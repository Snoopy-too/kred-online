# Rule Changes: Adjacent Rostrum Relaxation & Partial-Impossibility Honesty

**Date:** 2026-04-18
**Status:** Design approved, pending implementation plan
**Branch:** `supabase-multiplayer`

---

## Summary

Two independent rule changes to KRED:

1. **Rule 1 — Adjacent rostrum relaxation.** A piece may move from its current rostrum to an adjacent rostrum regardless of how many of the destination rostrum's supporting seats are filled. If the destination's supporting section is completely empty, the mover must designate one of the three supporting seats as the final landing spot; the piece lands in that seat. Applies to Organize and Influence. Advance (seat → own rostrum) is unchanged.

2. **Rule 2 — Partial-impossibility honesty.** If a tile's requirement set contains a move that the current board state cannot accommodate, executing every *possible* required move honestly is enough for the tile to be considered honest in whole. The receiver cannot expose it; bystander challenges fail.

---

## Motivation

- Rule 1 removes a choke point where pieces at a rostrum have no legal destination once their own supporting seats drain, making gameplay less likely to stall on late-game boards.
- Rule 2 resolves a long-standing ambiguity about partial-impossibility: previously the engine treated tile honesty as all-or-nothing with respect to board-state possibility. The revised rule matches intended play: the player must do what the board allows, and the board's limits cannot be weaponized to trap the player into dishonest status.

---

## Architecture Overview

Both changes live in the rules/validation layer. No state-machine restructuring, no UI redesign, no multiplayer protocol change. Every edit must land in both `src/` and its workspace mirror `packages/shared/src/`.

| Concern | File | Change |
|---|---|---|
| Rostrum-to-rostrum validation | `rules/rostrum.ts` → `validateAdjacentRostrumMovement` | Drop supporting-seats-full check |
| Piece-movement validation | `rules/movement.ts` → `validatePieceMovement` | Skip seat-full check when source is an adjacent rostrum; accept rostrum → adjacent-supporting-seat when section is empty |
| Move-type classification | `rules/movement.ts` → `validateMoveType` | Classify rostrum → adjacent-supporting-seat (empty section) as Organize/Influence |
| Move-possibility helpers | `rules/move-validation.ts` (new export) | Central `isMoveTypePossible(moveType, playerId, pieces, playerCount)` |
| Tile honesty | `game/tile-validation.ts` → `canTileBeRejected` | Accept `possibleRequiredMoves: DefinedMoveType[]` instead of `wasExecutionPossible: boolean` |
| Callers of `canTileBeRejected` | `engine/outcomeResolution.ts`, `engine/gameStateMachine.ts` (and any other call site surfaced by the compiler) | Build the possible-required-moves list using `isMoveTypePossible` |
| Drag-drop UI | Legal-target computation for tile-play drag targets | Surface supporting-seat targets when Rule 1 cascade applies |
| Bot move enumeration | `engine/randomBot.ts` | Same legal-target expansion |
| Documentation | `MANUAL.md`, `.claude/GAME_RULES.md`, `TILE_MOVES_REFERENCE.md` | Update rule text |
| Tests | `__tests__/rules/rostrum.test.ts`, `__tests__/rules/movement.test.ts`, `__tests__/rules/move-validation*.test.ts`, `__tests__/game/tile-validation.test.ts`, plus one integration test in `__tests__/engine/` | Cover new behaviors across 3, 4, and 5 player modes |

Per-project convention: all changes must work in **3, 4, and 5 player modes**. Tests assert this.

---

## Rule 1 — Adjacent Rostrum Movement (Detailed)

### Legality

A piece may move from rostrum A to rostrum B if:

