# Welcomer Bot — AI Agent Context

This file provides canonical context for AI agents working on this project.

---

## Quick Reference

**What:** TypeScript Nerimity welcome bot — posts HTML welcome cards when members join  
**Stack:** TypeScript + Node.js + `@nerimity/nerimity.js` SDK  
**Build:** `npm run build` → `npm run start` (requires `BOT_TOKEN` env var)  
**Test:** Type `welcome!testing!test` in any channel for manual smoke test  

---

## Project Overview

A TypeScript-based Nerimity welcome bot built on the `@nerimity/nerimity.js` library. When a new member joins a server, the bot posts a custom HTML-embedded welcome card in the server's active channel. It auto-assigns the welcome channel when joining a new server and dynamically tracks the most recently active channel per server.

### Core Behavior

1. **Auto-channel assignment:** When the bot joins a server, it picks the first available channel as the welcome channel
2. **Dynamic tracking:** Updates welcome channel to the most recently active channel (where messages are sent)
3. **Welcome cards:** Sends HTML-formatted welcome embeds with user avatar, username, and server name on a galaxy background
4. **Manual testing:** Responds to `welcome!testing!test` command with a test welcome card

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| **Language** | TypeScript (ES2020 target, CommonJS modules) |
| **Runtime** | Node.js |
| **Bot SDK** | `@nerimity/nerimity.js` ^1.20.1 |
| **Build Tool** | TypeScript compiler (`tsc`) ^5.9.3 |
| **Type Definitions** | `@types/node` ^25.9.1 |

---

## Project Structure

```
welcomer/
├── src/                    # TypeScript source files
│   ├── index.ts            # Main entry point — client setup, event handlers
│   ├── welcomeCard.ts      # Welcome embed HTML builder
│   └── channelStore.ts     # Persistent channel-per-server store
├── build/                  # Compiled JS output (from tsc)
├── node_modules/           # Dependencies
├── welcome-channels.json   # Runtime data store (serverId → channelId mappings)
├── package.json
├── tsconfig.json
├── AGENTS.md               # This file
└── CLAUDE.md               # Duplicate of this file for compatibility
```

---

## Architecture

### Data Flow

