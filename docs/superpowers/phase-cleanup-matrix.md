# Phase Cleanup Matrix

Working doc for Step 4 (Cleanup Audits) of the 2026-04-09 multiplayer hardening engagement.

## Inventory — long-lived state

| Name | Location | Type | Lifetime | Max size | Bounded? | Resets on phase? |
|---|---|---|---|---|---|---|
| hostVersionRef | GameStateSynchronizer.tsx:98 | number | mount..unmount | Unbounded counter | No — increments forever | No |
| lastProcessedVersionRef | GameStateSynchronizer.tsx:99 | number | mount..unmount | Unbounded counter | No — increments forever | No |
| pushTimerRef | GameStateSynchronizer.tsx:100 | setTimeout ID \| null | mount..unmount | 1 | Yes — single slot | N/A |
| broadcastChannelRef | GameStateSynchronizer.tsx:101 | Supabase channel \| null | mount..unmount | 1 | Yes — single slot | N/A |
| processedActionIdsRef | GameStateSynchronizer.tsx:150 | Set<string> | mount..unmount | 500 (ring) | Yes — Step 3 | No — dedupe spans phases |
| actionQueueRef | GameStateSynchronizer.tsx:152 | any[] | mount..unmount | ⚠️ UNKNOWN | No | No — accumulates across phases |
| isProcessingQueueRef | GameStateSynchronizer.tsx:153 | boolean | mount..unmount | 1 (boolean) | Yes — binary | N/A |
| lastAlertIdRef | App.tsx:358 | number | mount..unmount | Unbounded counter | No — increments forever | No |
| pendingChallengerRewardRef | App.tsx:490 | object \| null | mount..unmount | 1 | Yes — single reward | Resets on END_TURN/NEW_GAME |
| hasAutoStartedRef | App.tsx:784 | boolean | mount..unmount | 1 (boolean) | Yes — one-time flag | No — persists to avoid re-runs |
| draftPickPendingRef | App.tsx:795 | boolean | mount..unmount | 1 (boolean) | Yes — binary | No — debounce flag |
| subscriptionRef | LobbyContext.tsx:74 | Supabase channel \| null | provider lifetime | 1 | Yes — single slot | N/A |
| movedPiecesThisTurn | useMoveTracking.ts:47 | Set<string> | turn..turn | pieces_per_player | Yes — 1 piece per player | Yes — reset on advanceTurnNormally |
| serverAlert | App.tsx:332 | object \| null | mount..unmount | 1 | Yes — single alert | No — persists to broadcast |
| matchingTileIds | App.tsx:445 | string[] | action..action | 8 tiles max | Yes — 1 deck | Yes — CAMPAIGN only |
| selectedTileForPlay | App.tsx:447 | number \| null | action..action | 1 | Yes — single tile | Yes — DRAFTING phase |
| pendingCommunityPieces | useBureaucracy.ts:71 | Set<string> | phase..phase | ⚠️ UNKNOWN | No | Yes — BUREAUCRACY phase |

## Audit decisions
(filled in Task 2)

## Phase cleanup matrix
(filled in Task 4)
