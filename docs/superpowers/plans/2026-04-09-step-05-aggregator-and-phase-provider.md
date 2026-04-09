# Step 5 — Aggregator Skeleton + PhaseProvider (Section 3 Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the provider-based architecture shell without migrating any gameplay state yet, then migrate the *first* provider (`PhaseProvider`, which owns `gameState` + `currentPlayerIndex` + `moverPlayerIndex` + `campaignRole`). Prove the pattern works end-to-end before Step 7 migrates everything else.

**Architecture:** Introduce `src/providers/GameProviders.tsx` — a single component that composes all game providers. Initially it contains only `PhaseProvider`. Introduce `src/providers/GameStateAggregator.tsx` — a component that reads from every provider via hooks and builds the sync packet, replacing the current giant `getStatePacket` closure in `App.tsx`. The aggregator is the *only* component that needs the full world. `App.tsx` stops owning phase state and reads it via `usePhase()` instead.

**Tech Stack:** React 19, TypeScript, React Context.

---

## Context for fresh agent

**Read these first** (in this order, ~15 minutes — this is the highest-risk step so far, read carefully):

1. `docs/superpowers/specs/2026-04-09-multiplayer-perf-hardening-design.md` — **Section 3a, 3b, 3f**. Section 3b lists every planned provider; this step only implements PhaseProvider. Section 3f's phased rollout is the spine of this plan.
2. `docs/superpowers/phase-cleanup-matrix.md` — built in Step 4. Lists reset rules that must move from App.tsx into the new PhaseProvider.
3. `src/App.tsx` — read top-to-bottom. You need a mental model of:
   - Where `gameState` / `currentPlayerIndex` / `moverPlayerIndex` / `campaignRole` are declared.
   - Every call site that reads them.
   - Every call site that writes them.
   - The `getStatePacket` closure (the function that builds the sync packet for GameStateSynchronizer).
4. `src/components/GameStateSynchronizer.tsx` — the synchronizer receives the packet via a prop and a `pushStateRef` (installed in Step 3 — 2e). This file should NOT change in this step. Only the producer of the packet changes.
5. `src/__tests__/sync/` — Steps 1, 3, 4 built the test net. It must stay green at every checkpoint.
6. `src/game/types.ts` (or equivalent) — the `GameState` enum and any phase-related types.

**Project conventions:**
- TypeScript everywhere; `any` is a yellow flag.
- Two-space indent, double quotes, semicolons.
- Provider files go in `src/providers/<Name>Provider.tsx`, one file per provider.
- Hook files go in `src/providers/hooks.ts` or co-located (`useXxx` exported from the provider file).
- File-size budget: 500 lines per file. A provider file + its hooks should stay under 300 lines.

**Critical constraints:**
- **Baseline sync tests must stay green at every Task boundary.** Run `npm run test:sync` after every task. If it goes red, stop and fix before moving on.
- **3, 4, AND 5 player modes must all keep working.** Manual smoke test at end of the step for each.
- **No wire format changes.** The aggregator produces byte-for-byte the same packet shape that `getStatePacket` produced.
- **No App.tsx size constraint.** App.tsx stays the same total size for now — you're moving code *into* PhaseProvider, then updating App.tsx to consume it. Full shrink happens in Step 7.
- **One provider only.** Do not migrate Roster, Board, etc., in this step. Those are Step 7.

**What this step does NOT do:**
- ❌ Migrate Roster, Board, Campaign, Challenge, or Bureaucracy providers — Step 7.
- ❌ Component split (screens stop taking props) — Step 7.
- ❌ Memoization pass — Step 7.
- ❌ Delta packets or microtask yield — Step 6.
- ❌ Error boundaries — Step 8.

---

## File Structure

