# Step 7 — Provider Migrations + App.tsx Breakup (Section 3 Phases 2–5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the remaining game state out of `App.tsx` into domain providers, drop screen-level prop drilling in favor of hook consumption, and run a memoization pass guided by PerfStore render counts. By end of this step, `App.tsx` is ≤ 500 lines and acts purely as a wiring/orchestration layer.

**Architecture:** One provider per PR-sized task. Each provider moves state out of `App.tsx`, exposes read/dispatch hooks, registers a render count with PerfStore, and removes its legacy prop from `GameStateAggregator`. Screens then stop receiving props and consume providers directly. Finally, `React.memo` and selector hooks are added where PerfStore shows hot re-renders.

**Tech Stack:** React 19, TypeScript, React Context.

---

## Context for fresh agent

**Read these first** (in this order, ~20 minutes — this is the largest and riskiest step):

1. `docs/superpowers/specs/2026-04-09-multiplayer-perf-hardening-design.md` — **Section 3b, 3c, 3d, 3e, 3f**. Section 3b lists the provider catalog. Section 3f lists the phases this step executes (Phases 2–5).
2. `docs/superpowers/phase-cleanup-matrix.md` — built in Step 4. As each provider migrates, the reset effects for its state move with it.
3. `docs/superpowers/plans/2026-04-09-step-05-aggregator-and-phase-provider.md` — the pattern you'll replicate five times. Read it carefully; this step is "five copies of Step 5" with provider-specific twists.
4. `docs/superpowers/plans/2026-04-09-step-06-delta-packets-and-microtask-yield.md` — "Handoff notes" at the bottom. The aggregator's memo dep array is load-bearing for delta correctness.
5. `src/providers/PhaseProvider.tsx` — the canonical template.
6. `src/providers/GameStateAggregator.tsx` — the file you edit for every provider migration.
7. `src/App.tsx` — currently the source of state for everything not yet migrated.
8. `src/components/screens/*.tsx` — each screen currently takes props; will consume providers in Phase 3.
9. `src/__tests__/sync/` — the safety net. **Runs after every task.**

**Project conventions:**
- TypeScript everywhere; `any` is a yellow flag.
- Two-space indent, double quotes, semicolons.
- Provider files go in `src/providers/<Name>Provider.tsx`.
- File-size budget: 500 lines per file. If a provider would exceed 280 lines, split its pure logic into a sibling `use<Name>Logic.ts` hook.

**Critical constraints:**
- **Sync tests must stay green after every task.** Run `npm run test:sync` after each numbered Task in this document.
- **3, 4, AND 5 player modes must all keep working.** Manual smoke after every 2–3 tasks.
- **One provider per commit.** Do not bundle multiple provider migrations in one commit. If you find yourself doing that, stop and split.
- **Aggregator dep array is a hard invariant.** Every time you migrate a provider, audit the aggregator's `useMemo` deps and confirm every top-level field still appears. A missing dep means delta packets will drop updates → guests desync. This is the single most likely regression source in this step.
- **Delta packet flag stays ON in dev throughout.** If a migration breaks delta apply, the correct fix is "figure out which top-level field reference didn't change when it should have," not "turn deltas off."
- **No wire format changes.** The wire fields stay the same strings.

**What this step does NOT do:**
- ❌ Wire format changes (Step 6 did that).
- ❌ New game features.
- ❌ Validation audit — Step 8.
- ❌ Error boundaries — Step 8.
- ❌ UI guardrails — Step 9.

---

## File Structure

