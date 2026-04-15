# Phase Cleanup Matrix

Working doc for Step 4 (Cleanup Audits) of the 2026-04-09 multiplayer hardening engagement.

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
(filled in Task 4)
