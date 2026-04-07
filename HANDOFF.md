# HANDOFF: AI Playtesting System for KRED

**Date**: 2026-04-07
**Branch**: `supabase-multiplayer`
**Goal**: Get the playtest CLI (`npm run playtest`) producing output like this:

```
KRED Playtest: 500 games, 3 players, seed 1712419200
Game 1: P2 wins (Campaign 4, 87 actions)
Game 2: P1 wins (Campaign 6, 134 actions)
Game 3: FAIL invariant 3 (support rule) at action 52
  -> Exported: src/__tests__/generated/invariant_3_seed_1712419202.test.ts
...
Results: 497 passed, 3 failed, 0 stalemate
```

**Current state**: 100% stalemate. No games finish with a winner. Zero invariant violations (the engine is sound), but bots never reach a win condition within 500 actions.

---

## Architecture

The system has two layers (spec: `docs/superpowers/specs/2026-04-06-ai-playtesting-design.md`):

- **Layer A (Pure Engine)** — Complete and working. All files in `src/engine/`.
- **Layer B (Supabase Integration)** — Not started. `src/engine/supabaseRunner.ts` doesn't exist yet.

### Layer A Files

| File | Purpose | Status |
|------|---------|--------|
| `src/engine/types.ts` | KredGameState, KredAction, GameResult types | Done |
| `src/engine/gameStateMachine.ts` | `gameReducer()`, `createInitialState()` | Done |
| `src/engine/invariants.ts` | 11 invariant checks run after every action | Done |
| `src/engine/moveValidation.ts` | `validateMove()`, `findLegalMoves()` per move type | Done |
| `src/engine/outcomeResolution.ts` | Honesty checking, outcome resolution | Done |
| `src/engine/randomBot.ts` | `randomBot()` — picks random legal actions per phase | **Has the stalemate bug** |
| `src/engine/gameRunner.ts` | `runGame()` — orchestrates one complete game | Done |
| `src/engine/testExporter.ts` | Exports failing games as Vitest regression tests | Done |
| `src/engine/seededRandom.ts` | Deterministic PRNG for reproducibility | Done |
| `src/scripts/playtest.ts` | CLI harness (`npm run playtest`) | Done |
| `src/__tests__/playtest/fuzz.test.ts` | 30-game safety net (10 per player mode) | Passing |

### Test Results

- `npx vitest run src/__tests__/engine/` — **99 tests passing**
- `npx vitest run src/__tests__/playtest/fuzz.test.ts` — **3 tests passing** (seeds 0-9 per mode)
- `npm run playtest -- --games 50 --verbose` — **150/150 stalemate** (0 wins, 0 violations)

---

## The Stalemate Problem

Games hit the 500-action safety valve (`MAX_ACTIONS` in `src/engine/gameRunner.ts:7`) without any player achieving the win condition.

### Win Condition (from `src/rules/win-conditions.ts`)

A player wins when they have ALL of:
1. Pawn in their Office
2. Heel in both Rostrums (rostrum1 and rostrum2)
3. All 6 Seats occupied (by any piece type)

### Why Games Stalemate

The root cause is that **random bot play doesn't converge toward winning**. Specifically:

1. **Random moves are self-defeating**: The bot WITHDRAWS pieces it just ADVANCED, REMOVES pieces it just ASSISTED, etc. There's no strategic direction — moves cancel each other out across turns.

2. **Bureaucracy spending is random**: The bot buys random menu items. It might buy REMOVE (which hurts its own position by removing opponent pieces that block nothing) instead of ADVANCE (which builds toward winning). The 30% early-stop chance (`rng.next() < 0.3` in `botBureaucracy`) means it often buys nothing.

3. **500 actions is likely too low**: A 3-player campaign has ~8 tiles per player = 24 turns. Each turn generates 5-6 actions (MAKE_MOVES + SELECT_TILE + RECEIVER_DECISION + BYSTANDER_DECISIONS). So one campaign = ~120-150 actions, plus ~10 for Bureaucracy. That's only 3-4 campaigns in 500 actions, and random play needs many more campaigns to accidentally stumble into a win.

4. **The game is a zero-sum positional game**: In KRED, other players actively REMOVE your pieces, INFLUENCE your pieces out of your domain, and challenge your plays. Random opponents undo each other's progress constantly.

### What Needs Investigation

Before just bumping `MAX_ACTIONS`, **diagnose what's actually happening**:

