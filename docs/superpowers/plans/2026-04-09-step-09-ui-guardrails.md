# Step 9 — UI Guardrails (4e)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sweep every action-emitting button across the screens and add four classes of guardrail where missing:
1. **`isProcessing` double-submit guards** — stop rapid repeat clicks from emitting duplicate actions while a previous one is in flight.
2. **Confirmation gates** on destructive/expensive actions (ending a turn with unused resources, spending, irreversible phase advances).
3. **Correct `disabled` states** during animation or busy phases so the user can't click through a half-complete animation.
4. **Input sanitization** on every text input (`trim`, length caps, type checks).

**Architecture:** Additive only. Create one shared `useActionButton` hook that encapsulates `isProcessing` + click-swallow + auto-reset. Audit each screen, apply the hook where the existing code has an unguarded action button. Confirmation gates use local state (`confirming` boolean, click-twice-to-execute pattern). No changes to handlers, providers, or the sync layer.

**Tech Stack:** React 19, TypeScript, Vitest + React Testing Library.

---

## Context for fresh agent

**Read these first** (in this order, ~10 minutes):

1. `docs/superpowers/specs/2026-04-09-multiplayer-perf-hardening-design.md` — **Section 4e**. Short section; checklist-style.
2. `docs/superpowers/plans/2026-04-09-step-08-validation-reconnect-error-boundaries.md` — "Handoff notes" at the bottom. Validation rejection interacts with this step's `isProcessing` guards.
3. `src/components/screens/DraftingScreen.tsx`, `CampaignScreen.tsx`, `BureaucracyScreen.tsx` — the three primary gameplay screens. Every action button lives here or in their children.
4. `src/components/WaitingRoom.tsx`, `LobbyScreen.tsx`, `PlayerSelectionScreen.tsx` — pre-game screens. Inputs (lobby PIN, player name) need sanitization.
5. `src/providers/selectors.ts` and each `useXxxDispatch` hook — these are what buttons currently call. You don't change them; you wrap the caller site.

**Project conventions:**
- TypeScript everywhere; `any` is a yellow flag.
- Two-space indent, double quotes, semicolons.
- New hooks go in `src/hooks/`.
- File-size budget: 500 lines per file.

**Critical constraints:**
- **No handler changes.** Guardrails live entirely in the UI layer.
- **No provider changes.** Buttons talk to existing dispatch hooks, wrapped in the new `useActionButton` hook.
- **Sync tests must stay green.**
- **3, 4, AND 5 player modes must keep working.**
- **`isProcessing` auto-clear after 5 seconds.** Per the multiplayer-game skill guidance — a safety valve in case the host never responds. This is a last-resort clearance, not a success signal.
- **Confirmation gates are two-click, not modal.** Modals break flow and add a new dependency. Two-click is the lightest-weight solution.

**What this step does NOT do:**
- ❌ New handler logic.
- ❌ New providers or context shapes.
- ❌ Redesign of any screen's layout — guardrails are additive.
- ❌ Accessibility / keyboard / screen reader pass (desktop browser only, per spec).
- ❌ Input validation beyond trim / length / type — no regex-gated formatters.

---

## File Structure

| File | Change | Size after |
|---|---|---|
| `src/hooks/useActionButton.ts` | Create: reusable `isProcessing` + auto-reset hook. | ≤ 120 lines |
| `src/hooks/useConfirmGate.ts` | Create: two-click confirmation state hook. | ≤ 80 lines |
| `src/__tests__/hooks/useActionButton.test.tsx` | Create: hook unit tests. | ≤ 180 lines |
| `src/__tests__/hooks/useConfirmGate.test.tsx` | Create: hook unit tests. | ≤ 120 lines |
| `src/components/screens/DraftingScreen.tsx` | Modify: apply guardrails. | unchanged size (minor additions) |
| `src/components/screens/CampaignScreen.tsx` | Modify: apply guardrails. | unchanged size |
| `src/components/screens/BureaucracyScreen.tsx` | Modify: apply guardrails. | unchanged size |
| `src/components/screens/WaitingRoom.tsx` | Modify: input sanitization. | unchanged size |
| `src/components/screens/LobbyScreen.tsx` | Modify: PIN input sanitization + join button guard. | unchanged size |
| `src/components/screens/PlayerSelectionScreen.tsx` | Modify: name input sanitization. | unchanged size |
| `docs/superpowers/ui-guardrails-audit.md` | Create: checklist doc capturing every audited button + its guardrail status. | ≤ 250 lines |

