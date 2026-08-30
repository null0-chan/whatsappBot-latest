# Plana

*A personal WhatsApp AI bot built with Node.js, Baileys, Google Gemini, and ElevenLabs.*

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org/)
[![Baileys](https://img.shields.io/badge/Baileys-WhatsApp-black)](https://github.com/WhiskeySockets/Baileys)
[![Gemini](https://img.shields.io/badge/Google-Gemini-blue)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

## Overview

Plana is a personal WhatsApp automation bot with AI capabilities, persistent memory, reminders, and text-to-speech.

## Features

- AI conversations powered by Google Gemini
- Persistent conversation memory
- Customizable AI personality
- Text-to-Speech with ElevenLabs
- Reminder and school schedule system
- WhatsApp pairing code authentication
- Anti-call system
- Command system
- Group message filtering
- Quoted message context

## Requirements

- Node.js 20+
- npm
- WhatsApp account
- Google Gemini API key
- ElevenLabs API key (optional)
- FFmpeg (required for TTS)

## Installation

```bash
git clone https://github.com/null0-chan/whatsappBot-latest.git
cd whatsappBot-latest
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE=your_voice_id
```

Configure the bot owner in:

```bash
main/admin.js
```

## Usage

Start the bot:

```bash
npm start
```

On the first run, Plana will generate a WhatsApp pairing code.

Go to:

WhatsApp
→ Settings
→ Linked Devices
→ Link a Device
→ Link with phone number


The authentication session is stored locally in:

```bash
PlanaSesi/
```

## Commands

| Command | Description |
|---|---|
| `.cmd` | Show available commands |
| `.chat-on` | Enable AI |
| `.chat-off` | Disable AI |
| `.chat-status` | Show AI status |
| `.tts-on` | Enable TTS |
| `.tts-off` | Disable TTS |
| `.tts-status` | Show TTS status |
| `.reset` | Reset conversation memory |

## Configuration

| File | Purpose |
|---|---|
| `main/admin.js` | Admin and command prefix |
| `dataBase/personality.json` | AI personality |
| `dataBase/memory.json` | Conversation memory |
| `dataBase/reminder.json` | Reminder data |
| `.env` | API credentials |

## Project Structure

```bash

whatsappBot-latest/
├── dataBase/
│ ├── memory.json
│ ├── personality.json
│ └── reminder.json
├── main/
│ ├── antiNoisy/
│ ├── tts/
│ ├── admin.js
│ ├── autoAI.js
│ ├── config.js
│ └── main.js
├── modules/
│ ├── memory.js
│ ├── personality.js
│ ├── reminder.js
│ └── watching.js
├── .env
├── package.json
└── README.md
```
## Termux

Plana can run on Android through Termux.

```bash
pkg update
pkg install nodejs git ffmpeg

git clone https://github.com/null0-chan/whatsappBot-latest.git
cd whatsappBot-latest
npm install
npm start
```

## Security

Do not commit sensitive files to the repository:

```bash
.env
PlanaSesi/
```

These files may contain API credentials and WhatsApp authentication data.

If an API key is exposed, revoke it immediately and generate a new one.

## License

This project is licensed under the MIT License.

## Author

**Ichan**

GitHub: [@null0-chan](https://github.com/null0-chan)

Repository: [whatsappBot-latest](https://github.com/null0-chan/whatsappBot-latest)

