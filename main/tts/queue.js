const { generateTTS } = require("./tts.js")

class TTSQueue {
  constructor() {
    this.queue = []
    this.running = false
  }

  async add(text, voiceId, callback) {
    this.queue.push({ text, voiceId, callback })
    this.process()
  }

  async process() {
    if (this.running) return
    if (this.queue.length === 0) return

    this.running = true
    const job = this.queue.shift()

    try {
      const audioBuffer = await generateTTS(job.text, job.voiceId)
      await job.callback(audioBuffer)
    } catch (e) {
      console.log("[TTS QUEUE ERROR]", e)
    }

    this.running = false
    this.process()
  }
}

module.exports = { TTSQueue }