| File | Change | Size after |
|---|---|---|
| `src/providers/GameProviders.tsx` | Create: composition root for all game providers. Today contains only `<PhaseProvider>`. | ≤ 80 lines |
| `src/providers/PhaseProvider.tsx` | Create: owns `gameState`, `currentPlayerIndex`, `moverPlayerIndex`, `campaignRole`. Exposes `usePhase()` read hook, `usePhaseDispatch()` write hook. | ≤ 280 lines |
| `src/providers/GameStateAggregator.tsx` | Create: reads all providers, builds the sync packet, passes it to `GameStateSynchronizer`. Today reads PhaseProvider + props from App.tsx for the still-unmigrated state. | ≤ 200 lines |
| `src/KredApp.tsx` | Modify: wrap `<App />` in `<GameProviders>` (only once in a lobby). | +20 lines |
| `src/App.tsx` | Modify: remove `useState` declarations for the four phase-owned keys; replace reads with `usePhase()`; replace writes with `usePhaseDispatch()`. Delete `getStatePacket` closure; render `<GameStateAggregator>` inside the tree instead. | -100 to -200 lines |
| `src/__tests__/sync/helpers/scenario.ts` | Modify: the scenario wrapper must now render the real `GameProviders` tree so tests exercise the new code path. | +30 lines |
| `src/__tests__/providers/phase-provider.test.tsx` | Create: unit tests for PhaseProvider — state updates, phase transitions, reset-on-phase-change rules from the cleanup matrix. | ≤ 250 lines |

---

## Tasks

### Task 1: Scaffold empty `GameProviders` and `PhaseProvider` (no wiring yet)

**Files:**
- Create: `src/providers/GameProviders.tsx`
- Create: `src/providers/PhaseProvider.tsx`

- [ ] **Step 1: Write `PhaseProvider.tsx` with a minimal API**

```tsx
// src/providers/PhaseProvider.tsx
import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { GameState } from "../game/types";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface PhaseState {
  gameState: GameState;
  currentPlayerIndex: number;
  moverPlayerIndex: number;
  campaignRole: "mover" | "challenger" | "bystander" | null;
}

export interface PhaseDispatch {
  setGameState: (gs: GameState) => void;
  setCurrentPlayerIndex: (i: number) => void;
  setMoverPlayerIndex: (i: number) => void;
  setCampaignRole: (r: PhaseState["campaignRole"]) => void;
  /** Atomically update multiple phase keys. Prefer this over multiple setters. */
  patch: (p: Partial<PhaseState>) => void;
}

// ─── Contexts ───────────────────────────────────────────────────────────────
// Two contexts so consumers that only dispatch don't re-render on state changes.
const PhaseStateContext = createContext<PhaseState | null>(null);
const PhaseDispatchContext = createContext<PhaseDispatch | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
interface PhaseProviderProps {
  children: ReactNode;
  initial?: Partial<PhaseState>;
}

const DEFAULT_PHASE_STATE: PhaseState = {
  gameState: GameState.LOBBY,
  currentPlayerIndex: 0,
  moverPlayerIndex: 0,
  campaignRole: null,
};

export function PhaseProvider({ children, initial }: PhaseProviderProps) {
  const [state, setState] = useState<PhaseState>({
    ...DEFAULT_PHASE_STATE,
    ...initial,
  });

  const dispatch = useMemo<PhaseDispatch>(
    () => ({
      setGameState: (gs) => setState((s) => ({ ...s, gameState: gs })),
      setCurrentPlayerIndex: (i) => setState((s) => ({ ...s, currentPlayerIndex: i })),
      setMoverPlayerIndex: (i) => setState((s) => ({ ...s, moverPlayerIndex: i })),
      setCampaignRole: (r) => setState((s) => ({ ...s, campaignRole: r })),
      patch: (p) => setState((s) => ({ ...s, ...p })),
    }),
    [],
  );

  return (
    <PhaseStateContext.Provider value={state}>
      <PhaseDispatchContext.Provider value={dispatch}>
        {children}
      </PhaseDispatchContext.Provider>
    </PhaseStateContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────────────────────────
export function usePhase(): PhaseState {
  const ctx = useContext(PhaseStateContext);
  if (!ctx) throw new Error("usePhase must be used inside <PhaseProvider>");
  return ctx;
}

export function usePhaseDispatch(): PhaseDispatch {
  const ctx = useContext(PhaseDispatchContext);
  if (!ctx) throw new Error("usePhaseDispatch must be used inside <PhaseProvider>");
  return ctx;
}
```

