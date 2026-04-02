# KRED Online — Research Log

Baseline: **828/1001 tests passing** (173 pre-existing failures from main)

---

## Experiment 1 — 2026-04-02

**Target:** Issue #3 (hardcoded session secret) + Issue #6 (console.log spam)
**Files changed:** `packages/server/src/index.ts`, `packages/server/src/socketHandlers.ts`
**Approach:** Require SESSION_SECRET in production (exit if missing); replace all console.log in socketHandlers.ts with DEBUG-gated `log()` helper; add sameSite cookie flag.
**Test result:** 828/1001 — no change (these files aren't covered by client test suite)
**Outcome:** KEPT
**Notes:** Clean quick win. Session secret now safe in production. Logs won't leak game state. Next: Issue #2 (server-side action authorization in socketHandlers.cjs).

---

## Experiment 2 — 2026-04-02

**Target:** Issue #2 (server-side authorization — unprotected game action handlers)
**Files changed:** `server/socketHandlers.cjs`
**Approach:** Added identity/turn validation to 4 handlers that were missing it: `endTurn` (accepts playerIndex, validates against currentPlayerIndex), `receiverDecision` (validates sender is actual receiver), `challengerDecision` (validates sender is current bystander), `bureaucracy:purchase` (added phase + bounds validation). The two main gameplay handlers (`playTile`, `movePiece`) already had validation.
**Test result:** 828/1001 — no change (server handlers not covered by client test suite)
**Outcome:** KEPT
**Notes:** All critical action paths now have at minimum phase + player identity validation. The remaining gap: `playerIndex` is still supplied by the client (not verified against socket session). Full fix requires socket-level session binding — deferred to Issue #1 (socket transition) work.

