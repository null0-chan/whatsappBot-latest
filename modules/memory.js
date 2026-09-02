const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const file = path.join(__dirname, "..", "dataBase", "memory.json")

function loadMemory() {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "{}")
  }

  try {
    const data = fs.readFileSync(file, "utf8")
    return JSON.parse(data || "{}")
  } catch (err) {
    console.error("❌ Gagal baca memory.json:", err)
    return {}
  }
}

function saveMemory(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

function createSalt() {
  return crypto.randomBytes(4).toString("hex")
}

// =============================
//             GET
// =============================
function getMemory(chatJid, userJid) {
  const mem = loadMemory()

  return mem[chatJid]?.[userJid] || []
}

// =============================
//             ADD
// =============================
function addMemory(chatJid, userJid, role, content) {
  const mem = loadMemory()

  if (!mem[chatJid]) {
    mem[chatJid] = {}
  }

  if (!mem[chatJid][userJid]) {
    mem[chatJid][userJid] = []
  }

  mem[chatJid][userJid].push({
    role,
    content,
    salt: createSalt()
  })

  saveMemory(mem)
}

// =============================
//          RESET USER
// =============================
function resetMemory(chatJid, userJid) {
  const mem = loadMemory()

  if (!mem[chatJid]) return

  delete mem[chatJid][userJid]

  // Kalau sudah tidak ada user
  if (Object.keys(mem[chatJid]).length === 0) {
    delete mem[chatJid]
  }

  saveMemory(mem)
}

// =============================
//        RESET ALL CHAT
// =============================
function resetAllMemory(chatJid) {
  const mem = loadMemory()

  delete mem[chatJid]

  saveMemory(mem)
}

module.exports = {
  getMemory,
  addMemory,
  resetMemory,
  resetAllMemory
}