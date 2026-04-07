# KRED Game Manual (Agent Reference)

A deception and strategy game for 3-5 players. Players compete to fill their Domain with pieces by playing tiles, bluffing, and challenging opponents. The core tension: honest plays are safe but predictable; dishonest plays are powerful but risky if caught.

---

## 1. Components

### 1.1 Pieces

There are three types of pieces, listed in ascending rank:

| Piece | Description |
|-------|-------------|
| **Mark** | Lowest rank. Can be Removed by opponents. Can be promoted to Heel. |
| **Heel** | Mid rank. Cannot be Removed by opponents. Can be promoted to Pawn. |
| **Pawn** | Highest rank. One per player maximum. Cannot be Removed or Influenced across Domains. |

Piece counts by player mode:

| Mode | Marks | Heels | Pawns |
|------|-------|-------|-------|
| 3-player | 12 | 9 | 3 |
| 4-player | 15 | 13 | 4 |
| 5-player | 18 | 17 | 5 |

### 1.2 Tiles

There are 24 numbered tiles (IDs `"01"` through `"24"`) plus 1 blank tile (ID `"BLANK"`, used only in 5-player mode). Each tile specifies:
- **Required moves**: The move type(s) that constitute an "honest" play of that tile.
- **Funding value**: The kredcoin value used during Bureaucracy (only counted if the tile is face-down in the player's Bank).

#### Complete Tile Reference

| Tile ID | Required Moves | Funding (kredcoins) |
|---------|---------------|---------------------|
| 01 | Remove + Advance | 1 |
| 02 | Remove + Advance | 2 |
| 03 | Influence + Advance | 0 |
| 04 | Influence + Advance | 1 |
| 05 | Advance | 2 |
| 06 | Advance | 3 |
| 07 | Assist + Advance | 4 |
| 08 | Assist + Advance | 5 |
| 09 | Remove + Organize | 1 |
| 10 | Remove + Organize | 2 |
| 11 | Influence | 4 |
| 12 | Organize | 5 |
| 13 | Assist + Organize | 5 |
| 14 | Assist + Organize | 6 |
| 15 | Remove | 3 |
| 16 | Remove | 4 |
| 17 | Influence + Withdraw | 3 |
| 18 | Influence + Withdraw | 4 |
| 19 | Withdraw | 6 |
| 20 | Withdraw | 7 |
| 21 | Withdraw | 8 |
| 22 | Assist + Withdraw | 7 |
| 23 | Assist + Withdraw | 8 |
| 24 | Assist + Withdraw | 9 |
| BLANK | (none - wild) | 0 |

The sum of all tile funding values is exactly 100. This is used as a checksum: face-down tiles (counted) + face-up tiles (not counted) must total 100.

#### Tile Distribution by Tiles Per Player

| Mode | Tiles per player | Tile dealing |
|------|-----------------|--------------|
| 3-player | 8 tiles each (24 total) | No blank tile |
| 4-player | 6 tiles each (24 total) | No blank tile |
| 5-player | 5 tiles each (25 total) | Includes blank tile |

### 1.3 Credibility Tokens

Each player has a credibility token with 4 states:

| State | Notches Lost | Value | Description |
|-------|-------------|-------|-------------|
| Full | 0 | 3 | Starting position. All abilities available. |
| One notch | 1 | 2 | Still functional. |
| Two notches | 2 | 1 | Still functional. |
| No credibility | 3 | 0 | Severe restrictions (see Section 6). |

---

## 2. Board Layout (The Domain)

Each player has an identical **Domain** with the following spatial structure, described top-to-bottom:

```
              [Office]              <-- 1 Office space (top, marked with blue star)
             /        \
      [Rostrum 1]  [Rostrum 2]     <-- 2 Rostrum spaces (brown, triangular)
       /  |  \      /  |  \
    [S1][S2][S3] [S4][S5][S6]      <-- 6 Seat spaces (bottom row)
```

### 2.1 Location Identifiers

Locations use the format `p{playerId}_{type}{number}`:
- Office: `p1_office`, `p2_office`, etc.
- Rostrums: `p1_rostrum1`, `p1_rostrum2`, etc.
- Seats: `p1_seat1` through `p1_seat6`
- Community: `community` (shared pool of unplaced pieces)

### 2.2 Faction Structure

A **Faction** consists of one Rostrum and its 3 supporting Seats:
- **Faction 1**: Rostrum 1 + Seats 1, 2, 3
- **Faction 2**: Rostrum 2 + Seats 4, 5, 6

This matters for Advance (seats must support their rostrum) and the support rule (Section 3.7).

### 2.3 Seat Adjacency

Seats are adjacent if they are consecutive within a domain OR at the boundary between domains.

**Within a domain**: Seat N is adjacent to Seat N-1 and Seat N+1 (for seats 1-6).

**Cross-domain (wrapping)**: The last seat (seat 6) of one player wraps to the first seat (seat 1) of the next player in clockwise order.

Clockwise player order:
- 3-player: 1 -> 3 -> 2 -> 1
- 4-player: 1 -> 2 -> 3 -> 4 -> 1
- 5-player: 1 -> 2 -> 3 -> 4 -> 5 -> 1

So in a 3-player game: `p1_seat6` is adjacent to `p3_seat1`, `p3_seat6` is adjacent to `p2_seat1`, `p2_seat6` is adjacent to `p1_seat1`.

### 2.4 Rostrum Adjacency

Certain rostrums are adjacent, forming a circular chain (each player's rostrum 2 connects to the next player's rostrum 1):

**3-player**: p1_rostrum2 <-> p3_rostrum1, p3_rostrum2 <-> p2_rostrum1, p2_rostrum2 <-> p1_rostrum1

**4-player**: p1_rostrum2 <-> p4_rostrum1, p4_rostrum2 <-> p3_rostrum1, p3_rostrum2 <-> p2_rostrum1, p2_rostrum2 <-> p1_rostrum1

**5-player**: p1_rostrum2 <-> p5_rostrum1, p5_rostrum2 <-> p4_rostrum1, p4_rostrum2 <-> p3_rostrum1, p3_rostrum2 <-> p2_rostrum1, p2_rostrum2 <-> p1_rostrum1

Rostrums within the same domain are **NOT** adjacent (no direct movement between p1_rostrum1 and p1_rostrum2).

---

## 3. How Pieces Move (The Six Move Types)

Moves are categorized as:
- **Optional (O)**: Remove, Influence, Assist -- typically target opponent domains
- **Mandatory (M)**: Advance, Withdraw, Organize -- typically target own domain

### 3.1 Advance (M) -- Own Domain

The player does ONE of the following:
1. **Community -> Seat**: Take a Mark from the Community and place it on one of your vacant Seats. If no Marks remain in the Community, take a Heel instead. (Heels only if zero Marks in Community.)
2. **Seat -> Rostrum**: Move a piece from one of your Seats to the corresponding Rostrum. **Prerequisite**: All 3 Seats of that Faction must be occupied.
3. **Rostrum -> Office**: Move a piece from one of your Rostrums to your Office. **Prerequisite**: Both Rostrums must be occupied.

### 3.2 Withdraw (M) -- Own Domain

The player does ONE of the following:
1. **Office -> Rostrum**: Move the piece from your Office to a vacant Rostrum.
2. **Rostrum -> Seat**: Move a piece from one of your Rostrums to a vacant Seat within the same Faction.
3. **Seat -> Community**: Move a piece from one of your Seats back to the Community.

A Withdraw is mandatory unless the player has zero pieces in their domain.

### 3.3 Organize (M) -- Own Domain (may cross boundaries)

The player does ONE of the following:
1. **Seat -> Adjacent Seat**: Move one of your pieces from a Seat to an adjacent Seat (may end up in an opponent's domain if at the boundary).
2. **Rostrum -> Adjacent Rostrum**: Move one of your pieces from a Rostrum to an adjacent Rostrum in an opponent's domain (see Section 2.4 for adjacency).

### 3.4 Remove (O) -- Opponent Domain

Remove one **Mark** from any opponent's **Seat** and return it to the Community.

Restrictions:
- Can only remove **Marks** (not Heels or Pawns).
- Can only remove from **Seats** (not Rostrums or Office).
- Cannot target your own domain.

### 3.5 Influence (O) -- Opponent Domain (may cross boundaries)

Move one of an opponent's **Marks or Heels** one space left or right:
1. **Seat -> Adjacent Seat**: Move an opponent's Mark or Heel from a Seat to an adjacent Seat. Moving between domains (including into your own) is permitted.
2. **Rostrum -> Adjacent Rostrum**: Move an opponent's Mark or Heel from a Rostrum to an adjacent Rostrum in another player's domain.

Restrictions:
- Cannot Influence a **Pawn** into or out of any domain.
- The piece must belong to an opponent (not your own).

### 3.6 Assist (O) -- Opponent Domain

Take a Mark from the Community and place it on one of an opponent's vacant Seats. If no Marks remain in the Community, take a Heel instead.

Restrictions:
- Cannot Assist yourself -- must target an opponent.
- Only places into vacant Seats.

### 3.7 Support Rule (Automatic Enforcement)

This rule triggers automatically whenever the board state changes:

- If a piece occupies a **Rostrum** but **none** of its 3 supporting Seats are occupied, that piece must immediately be moved down to one of those Seats (player's choice).
- If a piece occupies the **Office** but **neither** Rostrum is occupied, that piece must immediately be moved down to a Rostrum (player's choice).

### 3.8 Two-Move Turn Rule

When a tile requires two moves (e.g., Remove + Advance), the following rules apply:
- The two moves may be done in **any order**.
- The two moves **must affect separate pieces**. You cannot move the same piece twice in one turn.
  - Example violation: Influence an opponent's piece into your domain, then Advance that same piece.
  - Example violation: Assist a piece to an opponent, then Influence that same piece.

---

## 4. Game Setup

### 4.1 Initial Board State

At the beginning of the game:
- A Mark is placed in every **other** Seat, starting from the left: Seats 1, 3, 5 of each player's domain.
- Seats 2, 4, 6 start vacant.
- All remaining pieces (Marks, Heels, Pawns not placed in seats) go to the Community.
- All Rostrums and Offices start empty.
- Each player starts with **full credibility** (0 notches lost).

### 4.2 Tile Draft

Tiles are shuffled face-down and dealt evenly:
- 3-player: 8 tiles each
- 4-player: 6 tiles each
- 5-player: 5 tiles each (includes blank tile)

Players look at their tiles, **select one to keep**, and pass the rest to the player on their left. Repeat until all tiles are claimed. This draft happens only once at game start -- it is NOT repeated between Campaigns.

---

## 5. The Campaign Phase

A Campaign is a sequence of turns where players play tiles and move pieces. A Campaign ends when all tiles have been played.

### 5.1 Turn Structure

Each turn follows this sequence:

#### Step 1: The Play (Mover's Turn)

1. The **Mover** makes one or two moves according to the tile they intend to play (see Section 3).
2. The Mover places one of their tiles **face-down** in front of any other player (the **Receiver**).
3. The play may be **honest** (moves match the tile), **dishonest** (moves match some OTHER existing tile, but not the one played), or **illegal** (moves don't match ANY existing tile). Illegal plays are never permitted.

**First Mover**: The player holding tile `"03"` (the 0-funding tile) starts the first Campaign. They do NOT have to play that tile first. Subsequent Campaigns also start with the holder of tile `"03"`.

**Self-play**: If the Mover has no other player with remaining tiles to receive, they may play to themselves. This should generally be avoided by distributing tiles wisely during the Campaign.

#### Step 2: The Receipt (Receiver's Response)

**If the Receiver has no remaining credibility (0 notches)**:
- They may NOT look at or touch the tile (except to discard it or reveal it when challenged).
- The tile goes directly to their area. Skip to Step 3 (The Challenge).
- If the move is later shown to be dishonest, the Receiver keeps the funding.

**If the Receiver has credibility**:
- They MAY look at the tile.
- They MAY also choose to accept without looking (blind accept) by placing it along the Accept Line.
- If the tile **matches** the moves made (honest play): place face-down on Accept Line.
- If the tile **does not match** the moves made (dishonest play), the Receiver has two choices:
  1. **Accept anyway**: Place face-down on Accept Line (pretend it was honest -- perhaps for the funding).
  2. **Expose (Reject)**: Turn the tile face-up. This triggers the "Whistle Blown" outcome (Section 5.3).

**Receiver must have tiles**: The Receiver must have at least one tile remaining to continue play as the next Mover.

#### Step 3: The Challenge (Other Players' Response)

After the Receiver accepts a tile (places it face-down), other players with remaining credibility may challenge, in clockwise order from the Receiver.

- **No challenge**: The tile goes face-down into the Receiver's Bank (counted for Bureaucracy funding). The Receiver becomes the next Mover.
- **Challenge**: The tile is turned face-up for all to see. This determines whether the play was honest or dishonest, triggering the appropriate outcome (Section 5.3).

**Players with no credibility cannot challenge.** However, ANY player regardless of credibility may call out an **illegal** move (a move matching no existing tile).

### 5.2 Honest vs. Dishonest vs. Illegal

| Classification | Definition | Permitted? |
|---------------|-----------|-----------|
| **Honest** | Moves match the tile played exactly (move types correspond to the tile's required moves). | Yes |
| **Dishonest** | Moves match some other existing tile's required moves, but NOT the tile actually played. | Yes (but risky) |
| **Illegal** | Moves do not match ANY existing tile's required moves. | No -- never permitted |

**Impossible moves**: If one or both moves on a tile are impossible due to the current board state, those moves may be forgone. The play is still considered honest if challenged.

### 5.3 Outcome Resolution

There are four possible outcomes, depending on how a tile is revealed:

#### Quiet is Kept (No rejection, no challenge)
- Tile goes face-down into Receiver's Bank.
- No credibility changes.
- Receiver becomes next Mover.

#### Whistle Blown (Receiver rejects a dishonest play)
- **Mover**: Returns dishonestly moved pieces to original positions. Makes the play exactly as per the tile. Loses 1 credibility notch.
- **Receiver**: Restores up to 2 credibility notches. If already at full credibility, takes a free Advance action instead. Tile placed face-up in Bank (NOT counted for Bureaucracy funding).

#### Smoking Gun (Bystander challenges, play was dishonest)
- **Mover**: Returns dishonestly moved pieces to original positions. Makes the play exactly as per the tile. Loses 1 credibility notch.
- **Challenger**: May either restore 1 credibility notch OR use funding to perform one Bureaucracy action (tiles turned face-up; leftover funding is lost).
- **Receiver**: Loses 1 credibility notch (if possible). Tile placed face-up in Bank (NOT counted for Bureaucracy funding).

#### Witch Hunt (Bystander challenges, play was honest)
- **Mover**: Restores 1 credibility notch. Exception: if the Mover had 0 credibility at the START of that turn, they do NOT restore credibility.
- **Challenger**: Loses 1 credibility notch.
- **Receiver**: Tile goes face-down into Bank (counted for Bureaucracy funding). No credibility change.

### 5.4 Zero-Credibility Penalties

When a player has 0 credibility:
- They cannot challenge.
- They cannot look at tiles they receive (except when challenged by another player).
- They cannot restore credibility during the Campaign (must wait for Bureaucracy).
- If caught making a dishonest play (as Mover), they must take a **Withdraw action** as additional penalty (instead of losing a credibility notch, which they cannot).
- If their play is challenged and found honest, they do NOT restore credibility (since they had 0 at the start of that turn).

### 5.5 The Blank Tile (5-Player Only)

- When played, the Receiver must accept it (no choice).
- Any legal move is considered honest when the blank tile is played.
- If challenged, the Challenger loses 1 credibility and the Mover restores 1.
- The blank tile **cannot** be used to achieve a winning setup.

### 5.6 Self-Play (Mover = Receiver)

In rare cases at the end of a Campaign, the Mover may have to play a tile to themselves:
- If challenged and the play is dishonest, they lose credibility but keep the funding.

---

## 6. Credibility System (Detailed)

### 6.1 Losing Credibility (1 notch each)

A player loses 1 notch when:
1. **As Mover**: Their play is rejected by the Receiver or challenged and shown dishonest.
2. **As Receiver**: They accept a play that a subsequent challenge shows was dishonest.
3. **As Challenger**: The play they challenge is shown to be honest.

### 6.2 Restoring Credibility

A player restores 1 notch when:
1. **As Mover**: Their play is challenged and shown honest. (Exception: no restoration if Mover had 0 credibility at start of that turn.)
2. **As Receiver**: They have exactly 1 notch lost and expose a dishonest play. (Restores to full.)
3. **As Challenger**: The play they challenge is shown dishonest.

A player restores 2 notches only when:
- **As Receiver**: They have exactly 2 notches lost and reject a dishonest play. (Restores to full.)

Special case -- Receiver at full credibility rejects dishonest play:
- Instead of restoring credibility (already full), they take a free **Advance** action.

### 6.3 Zero-Credibility State

When all 3 notches are lost:
- Cannot restore credibility until Bureaucracy phase.
- Cannot challenge opponents.
- Cannot look at received tiles.
- If caught dishonest as Mover: must take a Withdraw action (penalty).
- If play is challenged and found honest as Mover: no credibility restoration.

---

## 7. Bureaucracy Phase

At the end of each Campaign (all tiles played), the Bureaucracy phase begins.

### 7.1 Funding Calculation

Each player adds up the funding values of all **face-down** tiles in their Bank. Face-up tiles (from rejected/challenged dishonest plays) do NOT count toward funding.

Players announce their funding totals. The sum of all announced totals plus all face-up tile values must equal exactly **100**.

### 7.2 Turn Order

Players take Bureaucracy turns in descending order of available funding. Tiebreakers (in order):
1. Player with a Pawn in their domain goes first.
2. Most Heels in domain.
3. Most Marks in domain.
4. Most credibility remaining.

### 7.3 Bureaucracy Actions Menu

Players spend funding to purchase actions. Multiple actions may be purchased per turn, limited only by available funding and piece availability. Each player may only ever have one Pawn.

#### 3-Player and 4-Player Pricing

| Cost | Action |
|------|--------|
| 18 | Promote a piece in the **Office** (Mark -> Heel, or Heel -> Pawn) |
| 15 | Take 1 Assist, Remove, or Influence action |
| 12 | Promote a piece at a **Rostrum** (Mark -> Heel, or Heel -> Pawn) |
| 9 | Take 1 Advance, Withdraw, or Organize action |
| 6 | Promote a piece in a **Seat** (Mark -> Heel, or Heel -> Pawn) |
| 3 | Restore 1 credibility notch (even if completely lost) |

#### 5-Player Pricing

| Cost | Action |
|------|--------|
| 12 | Promote a piece in the **Office** (Mark -> Heel, or Heel -> Pawn) |
| 10 | Take 1 Assist, Remove, or Influence action |
| 8 | Promote a piece at a **Rostrum** (Mark -> Heel, or Heel -> Pawn) |
| 6 | Take 1 Advance, Withdraw, or Organize action |
| 4 | Promote a piece in a **Seat** (Mark -> Heel, or Heel -> Pawn) |
| 2 | Restore 1 credibility notch (even if completely lost) |

### 7.4 Promotion Rules

Promotion upgrades a piece in place (without moving it):
- Mark -> Heel: The Mark is returned to the Community and replaced with a Heel from the Community.
- Heel -> Pawn: The Heel is returned to the Community and replaced with a Pawn from the Community.

A player may only have **one Pawn** at any time.

### 7.5 After Bureaucracy

After all players complete Bureaucracy:
- All tiles are turned face-down and taken out of Banks.
- The player holding tile `"03"` begins the next Campaign.
- Tiles are NOT re-drafted between Campaigns -- players keep the same tiles.

---

## 8. Winning the Game

### 8.1 Winning Condition

A player wins when their Domain contains ALL of the following simultaneously:
- A piece (Mark or Heel) in **all 6 Seats**
- A **Heel** in **each Rostrum** (Marks are not sufficient for Rostrums)
- A **Pawn** in the **Office**

Total: 9 pieces in the Domain (6 Seats + 2 Rostrums + 1 Office).

### 8.2 When Victory Is Checked

Victory can be achieved at two points:
1. **During the Campaign**: After all challenges to the winning play have been resolved.
2. **After Bureaucracy**: When all players have completed their Bureaucracy actions.

### 8.3 Simultaneous Win

If two or more players simultaneously have a winning setup at either check point, the game ends in a **draw** for those players.

### 8.4 Blank Tile Restriction

In a 5-player game, the blank tile **cannot** be used to achieve a winning setup. If the move that would complete a winning setup uses the blank tile, the win does not count until confirmed by a non-blank tile play or Bureaucracy.

---

## 9. Edge Cases and Clarifications

### 9.1 Impossible Moves on Tiles

If one or both moves on a tile are impossible due to the board state (e.g., a Remove tile but no opponent has Marks in Seats), those moves may be forgone. The play is still considered **honest** if challenged.

### 9.2 No Receiver Available

If the Mover has no other player with tiles remaining, they must play to themselves.

### 9.3 Community Piece Priority

When taking a piece from the Community (for Advance or Assist):
1. Take a **Mark** first (if any Marks are in the Community).
2. Only if **zero** Marks remain in the Community, take a **Heel**.
3. Pawns are never taken from Community via Advance/Assist -- only via Promotion.

### 9.4 Illegal Move Detection

Any player, regardless of credibility, may call out an illegal move. An illegal move is one whose combination of move types does not appear on ANY existing tile. This is distinct from a dishonest move (which matches some tile, just not the one played).

### 9.5 Receiver with No Credibility Keeps Funding

If a Receiver has no credibility and cannot look at the tile, and the move is later shown to be dishonest via challenge, the Receiver still keeps the funding from that tile.

### 9.6 Winning Setup During Bureaucracy

A winning setup achieved partway through Bureaucracy does not end the game immediately. All players must complete their Bureaucracy actions first. The win only counts if the setup still exists after ALL players have finished.

### 9.7 Organize and Influence Can Cross Domain Boundaries

- **Organize**: A player's own piece in a boundary seat (seat 1 or seat 6) can be moved to the adjacent seat in a neighboring domain.
- **Influence**: An opponent's piece can be moved into or out of any domain, including into the influencing player's own domain. Exception: Pawns cannot be Influenced across domains.

### 9.8 Rostrum-to-Rostrum Movement

- **Organize**: A player may move their own piece from their Rostrum to an adjacent Rostrum in an opponent's domain.
- **Influence**: A player may move an opponent's Mark or Heel from a Rostrum to an adjacent Rostrum.
- Movement between Rostrums within the **same** domain is NOT possible (Rostrum 1 and Rostrum 2 are not adjacent).

---

## 10. Game Flow Summary

```
GAME START
  |
  v
[Tile Draft] -- one-time only
  |
  v
[Campaign Phase] <------------------+
  |                                  |
  |  for each turn:                  |
  |    1. Mover makes 1-2 moves     |
  |    2. Mover plays tile to Receiver |
  |    3. Receiver accepts/rejects   |
  |    4. Other players may challenge|
  |    5. Resolve outcome            |
  |    6. Receiver becomes next Mover|
  |                                  |
  |  (repeat until all tiles played) |
  |                                  |
  v                                  |
[Check for win] -- if win, GAME OVER|
  |                                  |
  v                                  |
[Bureaucracy Phase]                  |
  |  1. Calculate funding            |
  |  2. Determine turn order         |
  |  3. Players spend funding        |
  |  4. Return tiles to players      |
  |                                  |
  v                                  |
[Check for win] -- if win, GAME OVER|
  |                                  |
  +----------------------------------+
```

---

## 11. Key Invariants for Testing

These are rules that must ALWAYS hold, useful for writing assertions:

1. **Funding checksum**: Sum of all tile funding values (face-up + face-down) = 100, always.
2. **Piece conservation**: Total pieces on board + in Community = starting count for that player mode. Pieces are never created or destroyed, only moved and promoted.
3. **Support rule**: No piece may exist at a Rostrum if all 3 supporting Seats are empty. No piece may exist at the Office if both Rostrums are empty. (Auto-enforced after every board state change.)
4. **One Pawn per player**: A player may never have more than 1 Pawn.
5. **Advance hierarchy**: Community -> Seat -> Rostrum -> Office. Each step has prerequisites (all seats filled for rostrum, both rostrums filled for office).
6. **Withdraw hierarchy**: Office -> Rostrum -> Seat -> Community. Each step requires a vacancy at the destination.
7. **Remove targets only Marks in Seats**: Cannot remove Heels, Pawns, or pieces from Rostrums/Offices.
8. **Two moves affect separate pieces**: When a tile requires two moves, they must target different pieces.
9. **Illegal moves are never valid**: Every play must match at least one existing tile's move combination.
10. **Credibility bounds**: Credibility is always 0-3 (3 = full, 0 = lost). Cannot go below 0 or above 3.
11. **Blank tile cannot win**: A winning setup achieved via the blank tile does not count.
12. **Face-up tiles excluded from funding**: Only face-down tiles in Bank count toward Bureaucracy funding.
13. **Community piece priority**: Marks must be taken before Heels when drawing from Community (for Advance and Assist).
14. **Pawns cannot be Influenced across domains**: Influence can move Marks and Heels between domains, but never Pawns.
15. **Tiles persist across Campaigns**: Tiles are NOT re-drafted. Players keep the same tiles for the entire game.