| File | Change | Size after |
|---|---|---|
| `src/providers/RosterProvider.tsx` | Create: owns `players`, `pieces`. | ≤ 280 lines |
| `src/providers/BoardProvider.tsx` | Create: owns `boardTiles`, `bankedTiles`. | ≤ 220 lines |
| `src/providers/CampaignProvider.tsx` | Create: owns campaign-phase transient state (see spec 3b). | ≤ 280 lines |
| `src/providers/ChallengeProvider.tsx` | Create: owns challenge-phase transient state. | ≤ 280 lines |
| `src/providers/BureaucracyProvider.tsx` | Create: owns bureaucracy-phase state. | ≤ 220 lines |
| `src/providers/hooks.ts` | Create (optional): barrel re-exports if import boilerplate gets noisy. | ≤ 40 lines |
| `src/providers/GameProviders.tsx` | Modify: compose all five new providers. | ≤ 120 lines |
| `src/providers/GameStateAggregator.tsx` | Modify: read every new provider via hook; remove legacy props one at a time. | ≤ 180 lines (shrinks!) |
| `src/App.tsx` | Modify: remove migrated state, remove prop drilling, consume providers via hooks; final size **≤ 500 lines**. | ≤ 500 lines |
| `src/components/screens/*.tsx` | Modify: each screen stops taking migrated props; consumes via hook. | per-screen; no single screen > 500 lines |
| `src/providers/selectors.ts` | Create: stable selector hooks (`usePlayer(id)`, `useCurrentPlayer()`, etc.) for Phase 4 memoization. | ≤ 200 lines |
| `src/__tests__/providers/*.test.tsx` | Create: one test file per provider (same shape as `phase-provider.test.tsx`). | ≤ 250 lines each |
| `docs/superpowers/phase-cleanup-matrix.md` | Modify: mark migrated rows ✅. | unchanged size |

---

## Tasks

### Phase 2 — Migrate one provider at a time

Each task in Phase 2 follows the **same six-step template**:

> **Provider migration template** (applied to Tasks 1–5):
>
> 1. **Scaffold the provider** — create `src/providers/<Name>Provider.tsx` with state/dispatch contexts, following the `PhaseProvider.tsx` template from Step 5 verbatim (just with different fields).
> 2. **Write the provider unit tests** — create `src/__tests__/providers/<name>-provider.test.tsx` copied from `phase-provider.test.tsx` with the fields adjusted.
> 3. **Wire the provider into `GameProviders.tsx`** — add the `<NameProvider>` wrap around `{children}`, outside of any provider it depends on, inside any provider that depends on it. (All five are mutually independent; order inside GameProviders doesn't matter.)
> 4. **Migrate state from `App.tsx`** — delete the `useState` declarations, replace reads with `useName()`, replace writes with `useNameDispatch()`. Every call site must resolve; typecheck catches misses.
> 5. **Update `GameStateAggregator`** — add the `useName()` read, remove the corresponding fields from `AggregatorLegacyProps`, remove them from the `useMemo` packet body, remove them from the `useMemo` dep array, remove them from the JSX pass in `App.tsx`.
> 6. **Run the whole test suite + dev smoke for 3/4/5 players + commit.**
>
> Each task is its own commit. Do **not** batch provider migrations.

---

### Task 1: RosterProvider (players + pieces)

**Files:**
- Create: `src/providers/RosterProvider.tsx`
- Create: `src/__tests__/providers/roster-provider.test.tsx`
- Modify: `src/providers/GameProviders.tsx`
- Modify: `src/providers/GameStateAggregator.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Scaffold `RosterProvider.tsx`**

Use `PhaseProvider.tsx` as the verbatim template. The `RosterState` interface is:

```ts
export interface RosterState {
  players: Player[];
  pieces: Piece[];
}

export interface RosterDispatch {
  setPlayers: (updater: Player[] | ((prev: Player[]) => Player[])) => void;
  setPieces: (updater: Piece[] | ((prev: Piece[]) => Piece[])) => void;
  patch: (p: Partial<RosterState>) => void;
}
```

**Important:** allow functional updaters on setters. Step 5 used plain value setters in PhaseProvider because phase updates are cheap. Roster setters are called in many places where the new value depends on the old value; functional updaters avoid stale-closure bugs.

Add `useRenderCount("RosterProvider")` inside the component body.

Expected file size: ≤ 280 lines.

- [ ] **Step 2: Write `roster-provider.test.tsx`**

Copy `phase-provider.test.tsx` as a starting point. Assertions:
- default empty state
- initial override
- `setPlayers(array)` and `setPlayers(fn)` both work
- `patch` applies multiple keys atomically
- dispatch identity is stable across renders
- `useRoster` throws outside provider
- `useRosterDispatch` throws outside provider

Run it. Expected: PASS.

- [ ] **Step 3: Add `<RosterProvider>` to `GameProviders.tsx`**

```tsx
import { RosterProvider } from "./RosterProvider";
// ...
<PhaseProvider initial={initial?.phase}>
  <RosterProvider initial={initial?.roster}>
    {children}
  </RosterProvider>
</PhaseProvider>
```

Extend `GameProvidersProps.initial` to include a `roster?: Partial<RosterState>` field.

- [ ] **Step 4: Migrate `players` and `pieces` from `App.tsx`**

Grep:

```bash
# via Grep tool
Grep -n "useState.*players|setPlayers|useState.*pieces|setPieces" src/App.tsx
```

Delete the `useState`s. Add:

```tsx
import { useRoster, useRosterDispatch } from "./providers/RosterProvider";
// ...
const { players, pieces } = useRoster();
const { setPlayers, setPieces, patch: patchRoster } = useRosterDispatch();
```

Every existing call `setPlayers(fn)` continues to work because the dispatch now accepts functional updaters.

- [ ] **Step 5: Update `GameStateAggregator.tsx`**

```tsx
import { useRoster } from "./RosterProvider";
// ...
const roster = useRoster();
// Remove `players` and `pieces` from AggregatorLegacyProps.
// Remove `players` and `pieces` from the useMemo packet body; replace with:
const fullState = useMemo(() => ({
  gameState: phase.gameState,
  // ...
  players: roster.players,
  pieces: roster.pieces,
  // ...still-legacy fields
}), [
  phase.gameState, phase.currentPlayerIndex, phase.moverPlayerIndex, phase.campaignRole,
  roster.players, roster.pieces,
  // ...still-legacy deps
]);
```

In `App.tsx`, remove `players={players} pieces={pieces}` from the `<GameStateAggregator>` JSX.

- [ ] **Step 6: Audit the cleanup matrix for Roster rows**

Any rows in `phase-cleanup-matrix.md` whose "state to reset" key is a `players` or `pieces` field: if the reset belongs in RosterProvider (i.e., it doesn't depend on non-roster state), move the effect into the provider now and mark the row ✅. Otherwise leave it in App.tsx.

- [ ] **Step 7: Typecheck + tests + smoke**

```bash
npm run typecheck && npm test -- --run
```

Expected: PASS. Run dev smoke for 3, 4, 5 players. Confirm drafting works (every `setPlayers` in drafting screens resolves correctly).

- [ ] **Step 8: Commit**

```bash
git add src/providers/RosterProvider.tsx src/providers/GameProviders.tsx \
        src/providers/GameStateAggregator.tsx src/App.tsx \
        src/__tests__/providers/roster-provider.test.tsx \
        docs/superpowers/phase-cleanup-matrix.md
git commit -m "refactor: migrate players + pieces to RosterProvider"
```

---

### Task 2: BoardProvider (boardTiles + bankedTiles)

**Files:**
- Create: `src/providers/BoardProvider.tsx`
- Create: `src/__tests__/providers/board-provider.test.tsx`
- Modify: `src/providers/GameProviders.tsx`, `src/providers/GameStateAggregator.tsx`, `src/App.tsx`

Apply the **provider migration template** with:

```ts
export interface BoardState {
  boardTiles: Tile[];
  bankedTiles: Tile[];
}
export interface BoardDispatch {
  setBoardTiles: (u: Tile[] | ((prev: Tile[]) => Tile[])) => void;
  setBankedTiles: (u: Tile[] | ((prev: Tile[]) => Tile[])) => void;
  patch: (p: Partial<BoardState>) => void;
}
```

- [ ] **Step 1: Follow steps 1–8 of Task 1's template, substituting `Board` for `Roster`.**

The specific grep target:

```bash
Grep -n "useState.*boardTiles|setBoardTiles|useState.*bankedTiles|setBankedTiles" src/App.tsx
```

Aggregator change: remove `boardTiles`, `bankedTiles` from legacy props and add `useBoard()`.

Phase cleanup matrix: any row referencing tiles whose reset belongs in BoardProvider moves in now.

Typecheck + tests + smoke + commit:

```bash
git commit -m "refactor: migrate boardTiles + bankedTiles to BoardProvider"
```

---

### Task 3: CampaignProvider (playedTile, hasPlayedTileThisTurn, movedPiecesThisTurn, tileTransaction, tileRevealed, pendingReceiverReward, receiverAdvanceInProgress)

**Files:**
- Create: `src/providers/CampaignProvider.tsx`
- Create: `src/__tests__/providers/campaign-provider.test.tsx`
- Modify: `src/providers/GameProviders.tsx`, `src/providers/GameStateAggregator.tsx`, `src/App.tsx`

Apply the template with:

```ts
export interface CampaignState {
  playedTile: Tile | null;
  hasPlayedTileThisTurn: boolean;
  movedPiecesThisTurn: string[];
  tileTransaction: TileTransaction | null;
  tileRevealed: boolean;
  pendingReceiverReward: ReceiverReward | null;
  receiverAdvanceInProgress: boolean;
}
```

**Important — cleanup matrix integration:** CampaignProvider is the provider with the most phase-scoped resets. Every row in `phase-cleanup-matrix.md` that resets one of the fields above should now move into this provider as an effect keyed on `phase.gameState`:

```tsx
export function CampaignProvider({ children }: { children: ReactNode }) {
  const phase = usePhase();
  const [state, setState] = useState<CampaignState>(DEFAULT_CAMPAIGN_STATE);
  // ...
  useEffect(() => {
    if (phase.gameState === GameState.BUREAUCRACY || phase.gameState === GameState.DRAFTING) {
      setState(DEFAULT_CAMPAIGN_STATE);
    }
  }, [phase.gameState]);
  // ...
}
```

**Order matters in `GameProviders`:** `CampaignProvider` must be nested **inside** `PhaseProvider` so it can call `usePhase()`.

```tsx
<PhaseProvider initial={initial?.phase}>
  <RosterProvider initial={initial?.roster}>
    <BoardProvider initial={initial?.board}>
      <CampaignProvider initial={initial?.campaign}>
        {children}
      </CampaignProvider>
    </BoardProvider>
  </RosterProvider>
</PhaseProvider>
```

- [ ] **Step 1: Apply the template**

Follow the six-step template. In step 6 of the template, every ✅ row in the cleanup matrix that belongs to campaign state moves into the provider as an effect.

- [ ] **Step 2: After migrating, run phase-cleanup tests from Step 4**

```bash
npm test -- --run src/__tests__/sync/phase-cleanup.test.ts
```

Expected: PASS. If a row regresses, the effect was not correctly ported — fix inside the provider.

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor: migrate campaign-phase transient state to CampaignProvider"
```

---

### Task 4: ChallengeProvider (bystanders, bystanderIndex, challengeOrder, currentChallengerIndex, tileRejected, takeAdvantageState)

**Files:**
- Create: `src/providers/ChallengeProvider.tsx`
- Create: `src/__tests__/providers/challenge-provider.test.tsx`
- Modify: GameProviders, GameStateAggregator, App.tsx

Apply the template with:

```ts
export interface ChallengeState {
  bystanders: Player[];
  bystanderIndex: number;
  challengeOrder: number[];
  currentChallengerIndex: number;
  tileRejected: boolean;
  takeAdvantageState: TakeAdvantageState | null;
}
```

**Cleanup rules:** on CHALLENGE → CAMPAIGN transition, reset `bystanderIndex=0`, `challengeOrder=[]`, `currentChallengerIndex=0`, `tileRejected=false`, `takeAdvantageState=null`. Move the reset effect into the provider.

`ChallengeProvider` nests inside `PhaseProvider`.

- [ ] **Step 1: Apply the template, run the phase-cleanup tests after.**

- [ ] **Step 2: Commit**

```bash
git commit -m "refactor: migrate challenge state to ChallengeProvider"
```

---

### Task 5: BureaucracyProvider (bureaucracyStates, bureaucracyTurnOrder, currentBureaucracyPlayerIndex)

**Files:**
- Create: `src/providers/BureaucracyProvider.tsx`
- Create: `src/__tests__/providers/bureaucracy-provider.test.tsx`
- Modify: GameProviders, GameStateAggregator, App.tsx

Apply the template with:

```ts
export interface BureaucracyProviderState {
  bureaucracyStates: Record<string, BureaucracyPerPlayer>;
  bureaucracyTurnOrder: number[];
  currentBureaucracyPlayerIndex: number;
}
```

**Cleanup rules:** on BUREAUCRACY → next-round CAMPAIGN transition, reset `currentBureaucracyPlayerIndex=0` and clear any stale per-player entries whose keys are no longer valid. Move into the provider.

- [ ] **Step 1: Apply the template.**

**Checkpoint after Task 5:** `GameStateAggregator.AggregatorLegacyProps` should now be **empty or near-empty**. The only remaining legacy props should be `lobbyId`, `userId`, `isHost`, `pushStateRef`, `synchronizerSendRef`, `onApplyPacket`. Confirm.

- [ ] **Step 2: If legacy props are empty, simplify the aggregator's props type**

Remove `AggregatorLegacyProps` entirely; the aggregator now only takes the sync wiring props.

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor: migrate bureaucracy state to BureaucracyProvider"
```

---

### Task 6: Phase 2 checkpoint — full test suite + 3/4/5-player smoke

**Files:**
- None

- [ ] **Step 1: Run the full suite**

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 2: Dev smoke**

```bash
npm run dev
```

Play **one complete game** for 3, 4, and 5 players. Walk every phase. Confirm:
- No console errors.
- `App` render count in PerfOverlay is significantly lower than it was before Step 7 (it no longer re-renders on every state change).
- Each provider has its own render count, and only the relevant provider re-renders on state changes in its own domain (e.g., a piece movement re-renders `RosterProvider` but not `BureaucracyProvider`).
- `sync.delta.sent` still dominates `sync.full.sent` in steady state — if not, a dep array in the aggregator is missing a field.

- [ ] **Step 3: Optional — mid-step commit message**

No code commit needed. This is a checkpoint.

---

### Phase 3 — Component split (screens stop taking props)

Each screen under `src/components/screens/` currently receives migrated state via props from `App.tsx`. Replace those prop chains with direct hook calls.

### Task 7: DraftingScreen consumes providers

**Files:**
- Modify: `src/components/screens/DraftingScreen.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Identify DraftingScreen's current props**

Read the file. List every prop that comes from migrated state (players, pieces, boardTiles, bankedTiles, phase, etc.).

- [ ] **Step 2: Replace props with hook calls**

```tsx
import { useRoster, useRosterDispatch } from "../../providers/RosterProvider";
import { usePhase, usePhaseDispatch } from "../../providers/PhaseProvider";
// ...

export function DraftingScreen(/* reduced props */) {
  const { players } = useRoster();
  const { setPlayers } = useRosterDispatch();
  const { currentPlayerIndex } = usePhase();
  // ...
}
```

Keep in the props interface only things that are genuinely ambient wiring (e.g., `onExit` callbacks, lobby metadata the provider tree doesn't own).

- [ ] **Step 3: Update the `<DraftingScreen>` call site in `App.tsx`**

Remove the now-unused props from the JSX.

- [ ] **Step 4: Typecheck + tests + dev smoke**

```bash
npm run typecheck && npm test -- --run
```

Play through drafting with 3/4/5 players in dev.

- [ ] **Step 5: Commit**

```bash
git add src/components/screens/DraftingScreen.tsx src/App.tsx
git commit -m "refactor: DraftingScreen consumes providers directly"
```

---

### Task 8: CampaignScreen consumes providers

Apply Task 7's template to `CampaignScreen.tsx`. Reads: `usePhase`, `useRoster`, `useBoard`, `useCampaign`, `useChallenge`. Dispatches: whichever setters the screen calls.

- [ ] **Step 1: Apply the pattern, then commit**

```bash
git commit -m "refactor: CampaignScreen consumes providers directly"
```

---

### Task 9: BureaucracyScreen consumes providers

Apply Task 7's template to `BureaucracyScreen.tsx`. Reads: `usePhase`, `useRoster`, `useBureaucracy`. Dispatches: `useBureaucracyDispatch`.

- [ ] **Step 1: Apply the pattern, then commit**

```bash
git commit -m "refactor: BureaucracyScreen consumes providers directly"
```

---

### Task 10: Remaining screens + WaitingRoom / LobbyScreen

Apply the pattern to:
- `WaitingRoom.tsx`
- `LobbyScreen.tsx`
- `PlayerSelectionScreen.tsx`

These screens mostly don't touch migrated state (they're pre-game), so changes should be minimal. If a screen's props list shrinks to 0 / stable refs only, it's done.

- [ ] **Step 1: Apply where applicable, commit**

```bash
git commit -m "refactor: remaining screens consume providers where relevant"
```

---

### Task 11: App.tsx final shrink + ≤ 500 line check

**Files:**
- Modify: `src/App.tsx`

At this point, `App.tsx` should be dramatically smaller because:
- All migrated state declarations are gone.
- All setter declarations are gone.
- `getStatePacket` is gone (Step 5).
- Screen props that were just pass-through drilling are gone (Tasks 7–10).
- Reset effects for non-phase state moved into providers (Tasks 1–5).

- [ ] **Step 1: Audit `App.tsx` end-to-end**

What remains should be:
- Lobby / session setup (connect, rejoin hydration — or that moves to a `useLobby` hook — whichever is cleaner).
- `<GameStateAggregator>` wiring.
- `<ScreenRouter>` — a small function that picks the right screen by `phase.gameState`.
- Any remaining wiring that genuinely needs top-level access.

- [ ] **Step 2: Extract `<ScreenRouter>` into its own file if App.tsx is still > 500**

Create `src/components/ScreenRouter.tsx`:

```tsx
import { usePhase } from "../providers/PhaseProvider";
import { GameState } from "../game/types";
import { LobbyScreen } from "./screens/LobbyScreen";
import { WaitingRoom } from "./screens/WaitingRoom";
import { DraftingScreen } from "./screens/DraftingScreen";
import { CampaignScreen } from "./screens/CampaignScreen";
import { BureaucracyScreen } from "./screens/BureaucracyScreen";

export function ScreenRouter() {
  const { gameState } = usePhase();
  switch (gameState) {
    case GameState.LOBBY: return <LobbyScreen />;
    case GameState.WAITING: return <WaitingRoom />;
    case GameState.DRAFTING: return <DraftingScreen />;
    case GameState.CAMPAIGN: return <CampaignScreen />;
    case GameState.BUREAUCRACY: return <BureaucracyScreen />;
    default: return null;
  }
}
```

Replace the giant switch inside `App.tsx` with `<ScreenRouter />`.

- [ ] **Step 3: Measure**

```bash
wc -l src/App.tsx
```

Expected: ≤ 500.

If you are over 500:
- Look for more state that could be lifted into a provider.
- Look for inline hook logic that could move to `src/hooks/`.
- If after those two options the file is still > 500, stop, document the reason in the file top-of-file comment, and flag it in the handoff notes for Step 8. Do not hide complexity via mechanical splitting just to hit the number.

- [ ] **Step 4: Typecheck + tests + dev smoke (3/4/5)**

```bash
npm run typecheck && npm test -- --run
```

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/ScreenRouter.tsx
git commit -m "refactor: shrink App.tsx below 500 lines"
```

---

### Phase 4 — Memoization pass

### Task 12: Add selector hooks

**Files:**
- Create: `src/providers/selectors.ts`

- [ ] **Step 1: Write stable selectors**

```ts
// src/providers/selectors.ts
import { useMemo } from "react";
import { useRoster } from "./RosterProvider";
import { usePhase } from "./PhaseProvider";

/** Returns a stable reference to the given player (shallow-compared). */
export function usePlayer(id: string) {
  const { players } = useRoster();
  return useMemo(
    () => players.find((p) => p.id === id) ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, players.find((p) => p.id === id)],
  );
}