- [ ] **Step 2: Write `GameProviders.tsx`**

```tsx
// src/providers/GameProviders.tsx
import { ReactNode } from "react";
import { PhaseProvider, PhaseState } from "./PhaseProvider";

interface GameProvidersProps {
  children: ReactNode;
  initial?: {
    phase?: Partial<PhaseState>;
  };
}

/**
 * Composition root for all game providers.
 *
 * Today: only PhaseProvider. Step 7 will add Roster, Board, Campaign,
 * Challenge, and Bureaucracy providers here.
 */
export function GameProviders({ children, initial }: GameProvidersProps) {
  return <PhaseProvider initial={initial?.phase}>{children}</PhaseProvider>;
}
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: PASS. (Neither file is imported yet, so this is a pure addition.)

- [ ] **Step 4: Commit**

```bash
git add src/providers/PhaseProvider.tsx src/providers/GameProviders.tsx
git commit -m "feat: scaffold GameProviders + PhaseProvider (unused)"
```

---

### Task 2: Write PhaseProvider unit tests

**Files:**
- Create: `src/__tests__/providers/phase-provider.test.tsx`

- [ ] **Step 1: Write failing tests**

```tsx
// src/__tests__/providers/phase-provider.test.tsx
import { describe, expect, it } from "vitest";
import { act, render, renderHook } from "@testing-library/react";
import {
  PhaseProvider,
  usePhase,
  usePhaseDispatch,
} from "../../providers/PhaseProvider";
import { GameState } from "../../game/types";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhaseProvider>{children}</PhaseProvider>
);

describe("PhaseProvider", () => {
  it("provides default state", () => {
    const { result } = renderHook(() => usePhase(), { wrapper });
    expect(result.current.gameState).toBe(GameState.LOBBY);
    expect(result.current.currentPlayerIndex).toBe(0);
    expect(result.current.campaignRole).toBeNull();
  });

  it("accepts initial state override", () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <PhaseProvider initial={{ gameState: GameState.DRAFTING, currentPlayerIndex: 2 }}>
        {children}
      </PhaseProvider>
    );
    const { result } = renderHook(() => usePhase(), { wrapper: customWrapper });
    expect(result.current.gameState).toBe(GameState.DRAFTING);
    expect(result.current.currentPlayerIndex).toBe(2);
  });

  it("setGameState updates state", () => {
    const { result: stateResult } = renderHook(() => usePhase(), { wrapper });
    const { result: dispatchResult } = renderHook(() => usePhaseDispatch(), { wrapper });
    // NB: both hooks must share the same provider — use a combined hook:
  });

  it("dispatch.patch applies multiple keys atomically", () => {
    const combined = renderHook(
      () => ({ state: usePhase(), dispatch: usePhaseDispatch() }),
      { wrapper },
    );
    act(() => {
      combined.result.current.dispatch.patch({
        gameState: GameState.CAMPAIGN,
        currentPlayerIndex: 1,
        moverPlayerIndex: 1,
        campaignRole: "mover",
      });
    });
    expect(combined.result.current.state.gameState).toBe(GameState.CAMPAIGN);
    expect(combined.result.current.state.currentPlayerIndex).toBe(1);
    expect(combined.result.current.state.campaignRole).toBe("mover");
  });

  it("dispatch identity is stable across renders (consumers that only dispatch don't re-render)", () => {
    const combined = renderHook(
      () => ({ state: usePhase(), dispatch: usePhaseDispatch() }),
      { wrapper },
    );
    const firstDispatch = combined.result.current.dispatch;
    act(() => {
      combined.result.current.dispatch.setCurrentPlayerIndex(2);
    });
    expect(combined.result.current.dispatch).toBe(firstDispatch);
  });

  it("usePhase throws outside the provider", () => {
    expect(() => renderHook(() => usePhase())).toThrow(/usePhase must be used inside/);
  });

  it("usePhaseDispatch throws outside the provider", () => {
    expect(() => renderHook(() => usePhaseDispatch())).toThrow(/usePhaseDispatch must be used inside/);
  });
});
```

- [ ] **Step 2: Run**

```bash
npm test -- --run src/__tests__/providers/phase-provider.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/providers/phase-provider.test.tsx
git commit -m "test: PhaseProvider state, dispatch, and stability"
```

---

### Task 3: Create `GameStateAggregator` that reads PhaseProvider (and accepts the rest as props)

**Files:**
- Create: `src/providers/GameStateAggregator.tsx`

- [ ] **Step 1: Write the aggregator**

The aggregator is a *transitional* component. Today it reads PhaseProvider via `usePhase()`, and accepts the rest of the state (roster, board, campaign, challenge, bureaucracy) as props from App.tsx. As each provider is migrated in Step 7, the corresponding prop will be removed and replaced with a hook call.

```tsx
// src/providers/GameStateAggregator.tsx
import { useEffect, useMemo, useRef, RefObject } from "react";
import { usePhase } from "./PhaseProvider";
import { GameStateSynchronizer } from "../components/GameStateSynchronizer";

