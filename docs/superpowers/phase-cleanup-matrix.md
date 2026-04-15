# Phase Cleanup Matrix

Working doc for Step 4 (Cleanup Audits) of the 2026-04-09 multiplayer hardening engagement.

**Step 4 status:** ✅ **complete.** Every inventory row is bounded; every phase-transition row has either a passing test in `src/__tests__/sync/phase-cleanup.test.ts` or a code path verified by inspection. The subscription-stability fix in `GameStateSynchronizer.tsx` (refs for `applyStatePacket` / `getStatePacket` / `onRejoinComplete`) closed a real re-subscribe bug discovered by the §4f audit. See commit history on `supabase-multiplayer` from Step 4 for the full trail.

**Handoff to Step 5:** this matrix is the source of truth for the reset rules a future `PhaseProvider` must preserve. The hook-level resets currently live in `useTilePlayWorkflow.resetForNewTurn` / `completeTilePlay`, `useChallengeFlow.closeTakeAdvantage` / `closeChallengeReveal`, and `useBureaucracy.startBureaucracyPhase`. When Step 5 hoists these into a provider, point the test file at the new owner and the assertions should stay green.

## Inventory — long-lived state

| Name | Location | Type | Lifetime | Max size | Bounded? | Resets on phase? |
|---|---|---|---|---|---|---|
| hostVersionRef | GameStateSynchronizer.tsx:136 | number | mount..unmount | 1 JS number (monotonic) | ✅ | No — monotonic |
| lastProcessedVersionRef | GameStateSynchronizer.tsx:137 | number | mount..unmount | 1 JS number (monotonic) | ✅ | No — monotonic |
| pushTimerRef | GameStateSynchronizer.tsx:138 | setTimeout ID \| null | mount..unmount | 1 slot | ✅ | N/A |
| broadcastChannelRef | GameStateSynchronizer.tsx:139 | Supabase channel \| null | mount..unmount | 1 slot | ✅ | N/A |
| lastBroadcastReceiptRef | GameStateSynchronizer.tsx:140 | number (epoch ms) | mount..unmount | 1 JS number | ✅ | No — global liveness probe |
| persistTimerRef | GameStateSynchronizer.tsx:141 | setTimeout ID \| null | mount..unmount | 1 slot | ✅ | N/A |
| pendingPersistPacketRef | GameStateSynchronizer.tsx:142 | GameStatePacket \| null | mount..unmount | 1 slot | ✅ | N/A |
| lastPersistedVersionRef | GameStateSynchronizer.tsx:143 | number | mount..unmount | 1 JS number (monotonic) | ✅ | No — monotonic |
| lastPersistedPhaseRef | GameStateSynchronizer.tsx:144 | string \| null | mount..unmount | 1 short string | ✅ | No — tracks last persisted |
| lastSeenActionAtRef | GameStateSynchronizer.tsx:145 | string (ISO ts) | mount..unmount | 1 string | ✅ | No — monotonic poll cursor |
| processedActionIdsRef | GameStateSynchronizer.tsx:236 | BoundedActionIdSet | mount..unmount | 500 (ring) | ✅ Step 3 | No — dedupe spans phases |
| actionQueueRef | GameStateSynchronizer.tsx:238 | any[] | mount..unmount | ≤ poll batch + realtime burst (drained 1/macrotask) | ✅ de facto | No — drains naturally |
| isProcessingQueueRef | GameStateSynchronizer.tsx:239 | boolean | mount..unmount | 1 boolean | ✅ | N/A |
| lastAlertIdRef | App.tsx:358 | number | mount..unmount | 1 JS number (monotonic) | ✅ | No — monotonic |
| pendingChallengerRewardRef | App.tsx:490 | object \| null | mount..unmount | 1 | ✅ | Resets on END_TURN/NEW_GAME |
| hasAutoStartedRef | App.tsx:784 | boolean | mount..unmount | 1 boolean | ✅ | No — one-time flag |
| draftPickPendingRef | App.tsx:795 | boolean | mount..unmount | 1 boolean | ✅ | No — debounce flag |
| subscriptionRef | LobbyContext.tsx:74 | Supabase channel \| null | provider lifetime | 1 slot | ✅ | N/A |
| movedPiecesThisTurn | useMoveTracking.ts:47 | Set<string> | turn..turn | pieces_per_player (≤ 6) | ✅ | Yes — reset on advanceTurnNormally |
| serverAlert | App.tsx:332 | object \| null | mount..unmount | 1 | ✅ | No — persists to broadcast |
| matchingTileIds | App.tsx:445 | string[] | action..action | tile_count (≤ 64) | ✅ | Yes — CAMPAIGN only |
| selectedTileForPlay | App.tsx:447 | number \| null | action..action | 1 | ✅ | Yes — DRAFTING phase |
| pendingCommunityPieces | useBureaucracy.ts:71 | Set<string> | phase..phase | playerCount × pieces_per_player (≤ 5 × 6 = 30) | ✅ | Yes — BUREAUCRACY phase |