---

## Tasks

### Task 1: Build `useActionButton` hook

**Files:**
- Create: `src/hooks/useActionButton.ts`

- [ ] **Step 1: Write the hook**

```ts
// src/hooks/useActionButton.ts
import { useCallback, useEffect, useRef, useState } from "react";

interface UseActionButtonOptions {
  /** Max time the "processing" state can stay true before auto-clearing. Default 5000ms. */
  autoClearMs?: number;
  /** Called once when the button is clicked and not already processing. */
  onClick: () => void | Promise<void>;
  /**
   * Extra disabled conditions (animation phase, busy state, etc.).
   * Evaluated on every render.
   */
  disabled?: boolean;
}

interface UseActionButtonResult {
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
  /** Call this when external code knows the action completed (e.g., on a state change). */
  done: () => void;
}

/**
 * Encapsulates the double-submit guard pattern from the multiplayer-game skill.
 *
 * Behavior:
 * - Clicks are ignored while `isProcessing === true`.
 * - After the inner onClick resolves (sync or async), stays processing until
 *   the caller invokes `done()` OR the auto-clear timeout fires.
 * - The auto-clear is a safety valve in case the host never confirms. 5s
 *   default matches the multiplayer-game skill's guidance.
 * - An explicit `disabled` prop also short-circuits clicks.
 */
export function useActionButton(options: UseActionButtonOptions): UseActionButtonResult {
  const { autoClearMs = 5000, disabled = false } = options;
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onClickRef = useRef(options.onClick);

  // Keep the latest onClick in a ref so handleClick can be stable.
  useEffect(() => {
    onClickRef.current = options.onClick;
  }, [options.onClick]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const done = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsProcessing(false);
  }, []);

  const handleClick = useCallback(() => {
    if (disabled || isProcessing) return;
    setIsProcessing(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setIsProcessing(false);
    }, autoClearMs);
    try {
      const result = onClickRef.current();
      if (result && typeof (result as Promise<void>).then === "function") {
        (result as Promise<void>).catch((err) => {
          console.error("[useActionButton] onClick rejected:", err);
        });
      }
    } catch (err) {
      console.error("[useActionButton] onClick threw:", err);
    }
  }, [disabled, isProcessing, autoClearMs]);

  return {
    onClick: handleClick,
    disabled: disabled || isProcessing,
    isProcessing,
    done,
  };
}
```

- [ ] **Step 2: Write unit tests**

```tsx
// src/__tests__/hooks/useActionButton.test.tsx
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useActionButton } from "../../hooks/useActionButton";

describe("useActionButton", () => {
  it("calls onClick on first click", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useActionButton({ onClick }));
    act(() => { result.current.onClick(); });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("swallows repeat clicks while processing", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useActionButton({ onClick }));
    act(() => {
      result.current.onClick();
      result.current.onClick();
      result.current.onClick();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(result.current.isProcessing).toBe(true);
  });

  it("re-enables after calling done()", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useActionButton({ onClick }));
    act(() => { result.current.onClick(); });
    expect(result.current.isProcessing).toBe(true);
    act(() => { result.current.done(); });
    expect(result.current.isProcessing).toBe(false);
    act(() => { result.current.onClick(); });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("auto-clears after timeout", async () => {
    vi.useFakeTimers();
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useActionButton({ onClick, autoClearMs: 1000 }),
    );
    act(() => { result.current.onClick(); });
    expect(result.current.isProcessing).toBe(true);
    act(() => { vi.advanceTimersByTime(1100); });
    expect(result.current.isProcessing).toBe(false);
    vi.useRealTimers();
  });

  it("respects explicit disabled prop", () => {
    const onClick = vi.fn();
    const { result } = renderHook(() =>
      useActionButton({ onClick, disabled: true }),
    );
    act(() => { result.current.onClick(); });
    expect(onClick).not.toHaveBeenCalled();
    expect(result.current.disabled).toBe(true);
  });

  it("async onClick errors do not leak", async () => {
    const onClick = vi.fn().mockRejectedValue(new Error("boom"));
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useActionButton({ onClick }));
    act(() => { result.current.onClick(); });
    // Flush microtasks
    await Promise.resolve();
    expect(onClick).toHaveBeenCalled();
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
```

