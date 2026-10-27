const API_KEY = '';
const OPENAI_KEY = ''

const state = {
  currentAudioObject: null
}

async function* llmstreaming(userText = '') {
  yield { textContext: '', isFinal: false };
}

async function llm(userText = '') {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'z-ai/glm-5.3-flash',
      messages: [
        {
          role: 'user',
          content: userText,
        },
      ],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function speak(text = '') {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      input: text,
      voice: 'coral',
      instructions: 'speak in a calming and welcoming way, keep natural tone'
    }),
  }
  )

  const audioBlob = await response.blob();

  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  state.currentAudioObject = {
    audioUrl,
    audio
  }

  await audio.play();
  audio.onended = () => {
    state.currentAudioObject = null;
    URL.revokeObjectURL(audioUrl);
  }
}

function main() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechRecognition = new SpeechRecognition();

  speechRecognition.continuous = true;
  speechRecognition.interimResults = false;
  speechRecognition.maxAlternatives = 1;

  speechRecognition.onstart = function () {
    console.log('Speech recognition has started');
  };

  speechRecognition.onresult = async function (event) {
    const transcript =
      event.results[event.results.length - 1][0].transcript;
    console.log('User:', transcript);
    if (state.currentAudioObject) {
      state.currentAudioObject.audio.pause();
      URL.revokeObjectURL(state.currentAudioObject.audioUrl);
    }

    const textResponse = await llm(transcript);
    console.log('Assistant:', textResponse);

    await speak(textResponse);
  };

  speechRecognition.start();
}

main();