- A and B are adjacent per `ROSTRUM_ADJACENCY_BY_PLAYER_COUNT` for the current player count, **and**
- The mover satisfies the mover-ownership rules for the action (Organize: mover owns A; Influence: mover is moving a non-own piece from A to B, and B is in a third player's domain).

The current requirement that B's 3 supporting seats be fully occupied is **removed**.

### Landing resolution

- **Destination section has ≥ 1 supporting seat occupied** → piece lands in rostrum B.
- **Destination section has 0 supporting seats occupied** → mover must designate one of B's three supporting seats; piece lands in that seat. The move still counts as a single Organize (or Influence) move.

### Move-type classification

`validateMoveType` currently returns UNKNOWN for rostrum → seat transitions. Extend it:

- If source is a rostrum and destination is a seat that is (a) a supporting seat of a rostrum R, (b) R is adjacent to the source rostrum for the current player count, and (c) R's supporting section is fully empty of pieces, then:
  - Return **ORGANIZE** if the mover owns the source rostrum.
  - Return **INFLUENCE** otherwise.
- All other rostrum → seat transitions remain UNKNOWN.

### Ownership semantics under Influence cascade

The moved piece keeps its original owner. It physically occupies another player's supporting seat. This is consistent with the existing state model (piece owner and seat owner are independent).

### Validator changes

**`rules/rostrum.ts` — `validateAdjacentRostrumMovement`**: remove the block that checks `areSupportingSeatsFullForRostrum(targetRostrumId, pieces)`. Adjacency, ownership of the source, and existence of a piece to move remain the only checks.

**`rules/movement.ts` — `validatePieceMovement`**:

- In the "moving to a rostrum" branch, skip the `areSupportingSeatsFullForRostrum` check when the source location is a rostrum adjacent to the destination. Retain the check for seat → own-rostrum and community → own-rostrum paths.
- Add a new accepted transition: rostrum → seat when the destination seat is a supporting seat of the adjacent rostrum AND that adjacent rostrum's entire supporting section is empty. Ownership check: the mover must be the source rostrum's owner (Organize) OR moving a piece that belongs to someone other than the destination seat's owner (Influence); either is legal since both are existing action types — the mover identity/piece-owner relationship is already established by the caller, and this validator only checks location legality.
- Also validate the destination seat itself is empty at time of resolution.

### Drag-drop UI & bot move enumeration

When computing legal drop targets for a piece currently at a rostrum:

1. Always include the adjacent rostrum (if ownership rules allow).
2. If the adjacent rostrum's supporting section is fully empty, additionally include all three of that section's supporting seats as drop targets.

The bot enumerator (`randomBot.ts` and any other legal-move generators) must mirror this expansion so sampled moves are a superset of the old legal set.

### Edge cases

- Adjacent rostrum already contains another piece → unchanged; multiple pieces in a rostrum is existing behavior.
- Adjacent section has 1 seat filled + rostrum occupied → landing in the rostrum alongside another piece is legal.
- Empty section but a supporting seat becomes occupied mid-turn between target-computation and drop → validator re-checks at resolution; drop is rejected if the picked seat is no longer empty.

### What Rule 1 does NOT change

- Advance from seat → own rostrum still requires all 3 supporting seats filled.
- Advance from community → own rostrum still requires all 3 supporting seats filled.
- Rostrum → office (Advance) still requires both rostrums filled.
- Non-adjacent rostrum → rostrum is still illegal.
- All other move types (Remove, Assist, Withdraw) unchanged.

---

## Rule 2 — Partial-Impossibility Honesty (Detailed)

### Honesty truth table

For a tile whose required-move set is R, let P ⊆ R be the subset of required moves that were *possible* given the board state at tile reveal, and let E be the set of moves executed by the receiver.

| Scenario | Condition | Exposable? |
|---|---|---|
| Fully honest | P ⊆ E | No |
| Fully impossible | P = ∅, E = ∅ | No |
| Partially impossible, possible moves all executed | P ⊆ E, P ⊊ R | **No (new behavior)** |
| Partially impossible, at least one possible move skipped | ∃ m ∈ P with m ∉ E | **Yes** |
| Possible move skipped | ∃ m ∈ P with m ∉ E | Yes |

The BLANK tile is unchanged: non-empty E ⇒ rejectable.

### API change — `canTileBeRejected`

**Before:**

```ts
canTileBeRejected(
  tileId: string,
  executedMoves: DefinedMoveType[],
  wasExecutionPossible: boolean
): boolean
```

**After:**

```ts
canTileBeRejected(
  tileId: string,
  executedMoves: DefinedMoveType[],
  possibleRequiredMoves: DefinedMoveType[]
): boolean
```

**New logic:**

```
if (tileId === 'BLANK') return executedMoves.length > 0;
const requirements = getTileRequirements(tileId);
if (!requirements) return true; // unknown tile
// Tile is honest iff every possible required move was executed.
for (const move of possibleRequiredMoves) {
  if (!executedMoves.includes(move)) return true; // rejectable
}
return false; // not rejectable
```

### Centralizing per-move possibility

Add to `rules/move-validation.ts` (and mirror):

```ts
export function isMoveTypePossible(
  moveType: DefinedMoveType,
  actingPlayerId: number,
  pieces: Piece[],
  playerCount: number
): boolean
```

Per-move semantics:

- **REMOVE** — exists ≥ 1 Mark piece currently in a seat owned by a player ≠ actingPlayerId.
- **INFLUENCE** — exists ≥ 1 piece not owned by actingPlayerId that has a legal Influence destination, where legality follows the revised Rule 1 (rostrum → adjacent rostrum always geometrically possible; seat → adjacent seat requires adjacency and an empty destination seat).
- **ASSIST** — community contains ≥ 1 piece AND ≥ 1 opponent has a vacant seat.
- **ADVANCE** — ≥ 1 of {community → own vacant seat; own-seat piece → own-supported-rostrum (still requires 3 supporting seats); own-rostrum piece → own-office (still requires both rostrums filled)} is possible.
- **WITHDRAW** — actingPlayerId has ≥ 1 piece in their domain AND ≥ 1 legal withdraw destination (office → vacant rostrum, rostrum → vacant seat, seat → community).
- **ORGANIZE** — ≥ 1 of actingPlayerId's pieces has a legal adjacent destination (seat → adjacent seat with empty target, or rostrum → adjacent rostrum under Rule 1 — always legal if acting player has a piece at one of their rostrums).

Existing ad-hoc possibility checks in the codebase should be replaced with calls to this helper where they overlap, but that cleanup is scoped to what the new functionality requires — no broader refactor.

### Callers of `canTileBeRejected`

The TypeScript signature change will surface every call site. Each caller must:

1. For each `moveType ∈ TILE_REQUIREMENTS[tileId].requiredMoves`, call `isMoveTypePossible(moveType, receiverPlayerId, pieces, playerCount)`.
2. Pass the array of those possible required moves into `canTileBeRejected`.

Primary call sites expected: `engine/outcomeResolution.ts`, `engine/gameStateMachine.ts`, and their test files. The compiler enumerates the full list.

### Interaction with Rule 1

Because Rule 1 expands when Organize and Influence are geometrically possible, the `isMoveTypePossible` results for those two move types shift compared to pre-change behavior. Tiles 09, 10, 11, 12, 13, 14, 17, 18 (any tile with Organize or Influence in its requirement set) will see slight shifts in which plays count as honest. This is intended and consistent with the new rules.

---

## Testing Strategy

All test scenarios below must be executed for **each of 3, 4, and 5 player modes** (parameterized test data).

### Rule 1 unit tests (`__tests__/rules/rostrum.test.ts`, `__tests__/rules/movement.test.ts`)

1. Organize rostrum → adjacent rostrum, destination section fully filled → legal, lands in rostrum (regression).
2. Organize rostrum → adjacent rostrum, destination section has 1 or 2 seats filled → **newly legal**, lands in rostrum.
3. Organize rostrum → adjacent rostrum, destination section empty, mover picks supporting seat → legal, lands in declared seat; classified ORGANIZE.
4. Influence opponent-rostrum → adjacent third-player rostrum; same filled/partial/empty matrix as Organize; cascade case classifies INFLUENCE.
5. Advance seat → own rostrum with < 3 supporting seats filled → still rejected (Rule 1 does not affect Advance).
6. Rostrum → non-adjacent rostrum → rejected.
7. Rostrum → seat that is not a supporting seat of an adjacent rostrum → rejected.
8. Rostrum → supporting seat of adjacent rostrum when destination section is NOT empty → rejected (cascade only applies when section is fully empty).
9. Rostrum → supporting seat of adjacent rostrum when destination seat is already occupied → rejected.

### Rule 2 unit tests (`__tests__/game/tile-validation.test.ts`)

1. Tile 01 (REMOVE + ADVANCE), both possible, both executed → not rejectable (regression).
2. Tile 01, both possible, only ADVANCE executed → rejectable (regression).
3. Tile 01, REMOVE impossible (no opponent Marks), only ADVANCE executed → **not rejectable (new)**.
4. Tile 01, REMOVE impossible, nothing executed → rejectable (possible ADVANCE skipped).
5. Tile 12 (ORGANIZE only), ORGANIZE impossible, nothing executed → not rejectable (regression; all impossible).
6. Tile 13 (ASSIST + ORGANIZE), ORGANIZE impossible, only ASSIST executed → **not rejectable (new)**.
7. Tile 13, ASSIST possible but not executed, ORGANIZE executed → rejectable.
8. Tile 14, ASSIST impossible, ORGANIZE impossible, nothing executed → not rejectable.
9. BLANK tile, no moves → not rejectable. BLANK with moves → rejectable (regression).

### `isMoveTypePossible` unit tests (`__tests__/rules/move-validation*.test.ts`)

For each of the 6 defined move types: one board state where the move is possible, one where it is not. Specifically verify:

- ORGANIZE is reported possible when the only legal destination is an adjacent rostrum with an empty supporting section (Rule 1 relaxation).
- INFLUENCE is reported possible when the only legal destination is an adjacent rostrum with an empty supporting section.

### Integration test (`__tests__/engine/`)

At least one test that plays a full tile-reveal turn exercising Rule 2 partial-impossibility and verifies:

- The outcome is "honest."
- Credibility is unchanged for both parties.
- No expose prompt is presented.

### Manual / deployed verification

After pushing to `supabase-multiplayer` and letting Netlify deploy, exercise on the live build:

- Start a game in 3-, 4-, and 5-player modes.
- Drag a rostrum piece to an adjacent rostrum whose supporting section is empty. UI surfaces the three supporting seats as valid drop targets; dropping on a seat lands there.
- Play tile 13 against a player whose board can Assist but cannot Organize. Verify no expose prompt appears and no bystander challenge succeeds.

---

## Rollout

Single branch: `supabase-multiplayer`. No PRs. Commits pushed to GitHub; Netlify deploys each push for online testing.

Commit sequence (logical steps, each green on `npm test`):

1. Add `isMoveTypePossible` helper in `rules/move-validation.ts` + shared mirror + unit tests. Pure addition; no callers yet.
2. Rule 1 validator changes: `validateAdjacentRostrumMovement`, `validatePieceMovement`, `validateMoveType`, plus legal-target expansion in drag-drop UI and bot move enumeration. Unit + integration tests.
3. Rule 2 API change: new `canTileBeRejected` signature, update all callers to compute `possibleRequiredMoves` via `isMoveTypePossible`, tests.
4. Documentation: `MANUAL.md`, `.claude/GAME_RULES.md`, `TILE_MOVES_REFERENCE.md`.

---

## Non-Goals

- No change to tile definitions or the `TILE_REQUIREMENTS` mapping.
- No change to Advance or Withdraw semantics.
- No change to Remove targeting (Marks only).
- No change to credibility computation, exposure, or challenge mechanics beyond what flows from the revised `canTileBeRejected` contract.
- No UI redesign — only the legal-target set grows.
- No change to 2-player mode (not supported).

---

## Risks & Mitigations

- **Silent breakage at `canTileBeRejected` call sites.** Mitigated by the TypeScript signature change, which forces compile errors everywhere; all call sites updated in the same commit (step 3).
- **AI playtest regression.** Bots gain legal moves; expose rates shift. Run `npm run playtest` after step 3 in each of 3/4/5-player modes and compare legal-move counts and honest/dishonest outcomes against a pre-change baseline. Shifts in the expected direction are fine.
- **Drag-drop UI surfaces wrong targets.** Supporting-seat targets are gated strictly by "section fully empty." Unit tests for the target generator; manual verification on the deployed build.
- **Multiplayer state sync.** The cascade destination must be encoded in the move event so remote clients replay the same landing. Move events already carry the destination `locationId`; verify in step 2 that no schema change is needed.
- **`src/` vs `packages/shared/src/` drift.** Every edit lands in both copies within the same commit. Tests import from each copy independently.

---

## Open Items

None. All design questions resolved in brainstorming.
