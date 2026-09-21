# Jev-driven arena on the kred2.0 engine: executor sweep + two-browser walk

Two harnesses, one picker (`test/jev-arena/jevPicker.js`). The engine sweep
plays headless games through the LIVE `executeOnline*` executors in
`src/domain/onlineEngine.js`; the browser walk plays the real UI in two
synced contexts against `npm run dev`. Both treat Jev as an unreliable
advisor: every failure falls back to seeded randomness and never throws.

Ported from the `feature/jev-arena-tests` reference arena (which targeted the
`main`-line `src/engine` state machine that does NOT exist on this branch).
Shape ported, imports rewritten: actions enumerate from the kred2.0
executors + `src/domain/moves.js` validators, oracles assert broadcast
behavior, everything runs on `node --test` with zero new dependencies.

## What runs where

**Engine sweep (no browser)** — `test/jev-arena/`:

| File | Job |
|---|---|
| `arenaRunner.js` | async game loop over the executors, per-seat `jev`/`random` drivers, the three oracles |
| `actionEnumerator.js` | every legal executor-call per game situation, derived from `TILES`, move validators, executor guards, pending-play routing — never hardcoded move lists |
| `gameSetup.js` | deterministic campaign-ready G (mirrors `createKredGame` setup with `skipDraft:true`, seeded shuffle) |
| `oracles.js` | illegal-move probe (`inventIllegalProbe`) + rules-side legality (`isOptionLegalByRules`) + twin-state sync |
| `matrix.js` | `(phase × action-type)` coverage set + `CoverageTracker` |
| `jevPicker.js` | one POST per turn, Jev-or-fallback (see below) |
| `seededRandom.js` | mulberry32 + SeededRandom (no deps) |
| `cli.js` | `npm run arena` entrypoint |

- Tests: `npm test` (`node --test "test/**/*.test.js"`) — 30 arena tests
  across 6 files plus the 8 pre-existing `onlineEngine.guards` tests.
- CLI: `npm run arena -- --games 5 --seed 1` — defaults are `--players 3`,
  `--jev-seats none`, `--max-actions 500`, coverage forcing on.

**Browser walk (optional)** — `test/jev-arena/browserWalk.test.js`
(runs inside `npm test`, skips passing when Playwright, its browsers, or the
dev server are missing):

- Needs the dev server (`npm run dev`, default `http://127.0.0.1:3000`,
  override with `KRED_DEV_URL`) and a `playwright` install (NOT a project
  dependency — the walk skips without it so `npm test` stays green).
- The walk uses the landing screen's Local Pass & Play flow: check
  "Skip Draft Phase", "Start 3-Player Test Game". Two contexts start the same
  seeded game; each turn the clickables in context A are enumerated, Jev (or
  RNG offline) picks one, the same index is clicked in B, and the DESYNC
  oracle asserts both DOM fingerprints still match. Any `pageerror` or console
  error fails the walk.
- Env: `SEED` (default 1), `MAX_TURNS` (default 6), `KRED_ARENA_OFFLINE=1`
  for a no-network walk.

## Oracles (what fails a run)

1. **Illegal-move acceptance** — every turn a rules-rejected probe call
   (wrong-mover campaign turn, wrong-actor accept/end-turn, over-limit
   payload) is offered to a scratch clone (`executorBroadcastsIllegal`), and
   every applied option is re-checked by `isOptionLegalByRules` (executor
   guards + `validateMoveCombination`). A broadcast of a rules-illegal call
   fails the game.
2. **Desync** — every accepted option is applied to TWO independent clones;
   `statesInSync` must hold (normalized for the engine's nondeterministic
   fallback piece ids in `applyMoveToState`). Divergence fails the game.
3. **Stall cap** — `maxActions` (default 500) ends the game as `STALLED`
   instead of hanging, and a repeat-state detector cuts deterministic loops
   short. Outcomes: `WIN` / `DRAW` / `STALEMATE` / `STALLED` with a
   `stallReason` (`repeat-state`, `empty-hand-mover:N`, `no-options:<step>`).

## Seeds / repro

- **Engine:** `SeededRandom(seed)`; CLI `--seed N --games G` plays seeds
  N..N+G-1. `--players 3|4|5|all`, `--jev-seats none|all|1,3`,
  `--max-actions N`, `--offline`, `--no-coverage`, `--verbose`. Offline with
  all seats `random` is fully seeded and reproducible — `arena.test.js`
  asserts the same seed gives the same outcome, action count, and stall
  reason. Any live Jev seat is inherently non-reproducible; the report's
  `jevCalls/jevHits/fallbacks` line says how much of the run was Jev.