- [ ] **Step 3: Run + commit**

```bash
npm test -- --run src/__tests__/hooks/useActionButton.test.tsx
git add src/hooks/useActionButton.ts src/__tests__/hooks/useActionButton.test.tsx
git commit -m "feat: useActionButton hook for double-submit guards"
```

---

### Task 2: Build `useConfirmGate` hook

**Files:**
- Create: `src/hooks/useConfirmGate.ts`
- Create: `src/__tests__/hooks/useConfirmGate.test.tsx`

- [ ] **Step 1: Write the hook**

```ts
// src/hooks/useConfirmGate.ts
import { useCallback, useEffect, useRef, useState } from "react";

interface UseConfirmGateOptions {
  /** Max time the "confirming" state stays true before reverting. Default 4000ms. */
  timeoutMs?: number;
  /** Called when the user clicks a second time within the timeout. */
  onConfirm: () => void;
}

interface UseConfirmGateResult {
  confirming: boolean;
  /** Call this on button click. First call arms; second call within timeout fires onConfirm. */
  onClick: () => void;
  /** Programmatically cancel (e.g. user navigates away). */
  cancel: () => void;
}

/**
 * Two-click confirmation pattern.
 * First click arms and flips `confirming` to true so the UI can warn.
 * Second click (within timeoutMs) fires onConfirm.
 * No click within timeoutMs → reverts silently.
 */
export function useConfirmGate(options: UseConfirmGateOptions): UseConfirmGateResult {
  const { timeoutMs = 4000 } = options;
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onConfirmRef = useRef(options.onConfirm);

  useEffect(() => { onConfirmRef.current = options.onConfirm; }, [options.onConfirm]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => clearTimer(), []);

  const cancel = useCallback(() => {
    clearTimer();
    setConfirming(false);
  }, []);

  const onClick = useCallback(() => {
    if (confirming) {
      clearTimer();
      setConfirming(false);
      onConfirmRef.current();
      return;
    }
    setConfirming(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setConfirming(false);
    }, timeoutMs);
  }, [confirming, timeoutMs]);

  return { confirming, onClick, cancel };
}
```

- [ ] **Step 2: Write the test**

```tsx
// src/__tests__/hooks/useConfirmGate.test.tsx
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useConfirmGate } from "../../hooks/useConfirmGate";

describe("useConfirmGate", () => {
  it("first click arms, second click fires", () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmGate({ onConfirm }));
    act(() => { result.current.onClick(); });
    expect(result.current.confirming).toBe(true);
    expect(onConfirm).not.toHaveBeenCalled();
    act(() => { result.current.onClick(); });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.confirming).toBe(false);
  });

  it("reverts after timeout if no second click", () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    const { result } = renderHook(() =>
      useConfirmGate({ onConfirm, timeoutMs: 1000 }),
    );
    act(() => { result.current.onClick(); });
    expect(result.current.confirming).toBe(true);
    act(() => { vi.advanceTimersByTime(1100); });
    expect(result.current.confirming).toBe(false);
    expect(onConfirm).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("cancel() clears confirming state without firing", () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmGate({ onConfirm }));
    act(() => { result.current.onClick(); });
    act(() => { result.current.cancel(); });
    expect(result.current.confirming).toBe(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run + commit**

```bash
npm test -- --run src/__tests__/hooks/useConfirmGate.test.tsx
git add src/hooks/useConfirmGate.ts src/__tests__/hooks/useConfirmGate.test.tsx
git commit -m "feat: useConfirmGate hook for two-click confirmations"
```

---

### Task 3: Audit every action button — produce the checklist doc

**Files:**
- Create: `docs/superpowers/ui-guardrails-audit.md`

- [ ] **Step 1: Build the audit table**

For each screen file, grep for `onClick=` and list every button. Produce a table in `ui-guardrails-audit.md`:

```markdown
# UI Guardrails Audit