export function useCurrentPlayer() {
  const { players } = useRoster();
  const { currentPlayerIndex } = usePhase();
  return players[currentPlayerIndex] ?? null;
}

export function useMoverPlayer() {
  const { players } = useRoster();
  const { moverPlayerIndex } = usePhase();
  return players[moverPlayerIndex] ?? null;
}
```

**Note:** `usePlayer`'s dep array includes the resolved player object so the memo invalidates when that specific player reference changes. This works because providers use immutable updates.

- [ ] **Step 2: Use selectors in screen components where they currently do `.find()` inline**

Grep for inline finds:

```bash
Grep -n "players.find" src/components/screens
```

Replace inline finds with `usePlayer(id)` where appropriate — but do not force it everywhere. Only replace where PerfStore shows re-renders triggered by unrelated player changes.

- [ ] **Step 3: Typecheck + tests + commit**

```bash
git add src/providers/selectors.ts src/components/screens
git commit -m "feat: add stable player selector hooks"
```

---

### Task 13: React.memo on screens + heavy children

**Files:**
- Modify: each screen under `src/components/screens/*.tsx` and any heavy child the profiler identifies.

- [ ] **Step 1: Run the app with PerfOverlay open and note hot spots**

```bash
npm run dev
```

Play for 2–3 minutes. Note which component names in the render-count list are climbing disproportionately.

- [ ] **Step 2: For each hot screen/component, wrap its export in `React.memo`**

```tsx
export const CampaignScreen = memo(function CampaignScreen() { /* ... */ });
```

`React.memo` works **only** if the component's props are stable references. After Tasks 7–11, screens take few or no props, so memo is safe. For children that take props, verify the parent passes stable refs (functional handlers from providers are stable because dispatch identity is stable).

- [ ] **Step 3: Re-measure**

The hot components' render counts should drop noticeably. If they don't, the problem is not prop instability — it's a context consumer inside the component. Trace it.

- [ ] **Step 4: Typecheck + tests + commit**

```bash
git commit -m "perf: React.memo on hot screens + children"
```

---

### Task 14: Compare-before-set in `applyStatePacket` (guest side)

**Files:**
- Modify: `src/components/GameStateSynchronizer.tsx` OR modify `GameStateAggregator.tsx` — wherever the incoming packet is dispatched to providers.

- [ ] **Step 1: Find where a received full/delta packet is pushed to the providers**

This is the guest-side "apply." It currently dispatches every key in the packet to the matching provider setter. Change to compare-first:

```tsx
// For each provider slice:
if (!Object.is(currentRoster.players, packet.players)) {
  rosterDispatch.setPlayers(packet.players);
}
if (!Object.is(currentRoster.pieces, packet.pieces)) {
  rosterDispatch.setPieces(packet.pieces);
}
// ...etc
```

- [ ] **Step 2: Typecheck + tests + smoke + commit**

```bash
git commit -m "perf: compare-before-set in guest-side packet apply"
```

---

### Phase 5 — Hot leaves

### Task 15: Board grid memoization

**Files:**
- Modify: whichever component renders the board grid (likely `src/components/Board.tsx` or inside `CampaignScreen.tsx`).

- [ ] **Step 1: Identify the board grid component**

```bash
Grep -n "boardTiles.map" src/components
```

- [ ] **Step 2: Extract the grid to its own component if not already**

```tsx
// src/components/BoardGrid.tsx
import { memo } from "react";
import { useBoard } from "../providers/BoardProvider";
import { useRoster } from "../providers/RosterProvider";

