const { autoAI } = require("../main/autoAI")

module.exports = (plana) => {

  if (!global.statusProcessed) global.statusProcessed = new Set()

  plana.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0]
    if (!msg || msg.key.remoteJid !== "status@broadcast") return

    const key = msg.key
    const target = key.participant || msg.participant
    if (!target) return

    const uniqueId = key.id
    if (global.statusProcessed.has(uniqueId)) return
    global.statusProcessed.add(uniqueId)

    const caption =
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      msg.message?.extendedTextMessage?.text ||
      ""

    // -------- Safe Read Receipt --------
    const canRead =
      key.id &&
      key.remoteJid &&
      (key.participant || msg.participant)

    if (canRead) {
      await new Promise(res => setTimeout(res, 250)) // delay kecil wajib

      try {
        await plana.readMessages([key])
      } catch (err) {
        console.log("⚠️ Status read failed:", err.message)
      }
    }

    // -------- AI Trigger Check --------
    const isMentioned = /\bplana\b/i.test(caption)
    if (!isMentioned) return

    let reply
    try {
      reply = await autoAI(target, caption.trim())
    } catch (err) {
      console.log("❌ Error AI process:", err.message)
      return
    }

    if (!reply) return

    // -------- Reply to Sender --------
    try {
      await plana.sendMessage(target, {
        text: reply,
        contextInfo: {
          stanzaId: key.id,
          participant: target,
          quotedMessage: msg.message
        }
      })
    } catch (err) {
      console.log("⚠️ Failed sending reply:", err.message)
    }

  })
}