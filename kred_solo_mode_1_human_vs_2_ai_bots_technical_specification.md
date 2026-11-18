# KRED Online (`kred2.0`) — Solo Mode (1 Human vs. 2 AI Bots) Technical Specification

## 1. Objective & Scope
Implement **Solo Mode (1 Human Player vs. 2 AI Bots)** on a dedicated feature branch off **`kred2.0`** (e.g., `feat/solo-ai-mode`) without breaking or regressing existing 3–5 player Local Pass & Play or Online Supabase Multiplayer.

* **Target Game Mode:** 3-Player *KRED* (`numPlayers = 3`, 12 Marks, 9 Heels, 3 Pawns, 24 standard tiles `'01'`–`'24'` summing to `100` funding, 8 tiles per player, optional `skipDraft`).
* **Technology Stack:** Pure **JavaScript ESM** (`"type": "module"`), React 18, Vite, `zod`, `boardgame.io@0.50.2`, and `node --test` (no TypeScript build step).
* **AI Architecture:** Heuristic Utility AI with post-cascade board simulation, public tile-memory card counting, weighted randomness, and distinct bot personalities (no external LLM/network calls).
* **Project Guardrails ([GEMINI.md](GEMINI.md) & `.agents/skills/project-guidelines/SKILL.md`):**
  * Minimal, clean `/ponytail` implementation (no over-engineered abstractions or boilerplate).
  * Every file strictly **under 500 lines**.
  * Zero Supabase/network calls in Solo Mode.

---

## 2. Codebase Grounding & Architectural Decisions

### 2.1 Why Solo Mode Uses the `boardgame.io` Local Engine (Not `onlineEngine.js`)
The `kred2.0` codebase currently has two execution paths:
1. **`boardgame.io` engine** (`src/srcGame.js`, `src/domain/phases/draftPhase.js`, `src/domain/phases/campaignPhase.js`, `src/domain/bureaucracy.js`) — implements the complete 3–5P ruleset, including `bureaucracyTurnOrder`, all bureaucracy purchases (`RESTORE_CRED`, `PROMOTE_SEAT`, `PROMOTE_ROSTRUM`, `PROMOTE_OFFICE`, `BASIC_ACTION`, `EXTRA_ACTION`), empty-hand mover skipping, and re-execute/withdraw/advance validation.
2. **`src/domain/onlineEngine.js`** — powers Supabase rooms, but currently has known gaps documented in `docs/JEV_ARENA.md` (missing `bureaucracyTurnIndex` progression, incomplete bureaucracy action handlers, and no empty-hand mover skip).

Therefore, Solo Mode runs strictly on the **`boardgame.io` local engine** (`createKredGame(3, skipDraft)`).

### 2.2 Multi-Client `Local()` Transport Wiring (Avoiding the Single-Client `playerID` Trap)
Currently, `src/srcApp.jsx` mounts a single `<KredClient playerID={activePerspective} />` without a multiplayer transport. In `boardgame.io`, a single client can only dispatch moves as its own `playerID`. If the human is locked to `playerID="0"`, calling `moves.*` on that client for bot `'1'` or `'2'` would fail `playerID` checks with `INVALID_MOVE`.

Additionally, we **must not** use `boardgame.io`'s built-in `Local({ bots })` auto-bot loop (`GetBotPlayer`), because `draftPhase.js` uses `activePlayers: { all: 'drafting' }` without calling `endStage()`—which would cause `LocalMaster` to repeatedly pick an already-drafted bot.

**Chosen Wiring (`src/ai/soloController.js` + `src/srcApp.jsx`):**
1. Create a memoized `game = createKredGame(3, skipDraft)` instance and a unique `matchID` per solo match.
2. Pass `multiplayer: Local()` (from `boardgame.io/multiplayer`) to **both**:
   * The human React `<KredClient>` (`boardgame.io/react`) locked to `playerID="0"`.
   * Two headless bot `Client` instances (`boardgame.io/client`) for `playerID="1"` and `playerID="2"`, sharing the exact same `game` reference, `numPlayers: 3`, `matchID`, and `Local()` transport.
3. `SoloController` subscribes to the bot clients, checks when a bot has an actionable decision, waits `persona.thinkingDelayMs`, and dispatches `botClient.moves.<moveName>(...)`.
4. **Supabase Bypass:** `handleStartSoloGame` must set `lobbyId: null` and never create Supabase lobbies or write to `kred_game_states`.

---