## Audit decisions

Every inventoried entry is either **naturally bounded** (small constant or `O(playerCount)` with `playerCount ≤ 5`) or **explicitly bounded** (ring buffer / single slot / monotonic JS number). No ⚠️ entries remain after re-checking the Step 3 handoff refs.

- **`hostVersionRef`, `lastProcessedVersionRef`, `lastPersistedVersionRef`, `lastAlertIdRef`**: JS `number` counters. Each is exactly one IEEE-754 double. "Increments forever" is not an unbounded-memory concern — one number occupies 8 bytes regardless of its value. ✅ Promoted with inline comment clarifying the intent.
- **`actionQueueRef`**: `drainQueue()` yields via `setTimeout(…, 0)` after every action and is triggered on every `enqueueAction`. Worst-case depth equals a single poll batch (typical < 20) plus any realtime burst arriving before the next macrotask. Drains at ~1 action/macrotask (≈ 60/s). No long-game accumulation. ✅ de facto bounded, no code fix needed.
- **`processedActionIdsRef`**: Already a `BoundedActionIdSet(500)` from Step 3. ✅
- **`lastSeenActionAtRef`**: Single ISO-8601 string (~24 chars). Monotonic poll cursor. ✅
- **`pendingCommunityPieces`**: Set<pieceId>. Every piece has a stable id; the set holds at most every piece currently on the board = `playerCount × pieces_per_player` ≤ 30. Reset to `new Set()` on phase exit, turn boundaries, and NEW_GAME. ✅

**Conclusion:** No code-level memory-bounds fix is required by the 4a audit. Task 3 still introduces `BoundedMap` as a reusable utility in case future providers need it, but no existing collection is rewritten to use it.

## Phase cleanup matrix

Game phases (from `src/types/game.ts`):

- `PLAYER_SELECTION` — pre-game lobby
- `DRAFTING` — each player picks tiles into their hand
- `CAMPAIGN` — main turn loop; also the "return state" for every sub-flow below
- `SELECTING_TILE` — current player is choosing which tile to play
- `TILE_PLAYED` — tile dropped on board; awaiting receiver acceptance
- `PENDING_ACCEPTANCE` — receiver has not yet accepted/rejected
- `PENDING_CHALLENGE` — receiver rejected; bystanders may challenge
- `TAKE_ADVANTAGE` — challenger chose to "take advantage"
- `BONUS_MOVE` — bonus-move modal open for a piece move
- `CORRECTION_REQUIRED` — mover must withdraw an illegal move
- `BUREAUCRACY` — end-of-round spending phase

Reachable transitions in a normal game (non-exhaustive — focused on transitions that own meaningful state):

