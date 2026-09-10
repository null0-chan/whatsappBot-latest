const { exec } = require("child_process")
const fs = require("fs")

async function convertMp3ToOpus(inputBuffer) {
  return new Promise((resolve, reject) => {
    const input = "/storage/emulated/0/tmp_in.mp3"
    const output = "/storage/emulated/0/tmp_out.opus"

    fs.writeFileSync(input, inputBuffer)

    exec(`ffmpeg -y -i "${input}" -c:a libopus "${output}"`, (err) => {
      if (err) return reject(err)

      const result = fs.readFileSync(output)
      fs.unlinkSync(input)
      fs.unlinkSync(output)

      resolve(result)
    })
  })
}

module.exports = { convertMp3ToOpus }