## 3. Pre-AI Engine Hardening (Required Fixes in `src/domain/`)
Before connecting bots, patch these rule edge cases observed in the `boardgame.io` phase files so 100% of matches terminate cleanly:

1. **`0`-Credibility Receiver + `0` Eligible Challengers Softlock (`src/domain/phases/campaignPhase.js`):**
   * In `submitTurnMovesAndTile`, when `G.players[receiverId].credibilityNotchesLost >= 3 || tileId === 'BLANK'`, check `getOrderedChallengers(G)`.
   * If `eligibleChallengers.length === 0`, immediately bank the tile face-down, clear `G.pendingPlay`, and run the victory check (matching `acceptTile`), instead of entering `step = 'challenge'` with `activeChallenger === null`.
2. **No-Op Fallback for Impossible `penaltyWithdraw` / `freeAdvance` (`src/domain/phases/campaignPhase.js`):**
   * If `executePenaltyWithdraw` is entered when the mover has zero pieces on their own domain, or `executeFreeAdvance` is entered when no legal `Advance` exists on the board, allow `null`/`undefined` payload *only* when no legal `Withdraw` (or `Advance`) exists according to `validateSingleMove` / `isMoveTypePossible`—preventing an unrecoverable stalemate.
3. **Bureaucracy End-of-Phase Victory Check Timing (`src/domain/bureaucracy.js`):**
   * Verify `cleanupBureaucracy` (`onEnd`) vs `next` execution order in `boardgame.io@0.50.2`: ensure that when any player achieves the winning setup after Bureaucracy completes, `G.winner` is set before transitioning or ends the game cleanly without launching another Campaign turn. (Add a unit test in `test/`.)

---

## 4. Mandatory *KRED* Codebase Invariants & Full State Machine
Every AI decision module must match the exact data shapes and rules in `src/domain/`:

1. **Credibility Representation:** `G.players[id].credibilityNotchesLost` (`0` = 3 credibility remaining / full; `3` = 0 credibility / token on end). Remaining credibility is `3 - (player.credibilityNotchesLost || 0)`.
2. **Opening Tile:** Tile `'03'` (`Influence + Advance`, funding `0`), not `'0'`.
3. **Domain Keys:** 1-based domain prefix (`p1_*`, `p2_*`, `p3_*` for player IDs `'0'`, `'1'`, `'2'`) with `seat1`–`seat6`, `rostrum1`–`rostrum2`, `office`, and `community_1`–`community_N` (or `'community'` as target/generic source).
4. **Two-Move Turn Rules (`src/domain/moves.js`):**
   * Maximum 2 moves; `moves: []` is legally valid.
   * Must affect **two separate pieces** (`pieceId` and location checks).
   * A 2-move play must combine **1 Self Move** (`Advance`, `Withdraw`, `Organize`) and **1 Opponent Move** (`Assist`, `Remove`, `Influence`).
   * Community depletion hierarchy (`isCommunityPieceAvailable`): Marks must be depleted before Heels; Heels before Pawns.
5. **Impossible-Action Forgiveness & Support Cascade:**
   * Reuse `classifyPlay` directly for honesty classification.
   * Always simulate `enforceSupportRule(boardState, 3)` when scoring candidate boards.