| From → To | State that must be reset | Timers/intervals to clear | DB rows to sweep | Status | Notes |
|---|---|---|---|---|---|
| `PLAYER_SELECTION` → `DRAFTING` | `players` seeded; no cleanup (fresh game) | none | N/A (lobby table managed by LobbyContext) | ✅ | `handleNewGame` in `gameFlowHandlers.ts:328` clears everything; transition is a cold start. |
| `DRAFTING` → `CAMPAIGN` | `currentPlayerIndex` reset to player with starting tile; `pieces` seeded | none | N/A | ✅ | `gameFlowHandlers.ts:315` seeds campaign pieces and sets starting player. |
| `CAMPAIGN` → `SELECTING_TILE` | none — selection is additive | none | none | ✅ | No stale state to reset; just toggles UI. |
| `SELECTING_TILE` → `TILE_PLAYED` | `selectedTileForPlay` consumed into `playedTile` | none | none | ✅ | `tilePlayHandlers.ts` clears selection when committing play. |
| `TILE_PLAYED` → `PENDING_ACCEPTANCE` | none | none | none | ✅ | Additive state transition. |
| `PENDING_ACCEPTANCE` → `PENDING_CHALLENGE` | `receiverAcceptance` reflects rejection | none | none | ✅ | `challengeFlowHandlers.ts:168` drives the transition. |
| `PENDING_CHALLENGE` → `TAKE_ADVANTAGE` | `currentChallengerIndex` advances | none | none | ✅ | `useTilePlayWorkflow.ts` advances challenger index. |
| `PENDING_CHALLENGE` → `CAMPAIGN` (return to placer) | `playedTile`, `challengeOrder`, `currentChallengerIndex`, `tileRejected`, `tileTransaction`, `bystanderIndex`, `bystanders`, `movedPiecesThisTurn`, `pendingCommunityPieces` | none | none | ✅ | `advanceTurnNormally` (turnHandlers.ts:173) clears bystander/transaction/moved/pending state; play-end branches in App.tsx (1192, 2138, 2530, 3238, 3328, 3815) clear `playedTile`, `challengeOrder`, `currentChallengerIndex`, `tileRejected`. |
| `TAKE_ADVANTAGE` → `CAMPAIGN` | `takeAdvantageChallengerId`, `takeAdvantageChallengerCredibility`, `showTakeAdvantageModal`, `playedTile`, `bystanderIndex`, `challengeOrder`, `currentChallengerIndex`, `tileRejected` | none | none | ✅ | Reset through the shared "return to campaign" code path. |
| `BONUS_MOVE` → `CAMPAIGN` | `bonusMovePlayerId`, `showBonusMoveModal`, `piecesBeforeBonusMove` | none | none | ✅ | `pieceMovementHandlers.ts:318` + play-end branches. |
| `CORRECTION_REQUIRED` → `CAMPAIGN` | `tilePlayerMustWithdraw` | none | none | ✅ | `pieceMovementHandlers.ts` branches clear the flag. |
| `CAMPAIGN` → `BUREAUCRACY` (round end) | `playedTile`, `hasPlayedTileThisTurn`, `tileTransaction`, `movedPiecesThisTurn`, `pendingCommunityPieces`, `movesThisTurn`, `challengeOrder`, `currentChallengerIndex`, `tileRejected` | none | none | ✅ | `gameFlowHandlers.ts:259` enters bureaucracy after the last player's turn; prior turn-end resets already cleared state. |
| `BUREAUCRACY` → `CAMPAIGN` (next round) | `currentBureaucracyPlayerIndex` back to 0; `bureaucracyStates`, `bureaucracyTurnOrder`, `bureaucracyMoves`, `bureaucracySnapshot`, `currentBureaucracyPurchase`, `pendingCommunityPieces` | none | none | ✅ | `useBureaucracy.ts:startBureaucracyPhase` re-initializes on next entry; `gameFlowHandlers.ts:315` seeds next round. |
| `BUREAUCRACY` → `DRAFTING` (new draft round) | Same as BUREAUCRACY → CAMPAIGN plus reset of per-round campaign state | none | none | ✅ | `gameFlowHandlers.ts:319` routes to DRAFTING when a new draft is scheduled. |
| Any → `PLAYER_SELECTION` (new game) | Full reset (every game collection) | All timers in `GameStateSynchronizer` cleared on unmount | `kred_game_states` / `kred_game_actions` rows sweep deferred to lobby teardown | ✅ | `handleNewGame` in `gameFlowHandlers.ts:328` is the master reset. |

**Audit result:** The existing handlers already reset all phase-scoped state at every reachable transition. No 🔧 code fix is required by the 4b audit before tests run.

**Follow-up:** Task 6 builds tests that actually *exercise* these transitions and assert the invariants. If any test fails, that row will be flipped to 🔧 and fixed in the same commit as the test.

**Deferred rows:** none in Step 4. Every transition has a clear owner in App.tsx or a handler module. Provider migration (Step 5/7) will move these into a `PhaseProvider`, but the rules themselves do not change.
