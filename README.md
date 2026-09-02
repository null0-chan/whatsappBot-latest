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

```
PlanaSesi/
```

## Commands

| Command | Description | Permission |
|---|---|
| `.cmd` | Show available commands | Everyone |
| `.chat-on` | Enable AI | Admin/Owner |
| `.chat-off` | Disable AI | Admin/Owner |
| `.chat-status` | Show AI status | Everyone |
| `.tts-on` | Enable TTS | Admin/Owner |
| `.tts-off` | Disable TTS | Admin/Owner |
| `.tts-status` | Show TTS status | Everyone |
| `.reset` | Reset conversation memory | Everyone |
| `.resetall` | Reset all conversation memories | Admin/Owner |

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

Plana can run on Android through Termux.

```bash
pkg update
pkg upgrade
pkg install nodejs git ffmpeg

git clone https://github.com/null0-chan/whatsappBot-latest.git
cd whatsappBot-latest
npm install
npm start
```

## Security

Do not commit sensitive files to the repository:

```
.env
PlanaSesi/
```

These files may contain API credentials and WhatsApp authentication data.

If an API key is exposed, revoke it immediately and generate a new one.

## License

This project is licensed under the MIT License.

## Author

GitHub: [@null0-chan](https://github.com/null0-chan)

Repository: [whatsappBot-latest](https://github.com/null0-chan/whatsappBot-latest)