export const BoardGrid = memo(function BoardGrid() {
  const { boardTiles } = useBoard();
  const { pieces } = useRoster();
  return (
    <div className="grid ...">
      {boardTiles.map((tile) => (
        <Tile key={tile.id} tile={tile} pieces={pieces.filter((p) => p.tileId === tile.id)} />
      ))}
    </div>
  );
});
```

Keyed on provider reference — re-renders only when `boardTiles` or `pieces` reference changes.

- [ ] **Step 3: Each `<Tile>` is also memo'd with stable props**

```tsx
export const Tile = memo(function Tile({ tile, pieces }: { tile: TileType; pieces: Piece[] }) {
  // ...
});
```

If `pieces.filter(...)` produces a new array reference on every render, memoize the filter in the parent via a per-tile lookup map:

```tsx
const piecesByTileId = useMemo(() => {
  const map = new Map<string, Piece[]>();
  for (const p of pieces) {
    if (!map.has(p.tileId)) map.set(p.tileId, []);
    map.get(p.tileId)!.push(p);
  }
  return map;
}, [pieces]);
```

- [ ] **Step 4: Typecheck + tests + smoke + commit**

```bash
git commit -m "perf: memoize BoardGrid + Tile; stable pieces-per-tile map"
```

---

### Task 16: Player panel per-player memoization

**Files:**
- Modify: the player panel component.

- [ ] **Step 1: Find it**

```bash
Grep -n "players.map" src/components
```

- [ ] **Step 2: Split each player row into its own memo'd component**

```tsx
const PlayerRow = memo(function PlayerRow({ player }: { player: Player }) {
  // ...
});