/**
 * Props that come from state slices NOT YET migrated to providers.
 * Each one will be removed as its provider is introduced in Step 7.
 */
export interface AggregatorLegacyProps {
  // Roster
  players: any[];
  // Board
  boardTiles: any[];
  bankedTiles: any[];
  // Campaign
  playedTile: any;
  hasPlayedTileThisTurn: boolean;
  movedPiecesThisTurn: any[];
  tileTransaction: any;
  tileRevealed: boolean;
  pendingReceiverReward: any;
  receiverAdvanceInProgress: boolean;
  // Challenge
  bystanders: any[];
  bystanderIndex: number;
  challengeOrder: number[];
  currentChallengerIndex: number;
  tileRejected: boolean;
  takeAdvantageState: any;
  // Bureaucracy
  bureaucracyStates: any;
  bureaucracyTurnOrder: number[];
  currentBureaucracyPlayerIndex: number;
}

interface GameStateAggregatorProps extends AggregatorLegacyProps {
  lobbyId: string;
  userId: string;
  isHost: boolean;
  pushStateRef: RefObject<(() => void) | null>;
  onApplyPacket: (packet: any) => void;
}

export function GameStateAggregator(props: GameStateAggregatorProps) {
  // Phase state is read from context now.
  const phase = usePhase();

  // Build the sync packet from phase (provider) + all other slices (props).
  // Memoized on every slice reference — because providers use immutable updates
  // and App.tsx passes stable references, this is cheap.
  const packet = useMemo(
    () => ({
      // phase-owned
      gameState: phase.gameState,
      currentPlayerIndex: phase.currentPlayerIndex,
      moverPlayerIndex: phase.moverPlayerIndex,
      campaignRole: phase.campaignRole,
      // legacy prop-owned — same field names the old getStatePacket produced
      players: props.players,
      boardTiles: props.boardTiles,
      bankedTiles: props.bankedTiles,
      playedTile: props.playedTile,
      hasPlayedTileThisTurn: props.hasPlayedTileThisTurn,
      movedPiecesThisTurn: props.movedPiecesThisTurn,
      tileTransaction: props.tileTransaction,
      tileRevealed: props.tileRevealed,
      pendingReceiverReward: props.pendingReceiverReward,
      receiverAdvanceInProgress: props.receiverAdvanceInProgress,
      bystanders: props.bystanders,
      bystanderIndex: props.bystanderIndex,
      challengeOrder: props.challengeOrder,
      currentChallengerIndex: props.currentChallengerIndex,
      tileRejected: props.tileRejected,
      takeAdvantageState: props.takeAdvantageState,
      bureaucracyStates: props.bureaucracyStates,
      bureaucracyTurnOrder: props.bureaucracyTurnOrder,
      currentBureaucracyPlayerIndex: props.currentBureaucracyPlayerIndex,
    }),
    [
      phase.gameState, phase.currentPlayerIndex, phase.moverPlayerIndex, phase.campaignRole,
      props.players, props.boardTiles, props.bankedTiles,
      props.playedTile, props.hasPlayedTileThisTurn, props.movedPiecesThisTurn,
      props.tileTransaction, props.tileRevealed, props.pendingReceiverReward,
      props.receiverAdvanceInProgress, props.bystanders, props.bystanderIndex,
      props.challengeOrder, props.currentChallengerIndex, props.tileRejected,
      props.takeAdvantageState, props.bureaucracyStates, props.bureaucracyTurnOrder,
      props.currentBureaucracyPlayerIndex,
    ],
  );

  return (
    <GameStateSynchronizer
      lobbyId={props.lobbyId}
      userId={props.userId}
      isHost={props.isHost}
      statePacket={packet}
      pushStateRef={props.pushStateRef}
      onApplyPacket={props.onApplyPacket}
    />
  );
}
```

**Important:** the exact prop names and shape must match what `GameStateSynchronizer` already expects. Read `GameStateSynchronizer.tsx`'s props interface and reconcile. If the synchronizer's current interface uses a different prop name than `statePacket`, use that name here — do not rename either side in this task.

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: PASS. If not, adjust the prop names to match the real synchronizer interface.

- [ ] **Step 3: Commit**

```bash
git add src/providers/GameStateAggregator.tsx
git commit -m "feat: add GameStateAggregator (unused; transitional legacy props)"
```

---

### Task 4: Wire `GameProviders` into `KredApp.tsx`

**Files:**
- Modify: `src/KredApp.tsx`

- [ ] **Step 1: Add the provider wrap**

Read `src/KredApp.tsx`. Locate where `<App />` (the game root) is rendered. Wrap it in `<GameProviders>`:

```tsx
import { GameProviders } from "./providers/GameProviders";
// ...
<GameProviders>
  <App /* existing props */ />
