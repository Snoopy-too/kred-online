# Tile Moves Reference

This document maps each KRED tile to its strictly required movement actions as defined in `src/config/rules.ts`. This serves as an immediate context/reference for AI agents debugging game move legality or building out testing logic.

## Defined Move Types Overview

### Optional Moves (O) - Usually targets Opponent Domains
*   **REMOVE (O)**: Take a Mark from an opponent's seat and return it to the community.
*   **INFLUENCE (O)**: Move another player's piece from a seat to an adjacent seat OR from an opponent's rostrum to an adjacent rostrum in another player's domain.
*   **ASSIST (O)**: Take a piece from the community and add it to an opponent's vacant seat.

### Mandatory Moves (M) - Usually targets Own Domain
*   **ADVANCE (M)**: Take a piece from the community -> your seat, OR your seat -> supported Rostrum, OR your Rostrum -> your Office.
*   **WITHDRAW (M)**: Move a piece from your Office -> your Rostrum, OR your Rostrum -> your Seat, OR your Seat -> the Community.
*   **ORGANIZE (M)**: Move your piece from a seat to an adjacent seat OR from a rostrum to an adjacent rostrum (even into/in another player's domain).

---

## Valid Moves by Tile Number

| Tiles | Required Moves | Sequence Execution Breakdown |
| :--- | :--- | :--- |
| **01, 02** | `REMOVE`, `ADVANCE` | 1 (O) Remove + 1 (M) Advance |
| **03, 04** | `INFLUENCE`, `ADVANCE` | 1 (O) Influence + 1 (M) Advance |
| **05, 06** | `ADVANCE` | 1 (M) Advance only |
| **07, 08** | `ASSIST`, `ADVANCE` | 1 (O) Assist + 1 (M) Advance |
| **09, 10** | `REMOVE`, `ORGANIZE` | 1 (O) Remove + 1 (M) Organize |
| **11** | `INFLUENCE` | 1 (O) Influence only |
| **12** | `ORGANIZE` | 1 (M) Organize only |
| **13, 14** | `ASSIST`, `ORGANIZE` | 1 (O) Assist + 1 (M) Organize |
| **15, 16** | `REMOVE` | 1 (O) Remove only |
| **17, 18** | `INFLUENCE`, `WITHDRAW` | 1 (O) Influence + 1 (M) Withdraw |
| **19, 20, 21** | `WITHDRAW` | 1 (M) Withdraw only |
| **22, 23, 24** | `ASSIST`, `WITHDRAW` | 1 (O) Assist + 1 (M) Withdraw |

## Evaluation Rules

1. **Exact Matches Required:** For a player's action suite to legally match a tile, they must exactly dispatch the moves required by that tile (e.g. if the tile says `ASSIST` and `WITHDRAW`, the combination of actions performed must map perfectly to one Assist and one Withdraw - nothing more, nothing less, unless board state imposes "impossible move scenarios" mapped via exceptions).
2. **Move Combinations:** A legal turn before tile play validation usually considers a limit of 1 'M' Move and 1 'O' Move.
3. **No Phantom Extras:** Players errantly doing two 'M' moves or performing 'O' parameters across 'M' moves errantly triggers "Illegal Moves".
