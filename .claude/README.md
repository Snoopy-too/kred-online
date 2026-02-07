# Agent Configuration

This directory contains unified configuration for AI coding assistants (Claude Desktop, GitHub Copilot, etc.)

## Files

- **`instructions.md`** - Comprehensive instructions for the KRED Online project (used by all AI assistants)
- **`settings.local.json`** - Permissions for Claude Desktop bash commands

## Usage

### Claude Desktop
Automatically reads both `instructions.md` and `settings.local.json` from this directory.

### GitHub Copilot
Reads instructions via `.github/copilot-instructions.md` which references this directory.

### Other AI Assistants
Should reference `instructions.md` as the source of truth for KRED-specific guidance.

## Key Documentation Files

All documentation is consolidated in this directory:

- **instructions.md** - Comprehensive agent instructions and coding standards
- **GAME_RULES.md** - Game mechanics reference
- **MULTIPLAYER.md** - Socket.IO architecture, events, and database design
- **SOCKET_EVENTS.md** - Complete socket event reference
- **TESTING_GUIDE.md** - Testing practices and patterns
- **I18N.md** - Internationalization guide
- **skills/** - Specialized implementation guides (database design, multiplayer patterns)
- **archives/** - Historical documentation and outdated files
- **settings.local.json** - Claude Desktop permissions