</GameProviders>
```

**Important:** only wrap the branch that renders the in-lobby game. Do NOT wrap the lobby-selection / waiting-room screens — they have no phase state.

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 3: Run existing tests**

```bash
npm test -- --run
```

Expected: PASS. The provider is in place but App.tsx doesn't consume it yet.

- [ ] **Step 4: Dev sanity check**

```bash
npm run dev
```

Open the app, start a 3-player game, play one turn. Confirm no regressions and no console errors. Close dev server.

- [ ] **Step 5: Commit**

```bash
git add src/KredApp.tsx
git commit -m "feat: mount GameProviders around in-lobby App"
```

---

### Task 5: Migrate phase state from `App.tsx` to `PhaseProvider`

This is the risky one. Do it carefully and in small edits. Run tests after each sub-step.

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Identify every phase state declaration and usage**

Run:

```bash
# via Grep tool
Grep -n "useState.*gameState|useState.*currentPlayerIndex|useState.*moverPlayerIndex|useState.*campaignRole" src/App.tsx
Grep -n "setGameState|setCurrentPlayerIndex|setMoverPlayerIndex|setCampaignRole" src/App.tsx
```

Write down every line number. You will be editing each one.

- [ ] **Step 2: Replace declarations with hook reads**

At the top of the `App` function component body, delete:

```tsx
const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
const [moverPlayerIndex, setMoverPlayerIndex] = useState(0);
const [campaignRole, setCampaignRole] = useState<...>(null);
```

Replace with:

```tsx
const { gameState, currentPlayerIndex, moverPlayerIndex, campaignRole } = usePhase();
const {
  setGameState,
  setCurrentPlayerIndex,
  setMoverPlayerIndex,
  setCampaignRole,
  patch: patchPhase,
} = usePhaseDispatch();
```

Add the import at the top of `App.tsx`:

```tsx
import { usePhase, usePhaseDispatch } from "./providers/PhaseProvider";
```

- [ ] **Step 3: Verify no other call sites broke**

Every existing call `setGameState(...)`, `setCurrentPlayerIndex(...)`, `setMoverPlayerIndex(...)`, `setCampaignRole(...)` now resolves to the dispatcher. Their signatures match. Nothing in App.tsx needs to change for call sites.

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Run unit + sync tests**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 5: Dev sanity check (3, 4, 5 players)**

```bash
npm run dev
```

For each player count:
1. Start a game.
2. Walk drafting → campaign → challenge (if reached) → bureaucracy.
3. Confirm `currentPlayerIndex` advances correctly, phase transitions fire, no console errors.

If anything is broken, you missed a call site. Grep more broadly:

```bash
# via Grep tool
Grep -n "gameState|currentPlayerIndex|moverPlayerIndex|campaignRole" src/App.tsx
```

Fix and rerun.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: move phase state from App.tsx to PhaseProvider"
```

