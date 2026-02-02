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

- **instructions.md** - Comprehensive agent instructions and protocol
- **ACTION_PLAN.md** - Current phase, tasks, and priorities (check this first!)
- **CODEBASE_ASSESSMENT.md** - Architecture overview and code quality analysis
- **GAME_RULES.md** - Game mechanics reference
- **IMPLEMENTATION_STATUS.md** - Feature completion tracking
- **MULTIPLAYER_ARCHITECTURE.md** - Socket.IO event system and database design
- **settings.local.json** - Claude Desktop permissions

Always check `ACTION_PLAN.md` at the start of each session to understand current development status.
