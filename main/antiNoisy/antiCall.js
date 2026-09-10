/*
Nama Fitur : Anti Call (Modified)
Author     : MC•BOT™ 
Mod by     : Lyra & Ichan
*/

global._antiCallCooldown = global._antiCallCooldown || new Map()
global._antiCallWarning = global._antiCallWarning || new Map()
global._antiCallBlocked = global._antiCallBlocked || new Map()

const BLOCK_DURATION = 24 * 60 * 60 * 1000

const WARNING_MESSAGES = [
  "Ihh... jangan nelpon-nelpon dong!",
  "Udah dibilangin jangan nelpon! Kamu ngeyel ya!?",
  "Ngapain sih!?"
]

const WARNING_LIMIT = WARNING_MESSAGES.length

module.exports = function antiCall(plana) {

  const bindAntiCall = () => {

    plana.ev.removeAllListeners("call")

    plana.ev.on("call", async (call) => {
      try {

        if (call[0].status !== "offer") return
        const from = call[0].from

        const lastCall = global._antiCallCooldown.get(from)
        if (lastCall && (Date.now() - lastCall < 3000)) return
        global._antiCallCooldown.set(from, Date.now())

        const retry = async (fn, attempts = 2) => {
          for (let i = 0; i < attempts; i++) {
            try { await fn(); break }
            catch(e) { if (i === attempts-1) console.error(e) }
          }
        }

        await retry(() => plana.rejectCall(call[0].id, from))

        let warn = global._antiCallWarning.get(from) || 0
        const text = WARNING_MESSAGES[warn]

        await retry(() => plana.sendMessage(from, { text }))

        warn++

        if (warn >= WARNING_LIMIT) {

          await new Promise(r => setTimeout(r, 1000))

          await retry(() => plana.updateBlockStatus(from, "block"))

          global._antiCallBlocked.set(from, Date.now() + BLOCK_DURATION)
          global._antiCallWarning.delete(from)

        } else {
          global._antiCallWarning.set(from, warn)
        }

      } catch (err) {
        console.error("AntiCall Error:", err)
      }
    })

  }

  bindAntiCall()

  setInterval(bindAntiCall, 10 * 60 * 1000)

}