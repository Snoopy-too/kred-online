# Project Rules (testKredBGIO)

- **Minimal Code Philosophy (`/ponytail`)**: Always seek the shortest, simplest working solution. Avoid over-engineering, boilerplate, and unnecessary dependencies.
- **boardgame.io Stack**: Adhere strictly to boardgame.io patterns (clean state mutations, separated moves/phases, deterministic state logic).
- **File Length Limit (<500 lines)**: Keep files strictly under 500 lines. Refactor oversized files cleanly into separate module/component files as a senior engineer would.
- **Lobby Toolbar Integration**: Configure the KRED logo and manual in `game.json` (`"toolbar"`), and wire zoom, admin `devTools`, and `saveLoad` via `window.tfdMatchToolbar.configure(...)` (see lobby `AGENTS.md`).