---

### Task 6: Move phase-change reset effects from App.tsx into PhaseProvider

**Files:**
- Modify: `src/providers/PhaseProvider.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Identify phase-change reset effects in App.tsx**

From `docs/superpowers/phase-cleanup-matrix.md`, list every row whose "state to reset" key belongs to *phase* state (`gameState`, `currentPlayerIndex`, `moverPlayerIndex`, `campaignRole`). These are the ones that should move.

Rows that reset *other* provider state (campaign, challenge, bureaucracy) stay in App.tsx for now. They move in Step 7 with their provider.

- [ ] **Step 2: For each phase-owned reset, move the effect into PhaseProvider**

Example (shape only — use the real rules from the matrix):

```tsx
// Inside PhaseProvider, add an effect:
useEffect(() => {
  if (state.gameState === GameState.GAME_OVER) {
    // No further advancement; current/mover freeze
    return;
  }
  // ...other phase-scoped cleanups
}, [state.gameState]);
```

**Important:** if a reset rule is coupled to *non*-phase state, it cannot move yet. Leave it in App.tsx and mark it ⏭️ in the matrix doc.

- [ ] **Step 3: Delete the moved effects from App.tsx**

- [ ] **Step 4: Typecheck + tests**

```bash
npm run typecheck && npm test -- --run
```

Expected: PASS. In particular, the phase-cleanup tests from Step 4 must stay green.

- [ ] **Step 5: Commit**

```bash
git add src/providers/PhaseProvider.tsx src/App.tsx docs/superpowers/phase-cleanup-matrix.md
git commit -m "refactor: move phase-owned reset effects into PhaseProvider"
```

---

### Task 7: Replace `getStatePacket` closure with `<GameStateAggregator>`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Read the current wiring**

Locate in App.tsx:
- The `getStatePacket` function (the closure that builds a full packet for the synchronizer).
- The `<GameStateSynchronizer>` JSX element.
- The `pushStateRef` / prop the synchronizer uses (installed in Step 3 — 2e).

- [ ] **Step 2: Delete `getStatePacket`**

Search for `getStatePacket` throughout `App.tsx` and remove the closure. Any site that currently calls `getStatePacket()` was doing so to pass the packet to the synchronizer — that responsibility moves to the aggregator.

- [ ] **Step 3: Replace `<GameStateSynchronizer ... />` with `<GameStateAggregator ... />`**

Import:

```tsx
import { GameStateAggregator } from "./providers/GameStateAggregator";
```

Replace the JSX:

```tsx
<GameStateAggregator
  lobbyId={lobbyId}
  userId={userId}
  isHost={isHost}
  pushStateRef={pushStateRef}
  onApplyPacket={applyStatePacket}
  // legacy pass-throughs for state still owned by App.tsx:
  players={players}
  boardTiles={boardTiles}
  bankedTiles={bankedTiles}
  playedTile={playedTile}
  hasPlayedTileThisTurn={hasPlayedTileThisTurn}
  movedPiecesThisTurn={movedPiecesThisTurn}
  tileTransaction={tileTransaction}
  tileRevealed={tileRevealed}
  pendingReceiverReward={pendingReceiverReward}
  receiverAdvanceInProgress={receiverAdvanceInProgress}
  bystanders={bystanders}
  bystanderIndex={bystanderIndex}
  challengeOrder={challengeOrder}
  currentChallengerIndex={currentChallengerIndex}
  tileRejected={tileRejected}
  takeAdvantageState={takeAdvantageState}
  bureaucracyStates={bureaucracyStates}
  bureaucracyTurnOrder={bureaucracyTurnOrder}
  currentBureaucracyPlayerIndex={currentBureaucracyPlayerIndex}
