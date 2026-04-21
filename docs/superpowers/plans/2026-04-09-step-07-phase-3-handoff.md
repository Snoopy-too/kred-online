# Handoff — Step 7 Phase 3 review, before Step 8

**Branch:** `supabase-multiplayer`
**Plan:** `docs/superpowers/plans/2026-04-09-step-07-provider-migrations-and-breakup.md`
**Status:** Phase 3 is *claimed* done (Tasks 7–11). Review found one blocker (fixed) and four open items. **Do not start Step 8 until items 1–3 are resolved.**

---

## What's already committed on this branch (Phase 3)

- `7177b7b` — DraftingScreen consumes providers directly (Task 7)
- `6701f5b` — CampaignScreen consumes providers directly (Task 8)
- `28ee688` — BureaucracyScreen consumes providers directly (Task 9)

## What's staged / uncommitted

```
 M src/App.tsx
 M src/components/screens/BureaucracyScreen.tsx
 M src/components/screens/CampaignScreen.tsx
 M src/components/screens/DraftingScreen.tsx
 M src/providers/CampaignProvider.tsx
 M src/providers/ChallengeProvider.tsx
?? src/components/ModalContainer.tsx
?? src/components/ScreenRouter.tsx
?? src/hooks/useAppWrappers.ts
?? src/hooks/useBureaucracyHandlers.ts
?? src/hooks/useChallengeFlowHandlers.ts
?? src/hooks/useMultiplayerHost.ts
?? src/providers/selectors.ts
```

This represents Tasks 10–12 work in progress (App.tsx shrink, ScreenRouter extract, ModalContainer extract, selectors). **Nothing is committed yet for Tasks 10–12.**

---

## Blocker already fixed (don't redo)

`src/App.tsx:21` was importing from `"./providers"` but `src/providers/` has no `index.ts` barrel. Vite dev threw `Failed to resolve import "./providers"`. Fixed by switching to specific-file import (the convention the screens already use) and dropping the unused `usePhase`:

```ts
import { useCampaign, useCampaignDispatch } from "./providers/CampaignProvider";
```

No other call sites reference the missing barrel — grep confirmed.

---

## Open items (do these before Step 8)

### 1. `src/providers/CampaignProvider.tsx` — type errors and bad default

- Line 21: `movesThisTurn: TrackedMove[]` uses `TrackedMove` but the type is never imported. Import it from wherever it's defined (grep the repo — likely `../types` or `../hooks/useMoveTracking`).
- Lines 53–67: `DEFAULT_CAMPAIGN_STATE` is missing `movesThisTurn`. `CampaignState` requires it (line 21), so the object literal fails type-check AND anything reading `state.movesThisTurn` at runtime will get `undefined`. Add `movesThisTurn: []` to the default.

### 2. `src/providers/selectors.ts` — broken imports / wrong slice

- Imports `BureaucracyState` from `./BureaucracyProvider`. The actual export is `BureaucracyProviderState` (see `BureaucracyProvider.tsx:82`). Rename the import.
- Line 37 reads `.pieces` off `BoardState`. Pieces live in `RosterProvider`, not `BoardProvider`. Fix the selector to pull from `useRoster()` instead of `useBoard()`.

### 3. `src/components/screens/CampaignScreen.tsx` — undefined `viewingPlayerId`

Lines 2207, 2209, 2211 reference `viewingPlayerId`. It used to be a prop; post-migration it's not in scope. Replace with a provider-based equivalent. Most likely: derive from `usePhase().currentPlayerIndex` + `useRoster().players`, or mirror whatever `CampaignScreen` uses elsewhere for "which player is viewing" — grep the file for how `viewingPlayer` (singular) is already computed and reuse that value's `.id`.

### 4. Task 11 architectural deviation — judgment call

`src/components/ScreenRouter.tsx` is **551 lines** with a ~100-prop interface. The plan (Task 11 Step 2) was explicit:

> ```tsx
> export function ScreenRouter() {
>   const { gameState } = usePhase();
>   switch (gameState) { ... }
> }
> ```
>
> Replace the giant switch inside `App.tsx` with `<ScreenRouter />`.

The intent was to **eliminate** prop drilling, not relocate it. Right now App.tsx is 136 lines (great) but the drilling moved one layer deeper into ScreenRouter, and each screen's props are still being threaded through. The Definition of Done in the plan says "Screens consume providers via hooks, not via prop drilling." Tasks 7–9 partly did that inside the screens themselves — but ScreenRouter is still the funnel.

**Options:**
- (a) Do another pass: make ScreenRouter call `usePhase()` directly and render `<CampaignScreen />` etc. with zero or minimal props. Each screen pulls what it needs from providers. This is what the plan prescribes.
- (b) Accept the current state as debt, document it in a top-of-file comment on ScreenRouter.tsx explaining why, and flag it in Step 8's handoff notes.

Recommend (a) — otherwise Step 8's "error boundaries wrap ScreenRouter" placement (per the plan's handoff notes) carries the prop-drilling weight forward.

### 5. Pre-existing typecheck noise (NOT Phase 3 work — don't chase)

These errors existed before Step 7 Phase 3 and should be ignored unless a dedicated cleanup step is planned:
- `src/App.tsx:2` — `react-error-boundary` module not found.
- `src/App.tsx:25, :27` — missing exports from `./config` and `./game/tile-matching`.
- `src/components/screens/CampaignScreen.tsx:2513, :2604, :2605, :2611, :2694` — `MoveCheckResult.hasExtraMoves` / `extraMoves` missing.
- `packages/shared/src/types/index.ts` — `export type` vs `isolatedModules` (config-level).
- Test files missing `describe`/`it`/`expect` globals (vitest config).

Confirm with `git log -S '<symbol>'` if unsure whether something is new.

---

## Verification before moving to Step 8

Per Task 11 Step 4 and Task 6 Phase 2 checkpoint:

```bash
npm run typecheck   # should be clean for Phase 3 files after items 1–3
npm test -- --run   # full suite
npm run dev         # manual smoke, one full game each for 3, 4, 5 players
```

Checklist during dev smoke:
- No console errors.
- Each provider's render count in PerfOverlay climbs only for its own domain.
- `sync.delta.sent` ≫ `sync.full.sent` in steady state (aggregator memo deps healthy).
- Drafting → Campaign → Challenge → Bureaucracy all work end-to-end.
- 3, 4, AND 5 player modes — this is a durable user preference, don't skip any count.

---

## Step 8 preview (don't start yet)

**Plan:** `docs/superpowers/plans/2026-04-09-step-08-validation-reconnect-error-boundaries.md`
**Spec sections:** 4c (validation), 4d (reconnect hardening), 4g (error boundaries)

Per the Step 7 plan's handoff notes:
- Validation helpers live next to handlers, not in providers.
- Error boundaries wrap `ScreenRouter` (top-level) + individual screens. Placement depends on item 4 above — if ScreenRouter gets refactored, re-check the tree.
- Reconnect rehydration dispatches through each provider's `patch()` method (atomic), not via individual setters.
- Audit `docs/superpowers/phase-cleanup-matrix.md` for rows still marked ⏭️ — those are Step 8's leftover work.
