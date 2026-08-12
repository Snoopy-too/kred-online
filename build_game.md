You are an expert game developer specializing in building turn-based multiplayer board and card games using Boardgame.io and React.

I have attachedprovided a markdown rulebook (`MANUAL.md`) for a game I want to build. 

Your task is to analyze these rules and scaffold a fully functional, rule-enforced, real-time multiplayer implementation using Boardgame.io.

---

### INPUT RULEBOOK (`MANUAL.md`)


---

### ARCHITECTURAL INSTRUCTIONS

Please build the project following strict Boardgame.io best practices

#### 1. Game Logic (`srcGame.js`)
 State (`G`) Map out all game state requirements directly from the rulebook (e.g., player hands, deck array, discard pile, board grid, victory points, active phase data).
 Move Guardrails Every action described in the rulebook must be implemented inside the `moves` object.
   You MUST import `INVALID_MOVE` from `boardgame.iocore`.
   Validate ALL move conditions (e.g., player turn, card cost, space availability, action points left) before modifying `G`. If a move violates the rulebook, return `INVALID_MOVE`.
 Flow & Turn Structure Configure `turn` and `phases` to strictly enforce the sequence described in the rules (e.g., Draw Phase - Action Phase - End Turn).
 Hidden Information If the rulebook specifies hidden hands or face-down cards, use Boardgame.io's `playerView` or secret state mechanics to ensure players cannot inspect opponent cards in the browser's console.

#### 2. User Interface (`srcBoard.jsx`)
 Build a React component that takes `G`, `ctx`, `moves`, and `playerID` as props.
 Read the game state `G` to render the board, cards, and player stats cleanly.
 Disable buttons or interaction targets on screen if it is not the local player's turn or if they lack the required action pointsresources.
 Make sure boardcard click handlers call `moves.moveName(...)`.

#### 3. Execution Plan
1. State & Moves Summary Briefly list the core `G` properties and key moves you extracted from `rules.md`.
2. Code Generation Generate the complete code for
    `srcGame.js` (The rulebook translated into Boardgame.io state & moves)
    `srcBoard.jsx` (The React visual board & card UI)
    `srcApp.js` (The client wrapper connecting the Game and Board components locally)

Start by analyzing the rules and providing the State & Moves Summary, followed by the code.