| Screen | Button/input | Action dispatched | Has isProcessing? | Has confirm gate? | Correct disabled? | Input sanitized? | Status |
|---|---|---|---|---|---|---|---|
| DraftingScreen | "Pick fighter" | DRAFT_FIGHTER | ❌ | n/a | ✅ | n/a | 🔧 |
| DraftingScreen | "Skip draft" (dev) | SKIP_DRAFT | ❌ | needed (destructive) | ✅ | n/a | 🔧 |
| CampaignScreen | "End turn" | END_TURN | ❌ | needed | ✅ | n/a | 🔧 |
| CampaignScreen | "Play tile" | PLAY_TILE | ❌ | n/a | partial (missing bellPause) | n/a | 🔧 |
| BureaucracyScreen | "Buy item" | BUREAUCRACY_PURCHASE | ❌ | needed (spends cash) | ✅ | n/a | 🔧 |
| BureaucracyScreen | "Skip bureaucracy" | SKIP_BUREAUCRACY | ❌ | n/a | ✅ | n/a | 🔧 |
| LobbyScreen | PIN input | — | n/a | n/a | n/a | ❌ | 🔧 |
| LobbyScreen | "Join lobby" | JOIN_LOBBY | ❌ | n/a | ✅ | n/a | 🔧 |
| WaitingRoom | "Start game" | START_GAME | ❌ | needed | ✅ | n/a | 🔧 |
| PlayerSelectionScreen | Name input | — | n/a | n/a | n/a | ❌ | 🔧 |
```

**Important:** the real rows must come from your actual grep — not the placeholder rows above. The placeholder rows show the expected structure only.

- [ ] **Step 2: Commit the audit doc**

```bash
git add docs/superpowers/ui-guardrails-audit.md
git commit -m "docs: UI guardrails audit checklist"
```

---

### Task 4: Apply guardrails to `DraftingScreen`

**Files:**
- Modify: `src/components/screens/DraftingScreen.tsx`

- [ ] **Step 1: Wrap every action button in `useActionButton`**

Pattern for each button in the screen:

```tsx
import { useActionButton } from "../../hooks/useActionButton";

// Before:
<button onClick={() => pickFighter(fighterId)} disabled={!canPick}>Pick</button>

// After:
const pickButton = useActionButton({
  onClick: () => pickFighter(fighterId),
  disabled: !canPick || isDrafting,
});

<button onClick={pickButton.onClick} disabled={pickButton.disabled}>
  {pickButton.isProcessing ? "Picking…" : "Pick"}
</button>
```

**Important:** hooks cannot be called in loops. If the screen renders N pick buttons (one per fighter), you have two options:

1. Extract a `<PickButton />` child component that calls `useActionButton` internally once per render. This is cleaner.
2. Use a single `isProcessingId` state on the parent and guard all clicks against it.

Pick the child-component approach — it composes with `React.memo` from Step 7.

```tsx
function PickButton({ fighterId, onPick, disabled }: {
  fighterId: string;
  onPick: (id: string) => void;
  disabled: boolean;
}) {
  const btn = useActionButton({
    onClick: () => onPick(fighterId),
    disabled,
  });
  return (
    <button onClick={btn.onClick} disabled={btn.disabled}>
      {btn.isProcessing ? "…" : "Pick"}
    </button>
  );
}
```

- [ ] **Step 2: Apply `useConfirmGate` to the "Skip draft" button**

```tsx
const skipGate = useConfirmGate({ onConfirm: skipDraft });
<button onClick={skipGate.onClick}>
  {skipGate.confirming ? "Click again to skip draft" : "Skip draft"}
</button>
```

- [ ] **Step 3: Mark the DraftingScreen rows ✅ in the audit doc**

- [ ] **Step 4: Typecheck + dev smoke for drafting**

```bash
npm run typecheck && npm test -- --run
npm run dev
```

Start a 4-player game; complete drafting. Confirm pick buttons are disabled briefly after click, then re-enable when the host confirms.

- [ ] **Step 5: Commit**

```bash
git add src/components/screens/DraftingScreen.tsx docs/superpowers/ui-guardrails-audit.md
git commit -m "feat: DraftingScreen action guardrails + confirm gates"
```

---

### Task 5: Apply guardrails to `CampaignScreen`

**Files:**
- Modify: `src/components/screens/CampaignScreen.tsx`

Per the audit doc, apply the template from Task 4 to every button. Key behaviors:

- **Move piece** — wrap each tile's click handler in `useActionButton` with `disabled = !isMyTurn || animationInProgress || movesThisTurnExhausted`.
- **Play tile** — `disabled = !isMyTurn || hasPlayedTileThisTurn || tileRevealAnimationInProgress`.
- **End turn** — `useConfirmGate` if unused moves/tiles remain. A single button that toggles between "End turn" and "Click again to end turn" depending on whether there's unspent turn value.

```tsx
const mustConfirmEnd = hasUnusedMoves || hasUnusedTile;
const endConfirm = useConfirmGate({ onConfirm: endTurn });
const endButton = useActionButton({
  onClick: mustConfirmEnd ? endConfirm.onClick : endTurn,
  disabled: !isMyTurn || animationInProgress,
});

