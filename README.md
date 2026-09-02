# Plana

*Personal WhatsApp AI Bot built with Node.js, Baileys, Google Gemini, and ElevenLabs.*

![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)
![Baileys](https://img.shields.io/badge/Baileys-WhatsApp-black)
![Gemini](https://img.shields.io/badge/Google-Gemini-blue)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Personal WhatsApp automation bot with AI conversation, persistent memory, customizable personality, text-to-speech, and reminders. Built for personal use and experimentation.

## Features

- **AI Chat** — Google Gemini, memory context, quoted message support, group filtering, can be toggled on/off
- **Memory** — Conversation history stored locally, resettable via `.reset`
- **TTS** — AI responses converted to voice notes via ElevenLabs (`Gemini → ElevenLabs → FFmpeg → Opus`)
- **Reminders** — Scheduled reminders/schedule data, stored in `dataBase/reminder.json`
- **Message handling** — Duplicate protection, per-user lock, quoted message detection, auto read/typing simulation
- **Group filtering** — Bot only replies in groups when mentioned ("Plana") or given a valid command

## Requirements

Node.js 20+, npm, WhatsApp account, Google Gemini API key, FFmpeg (for TTS), ElevenLabs API key (optional, for TTS).

## Installation

```bash
git clone https://github.com/null0-chan/whatsappBot-latest.git
cd whatsappBot-latest
npm install
```

Create `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE=your_voice_id
```

Set the bot owner & prefix in `main/admin.js`:

```js
global.admin = [ /* your number/lid/g.us */ ]
global.prefix = "."
```

## Usage

```bash
npm start
```

On first run, scan the WhatsApp pairing code via **Settings → Linked Devices → Link a Device → Link with phone number**. Session data is stored locally in `PlanaSesi/` — do not commit this folder.

## Commands

| Command        | Description               | Permission |
| -------------- | -------------------------- | ---------- |
| `.cmd`         | Show available commands    | Everyone   |
| `.chat-on/off` | Enable/disable AI chat     | Admin      |
| `.chat-status` | Show AI status             | Everyone   |
| `.tts-on/off`  | Enable/disable TTS         | Admin      |
| `.tts-status`  | Show TTS status            | Everyone   |
| `.reset`       | Reset conversation memory  | Everyone   |

## Project Structure

```bash

whatsappBot-latest/
│
├── dataBase/
│   ├── memory.json
│   ├── personality.json
│   └── reminder.json
│
├── main/
│   ├── antiNoisy/
│   ├── tts/
│   │   ├── convert.js
│   │   ├── queue.js
│   │   └── ...
│   │
│   ├── admin.js
│   ├── autoAI.js
│   ├── config.js
│   └── main.js
│
├── modules/
│   ├── memory.js
│   ├── personality.js
│   ├── reminder.js
│   └── watching.js
│
├── .env
├── package.json
└── README.md
```

## Termux (Android)

```bash
pkg update && pkg install nodejs git ffmpeg
git clone https://github.com/null0-chan/whatsappBot-latest.git
cd whatsappBot-latest && npm install && npm start
```

## Security

Never commit `.env` or `PlanaSesi/` — they contain API keys and WhatsApp auth data. Revoke and rotate any exposed key immediately.

## Notes

Uses Baileys (unofficial WhatsApp library), not the official WhatsApp Business API. Use responsibly — avoid bulk/automated spam messaging.

## License

MIT License

## Author

**Ichan** — [@null0-chan](https://github.com/null0-chan)