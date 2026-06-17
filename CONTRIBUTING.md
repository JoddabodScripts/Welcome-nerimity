# Contributing to Nerimity Welcomer Bot

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Project Structure](#project-structure)

## Code of Conduct

Be respectful and constructive. We're all here to build something useful together.

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm (comes with Node.js)
- A Nerimity bot token (get one from [Nerimity](https://nerimity.com))

### Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/JoddabodScripts/Welcome-nerimity.git
   cd Welcome-nerimity
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your BOT_TOKEN
   ```

4. **Build and run:**
   ```bash
   npm run dev
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or for bug fixes:
   ```bash
   git checkout -b fix/issue-description
   ```

2. **Make your changes** in the `src/` directory

3. **Test your changes:**
   - Build: `npm run build`
   - Run: `npm start`
   - Manual test: Type `welcome!testing!test` in a channel

4. **Commit your changes** (see [Commit Guidelines](#commit-guidelines))

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Key Files to Know

- `src/index.ts` - Main bot entry point, event handlers
- `src/welcomeCard.ts` - HTML welcome card builder
- `src/channelStore.ts` - Persistent channel storage
- `welcome-channels.json` - Runtime data (auto-generated, don't commit)

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear, semantic commit messages.

### Format

```
<type>: <description>

[optional body]
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, build config)

### Examples

```bash
feat: add /setwelcomechannel command for admins
fix: escape HTML in usernames to prevent embed errors
docs: update README with installation steps
refactor: extract HTML escaping to separate utility
chore: update @nerimity/nerimity.js to v1.21.0
```

### Multi-line Commits

For more complex changes:

```bash
git commit -m "feat: add custom welcome message configuration

- Add welcomeMessages.json for per-server custom messages
- Update buildWelcomeEmbed to use custom messages
- Add /setwelcomemessage command for admins"
```

## Pull Request Process

### Before Submitting

- [ ] Code builds without errors (`npm run build`)
- [ ] You've tested the changes manually
- [ ] Commit messages follow the guidelines above
- [ ] You've updated documentation if needed

### Submitting

1. Push your branch to your fork
2. Open a Pull Request against the `main` branch
3. Fill out the PR template with:
   - **Description**: What does this PR do?
   - **Changes**: List key changes
   - **Testing**: How did you test it?
   - **Screenshots**: If applicable (for UI/embed changes)

### PR Title Format

Use the same format as commit messages:

```
feat: add custom welcome messages
fix: prevent crash when channel is deleted
docs: add troubleshooting section to README
```

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged!

## Code Style

### TypeScript Conventions

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Use them
- **Naming**:
  - `camelCase` for variables and functions
  - `PascalCase` for types and interfaces
  - `UPPER_SNAKE_CASE` for constants

### Current Patterns

Match existing code style:

```typescript
// Event handlers
client.on('EventName', async (data) => {
  try {
    // Handle event
  } catch (error) {
    console.error('Error description:', error);
  }
});

// Async operations
someAsyncFunction()
  .catch(console.error);
```

### HTML in Embeds

**CRITICAL**: Always escape user-provided content:

```typescript
// WRONG - Security issue
const html = `<div>${username}</div>`;

// CORRECT - Escaped
const html = `<div>${escapeHtml(username)}</div>`;
```

**CRITICAL**: Use self-closing tags for void elements:

```typescript
// WRONG - Breaks Nerimity HTML validator
<img src="...">

// CORRECT - Self-closing
<img src="..." />
```

## Testing

### Manual Testing

Currently, the project uses manual testing:

1. **Run the bot**: `npm run dev`
2. **Test welcome messages**: Invite a new user to a server
3. **Test command**: Type `welcome!testing!test` in any channel

### Future: Automated Tests

We'd love contributions that add:
- Unit tests for `welcomeCard.ts`
- Integration tests for event handlers
- Test framework setup (Jest, Mocha, etc.)

## Project Structure

```
welcomer/
├── src/
│   ├── index.ts           # Main entry point
│   ├── welcomeCard.ts     # HTML embed builder
│   └── channelStore.ts    # Channel persistence
├── build/                 # Compiled output (gitignored)
├── node_modules/          # Dependencies (gitignored)
├── .env                   # Local config (gitignored)
├── .env.example           # Example config
├── package.json           # Project metadata
├── tsconfig.json          # TypeScript config
└── README.md              # User documentation
```

## Common Contribution Ideas

### Good First Issues

- Add error handling for deleted channels
- Improve channel selection logic
- Add configuration for custom backgrounds
- Create admin-only commands

### Larger Features

- Database support (replacing JSON file)
- Multiple welcome messages per server
- Welcome message templates
- Role assignment on join
- Configurable welcome card styling

## Getting Help

- **Issues**: Check [existing issues](https://github.com/JoddabodScripts/Welcome-nerimity.git)
- **Questions**: Open a new issue with the "question" label
- **Bugs**: Open an issue with reproduction steps

## Resources

- [Nerimity.js Documentation](https://docs.nerimity.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

Thank you for contributing! 🎉
