// import module
require("./admin")

const { autoAI } = require("./autoAI")
const { resetMemory, resetAllMemory } = require("../modules/memory")
const { convertMp3ToOpus } = require("./tts/convert")
const { TTSQueue } = require("./tts/queue.js")
const { areJidsSameUser } = require("@whiskeysockets/baileys")

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

  const chatJid = msg.key?.remoteJid
  if (!chatJid) return

  const userJid = msg.key?.participant || chatJid

  if (msg.key.fromMe || chatJid === "status@broadcast") return

  const msgId = msg.key.id || ""
  const processedKey = `${chatJid}:${msgId}`
  const now = Date.now()
  const DUP_WINDOW = 30 * 1000

  // Filter msg-lock
  for (const [k, ts] of global.processedMsgIds) {
    if (now - ts > DUP_WINDOW) global.processedMsgIds.delete(k)
  }

  if (global.processedMsgIds.has(processedKey)) return
  global.processedMsgIds.set(processedKey, now)

  const lockKey = `${chatJid}:${userJid}`
  if (global.userLocks.get(lockKey)) return
  global.userLocks.set(lockKey, true)

  try {
    // Status pesan telah dibaca
    try {
      await plana.readMessages([msg.key])
    } catch {}

    function isOwner(msg) {
    const senderJid =
        msg.key?.participant ||
        msg.key?.remoteJid

    return admin.some(id =>
        areJidsSameUser(id, senderJid)
        )
    }

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ""

    let text = body.trim()
    if (!text) return

    const isPrivate = !chatJid.endsWith("@g.us")
    const mentionRegex = /(^|\s|[,.!?])plana\b/i
    const isMentioned = mentionRegex.test(text)

    const isCommand = text.startsWith(prefix)
    const isAdmin = isOwner(msg)
    const cacheKey = `${chatJid}:${userJid}`

    const contextInfo = msg.message?.extendedTextMessage?.contextInfo || msg.message?.imageMessage?.contextInfo || msg.message?.videoMessage?.contextInfo

    const quoted = contextInfo?.quotedMessage
    const quotedParticipant = contextInfo?.participant

    let quotedText = ""

    if (quoted) {
      quotedText =
        quoted.conversation ||
        quoted.extendedTextMessage?.text ||
        quoted.imageMessage?.caption ||
        ""
    }

    // reply mention
    let repliedToPlana = false

    if (quoted && quotedParticipant) {
        const botId = plana.user?.id
        const botLid = plana.user?.lid

        repliedToPlana =
            (botId && areJidsSameUser(quotedParticipant, botId)) ||
            (botLid && areJidsSameUser(quotedParticipant, botLid))
    }

    // group filter
    if (!isPrivate && !isMentioned && !repliedToPlana && !isCommand) return

    const userText = text

    // Command Handling
    if (isCommand) {
      const command = userText.slice(prefix.length).split(" ")[0].toLowerCase()

      switch (command) {
                case 'cmd':
                    await plana.sendMessage(chatJid, {
          text:
` COMMAND MENU
┌───────────────────┐
│  .reset
│  .resetall
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
                    await plana.sendMessage(chatJid, {
                       text: "Kamu bukan ownerku!"}, { quoted: msg })
                 return
                }

                global.planaAIEnabled = true
                await plana.sendMessage(chatJid, { text: "_Plana online_" }, { quoted: msg })
                    return

                case 'chat-off':
                    if (!isAdmin) {
                    await plana.sendMessage(chatJid, {
                       text: "Kamu bukan ownerku!"}, { quoted: msg })
                 return
                }

                global.planaAIEnabled = false
                await plana.sendMessage(chatJid, { text: "_Plana offline_" }, { quoted: msg })
                    return

                case 'tts-on':
                    if (!isAdmin) {
                    await plana.sendMessage(chatJid, {
                       text: "Kamu bukan ownerku!"}, { quoted: msg })
                 return
                }

                global.planaTTS = true
                await plana.sendMessage(chatJid, { text: "_TTS dinyalakan_"}, { quoted: msg })
                    return

                case 'tts-off':
                    if (!isAdmin) {
                    await plana.sendMessage(chatJid, {
                       text: "Kamu bukan ownerku!"}, { quoted: msg })
                 return
                }

                global.planaTTS = false
                await plana.sendMessage(chatJid, { text: "_TTS dimatikan_"}, { quoted: msg })
                    return

                // Status check command
                case 'tts-status': {
                    const status = global.planaTTS ? "Online" : "Offline"
                    await plana.sendMessage(chatJid, { text: `📊 TTS Status: ${status}` }, { quoted: msg })
                }
                    return

                case 'chat-status': {
                    const status = global.planaAIEnabled ? "Online" : "Offline"
                    await plana.sendMessage(chatJid, { text: `📊 Chat Status: ${status}` }, { quoted: msg })
                }
                    return

                // Reset command
                case 'reset':
                    await resetMemory(chatJid, userJid)
                    await plana.sendMessage(chatJid, { text: "Memori berhasil dihapus" }, { quoted: msg })
                    return

                case 'resetall':
                    if (!isAdmin) {
                        await plana.sendMessage(chatJid, { text: "Kamu bukan ownerku!" }, { quoted: msg })
                     return
                    }

                    if (isPrivate) {
                        await plana.sendMessage(chatJid, { text: "Command ini hanya bisa digunakan didalam grup" }, { quoted: msg })
                     return
                    }

                    await resetAllMemory(chatJid)
                    await plana.sendMessage(chatJid, { text: "Seluruh memory chat berhasil dihapus" }, { quoted: msg })
                    return

                default:
                    return
            }
    }

    if (!global.planaAIEnabled) return

    if (cache[cacheKey] && cache[cacheKey][userText]) return

    await plana.presenceSubscribe(chatJid)
    await plana.sendPresenceUpdate("composing", chatJid)
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 1000))

    // AI Processing
    const aiResponse = await autoAI(chatJid, userJid, userText, quotedText)

    if (aiResponse?.error) {
        await plana.sendMessage(chatJid, { text: aiResponse.message }, { quoted: msg })

        return
    }

    await plana.sendPresenceUpdate("paused", chatJid)

    if (aiResponse && typeof aiResponse === "string" && !aiResponse.startsWith("⚠️")) {

      await plana.sendMessage(chatJid, { text: aiResponse.trim() }, { quoted: msg })

    if (global.planaTTS) {
        try {
            ttsQueue.add(
            aiResponse.trim(),
            VOICE_ID,
            async (audioBuffer) => {
                try {
                    const opusBuffer = await convertMp3ToOpus(audioBuffer)
    
                await plana.sendMessage(chatJid, {
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
      if (!cache[cacheKey]) cache[cacheKey] = {}
      cache[cacheKey][userText] = aiResponse

    } else {
      console.log("⚠️ AI gagal atau null")
    }

  } catch (err) {
    console.error("Error di plana.js:", err)
  } finally {
    if (chatJid) global.userLocks.delete(lockKey)
  }
}