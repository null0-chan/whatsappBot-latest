// import module
require("./admin")

const { autoAI } = require("./autoAI")
const { resetMemory } = require("../modules/memory")
const { convertMp3ToOpus } = require("./tts/convert")
const { TTSQueue } = require("./tts/queue.js")

const ttsQueue = new TTSQueue()
const VOICE_ID = process.env.ELEVENLABS_VOICE

// status check
if (global.planaAIEnabled === undefined) global.planaAIEnabled = true
if (global.planaTTS === undefined) global.planaTTS = true

const cache = {}
if (!global.processedMsgIds) global.processedMsgIds = new Map()
if (!global.userLocks) global.userLocks = new Map()

module.exports = async (plana, m) => {
  const msg = m?.messages?.[0]
  if (!msg?.message) return

  const sender = msg.key?.remoteJid
  if (!sender) return

  if (msg.key.fromMe || sender === "status@broadcast") return

  const msgId = msg.key.id || ""
  const processedKey = `${sender}:${msgId}`
  const now = Date.now()
  const DUP_WINDOW = 30 * 1000

  // Filter msg-lock
  for (const [k, ts] of global.processedMsgIds) {
    if (now - ts > DUP_WINDOW) global.processedMsgIds.delete(k)
  }

  if (global.processedMsgIds.has(processedKey)) return
  global.processedMsgIds.set(processedKey, now)

  if (global.userLocks.get(sender)) return
  global.userLocks.set(sender, true)

  try {
    // Status pesan telah dibaca
    try {
      await plana.readMessages([msg.key])
    } catch {}

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ""

    let text = body.trim()
    if (!text) return

    const isPrivate = !sender.endsWith("@g.us")
    const mentionRegex = /(^|\s|[,.!?])plana\b/i
    const isMentioned = mentionRegex.test(text)

    const isCommand = text.startsWith(prefix)
    const isAdmin = (admin.includes(sender))

    // group filter
    if (!isPrivate && !isMentioned && !isCommand) return

    const userText = text

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    let quotedText = ""

    if (quoted) {
      quotedText =
        quoted.conversation ||
        quoted.extendedTextMessage?.text ||
        quoted.imageMessage?.caption ||
        ""
    }

    // 🔹 Command Handling
    if (isCommand) {
      const command = userText.slice(prefix.length).split(" ")[0].toLowerCase()

      switch (command) {
                case 'cmd':
                    await plana.sendMessage(sender, {
          text:
` COMMAND MENU
┌───────────────────┐
│  .reset
│  .chat-on
│  .chat-off
│  .tts-on
│  .tts-off
│  .tts-status
│  .chat-status
└───────────────────┘`
             }, { quoted: msg })

                    return

                case 'chat-on':
                    if (!isAdmin) {
                    await plana.sendMessage(sender, {
                       text: "Kamu bukan ownerku!"}, { quoted: msg })
                 return
                }

                global.planaAIEnabled = true
                await plana.sendMessage(sender, { text: "_Plana online_" }, { quoted: msg })
                    return

                case 'chat-off':
                    if (!isAdmin) {
                    await plana.sendMessage(sender, {
                       text: "Kamu bukan ownerku!"}, { quoted: msg })
                 return
                }

                global.planaAIEnabled = false
                await plana.sendMessage(sender, { text: "_Plana offline_" }, { quoted: msg })
                    return

                case 'tts-on':
                    if (!isAdmin) {
                    await plana.sendMessage(sender, {
                       text: "Kamu bukan ownerku!"}, { quoted: msg })
                 return
                }

                global.planaTTS = true
                await plana.sendMessage(sender, { text: "_TTS dinyalakan_"}, { quoted: msg })
                    return

                case 'tts-off':
                    if (!isAdmin) {
                    await plana.sendMessage(sender, {
                       text: "Kamu bukan ownerku!"}, { quoted: msg })
                 return
                }

                global.planaTTS = false
                await plana.sendMessage(sender, { text: "_TTS dimatikan_"}, { quoted: msg })
                    return

                // Status check command
                case 'tts-status': {
                    const status = global.planaTTS ? "Online" : "Offline"
                    await plana.sendMessage(sender, { text: `📊 TTS Status: ${status}` }, { quoted: msg })
                }
                    return

                case 'chat-status': {
                    const status = global.planaAIEnabled ? "Online" : "Offline"
                    await plana.sendMessage(sender, { text: `📊 Chat Status: ${status}` }, { quoted: msg })
                }
                    return

                case 'reset':
                    await resetMemory(sender)
                    await plana.sendMessage(sender, { text: "Memori berhasil dihapus" }, { quoted: msg })
                    return

                default:
                    return
            }
    }

    if (!global.planaAIEnabled) return

    if (cache[sender] && cache[sender][userText]) return

    await plana.presenceSubscribe(sender)
    await plana.sendPresenceUpdate("composing", sender)
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 1000))

    // AI Processing
    const aiResponse = await autoAI(sender, userText, quotedText)

    await plana.sendPresenceUpdate("paused", sender)

    if (aiResponse && typeof aiResponse === "string" && !aiResponse.startsWith("⚠️")) {

      await plana.sendMessage(sender, { text: aiResponse.trim() }, { quoted: msg })

    if (global.planaTTS) {
        try {
            ttsQueue.add(
            aiResponse.trim(),
            VOICE_ID,
            async (audioBuffer) => {
                try {
                    const opusBuffer = await convertMp3ToOpus(audioBuffer)
    
                await plana.sendMessage(sender, {
                  audio: opusBuffer,
                  mimetype: "audio/ogg; codecs=opus",
                  ptt: true
                })
              } catch {}
            }
          )
        } catch (e) {
          console.error("TTS Queue Error:", e)
        }
      }

      // save cache
      if (!cache[sender]) cache[sender] = {}
      cache[sender][userText] = aiResponse

    } else {
      console.log("⚠️ AI gagal atau null")
    }

  } catch (err) {
    console.error("Error di plana.js:", err)
  } finally {
    if (sender) global.userLocks.delete(sender)
  }
}