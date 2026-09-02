const { getMemory, addMemory } = require("../modules/memory")
const { getPersonality } = require("../modules/personality")
const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY
})

async function autoAI(chatJid, userJid, userText, quotedText) {
  try {
    const personality = getPersonality("plana")
    const history = getMemory(chatJid, userJid)
    const recentHistory = history.slice(-30)

    // Build parts
    const parts = []

    parts.push({
      text: [
        personality?.prompt ?? "",
        personality?.rules ?? "",
        personality?.behavior ?? ""
      ].join("\n\n")
    })

    recentHistory.forEach(h => {
      parts.push({ text: `${h.role}: ${h.content}` })
    })

    parts.push({
        text: `Pesan yang di-reply: ${quotedText || "(tidak ada)"}

        Pesan dari user: ${userText}`
    })

    // =============================
    //       Gemini 3.5 Flash
    // =============================
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      tools: [
          { googleSearch: {} }
          ],
      contents: [
        {
          role: "user",
          parts: parts
        }
      ]
    })

    const reply =
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ AI tidak merespons."

    // Simpan ke memori
    addMemory(chatJid, userJid, "user", userText.trim())
    addMemory(chatJid, userJid, "ai", reply.trim())

    return reply
  } catch (err) {
      const status = err?.status || err?.response?.status || err?.error?.status

      console.error("❌ Error di autoAI:", err.message)

      if (status === 429) {
          return {
              error: true,
              status: 429,
              message: "Maaf, sepertinya aku sedang tidak bisa menjawab untuk sementara."
          }
      }
      if (status === 503) {
          return {
              error: true,
              status: 503,
              message: "Aku sedang mengalami sedikit kendala. Coba lagi nanti ya!"
          }
      }

      return null
  }
}

module.exports = { autoAI }