export function PlayerPanel() {
  const { players } = useRoster();
  return (
    <div className="...">
      {players.map((p) => <PlayerRow key={p.id} player={p} />)}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + tests + smoke + commit**

```bash
git commit -m "perf: per-player memoization in player panel"
```

---

### Task 17: Animation timer audit

**Files:**
- Wherever `useEffect` drives animation state setters in screens.

- [ ] **Step 1: Grep for animation-related setters in effects**

```bash
Grep -n "useEffect.*setTimeout.*setState|useEffect.*setInterval.*setState" src/components
```

- [ ] **Step 2: For each hit, confirm**

- There is a `return () => clearTimeout(...)` cleanup.
- The effect doesn't fire on every render (stable deps).
- The setState rate is bounded (not faster than ~60fps worth of updates).

- [ ] **Step 3: Fix any violations inline**

- [ ] **Step 4: Commit**

```bash
git commit -m "fix: animation timer cleanup + rate audit"
```

---

### Task 18: Final full-game smoke + commit

**Files:**
- None

- [ ] **Step 1: Full suite**

```bash
npm test -- --run
```

- [ ] **Step 2: Full game × 3 player counts**

```bash
npm run dev
```

Play a complete game for 3, 4, and 5 players. In each, confirm:
- No console errors.
- `App` renders fewer than 20 times per minute of play.
- Each provider renders only when its domain state changes.
- Board grid re-renders only on board changes.
- Player panel rows re-render only for the player that changed.
- `sync.delta.sent` ≫ `sync.full.sent` in steady state.
- `App.tsx` is ≤ 500 lines.

- [ ] **Step 3: If anything is regressed**

Do not force the final task complete. Bisect by commit — each task in this step is its own commit, so `git bisect` will localize the break within minutes.

---

## Definition of done

- [ ] `RosterProvider`, `BoardProvider`, `CampaignProvider`, `ChallengeProvider`, `BureaucracyProvider` all exist.
- [ ] Each provider has its own unit test file that passes.
- [ ] `GameProviders.tsx` composes all six providers (Phase, Roster, Board, Campaign, Challenge, Bureaucracy).
- [ ] `GameStateAggregator.tsx` reads every slice via a hook; `AggregatorLegacyProps` is gone.
- [ ] `App.tsx` is ≤ 500 lines (or documented exception with reason).
- [ ] Screens consume providers via hooks, not via prop drilling.
- [ ] Selector hooks exist in `src/providers/selectors.ts`.
- [ ] `React.memo` is applied on hot screens + children identified by PerfStore.
- [ ] Compare-before-set is applied in guest-side packet apply.
- [ ] Board grid and player panel rows are per-entity memoized.
- [ ] Animation timers have cleanup + stable deps.
- [ ] `phase-cleanup-matrix.md` rows are all ✅ (moved into their respective providers) except any explicitly marked ⏭️ in Step 8's scope.
- [ ] All tests pass — unit, provider, sync, phase cleanup, subscription stability, memory bounds, delta packets, microtask yield.
- [ ] 3, 4, and 5 player manual smoke tests succeed.
- [ ] `sync.delta.sent` ≫ `sync.full.sent` confirms the delta path is healthy post-migration.
- [ ] No wire format changes.
- [ ] No schema changes.

## Handoff notes for next step (Step 8 — Validation + reconnect + error boundaries)

- Provider tree is the new architectural shape. Validation helpers in Step 8 (4c) should live next to each handler file, not inside providers — handlers remain the mutation centerpoint.
- Error boundaries (4g) will wrap `ScreenRouter` at the top level (catches any screen throw) and individual screens (contains blast radius to one screen). Placement is determined by the component tree built in Task 11.
- Reconnect edge cases (4d) will interact with PhaseProvider, RosterProvider, and BoardProvider during rehydration. The rehydration path currently lives in the synchronizer — when Step 8 adds reconnect logic, make sure it dispatches through each provider's `patch()` method (atomic update) rather than calling each setter individually.
- Any rows in `phase-cleanup-matrix.md` still marked ⏭️ after this step are the leftover work Step 8 must pick up. Audit the matrix before starting Step 8.
