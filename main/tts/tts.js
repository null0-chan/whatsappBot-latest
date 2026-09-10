const { ElevenLabsClient } = require("@elevenlabs/elevenlabs-js");

async function streamToBuffer(stream) {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function generateTTS(text, voiceId) {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_KEY
  });

  const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
    text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128"
  });

  // ubah stream → buffer
  const buffer = await streamToBuffer(audioStream);

  return buffer;
}

module.exports = { generateTTS };