- **Browser:** `SEED`, `MAX_TURNS`, `KRED_ARENA_OFFLINE=1`. `mulberry32`
  runs in Node and, via init script, inside the page (overrides
  `Math.random`), so both contexts deal the same game for the same `SEED`.

## Jev key setup

- **No key (default):** keyless POST to `https://classifier.dev/v1/classify`
  with `{ input, labels, instructions }`. Duplicate labels are uniquified
  first (`dup` → `dup [2]`) because the endpoint 400s on duplicates; index
  alignment is preserved so the pick maps back to the right action.
- **`TYPESAFE_API_KEY` set:** POST to `https://api.typesafe.ai/v1/systemone`
  (`model: jev-latest`) as a `choice` question over `opt_N` criteria, with
  `Authorization: Bearer` header. `JEV_ENDPOINT` overrides the URL in both.
- **Gate + safety:** confidence threshold 0.6 (0.6 itself is kept, below
  falls back), 5s timeout with a real `User-Agent`
  (`kred-arena-kred2/1.0`), single-option and empty-label turns skip the
  network. Every failure mode — low/null confidence, unknown label,
  non-200, timeout, network error — returns a seeded uniform-random pick
  with a `reason`, never throws.

## Combination-matrix report format

- `expectedPairs()` is derived at runtime from the rules: distinct tile
  move-combos in `TILES` (as `CAMPAIGN:<combo>`, plus `(no moves)`),
  pendingPlay steps (`PENDING:receipt/challenge/reexecute/penaltyWithdraw/
  receiverReward/freeAdvance/challengerReward`), bureaucracy executor kinds
  (`BUREAUCRACY:RESTORE_CRED/PROMOTE_SEAT_TO_ROSTRUM/END`), and every move
  type (`MOVES:<type>`) — so the set grows with the rules instead of rotting.
- One `CoverageTracker` is shared across all games in a CLI run; with
  forcing on, selection prefers currently-uncovered pairs. Types are marked
  after apply, so forcing cannot loop.
- CLI prints three lines plus the uncovered list:
  `Results: <wins> wins, <draws> draws, <stalemates> stalemates, <stalled> stalled, <i> illegal-accept, <d> desync`,
  `Jev: <calls> calls, <hits> picks, <fallbacks> fallbacks`,
  `Matrix: <covered>/<total> pairs covered`, then `Uncovered pairs:`.
  Any illegal-accept or desync exits 1.
- Measured: `node test/jev-arena/cli.js --games 3 --seed 1 --players 3
  --offline` covers 29/29 pairs in under a second with 0 illegal-accept
  and 0 desync.

## Findings so far (live kred2.0 behavior, verified by the arena)

1. **`empty-hand-mover` softlock** — `executeOnlineCampaignTurn` pins
   `nextMoverId` exactly, but no executor skips a mover whose hand is empty
   (the boardgame.io `campaignPhase` turn order does skip). Passing the last
   tile's turn to an empty-hand receiver freezes the online game; the arena
   names it (`stallReason: empty-hand-mover:N`) instead of hanging.
2. **Bureaucracy end-turn actor loop** — `executeOnlineEndBureaucracyTurn`
   never advances `bureaucracyTurnIndex`, so only the first actor in
   `bureaucracyTurnOrder` can ever act (`repeat-state` stalls in the arena;
   the bgio `endBureaucracyTurn` move increments the index).
3. **Reexecute-family blind apply** — `executeOnlineReexecute`,
   `executeOnlinePenaltyWithdraw`, and `executeOnlineFreeAdvance` apply
   staged moves without validation (the bgio counterparts require honest /
   Withdraw / Advance respectively). The enumerator only offers honest
   constructions, so a position with no honest reexecute ends as
   `no-options:reexecute` — a rules-level stalemate, not an oracle failure.

## What it will not find

Balance, fun, and strategy quality — by design. Picks are plausibility votes
(Jev labels) or uniform random, not strong play: there is no opponent
modeling, no win-rate significance testing, and coverage forcing deliberately
distorts play toward rare pairs. The browser walk checks sync and console
errors, not whether the UI is correct or pleasant. A green arena means "no
illegal broadcasts, no desyncs, no hangs across the swept space" — nothing
about whether the game is good. Draft-phase executors are out of scope (the
arena deals campaign-ready hands); challenge-empty and bank-full edges are
handled by mirroring the executors' own fallback rules.
