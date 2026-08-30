const { getMemory, addMemory } = require("../modules/memory")
const { getPersonality } = require("../modules/personality")
const { GoogleGenAI } = require("@google/genai")

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY
})

async function autoAI(user, userText, quotedText) {
  try {
    const personality = getPersonality("plana")
    const history = getMemory(user)
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
    // Gemini 2.5 Flash
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
    addMemory(user, "user", userText.trim())
    addMemory(user, "ai", reply.trim())

    return reply
  } catch (err) {
    console.error("❌ Error di autoAI:", err.message)
    return null
  }
}

module.exports = { autoAI }