- How many campaigns does a 500-action game go through?
- What does the board look like at action 500? Are players close to winning or nowhere near?
- What's the action breakdown (how many MAKE_MOVES vs BUREAUCRACY_PURCHASE vs END_BUREAUCRACY_TURN)?
- Are campaigns transitioning to Bureaucracy correctly? Is Bureaucracy transitioning to the next campaign?
- Are tiles being dealt correctly for each new campaign?

A quick diagnostic approach: temporarily add logging to `runGame()` that prints campaign transitions, or write a small script that runs one game and dumps the state at key milestones.

### Possible Fixes (in order of likely impact)

1. **Increase MAX_ACTIONS** to 2000-5000. Random play is inherently slow; 500 may simply be too few.

2. **Make the bot less self-destructive**: Give it a bias toward ADVANCE over WITHDRAW, and toward keeping pieces in its own domain. The spec says "decision weights are not strategically tuned" but some minimal direction would help games finish.

3. **Weight Bureaucracy purchases toward ADVANCE and PROMOTION**: These directly progress toward winning. Currently the bot picks uniformly from all affordable items.

4. **Reduce the Bureaucracy early-stop chance**: The 30% stop rate (`rng.next() < 0.3`) means many Bureaucracy turns do nothing. Consider lowering to 10% or removing it — real players spend all their funding.

5. **Check for campaign cycling bugs**: Verify that after Bureaucracy, a new campaign starts with tiles re-dealt. If the state machine gets stuck, games would stalemate regardless of action count.

---

## What's Already Been Done This Session

1. **Fixed `botBureaucracy`** — was a stub that always returned `END_BUREAUCRACY_TURN`. Now actually purchases from the menu (CREDIBILITY, PROMOTION, MOVE items).

2. **Fixed `onePawnPerPlayer` invariant violation** — Bureaucracy PROMOTION was creating duplicate Pawns. Added guard in both `gameStateMachine.ts:490` and `randomBot.ts:findPromotablePieces()`.

3. **Verified alignment plan progress** — Tasks 1-10, 14, 17 of `ALIGNMENT_PLAN_4_4_2026.md` are implemented. Remaining: 12, 13, 15, 16, 18, 19.

---

## Other Pending Work

### Alignment Plan (`ALIGNMENT_PLAN_4_4_2026.md`)

These are rule fixes to match the physical board game manual (`.claude/GAME_RULES.md`):

| Task | Description | Status |
|------|-------------|--------|
| 12 | Zero-credibility forced Withdraw tracking | Pending |
| 13 | Verify face-up tiles excluded from Bureaucracy funding | Pending (verify only) |
| 15 | Verify no Bureaucracy move cap | Pending (verify only) |
| 16 | Self-play restriction (can only play tile to self if last player with tiles) | Pending |
| 18 | Reverse Campaign flow: moves-first, then tile selection with honest hints | Pending (large) |
| 19 | Illegal move detection (block moves matching no tile) | Pending |

### Layer B: Supabase Integration Testing

Not started. Spec is in `docs/superpowers/specs/2026-04-06-ai-playtesting-design.md` under "Layer B". Requires `src/engine/supabaseRunner.ts` and `src/__tests__/playtest/integration.test.ts`.

---

## Key Files to Read

- `docs/superpowers/specs/2026-04-06-ai-playtesting-design.md` — Full system spec
- `.claude/GAME_RULES.md` — Official game rules the app must follow
- `ALIGNMENT_PLAN_4_4_2026.md` — 19-task plan for rule fixes
- `src/engine/randomBot.ts` — The bot (where the stalemate fix goes)
- `src/engine/gameRunner.ts` — Game loop (where MAX_ACTIONS lives)
- `src/engine/gameStateMachine.ts` — State machine reducer
- `packages/shared/src/config/bureaucracy.ts` — Bureaucracy menu items and prices

## Commands

- `npm run playtest -- --games 100 --players 3 --verbose` — Run playtest CLI
- `npx vitest run src/__tests__/engine/` — Run engine unit tests (99 tests)
- `npx vitest run src/__tests__/playtest/fuzz.test.ts` — Run fuzz safety net (30 games)

## Critical Constraint

**Every fix must work for 3, 4, AND 5 player modes.** This is tracked in memory at `.claude/projects/C--xampp-htdocs-kred/memory/feedback_player_modes.md`.