<button onClick={endButton.onClick} disabled={endButton.disabled}>
  {endConfirm.confirming ? "Click again to end turn" : "End turn"}
</button>
```

- [ ] **Step 1: Apply the template to every button**

- [ ] **Step 2: Animation-busy disabled audit**

Identify every animation phase flag in `CampaignScreen` (e.g., `flipping`, `bellPause`, `tileRevealAnimating`, `pieceMoveAnimating`). Make sure **every** action button's `disabled` prop includes the relevant flag(s). Missing one means the user can click through an animation.

- [ ] **Step 3: Mark rows ✅ in audit doc, typecheck, tests, dev smoke**

```bash
npm run typecheck && npm test -- --run
npm run dev
```

Play a campaign round with 4 players. Try to click through an animation — it should be disabled.

- [ ] **Step 4: Commit**

```bash
git add src/components/screens/CampaignScreen.tsx docs/superpowers/ui-guardrails-audit.md
git commit -m "feat: CampaignScreen action guardrails + animation-aware disables"
```

---

### Task 6: Apply guardrails to `BureaucracyScreen`

**Files:**
- Modify: `src/components/screens/BureaucracyScreen.tsx`

- [ ] **Step 1: Apply the template**

Buttons to audit:
- "Buy item" (each purchasable) — `useActionButton` + `useConfirmGate` (spending is destructive).
- "Skip bureaucracy" — `useActionButton` + `useConfirmGate`.
- "End bureaucracy turn" — `useActionButton`.

- [ ] **Step 2: Disabled audit**

- `disabled = !isMyBureaucracyTurn || processingPurchase || !canAfford(item)`

- [ ] **Step 3: Typecheck + tests + smoke + commit**

```bash
git add src/components/screens/BureaucracyScreen.tsx docs/superpowers/ui-guardrails-audit.md
git commit -m "feat: BureaucracyScreen action guardrails"
```

---

### Task 7: Input sanitization pass

**Files:**
- Modify: `src/components/screens/LobbyScreen.tsx`
- Modify: `src/components/screens/PlayerSelectionScreen.tsx`
- Modify: `src/components/screens/WaitingRoom.tsx` (if it has any inputs)

- [ ] **Step 1: PIN input in `LobbyScreen`**

```tsx
<input
  type="text"
  value={pin}
  maxLength={6}
  onChange={(e) => {
    // Uppercase alphanumeric only, capped at 6
    const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setPin(cleaned);
  }}
/>
```

And the Join button's click handler:

```tsx
const canJoin = pin.trim().length === 6;
const joinButton = useActionButton({
  onClick: () => joinLobby(pin.trim()),
  disabled: !canJoin,
});
```

- [ ] **Step 2: Name input in `PlayerSelectionScreen`**

```tsx
<input
  type="text"
  value={name}
  maxLength={20}
  onChange={(e) => setName(e.target.value.slice(0, 20))}
/>
```

Submit button:

```tsx
const trimmedName = name.trim();
const canSubmit = trimmedName.length >= 1 && trimmedName.length <= 20;
const submitButton = useActionButton({
  onClick: () => submitName(trimmedName),
  disabled: !canSubmit,
});
```

- [ ] **Step 3: Any other text inputs**

Grep for `<input` across `src/components/screens` and cap every one that isn't already capped.

```bash
Grep -n "<input" src/components/screens
```

For each hit that accepts free-form text, apply `maxLength` + `onChange` trim. For numeric inputs (`type="number"`), also clamp to a sensible range:

```tsx
<input
  type="number"
  min={1}
  max={999}
  onChange={(e) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n)) setQty(Math.min(999, Math.max(1, Math.floor(n))));
  }}
