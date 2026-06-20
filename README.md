# Nerimity Welcomer Bot

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/JoddabodScripts/Welcome-nerimity)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-green.svg?logo=node.js)](https://nodejs.org/)
[![Nerimity](https://img.shields.io/badge/Nerimity.js-1.20.1-7289DA.svg)](https://nerimity.com)

A welcome bot for Nerimity that sends custom HTML embeds when users join a server.

## Features

- Custom HTML welcome embeds with user avatars and galaxy background
- Auto-detects welcome channel (last active channel in server)
  - Note: This auto-detection can be unreliable - use `/setwelcomechannel` instead
- `/setwelcomechannel` command to lock welcome channel (requires admin)
- Test command: `cool!testing!testing!command`
- Persistent channel storage using JSON

## Prerequisites

- Node.js (v16 or higher)
- A Nerimity bot token
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your bot token:**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and replace `your_bot_token_here` with your actual bot token:
   ```env
   BOT_TOKEN=your_bot_token_here
   ```

3. **Build the bot:**
   ```bash
   npm run build
   ```

4. **Run the bot:**
   ```bash
   npm start
   ```

   Or for development (build + run):
   ```bash
   npm run dev
   ```

## Commands

| Command | Description | Permission Required |
|---------|-------------|---------------------|
| `/setwelcomechannel` | Set a permanent welcome channel for the server | Admin |
| `cool!testing!testing!command` | Test the welcome embed in current channel | None |

## Project Structure

```
welcomer/
├── src/
│   ├── index.ts           # Main bot logic & event handlers
│   ├── welcomeCard.ts     # HTML welcome embed builder
│   └── channelStore.ts    # Persistent channel storage
├── build/                 # Compiled JavaScript output
├── welcome-channels.json  # Server → channel mappings
├── package.json
├── tsconfig.json
└── .env                   # Your bot token (gitignored)
```

## Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled bot |
| `npm run dev` | Build and run in one command |

### Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Bot SDK:** [@nerimity/nerimity.js](https://github.com/Nerimity/nerimity.js)
- **Build Tool:** TypeScript Compiler (tsc)

## Contributing

Want to contribute? Check out the [Contributing Guide](CONTRIBUTING.md) for:
- Development workflow
- Commit message conventions
- Pull request process
- Code style guidelines

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BOT_TOKEN` | Yes | Your Nerimity bot authentication token |

## Troubleshooting

**Bot not sending welcome messages?**
- Verify `BOT_TOKEN` is correctly set in `.env`
- Check that the bot has permissions to send messages in the welcome channel
- Try setting a specific channel with `/setwelcomechannel`

**Build errors?**
- Ensure you're using Node.js v16 or higher
- Delete `node_modules` and `build/` directories, then run `npm install` and `npm run build`

**Welcome channel not updating?**
- The bot tracks the most recently active channel automatically
- Use `/setwelcomechannel` to lock a specific channel if auto-detection isn't working

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
