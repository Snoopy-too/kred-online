# Multiplayer Handler Wiring Audit & Fix

**Date**: 2026-04-22
**Branch**: `supabase-multiplayer`
**Scope**: Eliminate latent "missing wiring" regressions introduced by the Step 7 Phase 3 rewrite of `App.tsx`.

## Context

Step 7 Phase 3 thinned `src/App.tsx` from ~4,500 lines to ~370. During the rewrite, every `create*Handlers(...)` call site was cast `as any`, which silenced TypeScript errors when required dependencies were dropped. The bugs are latent: each broken code path only surfaces when a user takes the action that triggers it. The branch's last five commits (`7eec24d`, `6f77edf`, `6b2be07`, `de20db1`, `5b1d223`) are all reactive patches for this same pattern.

Two new bugs were reported at the start of this work:

1. **Turn indicator wrong**: In a 3-player game, every player's screen shows `"<currentPlayer>'s Turn"` rather than `"Your Turn"` for the active player.
2. **Pieces unmovable**: The active player cannot drag pieces on the board.

Investigation traced both to the same root pattern. Rather than continuing reactive whack-a-mole, this spec defines a one-pass audit that compares every wiring surface in current `App.tsx` against `git show a350780:src/App.tsx` (the last known-good pre-rewrite snapshot) and restores everything that was dropped.

## Confirmed Root Causes

### Bug A — Turn indicator

`CampaignScreen.tsx:1492-1499` derives the title from `isMover = campaignRole === 'mover'`, etc. In the pre-refactor App, `campaignRole` was **computed per-viewer at render time** (a350780 lines 4243-4297) using `playerIndex`, `gameState`, `playedTile`, `tileTransaction`, `challengeOrder`, `currentChallengerIndex`, `takeAdvantageChallengerId`, `bonusMovePlayerId`. The computed value was passed as a prop.

In current code:

- `campaignRole` lives in `PhaseProvider` as a single global value.
- `setCampaignRole(...)` is **never called** during gameplay (only by `setCampaignRole(packet.campaignRole)` on apply, and `setCampaignRole(null)` on reset).
- It stays `null`, every role flag evaluates `false`, and every viewer falls through to the `${nameByIndex(currentPlayerIndex)}'s Turn` branch.

### Bug B — Pieces unmovable

`App.tsx:187` calls `createPieceMovementHandlers({...} as any)` and **omits 5 required deps**: `validatePieceMovement`, `validateMoveType`, `calculatePieceRotation`, `formatLocationId`, `ALERTS`. `handlePieceMove` (handlers/pieceMovementHandlers.ts:155) calls `deps.validatePieceMovement(...)` first thing on a non-empty `locationId` → `TypeError: undefined is not a function`, swallowed by the drop handler. Piece never moves.

## Audit Surfaces

Each surface gets a side-by-side diff against `a350780:src/App.tsx`. For each gap: pre-refactor behavior, current behavior, trigger path, fix.

1. `createGameFlowHandlers` — already patched in `6b2be07`; re-verify nothing else dropped.
2. `createPieceMovementHandlers` — known broken (Bug B).
3. `createTurnHandlers` — pre-refactor passes `getLocationIdFromPosition`, `formatLocationId`. Current omits both. `turnHandlers.ts:125,134,144,157` calls them inside `advanceTurnNormally` → end-of-turn very likely throws.
4. `createTilePlayHandlers` — pre-refactor wraps `calculateMoves` as `(orig, cur, pid) => calculateMovesCore(orig, cur, pid, playerCount, areSeatsAdjacent)`; current passes `calculateMovesCore` raw — signature mismatch when tile-play paths invoke it.
5. `useChallengeFlowHandlers` — verify hook input contract against pre-refactor `createChallengeFlowHandlers` deps.
6. `useBureaucracyHandlers` — verify hook input contract against pre-refactor bureaucracy handler deps.
7. **Per-viewer derivations**: `campaignRole` (Bug A), `viewingPlayerId`, `challengeRevealCanContinue`, hand visibility, take-advantage gating, bonus-mover gating. These are conditions of the form `(!isMultiplayer || playerIndex === ...)` that need to use `playerIndex` rather than `currentPlayerIndex` from the host.
8. **Effects/refs**: state-sync push, host action dispatcher (`useMultiplayerHost`), draft-pick wrapper. Already partially restored — verify no further omissions.

## Fix Order

1. **Bug A — per-viewer `campaignRole`**. Place the derivation in `App.tsx` (or a small dedicated hook `useViewerCampaignRole`) producing the value from `playerIndex`, `gameState`, and the relevant phase state. Pass through `campaignValue` context as `campaignRole`. Change `CampaignScreen` to consume `campaignRole` from context instead of `useGameState()`. Leave the global `PhaseProvider.campaignRole` field in place (it is harmless once the per-viewer derivation overrides it; removing it is out of scope).
2. **Bug B — restore the 5 missing deps** to `createPieceMovementHandlers` at `App.tsx:187`. Drop the `as any` cast on this call so future omissions surface as TS errors.
3. **Sweep surfaces 3, 4, 5, 6**. For each, restore deps, drop `as any` where feasible, and add it to the dep array of the surrounding `useMemo`.
4. **Sweep surface 7**. Catalog every per-viewer condition in `CampaignScreen`, `BureaucracyScreen`, `DraftingScreen`. For each: confirm correct behavior in 3/4/5 player MP. Fix any that compare against `currentPlayerIndex` when they should compare against `playerIndex`.
5. **Sweep surface 8**. Verify dispatcher branches in `useMultiplayerHost` cover every action that `multiplayerActions` can emit, and that ref wiring (`applyStatePacketRef`, `pushStateRef`) is complete.

Stop after surface 8. No adjacent refactoring, no typecheck cleanup, no test repair.

## Verification

- Per-touched-file typecheck (full repo typecheck is pre-broken per handoff item 5).
- Manual smoke test on each Netlify deploy: 3-, 4-, and 5-player games. For each:
  - Active player sees "Your Turn"; other players see correct name.
  - Active player can drag pieces; non-active cannot.
  - End-turn advances correctly to next player.
  - Tile play → receiver decision → challenge flow fires at least once.
  - Bureaucracy phase reachable, each player can take their turn.
- Test suite baseline (64 failed files / 580 failed tests / 2,076 passed) must not regress.

## Out of Scope

- Pre-existing typecheck errors: `hasExtraMoves`/`extraMoves` on `MoveCheckResult`, missing vitest globals, `isolatedModules` re-exports.
- Test suite repair.
- Architectural redesign of the provider/handlers split.
- Removing the now-vestigial global `PhaseProvider.campaignRole` field.

## Commits

Single commit at the end of the audit, direct to `supabase-multiplayer` (no PRs per project workflow). All fixes batched into one commit for one Netlify deploy + one smoke-test pass.

## Risks

- **Hidden state in PhaseProvider.campaignRole**: if any other code path reads it, switching CampaignScreen to a context-derived value could leave inconsistencies. Mitigation: grep for all `campaignRole` reads outside `selectors.ts` before flipping the source.
- **Per-viewer derivation logic complexity**: pre-refactor logic was ~55 lines of conditionals on game state. Risk of subtle off-by-one errors (1-indexed `player.id` vs 0-indexed `playerIndex`). Mitigation: copy the pre-refactor logic verbatim into the new derivation site, only changing variable scoping.
- **Dropping `as any` may surface unrelated TS errors**: if it does, restore the cast for that call and note the unrelated error for the existing typecheck-cleanup backlog rather than expanding scope.
