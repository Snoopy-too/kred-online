# KRED Game Rules

> **Source**: [Official KRED Manual](https://flyingdutchmen.online/KRED/manual)
> 
> **Purpose**: This document provides a reference for game mechanics and tile requirements to ensure the digital implementation matches the official rules.

## Critical Tile Rules

### Tile Requirements and Rejection

From the official manual:

> **If one or both of the actions on a tile are impossible due to the current state of the board, such actions may be forgone and the play will still be considered honest if challenged.**

**Key Rules**:
1. If a tile's requirements are played correctly by the player, it **CANNOT be rejected**
2. A correctly played tile is **NOT AFFECTED by challenges**
3. If the board state makes one or both requirements **impossible to execute**, the tile also **CANNOT be rejected** and is **NOT AFFECTED by challenges**
4. The **BLANK TILE** (5-player mode only) requires the player to make **NO moves**
   - If they make ANY moves with the blank tile, those moves **ARE AFFECTED** by rejection/challenges
5. **All requirements must be completed** for the tile to be unrejectable
   - If only some requirements are met, the tile **CAN be rejected**

### The Blank Tile

From the official manual:

> **When this tile is played, the Receiver will have no choice but to accept and any legal move will be considered honest. If challenged, the Challenger will incur one notch on their credibility and the Mover will restore one.**
> 
> **The blank tile cannot be used to achieve a winning setup.**

**Implementation Notes**:
- BLANK tile: No required moves
- If no moves made → tile CANNOT be rejected
- If ANY moves made → tile CAN be rejected
- Any legal move is considered honest with the blank tile
- Blank tile cannot trigger a win condition

## Move Types

From the official manual's "How the Pieces Move" section:

### Advance (Mandatory)
- Add one Mark from Community to vacant Seat (or Heel if no Marks available)
- Once all 3 Seats of a Faction are occupied, advance piece to Rostrum
- If both Rostrums occupied, can advance from Rostrum to Office

### Remove (Optional)
- Remove one Mark from opponent's Seat to Community
- Cannot remove from Rostrums or Offices
- Cannot remove Pawns or Heels

### Influence (Optional)
- Move opponent's Mark or Heel one space left or right
- Can move between Domains (including into your own)
- Cannot Influence Pawns

### Assist (Optional)
- Add one Mark from Community to opponent's vacant Seat (or Heel if no Marks available)

### Withdraw (Mandatory)
- Withdraw piece from your Seat back to Community, OR
- Move piece from your Rostrum down to vacant Seat, OR
- Move piece from your Office down to vacant Rostrum

### Organize (Mandatory)
- Move one of your pieces one space left or right
- Cannot move between Rostrums
- Can transfer piece to adjacent player's Rostrum or Seat

## Move Constraints

From the official manual:

> **When making two moves in a turn, they may be done in any order. However, they must affect separate pieces. For example, you cannot Influence another player's piece into your domain and then Advance or Withdraw the same piece. Nor can you give another player a piece and then Influence that same piece into your own domain.**

## Tile Play Options

Based on the game rules, tiles can require:
- **NO_MOVE**: No moves allowed
- **ONE_OPTIONAL**: One move from the optional moves (REMOVE, INFLUENCE, ASSIST)
- **ONE_MANDATORY**: One move from the mandatory moves (ADVANCE, WITHDRAW, ORGANIZE)
- **ONE_OPTIONAL_AND_ONE_MANDATORY**: One optional + one mandatory move

## Verification Checklist

When implementing or testing tile validation:

- [ ] Verify tile requirements match the official tile images/descriptions
- [ ] Test that tiles with met requirements cannot be rejected
- [ ] Test that tiles with impossible requirements cannot be rejected
- [ ] Test that tiles with partially met requirements CAN be rejected
- [ ] Test BLANK tile: no moves made → cannot reject
- [ ] Test BLANK tile: moves made → can reject
- [ ] Verify move type classifications (mandatory vs optional)
- [ ] Test that impossible board states don't trigger rejection

## Implementation References

- **Tile Requirements**: `src/config/rules.ts` - `TILE_REQUIREMENTS`
- **Move Definitions**: `src/config/rules.ts` - `DEFINED_MOVES`
- **Tile Play Options**: `src/config/rules.ts` - `TILE_PLAY_OPTIONS`
- **Validation Logic**: `src/game/tile-validation.ts`
- **Tests**: `src/__tests__/game/tile-validation.test.ts`
