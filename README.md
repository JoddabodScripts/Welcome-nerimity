# Nerimity Welcomer Bot

A welcome bot for Nerimity that sends custom HTML embeds when users join a server.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your bot token:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and replace `your_bot_token_here` with your actual bot token

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

## Features

- Auto-detects welcome channel (last active channel in server) one thing tho this auto-detection sucks, dont use it ever!
- `/setwelcomechannel` command to lock welcome channel (requires admin)
- Custom HTML welcome embeds
- Test command: `cool!testing!testing!command`

## Contributing

Want to contribute? Check out the [Contributing Guide](CONTRIBUTING.md) for:
- Development workflow
- Commit message conventions
- Pull request process
- Code style guidelines

## Environment Variables

- `BOT_TOKEN` - Your Nerimity bot token (required)