1. **Bot startup** → Creates `Client` from `@nerimity/nerimity.js`, authenticates with `BOT_TOKEN` env var
2. **Server joined** → On `ServerJoined` event, scans channel cache for first channel in new server, persists as welcome channel
3. **Message tracking** → On `MessageCreate` event, updates stored welcome channel to the channel where message was sent (ignores bot's own messages)
4. **Member join** → On `ServerMemberJoined` event, retrieves stored welcome channel and sends HTML welcome card
5. **Test command** → Typing `welcome!testing!test` triggers test welcome embed for the sender

### Key Modules

#### `index.ts`
Client lifecycle, event wiring, and handlers:
- `ServerJoined` — Initializes welcome channel for new servers
- `MessageCreate` — Updates active welcome channel based on message activity
- `ServerMemberJoined` — Sends welcome card when new member joins
- Test command handler for `welcome!testing!test`

#### `welcomeCard.ts`
Exports `buildWelcomeEmbed()` function that generates HTML string with inline CSS. Renders:
- User avatar (via `cdn.nerimity.com`)
- Username and server name
- Blurred galaxy background image from external CDN

#### `channelStore.ts`
In-memory cache backed by `welcome-channels.json` on disk:
- `getWelcomeChannel(serverId)` — Retrieves stored channel ID
- `setWelcomeChannel(serverId, channelId)` — Persists channel mapping
- Lazy file I/O (only writes on change, not on every read)

### Persistence Layer

**Storage:** `welcome-channels.json` in project root  
**Format:** Flat JSON object mapping `serverId → channelId`  
**Behavior:** Auto-created and updated by `channelStore.ts`  
**No database** — JSON file is the sole persistence mechanism

---

## Development Commands

| Command | Action |
|---------|--------|
| `npm run build` | Compile TypeScript → outputs to `build/` |
| `npm run start` | Run compiled JS (`node build/index.js`) |
| `npm run dev` | Build + start in one step |

**Environment requirement:** `BOT_TOKEN` must be set (e.g., `BOT_TOKEN=xxx npm start`). Bot exits immediately if missing.

---

## Configuration

### Required
- **`BOT_TOKEN`** — Nerimity bot token. Must be present at runtime.

### Compiler Config
- **`tsconfig.json`** — Strict mode enabled, `esModuleInterop`, source maps + declaration maps

### Runtime Data
- **`welcome-channels.json`** — Auto-managed by `channelStore.ts`, not user-editable config

**No `.env` file, no CLI arguments, no additional config files.**

---

## Code Conventions

- **Module exports:** Named exports from each module, imported at top of `index.ts`
- **Error handling:** `.catch(console.error)` for fire-and-forget promises, `try/catch` with `console.error` for awaited operations
- **No linter/formatter:** No ESLint, Prettier, or similar tooling configured
- **HTML generation:** Inline HTML strings with `<style>` blocks in template literals (not JSX or template engine)
- **No tests:** No test directory, runner, or framework present
- **No version control:** Project directory is not a git repository
- **Env config:** `BOT_TOKEN` read directly from `process.env` at startup

---

## Testing Strategy

**No automated test infrastructure exists.**

**Manual testing:**
- Type `welcome!testing!test` in any channel
- Bot sends test welcome embed for the message sender
- No permission checks or channel validation on test command

---

## Critical Gotchas & Constraints

### HTML Validation Rules (CRITICAL)

1. **Username/server name MUST be HTML-escaped**
   - Nerimity's HTML validator counts opening vs closing tags via regex: `/<[a-zA-Z0-9]+/g`
   - If username/server name contains `<` or `>`, it creates fake opening tags
   - This breaks tag counting → "Mismatched or unclosed HTML tags" error
   - **Always escape user-provided strings with `escapeHtml()` before inserting into embed**

2. **`<img>` tags MUST use self-closing syntax**
   - Required format: `<img ... />`
   - Invalid format: `<img ... >` (missing trailing slash)
   - Nerimity HTML validator requires void elements to be self-closed

### URL Construction

- **Avatar URLs:** Constructed as `https://cdn.nerimity.com/${avatarUrl}`
- The `avatarUrl` from member/user objects is a **relative path**, not absolute URL
- Must prepend CDN base URL

### File Paths

- **`welcome-channels.json` path resolution:**
  - Resolved at compile time via `__dirname`
  - Relative to `build/` directory (compiled output), **not** `src/`
  - JSON file lives in project root alongside `build/`

### External Dependencies

- **Background image:** `buildWelcomeEmbed()` uses hardcoded background image URL from external CDN (pngtree.com)
- If external image URL breaks, cards render with no background
- No fallback image configured

### Channel Management

- **`ServerJoined` handler:** Iterates `client.channels.cache` and picks first channel belonging to new server
- Channel selection order is **cache-dependent** (non-deterministic)
- **Stale channel IDs:** `welcome-channels.json` can reference deleted channels — no cleanup logic exists

### Security & Validation

- **No input validation** on `welcome!testing!test` command
- No admin permission checks
- No channel scope restrictions
- Test command works in any channel where bot can read messages

### Deployment

- **No containerization:** Bare Node.js process (no Docker)
- Intended for direct execution or simple process manager (e.g., PM2, systemd)

---

## Common Operations

### Adding New Event Handlers
1. Add event listener in `index.ts` using `client.on()`
2. Use `.catch(console.error)` for error handling
3. Follow existing patterns for channel lookups via `channelStore`

### Modifying Welcome Card Design
1. Edit `buildWelcomeEmbed()` in `welcomeCard.ts`
2. Ensure all user-provided content is HTML-escaped
3. Use self-closing syntax for void elements (`<img />`, `<br />`)
4. Test with `welcome!testing!test` command

### Debugging Channel Issues
1. Check `welcome-channels.json` for server-to-channel mappings
2. Verify channel still exists in server (may be deleted)
3. Test message sending in target channel to trigger channel update

---

## Future Considerations

- Add channel cleanup logic for deleted channels
- Implement fallback for external background image
- Add permission checks for test command
- Consider deterministic channel selection on `ServerJoined`
- Add input sanitization beyond HTML escaping