/>
```

- [ ] **Step 4: Typecheck + tests + dev smoke**

Try pasting garbage into every input in the app. Expected: silently sanitized, not accepted as-is.

- [ ] **Step 5: Commit**

```bash
git add src/components/screens/LobbyScreen.tsx src/components/screens/PlayerSelectionScreen.tsx src/components/screens/WaitingRoom.tsx
git commit -m "feat: input sanitization on lobby PIN, player name, all text inputs"
```

---

### Task 8: Wire `done()` on state-change convergence where it matters

**Files:**
- Modify: each screen that used `useActionButton` and wants faster re-enable than the 5s auto-clear.

- [ ] **Step 1: Identify fast-path buttons**

A button benefits from explicit `done()` if the user would reasonably expect to click it again within 5 seconds. Examples:
- "Move piece" (multiple moves per turn)
- "Play tile" (players often hover/click quickly)
- "End bureaucracy turn"

Buttons where 5s auto-clear is fine: "Start game," "Join lobby," "Skip draft," "End turn" (you usually don't end twice in 5 seconds).

- [ ] **Step 2: For each fast-path button, call `done()` via an effect that watches the relevant state**

```tsx
const moveButton = useActionButton({ onClick: () => movePiece(...), disabled: !canMove });

// When the piece's tileId actually changes, the move was applied — re-enable.
useEffect(() => {
  if (moveButton.isProcessing && /* the piece is now at the expected destination */) {
    moveButton.done();
  }
}, [/* the relevant piece/tile state */]);
```

**Important:** do NOT call `done()` in a tight loop. The effect's deps must be the specific state that indicates "the action landed," not the full packet.

- [ ] **Step 3: Smoke test — confirm buttons re-enable quickly**

```bash
npm run dev
```

Click move piece, observe the button re-enables as soon as the animation lands (well under 5s).

- [ ] **Step 4: Commit**

```bash
git add src/components/screens
git commit -m "feat: explicit done() on fast-path action buttons"
```

---

### Task 9: Final audit review + smoke

**Files:**
- Modify: `docs/superpowers/ui-guardrails-audit.md`

- [ ] **Step 1: Every row in the audit table must be ✅**

If any rows are still 🔧 at this point, go back and fix them. If a row is intentionally not applicable (e.g., a button that fires a local UI state toggle and not a game action), mark it `n/a` with a note.

- [ ] **Step 2: Full test suite**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 3: Dev smoke for 3/4/5 players**

For each player count, play a full game. Specifically verify:
- Double-click any action button → no duplicate actions (check host's `validation.accepted` counter doesn't double-count).
- Click destructive buttons (End turn with unused moves, Buy expensive item) → confirmation gate appears.
- Try to click through a running animation → blocked.
- Paste garbage into lobby PIN and player name → sanitized on the fly.
- Disconnect during a click → no hang: either the action lands or the button auto-clears in 5s.

- [ ] **Step 4: Commit the final audit doc**

```bash
git add docs/superpowers/ui-guardrails-audit.md
git commit -m "docs: close out UI guardrails audit"
```

---

## Definition of done

- [ ] `useActionButton` and `useConfirmGate` hooks exist and are tested.
- [ ] `docs/superpowers/ui-guardrails-audit.md` lists every action button and its guardrail status; every row is ✅ or `n/a`.
- [ ] Every gameplay screen's action buttons use `useActionButton`.
- [ ] Destructive/expensive actions use `useConfirmGate`.
- [ ] Every animation-aware button includes the relevant animation flag in its `disabled`.
- [ ] Every text input has `maxLength` + onChange sanitization.
- [ ] Numeric inputs clamp to a range.
- [ ] Fast-path buttons call `done()` on state convergence so they re-enable before the 5s safety valve.
- [ ] All existing tests still pass.
- [ ] 3, 4, and 5 player smoke tests succeed.
- [ ] No handler, provider, or sync-layer changes.

## Handoff notes for the next engagement (post-Step 9)

- This step is the last planned step in the 2026-04-09 performance hardening pass. At this point the game should be in the "best state per spec acceptance criteria."
- Any items marked ⏭️ or `deferred` across the phase-cleanup matrix, UI guardrails audit, and reconnect matrix are candidates for a future micro-pass — they intentionally were not picked up to keep this engagement scoped.
- PerfStore metrics from a live playtest are the best input for deciding what (if anything) to tackle next: if `sync.full.sent` is still growing faster than expected, revisit the delta packet dep arrays; if `App` renders are still high, revisit memoization coverage; if `validation.rejected` has non-trivial counts, those screens' state may still have logic bugs.
- When the engagement fully wraps, delete the `2026-04-09-step-*` plan files from the branch only *after* they've all been merged to main — keep them in git history.