/>
```

**Important:** do not add phase fields as props. They come from `usePhase()` inside the aggregator.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Fix any type mismatches by reconciling prop names (App.tsx must use whatever names it already has for these slices — don't rename in this task).

- [ ] **Step 5: Run all tests**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 6: Dev sanity check (3, 4, 5 players)**

```bash
npm run dev
```

Critical smoke test. Do a full round in each player count. If anything is wrong, the most likely cause is a field missing from the aggregator's packet — diff against what `getStatePacket` used to produce (git show the prior commit) and add it.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: replace getStatePacket with GameStateAggregator"
```

---

### Task 8: Update sync test scenario helpers to render the new tree

**Files:**
- Modify: `src/__tests__/sync/helpers/scenario.ts`

- [ ] **Step 1: Ensure scenario helpers mount `GameProviders`**

The scenario helper currently mounts a test harness that drives the synchronizer directly. It must now mount the real provider tree so tests exercise `PhaseProvider` + `GameStateAggregator`.

Find the `createHost` / `createGuest` helper in `scenario.ts`. Wrap the test harness component in `<GameProviders>`:

```tsx
import { GameProviders } from "../../../providers/GameProviders";
// ...
render(
  <GameProviders initial={{ phase: initialPhase }}>
    <TestHarness ... />
  </GameProviders>
);
```

- [ ] **Step 2: Update `advanceToPhase` helper**

The helper used by Step 4's tests directly mutated App state. It must now dispatch via `PhaseProvider`. The cleanest way is to expose a test-only hook inside the harness:

```tsx
function TestHarness({ onReady }: { onReady: (ctx: TestCtx) => void }) {
  const phaseDispatch = usePhaseDispatch();
  // ... other provider dispatches
  useEffect(() => {
    onReady({
      advanceToPhase: (p) => phaseDispatch.setGameState(p),
      // ...
    });
  }, [onReady, phaseDispatch]);
  return null;
}
```

- [ ] **Step 3: Run sync tests**

```bash
npm run test:sync
```

Expected: PASS.

- [ ] **Step 4: Run full suite**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/__tests__/sync/helpers/scenario.ts
git commit -m "test: scenario helpers render real GameProviders tree"
```

---

### Task 9: Add a render-count assertion for PhaseProvider

**Files:**
- Modify: `src/providers/PhaseProvider.tsx` (add render-count instrumentation)
- Create or modify: `src/__tests__/providers/phase-provider-rendercount.test.tsx`

- [ ] **Step 1: Add PerfStore render-count hook (dev-only)**

In `PhaseProvider.tsx`, inside the provider component:

```tsx
import { usePerfRenderCount } from "../perf/index";
// ...
export function PhaseProvider({ children, initial }: PhaseProviderProps) {
  usePerfRenderCount("PhaseProvider");
  // ... existing body
}
```

(`usePerfRenderCount` was added in Step 2. If it doesn't exist yet with that exact name, use whatever the Step 2 plan named it — the pattern is the same.)

- [ ] **Step 2: Write the assertion test**

```tsx
// src/__tests__/providers/phase-provider-rendercount.test.tsx
import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { PhaseProvider, usePhase, usePhaseDispatch } from "../../providers/PhaseProvider";
import { readPerfGauge, resetPerf } from "../../perf";

