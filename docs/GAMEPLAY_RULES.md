# KRED Gameplay Rules & Turn Mechanics

## 1. Domain Structure & Spatial Placement
Each player has an identical Domain with the following spatial structure (top-to-bottom):
```
              [Office]              <-- 1 Office space (top)
             /        \
      [Rostrum 1]  [Rostrum 2]     <-- 2 Rostrum spaces (middle)
       /  |  \      /  |  \
    [S1][S2][S3] [S4][S5][S6]      <-- 6 Seat spaces (bottom row)
```

Locations use the format `p{playerId}_{type}{number}`:
- Seats 1-3 support Rostrum 1.
- Seats 4-6 support Rostrum 2.
- Both Rostrums support the Office.

### Support Rule Invariant
No piece may exist at a Rostrum if all 3 supporting Seats are empty. No piece may exist at the Office if both Rostrums are empty. If a vacancy occurs that violates support, upper pieces immediately cascade down (auto-enforced).

---

## 2. Six Basic Board Actions

1. **Advance**: Move a piece upward (Community -> Seat -> Rostrum -> Office). Takes a Mark from Community first (or Heel if zero Marks remain).
2. **Withdraw**: Move a piece downward (Office -> Rostrum -> Seat -> Community).
3. **Organize**: Move a piece sideways within your Domain or to an adjacent Rostrum/Seat in a neighboring Domain.
4. **Assist**: Move an opponent's piece upward in their Domain. Takes a piece from Community if moving into a Seat.
5. **Remove**: Take an opponent's Mark from a Seat and return it to Community. (Cannot target Heels, Pawns, or Rostrums/Offices).
6. **Influence**: Move an opponent's Mark or Heel within or across Domains (cannot target Pawns across Domains).

---

## 3. Turn & Campaign Execution

### Step 1: Play Submission (Mover)
- Mover selects 1-2 moves matching a tile, or bluffs with non-matching moves.
- Chooses a Receiver and passes the tile face-down.

### Step 2: The Receipt (Receiver)
- **If 0 credibility**: Cannot look at tile. Accepted directly.
- **If credibility > 0**: May inspect tile. If dishonest, may **Reject** (Whistle Blown).

### Step 3: The Challenge (Other Players)
- Bystanders with credibility may challenge face-down accepted plays in clockwise order.

### Outcomes:
- **Quiet Kept**: Tile face-down into Bank. No credibility change. Receiver becomes next Mover.
- **Whistle Blown (Rejected)**: Mover resets board & loses 1 notch (or withdraw penalty). Tile goes face-up into Receiver's Bank. After Mover rectifies moves to satisfy the tile, Receiver chooses either: (A) Restore up to 2 credibility notches, or (B) Take an "Advance" move.
- **Smoking Gun (Challenged & Dishonest)**: Mover resets board & loses 1 notch. Receiver loses 1 notch. Challenger gains 1 notch.
- **Witch Hunt (Challenged & Honest)**: Mover gains 1 notch. Challenger loses 1 notch. Tile face-down in Bank.

---

## 4. Credibility & Penalties
- 4 credibility states (Full, 1 lost, 2 lost, 0 lost).
- At 0 credibility: Cannot challenge, cannot inspect received tiles, caught dishonest mover must perform a **Withdraw action penalty**.
