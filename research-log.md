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