describe("PhaseProvider render counts", () => {
  it("dispatch-only consumers do not re-render on state changes", () => {
    resetPerf();
    // Mount a consumer of dispatch only; it should re-render exactly once (initial mount).
    let dispatchRenders = 0;
    function DispatchOnly() {
      dispatchRenders++;
      const d = usePhaseDispatch();
      return <button onClick={() => d.setCurrentPlayerIndex(1)}>go</button>;
    }

    const { rerender } = renderHook(
      () => null,
      { wrapper: ({ children }) => <PhaseProvider><DispatchOnly />{children}</PhaseProvider> },
    );

    const initial = dispatchRenders;
    // Trigger a state change
    act(() => {
      // get a dispatch handle via a separate hook
    });

    // (implementation note: the cleanest way is a combined hook; pattern shown in
    // phase-provider.test.tsx Task 2. Copy that wrapper.)

    expect(dispatchRenders).toBe(initial);
  });
});
```

**Note:** getting React Testing Library to report precise render counts for context-split consumers is fiddly. If this test is hard to write cleanly in under 60 lines, simplify it to "provider renders 1 extra time after a state change" using `usePerfRenderCount("PhaseProvider")` and `readPerfGauge("render.PhaseProvider")`. A working-but-loose test is better than a clever-but-broken one.

- [ ] **Step 3: Run**

```bash
npm test -- --run src/__tests__/providers/phase-provider-rendercount.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/providers/PhaseProvider.tsx src/__tests__/providers/phase-provider-rendercount.test.tsx
git commit -m "test: PhaseProvider render-count stability for dispatch-only consumers"
```

---

### Task 10: Full-game smoke + final commit

**Files:**
- None (verification only)

- [ ] **Step 1: Full test suite**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 2: Dev smoke test**

```bash
npm run dev
```

Play **one complete game** (lobby → drafting → multiple campaign rounds → bureaucracy → at least one round close) for each of:
- 3 players
- 4 players
- 5 players

For each run, open the Perf Overlay (`?perf=1`) and confirm:
- `PhaseProvider` render count is ≤ `App` render count.
- `subscriptions.openCount` stays at its baseline (from Step 4).
- No console errors.

- [ ] **Step 3: If any regression shows up**

Do NOT force the commit. Roll back (`git reset`) and re-examine the affected task. The most likely culprits are:
- A call site for a phase setter was missed in Task 5.
- The aggregator's packet is missing a field that `getStatePacket` produced in Task 7 (diff against the prior commit).
- A reset effect was moved to the provider but the provider doesn't have access to a dependency the effect needed.

- [ ] **Step 4: If everything is green, you are done.**

No final commit needed — all task-level commits already landed.

---

## Definition of done

- [ ] `src/providers/PhaseProvider.tsx` exists with split state/dispatch contexts.
- [ ] `src/providers/GameProviders.tsx` composition root exists.
- [ ] `src/providers/GameStateAggregator.tsx` replaces `getStatePacket` as the producer of the sync packet.
- [ ] `KredApp.tsx` wraps the in-lobby tree in `<GameProviders>`.
- [ ] `App.tsx` no longer declares `useState` for `gameState` / `currentPlayerIndex` / `moverPlayerIndex` / `campaignRole`.
- [ ] Phase-owned reset effects live inside `PhaseProvider`.
- [ ] `getStatePacket` closure is deleted from `App.tsx`.
- [ ] All existing tests pass; sync tests pass; new provider tests pass.
- [ ] PhaseProvider has its own render count in the overlay.
- [ ] Dispatch-only consumers do not re-render on state changes (asserted by test).
- [ ] 3, 4, and 5 player manual smoke tests all succeed with no regressions.
- [ ] No wire format changes.
- [ ] No other provider migrations happened (Roster, Board, etc. stay as-is).

## Handoff notes for next step (Step 6 — Delta packets + microtask yield)

- `GameStateAggregator` is the ONLY component that sees the whole packet — it is the natural place to compute deltas in Step 6.
- The aggregator currently rebuilds the packet via `useMemo`. Step 6 can compare `packet` against a previous ref (`prevPacketRef`) inside the aggregator to produce the delta, then call `pushStateRef.current(packet, delta)`.
- PhaseProvider already uses stable setter refs; Step 6's microtask yield must preserve that stability.
- The sync test scenario helpers now render the real tree, so Step 6's delta-apply tests (spec matrix items 4, 5) can extend the same helpers without a fresh mock.
- Do NOT attempt to migrate another provider in Step 6 — that is Step 7. Step 6 is behind a feature flag.