6. **Self-Play Rule:** Self-play (`receiverId === moverId`) is legal **only** when every opponent's bank is full (`bank.length >= 8` in 3P).
7. **Complete Action Matrix (All `G` States Bots Must Handle):**
   * `phase === 'draft'`: `selectDraftTile(tileId)` when `!G.draftSelectionsThisRound?.[botId]` and `(G.draftPacks?.[botId]?.length || 0) > 0`.
   * `phase === 'campaign'`, no `G.pendingPlay`, `ctx.currentPlayer === botId`: `submitTurnMovesAndTile({ tileId, receiverId, moves })`.
   * `phase === 'campaign'`, `G.pendingPlay` active for `botId` via `getPendingPlayActivePlayer(G)`:
     1. `'receipt'`: `acceptTile()` or `rejectTile()`
     2. `'challenge'`: `challengeTile()` or `passChallenge()`
     3. `'reexecute'`: `reexecuteHonestly(honestMoves)` *(required when bot's bluff is caught)*
     4. `'penaltyWithdraw'`: `executePenaltyWithdraw(withdrawMove)` *(required when caught at `credibilityNotchesLost >= 3`)*
     5. `'receiverReward'`: `claimReceiverCredibilityReward()` or `chooseReceiverAdvanceReward()` *(required after bot blows whistle)*
     6. `'freeAdvance'`: `executeFreeAdvance(advanceMove)` *(required if bot picked Advance reward)*
     7. `'challengerReward'`: `claimChallengerCredibility()` or `buyChallengerBureaucracyAction({ actionType, targetLoc, subAction })` *(required after winning a challenge with face-down tiles in bank)*
   * `phase === 'bureaucracy'`, `ctx.currentPlayer === botId`: `buyBureaucracyAction({ actionType, targetLoc, subAction })` followed by `endBureaucracyTurn()`.

---

## 5. `src/ai/` Module Design (Lean, `<500` Lines/File)

```text
src/ai/
├── observation.js     # buildBotObservation(G, ctx, botId) + public tile-counting memory
├── personas.js        # Bot persona definitions ("Baron Vance", "Inspector Vale", + test Bot 0)
├── evaluator.js       # evaluateDomain(0–100), post-cascade simulation, legal move/turn generator
├── decisions.js       # Pure heuristic decision functions for Draft, Campaign, all 7 pendingPlay steps, Bureaucracy
├── soloController.js  # Manages 2 headless boardgame.io Clients, timers, idempotency, UI status
└── index.js           # Public exports
```
*(If `decisions.js` approaches 400 lines, split cleanly into `campaignDecisions.js` and `bureaucracyDecisions.js` to stay well under the 500-line ceiling.)*

### 5.1 Strict Information Hiding (`src/ai/observation.js`)
Decision functions never read raw `G`. `buildBotObservation(G, ctx, botId)` exposes only:
* `botId`, `phase`, `currentPlayer`, `numPlayers`, `boardState`, `community`, `winner`.
* Public player summaries (`credibilityNotchesLost`, `handCount`, `bankCount`, `funding`, `faceUpBankTiles`, `pendingPenaltyWithdraw`).
* **Only** `botId`'s own `hand`, `draftPack`, `hasDraftedThisRound`, and own `bank` tiles.
* `pendingPlay` metadata (`step`, `moverId`, `receiverId`, `movesMade`, `challengesPassed`, `successfulChallengerId`, `reexecuteTileId`), exposing `tileIdPlayed` **only** when:
  * `botId === moverId`, OR
  * `step === 'receipt'` and `botId === receiverId` and `credibilityNotchesLost < 3`, OR
  * `step === 'reexecute'` (tile is being re-executed openly / placed face-up).
* **Public Card-Counting Memory:** Computes `unseenTileIds` by removing `botId`'s hand, `botId`'s bank, and all opponents' `faceUpBankTiles` from the 24-tile set (`'01'`–`'24'`).
* *(Optional UI hardening)*: Add an optional `hideOpponentHands` flag to `createKredGame` so Solo Mode's `playerView` replaces opponent `hand` entries with `'HIDDEN'` and masks opponent face-down bank tile IDs from the human client (`'0'`), keeping `OpponentHandSummary` (`hand.length`) intact without breaking `PendingPlayModal`.

### 5.2 Board Evaluator & Move Generator (`src/ai/evaluator.js`)
* **`evaluateDomain(boardState, playerId)` (`0`–`100`):**
  * Each occupied Seat (`seat1`–`seat6`): `+5` pts (max `30`; `+1` bonus if Heel).
  * Each occupied Rostrum (`rostrum1`, `rostrum2`): `+12` pts (max `24`), `+8` pts bonus if Heel (max `16`).
  * `office`: `+30` pts if Pawn, `+10` pts if Mark/Heel.
  * Winning domain (`checkVictory(boardState, playerId)`) = `100`+ pts (add immediate win bonus `+500` in move scoring).
* **Candidate Move Generator:**
  * Uses `validateSingleMove`, `validateMoveCombination`, `applyMoveToState`, `enforceSupportRule`, and `classifyPlay` directly—never reimplementing rule checks.
  * Generates all distinct legal 0-, 1-, and 2-move combinations (capped/deduplicated cleanly by board outcome so search stays sub-millisecond).
  * Computes `boardGain`, `opponentDamage`, `isWinningPlay`, and matches against `bot.hand` (Honest) vs. sacrificial tile (Dishonest).

### 5.3 Heuristic Decision Rules (`src/ai/decisions.js`)
Every decision function wraps its scorer in a `try/catch` and guarantees a verified-legal fallback action:
1. **`decideDraftPick(obs, persona)`:** Scores pack tiles by `funding * draftFundingWeight + moveActionUtility + (tileId === '03' ? firstPlayerBonus : 0)`.
2. **`decideCampaignMove(obs, persona)`:**
   * Evaluates candidate plays across valid receivers (`bank.length < 8`, or `self` only when all opponent banks are full).
   * Weighs Honest plays (0 risk) against Dishonest bluffs (`sacrificialTile.funding * bribeGenerosity`, penalized when `credibilityNotchesLost >= 2`, modulated by `persona.bluffThreshold`).
   * **Receiver targeting:** Passes low-funding tiles (`0–3`) on Honest plays (or targets `0`-credibility opponents to bait a Witch Hunt); passes higher-funding tiles (`5–9`) on Dishonest bluffs to buy silence.
3. **`decideReceipt(obs, persona)`:**
   * Only runs when `credibilityNotchesLost < 3` (engine bypasses `'receipt'` at 0 cred).
   * Always `acceptTile` if Honest (`classifyPlay === 'Honest'`).
   * If Dishonest, compares `keepBribeScore` (`tile.funding * greedWeight - obviousLieRisk * paranoiaWeight`) vs `whistleBlowScore` (`credibilityNotchesLost * 18 * integrityWeight + moverBoardGain * 1.2 + (notchesLost === 0 ? 15 : 0)`).
4. **`decideChallenge(obs, persona)`:**
   * Uses `unseenTileIds` card-counting: if **zero** unseen tiles in the 24-tile deck can produce `movesMade` honestly, `remainingCopies === 0` -> **100% guaranteed lie -> Challenge!**
   * Otherwise scores suspicion from rarity (`1 / remainingCopies`), `moverBoardGain`, win-prevention urgency, and `-45` penalty if bot is at `credibilityNotchesLost === 2` (last notch), comparing against `persona.challengeThreshold` with small random jitter.
5. **`decideReexecute(obs)`:** Picks the highest-scoring legal `Honest` move combination (including `[]` if tile actions are impossible) for `reexecuteTileId`.
6. **`decidePenaltyWithdraw(obs)`:** Picks the least damaging legal `Withdraw` (Seat -> Community preferred over Rostrum -> Seat or Office -> Rostrum, checking post-cascade impact).
7. **`decideReceiverReward(obs, persona)` & `decideFreeAdvance(obs)`:** Chooses `claimReceiverCredibilityReward` if `credibilityNotchesLost >= 2` (or `>= 1` for Watchdog) and a strong Advance isn't winning; otherwise takes `chooseReceiverAdvanceReward` + best `executeFreeAdvance`.
8. **`decideChallengerReward(obs, persona)`:** Evaluates whether buying one affordable bureaucracy action via `selectBestBankTilesToPay` beats restoring 1 credibility notch (when `credibilityNotchesLost > 0`); picks the higher-utility option.
9. **`decideBureaucracyAction(obs, persona)`:**
   * Evaluates affordable actions using `BUREAUCRACY_PRICES[3]` (`18, 15, 12, 9, 6, 3`) and `player.funding`:
     1. Immediate winning action sequence if achievable.
     2. Credibility restoration (`3`) when `credibilityNotchesLost === 3` (or `>= 2` for Watchdog).
     3. Promotions (`18` Office Heel->Pawn, `12` Rostrum Mark->Heel, `6` Seat Mark->Heel—respecting community stock and max-1-Pawn rule).
     4. Board expansion (`9` Advance) or disruption (`15` Remove/Influence against leader `>= 70` score).
   * Returns `endBureaucracyTurn` when no beneficial purchase remains affordable.

### 5.4 AI Personalities (`src/ai/personas.js`)
| Parameter | **Bot 1: Baron Vance** (`'1'`) | **Bot 2: Inspector Vale** (`'2'`) |
| :--- | :--- | :--- |
| Archetype | Opportunistic Deceiver | Rule-Enforcing Watchdog |
| `bluffThreshold` | Low (bluffs strategically ~45–55% when needed) | High (plays honest ~80%+; bluffs mainly for wins/emergencies) |
| `bribeGenerosity` | `1.5` (offers `6–9` funding tiles as bribes) | `0.7` (hoards high-funding tiles) |
| `greedWeight` | `1.6` (accepts dishonest `5+` funding bribes) | `0.6` (rarely accepts lies unless broke & `8+` bribe) |
| `integrityWeight` | `0.7` (tolerates lies unless low cred) | `1.6` (exposes lies aggressively & recovers cred) |
| `challengeThreshold` | High (challenges mainly obvious/winning plays) | Low (frequently challenges suspicious plays) |
| `aggressionWeight` | `1.4` (targets leader with Remove/Influence) | `0.9` (focuses on steady domain advancement) |
| `thinkingDelayMs` | `[1000, 2200]` | `[700, 1400]` |

---

## 6. Anti-Deadlock & UI Integration (`soloController.js`, `srcApp.jsx`, `srcBoard.jsx`)
1. **Idempotency Guard:** Build `turnActionKey = "${phase}:${ctx.turn}:${stepKey}:${activeBotId}"` so a bot never fires twice for the same state snapshot.
2. **Timer & Unmount Cleanup:** Track active `setTimeout` IDs and unsubscribe/destroy both headless bot clients on "Main Menu", "Reset Match", or component unmount.
3. **Landing Screen (`src/srcApp.jsx`):**
   * Add a **"Solo vs. 2 AI Bots"** mode card/button (with optional `Skip Draft` toggle) alongside Local Pass & Play and Online Multiplayer.
   * Set `playerNames = ['You', 'Baron Vance', 'Inspector Vale']`, lock `playerID="0"`, hide the Perspective Selector in the bottom toolbar, and tag mode as `🤖 Solo Mode (vs. 2 AI)`.
4. **In-Game Feedback (`src/srcBoard.jsx`, `PendingPlayModal.jsx`, `PlayerStatusHeader.jsx`):**
   * Display AI badges and a subtle live status indicator (e.g., *"Baron Vance is inspecting the tile..."*, *"Inspector Vale is deciding..."*) during `thinkingDelayMs`.
   * Ensure existing turn replay animations and outcome banners work naturally when bots act.

---

## 7. Execution Plan & Sub-Agent Verification Strategy

### Step-by-Step Build Sequence
1. **Branch Setup:** Create `feat/solo-ai-mode` from `kred2.0` (decide whether to commit this spec or keep it untracked; exclude unrelated prototype changes unless requested).
2. **Engine Hardening:** Apply Section 3 fixes to `campaignPhase.js` and `bureaucracy.js` + add targeted unit tests.
3. **Core AI & 100-Game Headless Stress Test:**
   * Implement `src/ai/observation.js`, `personas.js`, `evaluator.js`, `decisions.js`, `index.js`.
   * Add `test/soloAi.test.js` driving **100+ complete 3-bot matches** (`Baron Vance` vs `Inspector Vale` vs `Bot 0`) through `createKredGame(3)` + `Local()` headless clients from **Draft -> Campaigns -> Bureaucracies -> `GAME_OVER`** (plus `skipDraft: true` cases).
   * Assert: 100% termination with valid `winner` (0 deadlocks/cap hits), 0 `INVALID_MOVE` responses, 0 raw-`G` leaks in observations, and tile conservation (`24` tiles, total funding `100` at every Bureaucracy).
4. **Controller & UI Integration:** Implement `src/ai/soloController.js` and wire Solo Mode into `src/srcApp.jsx`, `src/srcBoard.jsx`, and status UI.
5. **Full Regression & Browser Verification:** Run `npm test`, `npm run build`, `npm run build:server`, and run a live browser smoke test of Solo Mode via `npm run dev`.

### Sub-Agent Division & Coordinator Assessment Gate
To avoid contract drift and duplicate helpers across small modules:
* **Coordinator (Main Agent):** Owns branch creation, Section 3 engine fixes, exact `observation`/`decisions` contracts, UI wiring (`srcApp.jsx` / `srcBoard.jsx`), and final integration.
* **Bounded Sub-Agent Work (Optional):**
  1. **AI + Stress Test Builder (1 focused sub-agent):** Implements pure `src/ai/` (`observation`, `personas`, `evaluator`, `decisions`) + `test/soloAi.test.js` against the locked contracts.
  2. **Adversarial Verification (`browser` sub-agent + reviewer):** After integration, plays through Solo Mode in a real browser against `npm run dev` (Draft, Campaign turn, Receipt/Challenge, Bureaucracy) and audits edge cases.
* **Assessment Gate Before Reporting Done:** Coordinator reviews the entire diff (verifying `<500` lines/file, clean `/ponytail` style, strict info-hiding), observes passing `npm test` + 100-game stress suite + `npm run build`, and confirms live UI behavior.
