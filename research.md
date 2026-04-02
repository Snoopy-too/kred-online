# KRED Online — Autonomous Research Loop

> Inspired by [karpathy/autoresearch](https://github.com/karpathy/autoresearch).
> This file is the agent's standing instructions. The human edits this file to steer research.
> The agent edits code. This file is not modified by the agent.

---

## The Goal

Make KRED Online work as a real multiplayer game — correctly, securely, and without losing connection.

The primary metric is: **how many players can successfully complete a full game session without disconnection, state loss, or cheating opportunity?**

Proxy metric for each experiment: `npm test -- --run` → test count passing / total. Never regress tests. Net improvement = keep. Neutral = keep only if it reduces known issues listed below. Regression = revert immediately.

---

## Current Known Issues (Priority Order)

### 1. 🔴 Lobby → Game socket transition breaks
**File:** `src/contexts/SocketContext.tsx`, `server/socketHandlers.cjs`
**Symptom:** Players lose connection when redirected from `/lobby` to `/KRED/`. New socket is created instead of rejoining.
**Root cause:** `SocketContext` calls `io()` fresh on mount, then emits `room:rejoin` — but if the server has already cleaned up the session, the rejoin silently fails and game state is never received.
**Fix target:** Players must always end up with a valid game state after the lobby→game transition, even if they refresh the browser.

### 2. 🔴 No server-side authorization on game actions
**File:** `server/socketHandlers.cjs`
**Symptom:** Any player can emit any game action (move a piece, play a tile) regardless of whose turn it is.
**Fix target:** Every action handler must verify `playerId` matches `state.players[state.currentPlayerIndex].id` before applying the action. Return `{ success: false, error: 'Not your turn' }` otherwise.

### 3. 🟡 Hardcoded session secret
**File:** `packages/server/src/index.ts` line ~42
**Symptom:** `secret: process.env.SESSION_SECRET || 'kred-secret-key-change-in-production'`
**Fix target:** Require `SESSION_SECRET` env var. Throw on startup if missing in production.

### 4. 🟡 Legacy `.cjs` server and TypeScript `packages/server` are out of sync
**File:** `server/socketHandlers.cjs` vs `packages/server/src/`
**Symptom:** Two implementations diverging. TypeScript version has better architecture but is incomplete.
**Fix target:** Incrementally migrate `.cjs` logic into `packages/server/src/socketHandlers.ts`. Do not break production (`.cjs`) until TypeScript version is verified complete.

### 5. 🟡 Deprecated socket events still in codebase
**File:** `server/socketHandlers.cjs`, `src/hooks/useGameSync.ts`
**Symptom:** Handlers for `game:phaseChange`, `player:joined`, `player:disconnected`, `error:*` exist on client but are never emitted by server.
**Fix target:** Either implement the server-side emitters or remove the dead client listeners. No orphaned event handlers.

### 6. 🟢 Debug `console.log` dumping full game state
**Files:** `packages/server/src/socketHandlers.ts`, `packages/server/src/gameEngine.ts`
**Fix target:** Replace with structured logging gated behind `DEBUG` env var. Never log full game state in production.

---

## The Files That Matter

The agent works primarily on these files, in priority order:

```
server/socketHandlers.cjs          ← Production server (most impactful, most risk)
src/contexts/SocketContext.tsx      ← Socket connection lifecycle
src/hooks/useGameSync.ts            ← Client state sync
src/hooks/useMultiplayerSync.ts     ← Multiplayer state integration
packages/server/src/socketHandlers.ts  ← TypeScript migration target
packages/server/src/gameEngine.ts   ← State machine (authoritative logic)
packages/server/src/index.ts        ← Server config / security
```

These files are **never modified by the agent:**
```
src/config/           ← Game configuration (static)
src/rules/            ← Game rules (requires human permission to change)
packages/shared/      ← Shared types/logic (change with care, full test run required)
prepare.py / train.py ← Not applicable to this project
```

---

## Experiment Protocol

Each experiment must:

1. **Identify one specific issue** from the list above (or a sub-problem within it)
2. **Make a targeted change** to one or two files maximum per experiment
3. **Run the test suite:** `npm test -- --run`
4. **Evaluate:**
   - Tests improved → commit with descriptive message, move to next experiment
   - Tests neutral, issue reduced → commit with note explaining the improvement
   - Tests regressed → `git checkout` the changed files, log the attempt and why it failed
5. **Log every experiment** to `research-log.md` (see format below)
6. **Never commit directly to `main`** — all work stays on `branch-de-escalante`

---

## research-log.md Format

Append each experiment as:

```markdown
## Experiment N — YYYY-MM-DD HH:MM

**Target:** [issue number + description]
**Files changed:** [list]
**Approach:** [one sentence]
**Test result:** [X/Y passing, delta from previous]
**Outcome:** KEPT / REVERTED
**Notes:** [what worked, what didn't, what to try next]
```

---

## Starting Point

Begin with **Issue #2** (server-side authorization) because:
- It's self-contained: each handler in `server/socketHandlers.cjs` can be hardened independently
- Tests exist that exercise game actions — failures will show immediately
- It doesn't require running a live server to validate
- It's the highest security risk

After each handler is hardened, move to **Issue #1** (socket transition).

Issue #3 and #6 can be done in a single experiment each — low risk, quick.

Issue #4 (TypeScript migration) is the big one — tackle last, after the others are stable.

---

## Definition of Done

The research loop is complete when:
- All 1056+ tests pass
- Every game action handler in `socketHandlers.cjs` validates player identity
- A player who refreshes mid-game reliably rejoins with correct state
- No hardcoded secrets
- No orphaned event listeners
- A PR to `main` is ready for human review

Human review required before merge. Do not merge autonomously.
