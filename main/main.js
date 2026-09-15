// Import Module 
require("dotenv").config()

const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const pino = require("pino")
const chalk = require("chalk")
const readline = require("readline")
const { resolve } = require("path")
const { Browsers } = require("@whiskeysockets/baileys")

// TTS
const { TTSQueue } = require("./tts/queue.js")
const ttsQueue = new TTSQueue()

// Metode Pairing
const usePairingCode = true
let pairingRequested = false

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./PlanaSesi')
  
  // New version
  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`Plana Using WA v${version.join('.')}, isLatest: ${isLatest}`)

  const plana = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: !usePairingCode,
    auth: state,
    browser: Browsers.ubuntu('Chrome'),//["Ubuntu", "Chrome", "20.0.04"],
    version: version,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id)
        return msg?.message || undefined
      }
      return proto.Message.fromObject({})
    }
  })

  // Handle Pairing Code
  if (usePairingCode && !plana.authState.creds.registered) {
    pairingRequested = true
    try {
      const phoneNumber = process.env.PHONE_NUMBER

      if (!phoneNumber) {
          throw new Error("PHONE_NUMBER belum diatur di file .env")
      }

      await new Promise(r => setTimeout(r, 1500))
      const code = await plana.requestPairingCode(phoneNumber.trim())
      console.log(`🎁 Pairing Code : ${code}`)
    } catch (err) {
      console.error('Failed get the pairing code:', err)
      pairingRequested = false
    }
  }
    // Save Login session
    plana.ev.on("creds.update", saveCreds)

    // Connection Information
plana.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update
    if (connection === "close") {
        console.log(chalk.red("✖ Disconnected, trying connect again"))
        connectToWhatsApp()
    } else if (connection === "open") {
        console.log(chalk.green("✔ Bot Connected"))

        // Always active status
        plana.sendPresenceUpdate("available").catch(err =>
            console.warn("⚠️ Failed update status available:", err.message))

        // Place for Module Import
        const { startReminder } = require("../modules/reminder")
        startReminder(plana)

        require("./antiNoisy/antiCall")(plana)

        require("../modules/watching")(plana)
    }
})

    // Respond Message
    plana.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]

        if (!msg.message) return

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        const sender = msg.key.remoteJid
        const pushname = msg.pushName || "Plana"

        // Log Message in Terminal
        const listColor = ["red", "green", "yellow", "magenta", "cyan", "white", "blue"]
        const randomColor = listColor[Math.floor(Math.random() * listColor.length)]

        console.log(
            chalk.green.bold("[ Message from WhatsApp ]"),
            chalk[randomColor](pushname),
            chalk[randomColor](" : "),
            chalk.white(body)
            
        )

        require("./config")(plana, m)
    })
    
}

// Connection to WhatsApp
connectToWhatsApp()