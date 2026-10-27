export function pcmToWav(
  pcmBuffer,
  { sampleRate = 24000, channels = 1 } = {},
) {
  const pcm = new Uint8Array(pcmBuffer);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const bytesPerSample = 2;
  const byteRate = sampleRate * channels * bytesPerSample;
  const blockAlign = channels * bytesPerSample;

  writeText(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcm.byteLength, true);
  writeText(view, 8, 'WAVE');
  writeText(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeText(view, 36, 'data');
  view.setUint32(40, pcm.byteLength, true);

  return new Blob([header, pcm], { type: 'audio/wav' });
}

export function createAudioUrl(wavBlob) {
  return URL.createObjectURL(wavBlob);
}

function writeText(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}
