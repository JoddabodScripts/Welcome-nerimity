# Welcomer — Agent Context

This file is the canonical context for AI agents working on this project.
It lives in the project root so every fresh session starts with awareness.

## Project Overview

A TypeScript Nerimity welcome bot built on the `@nerimity/nerimity.js` library. When a new member joins a server, the bot posts a custom HTML-embedded welcome card in the server's active channel. It also auto-assigns the welcome channel when joining a new server and tracks the most recently active channel per server.

## Tech Stack

- **Language:** TypeScript (target ES2020, CommonJS modules)
- **Runtime:** Node.js
- **Library:** `@nerimity/nerimity.js` ^1.20.1 (Nerimity/Chat client SDK)
- **Build tool:** TypeScript compiler (`tsc`) ^5.9.3
- **Type defs:** `@types/node` ^25.9.1

## Directory Structure

```
welcomer/
├── src/                    # TypeScript source files
│   ├── index.ts            # Main entry point — client setup, event handlers
│   ├── welcomeCard.ts      # Welcome embed HTML builder
│   └── channelStore.ts     # Persistent channel-per-server store
├── build/                  # Compiled JS output (from tsc)
├── node_modules/           # Dependencies
├── welcome-channels.json   # Runtime data store (serverId -> channelId mappings)
├── package.json
├── tsconfig.json
└── AGENTS.md               # This file
```

## Architecture

### Data Flow

1. **Bot startup** — creates a `Client` from `@nerimity/nerimity.js`, logs in with `BOT_TOKEN` env var.
2. **Server joined** — on `ServerJoined`, scans channel cache for the first channel in the new server and persists it as the welcome channel via `channelStore`.
3. **Message tracking** — on `MessageCreate`, updates the stored welcome channel for that server to the channel where the message was sent (so welcomes go to the most recently active channel). Ignores the bot's own messages.
4. **Member join** — on `ServerMemberJoined`, looks up the stored welcome channel and sends a welcome message with an HTML embed (the welcome card).
5. **Test command** — typing `welcome!testing!test` in any channel sends a test welcome embed for the sender.

### Key Modules

- **`index.ts`** — Client lifecycle, event wiring (`ServerJoined`, `MessageCreate`, `ServerMemberJoined`), test command handler.
- **`welcomeCard.ts`** — `buildWelcomeEmbed()` function that produces an HTML string with inline CSS. Renders the user's avatar (via `cdn.nerimity.com`), username, and server name over a blurred galaxy background image.
- **`channelStore.ts`** — In-memory cache backed by `welcome-channels.json` on disk. `getWelcomeChannel(serverId)` and `setWelcomeChannel(serverId, channelId)` with lazy file I/O (only writes on change, not on every call).

### Persistence

Welcome channel assignments are stored in `welcome-channels.json` (flat dict of `serverId -> channelId`). The file is in the project root and committed (present at runtime). No database — JSON file is the persistence layer.

## Key Conventions

- **Exports** — Named exports from each module, imported at the top of `index.ts`.
- **Error handling** — `.catch(console.error)` for fire-and-forget promises, `try/catch` with `console.error` for awaited operations.
- **No formatter/linter** — No ESLint, Prettier, or similar config present. Inline styles in template literals.
- **No tests** — No test directory, test runner, or test framework configured.
- **HTML embeds** — Welcome cards are inline HTML strings with `<style>` blocks. Not JSX or template engine — raw string concatenation in template literals.
- **No version control** — The project directory is not a git repository.
- **Env config** — `BOT_TOKEN` read from `process.env` at startup; no `.env` file included.

## Commands / Entry Points

| Command | Action |
|---------|--------|
| `npm run build` | Compile TypeScript (`tsc`) — outputs to `build/` |
| `npm run start` | Run compiled JS (`node build/index.js`) |
| `npm run dev` | Build then run in one step |

The bot expects `BOT_TOKEN` in the environment (or via `BOT_TOKEN=xxx npm start`).

## Configuration

- **`BOT_TOKEN`** (required) — Nerimity bot token. Must be set at runtime. The bot exits immediately if missing.
- **`tsconfig.json`** — Strict mode, `esModuleInterop`, source maps + declaration maps enabled.
- **`welcome-channels.json`** — Runtime data, not config. Auto-created and updated by `channelStore.ts`.
- No `.env`, no config files, no CLI args.

## Testing

No test infrastructure exists. The bot has a test command (`welcome!testing!test`) that fires a welcome embed for the sender as a manual smoke test.

## Notable Gotchas

- **Avatar URL** is constructed as `https://cdn.nerimity.com/${avatarUrl}` — the avatar stored on the member/user object is a relative path, not an absolute URL.
- **`welcome-channels.json`** path is resolved at compile time via `__dirname`, so it's relative to `build/` (the compiled output dir), not `src/`. The JSON file lives in the project root alongside `build/`.
- **No dockerization** — bare Node.js process intended for direct execution or simple process manager.
- **`ServerJoined`** handler iterates `client.channels.cache` and picks the first channel belonging to the new server (order is cache-dependent).
- **No input validation** on `welcome!testing!test` — the command doesn't check for admin permissions or channel scope.
- **The `buildWelcomeEmbed`** uses a hardcoded background image URL from an external CDN (pngtree.com) — if that image goes down, cards render with no background.
- **Username/server name must be HTML-escaped** — Nerimity's server-side HTML validator counts opening tags vs closing tags via regex (`/<[a-zA-Z0-9]+/g`). If a username or server name contains `<` or `>`, it creates fake opening tags that break the count and cause a "Mismatched or unclosed HTML tags" error. Always escape user-provided strings with `escapeHtml()` before inserting into the embed template.
- **`<img>` tags must use self-closing syntax** (`<img ... />`) — the Nerimity HTML validator requires void elements to be self-closed with a trailing slash. `<img ... >` without the slash will be rejected.
- **`welcome-channels.json`** can get stale if channels are deleted — no cleanup logic for removed channels.
