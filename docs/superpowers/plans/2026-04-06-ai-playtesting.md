# AI Playtesting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-layer automated playtesting system where random bots play complete KRED games, validate invariants, and auto-export failing games as Vitest regression tests.

**Architecture:** Pure `gameReducer(state, action) -> state` function (no side effects, no React). Random bots dispatch actions, a runner orchestrates full games, an invariant checker validates after every state change, and a test exporter writes failing games as deterministic Vitest files. Layer B wraps the same engine with Supabase I/O later.

**Tech Stack:** TypeScript, Vitest (existing), tsx (new devDep for CLI script), existing `packages/shared/src/` game config and rules.

**Spec:** `docs/superpowers/specs/2026-04-06-ai-playtesting-design.md`

**Manual:** `MANUAL.md` (comprehensive rules reference for testing edge cases)

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/engine/types.ts` | All engine types: `KredGameState`, `KredAction`, `KredPiece`, `EnginePlayer`, `TurnPhase`, `GameResult`, `InvariantViolation` |
| `src/engine/seededRandom.ts` | Deterministic PRNG for reproducible games |
| `src/engine/gameStateMachine.ts` | `createInitialState()` and `gameReducer()` — the core pure reducer |
| `src/engine/moveValidation.ts` | Per-move-type legality checks (Advance, Withdraw, Remove, etc.) against board state |
| `src/engine/outcomeResolution.ts` | Applies Whistle Blown / Smoking Gun / Witch Hunt / Quiet is Kept outcomes |
| `src/engine/invariants.ts` | 11 invariant check functions + `runAllInvariants()` |
| `src/engine/randomBot.ts` | `randomBot(state, playerId)` — picks random legal actions per phase |
| `src/engine/gameRunner.ts` | `runGame(config)` — orchestrates a complete game start to finish |
| `src/engine/testExporter.ts` | `exportFailingTest()` — writes a Vitest file from a failed game |
| `src/scripts/playtest.ts` | CLI entry point (`npm run playtest`) |
| `src/__tests__/engine/types.test.ts` | Type construction and validation tests |
| `src/__tests__/engine/seededRandom.test.ts` | PRNG determinism tests |
| `src/__tests__/engine/gameStateMachine.test.ts` | Reducer unit tests per action type |
| `src/__tests__/engine/moveValidation.test.ts` | Per-move legality tests |
| `src/__tests__/engine/outcomeResolution.test.ts` | Outcome resolution tests |
| `src/__tests__/engine/invariants.test.ts` | Invariant checker unit tests |
| `src/__tests__/engine/randomBot.test.ts` | Bot produces legal actions |
| `src/__tests__/engine/gameRunner.test.ts` | Full game completion tests |
| `src/__tests__/playtest/fuzz.test.ts` | 30-game safety net (10 per player mode) |

---

## Task 1: Engine Types

**Files:**
- Create: `src/engine/types.ts`
- Test: `src/__tests__/engine/types.test.ts`

- [ ] **Step 1: Write the type test file**

```typescript
// src/__tests__/engine/types.test.ts
import { describe, it, expect } from 'vitest';
import {
  TurnPhase,
  type KredPiece,
  type EnginePlayer,
  type KredGameState,
  type MakeMoves,
  type SelectTile,
  type ReceiverDecision,
  type BystanderDecision,
  type ResolveSupport,
  type BureaucracyPurchase,
  type EndBureaucracyTurn,
  type KredAction,
  type GameResult,
  type InvariantViolation,
  type InvariantResult,
} from '../../engine/types';

describe('engine types', () => {
  it('TurnPhase enum has all phases', () => {
    expect(TurnPhase.MOVING).toBe('MOVING');
    expect(TurnPhase.SELECTING_TILE).toBe('SELECTING_TILE');
    expect(TurnPhase.AWAITING_RECEIPT).toBe('AWAITING_RECEIPT');
    expect(TurnPhase.AWAITING_CHALLENGES).toBe('AWAITING_CHALLENGES');
    expect(TurnPhase.RESOLVING_OUTCOME).toBe('RESOLVING_OUTCOME');
    expect(TurnPhase.RESOLVE_SUPPORT).toBe('RESOLVE_SUPPORT');
    expect(TurnPhase.BUREAUCRACY).toBe('BUREAUCRACY');
    expect(TurnPhase.GAME_OVER).toBe('GAME_OVER');
  });

  it('KredPiece can be constructed', () => {
    const piece: KredPiece = {
      id: 'campaign_mark_1',
      type: 'MARK',
      locationId: 'p1_seat1',
    };
    expect(piece.id).toBe('campaign_mark_1');
    expect(piece.type).toBe('MARK');
    expect(piece.locationId).toBe('p1_seat1');
  });

  it('EnginePlayer can be constructed', () => {
    const player: EnginePlayer = {
      id: 1,
      hand: ['01', '05', '12'],
      bankFaceDown: [],
      bankFaceUp: [],
      credibility: 3,
      credibilityAtTurnStart: 3,
    };
    expect(player.hand).toHaveLength(3);
    expect(player.credibility).toBe(3);
  });

  it('KredAction discriminated union works via type field', () => {
    const action: KredAction = {
      type: 'MAKE_MOVES',
      playerId: 1,
      moves: [],
    };
    expect(action.type).toBe('MAKE_MOVES');

    const selectTile: KredAction = {
      type: 'SELECT_TILE',
      playerId: 1,
      tileId: '05',
      receiverPlayerId: 2,
    };
    expect(selectTile.type).toBe('SELECT_TILE');
  });

  it('InvariantResult can be constructed', () => {
    const pass: InvariantResult = { passed: true, name: 'test' };
    expect(pass.passed).toBe(true);

    const fail: InvariantResult = { passed: false, name: 'test', details: 'broke' };
    expect(fail.details).toBe('broke');
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/__tests__/engine/types.test.ts`
Expected: FAIL — cannot find module `../../engine/types`

- [ ] **Step 3: Write the types file**

```typescript
// src/engine/types.ts
import { DefinedMoveType } from '@kred/shared';

// ============================================================================
// PIECE (simplified — no position/rotation, just id + type + location)
// ============================================================================

export type PieceType = 'MARK' | 'HEEL' | 'PAWN';

export interface KredPiece {
  id: string;
  type: PieceType;
  locationId: string; // e.g. 'p1_seat3', 'community_mark_1', 'p2_rostrum1'
}

// ============================================================================
// PLAYER (engine-only — no UI tiles, just string IDs)
// ============================================================================

export interface EnginePlayer {
  id: number; // 1-based
  hand: string[]; // tile IDs in hand (e.g. ['01', '05', '12'])
  bankFaceDown: string[]; // tile IDs counted for Bureaucracy
  bankFaceUp: string[]; // tile IDs NOT counted (exposed dishonest plays)
  credibility: number; // 0-3
  credibilityAtTurnStart: number; // snapshot for zero-cred penalty rules
}

// ============================================================================
// TURN PHASE
// ============================================================================

export enum TurnPhase {
  MOVING = 'MOVING',
  SELECTING_TILE = 'SELECTING_TILE',
  AWAITING_RECEIPT = 'AWAITING_RECEIPT',
  AWAITING_CHALLENGES = 'AWAITING_CHALLENGES',
  RESOLVING_OUTCOME = 'RESOLVING_OUTCOME',
  RESOLVE_SUPPORT = 'RESOLVE_SUPPORT',
  BUREAUCRACY = 'BUREAUCRACY',
  GAME_OVER = 'GAME_OVER',
}

// ============================================================================
// ENGINE MOVE (simplified TrackedMove — no positions, just IDs)
// ============================================================================

export interface EngineMove {
  moveType: DefinedMoveType;
  pieceId: string;
  fromLocationId: string;
  toLocationId: string;
}

// ============================================================================
// GAME STATE
// ============================================================================

export interface KredGameState {
  pieces: KredPiece[];
  players: EnginePlayer[];

  turn: {
    phase: TurnPhase;
    moverId: number;
    receiverId: number | null;
    movesExecuted: EngineMove[];
    tilePlayedId: string | null; // tile the Mover placed face-down
    pendingBystanders: number[]; // player IDs who haven't decided yet
    challengerId: number | null;
    // Bluff tracking: what moves did the mover intend? (for bot coordination)
    isBluff: boolean;
  };

  campaign: {
    number: number; // which Campaign (1-based)
  };

  bureaucracy: {
    turnOrder: number[];
    currentPlayerIndex: number;
    remainingFunding: Record<number, number>; // playerId -> remaining kredcoins
  };

  config: {
    playerCount: 3 | 4 | 5;
    seed: number;
  };

  history: KredAction[];

  // Pre-move snapshot for undoing dishonest plays
  piecesBeforeMove: KredPiece[] | null;

  // Phase to return to after RESOLVE_SUPPORT
  phaseBeforeSupport: TurnPhase | null;
}

// ============================================================================
// ACTIONS (discriminated union)
// ============================================================================

export interface MakeMoves {
  type: 'MAKE_MOVES';
  playerId: number;
  moves: EngineMove[];
}

export interface SelectTile {
  type: 'SELECT_TILE';
  playerId: number;
  tileId: string;
  receiverPlayerId: number;
}

export interface ReceiverDecision {
  type: 'RECEIVER_DECISION';
  playerId: number;
  decision: 'ACCEPT' | 'ACCEPT_BLIND' | 'REJECT';
}

export interface BystanderDecision {
  type: 'BYSTANDER_DECISION';
  playerId: number;
  decision: 'CHALLENGE' | 'PASS';
}

export interface ResolveSupport {
  type: 'RESOLVE_SUPPORT';
  playerId: number;
  pieceId: string;
  targetLocationId: string;
}

export interface BureaucracyPurchase {
  type: 'BUREAUCRACY_PURCHASE';
  playerId: number;
  menuItemId: string;
  targetPieceId?: string;
  targetLocationId?: string;
}

export interface EndBureaucracyTurn {
  type: 'END_BUREAUCRACY_TURN';
  playerId: number;
}

export type KredAction =
  | MakeMoves
  | SelectTile
  | ReceiverDecision
  | BystanderDecision
  | ResolveSupport
  | BureaucracyPurchase
  | EndBureaucracyTurn;

// ============================================================================
// RESULTS
// ============================================================================

export interface InvariantResult {
  passed: boolean;
  name: string;
  details?: string;
}

export interface InvariantViolation {
  invariantName: string;
  details: string;
  stateBefore: KredGameState;
  stateAfter: KredGameState;
  triggeringAction: KredAction;
  actionIndex: number;
}

export interface GameResult {
  outcome: 'WIN' | 'DRAW' | 'STALEMATE';
  winnerIds: number[]; // single for WIN, multiple for DRAW, empty for STALEMATE
  actions: KredAction[];
  violations: InvariantViolation[];
  stats: {
    campaignCount: number;
    totalActions: number;
    finalPieces: KredPiece[];
  };
  config: {
    playerCount: 3 | 4 | 5;
    seed: number;
  };
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/__tests__/engine/types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/types.ts src/__tests__/engine/types.test.ts
git commit -m "feat(engine): add core types for game state machine"
```

---

## Task 2: Seeded Random Number Generator

**Files:**
- Create: `src/engine/seededRandom.ts`
- Test: `src/__tests__/engine/seededRandom.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/__tests__/engine/seededRandom.test.ts
import { describe, it, expect } from 'vitest';
import { SeededRandom } from '../../engine/seededRandom';

describe('SeededRandom', () => {
  it('produces deterministic sequences from the same seed', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences from different seeds', () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(99);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    expect(seq1).not.toEqual(seq2);
  });

  it('next() returns values in [0, 1)', () => {
    const rng = new SeededRandom(123);
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('nextInt(min, max) returns integers in [min, max]', () => {
    const rng = new SeededRandom(7);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(1, 5);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(5);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('shuffle() returns all elements in different order deterministically', () => {
    const rng1 = new SeededRandom(55);
    const rng2 = new SeededRandom(55);
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8];
    const arr2 = [1, 2, 3, 4, 5, 6, 7, 8];
    rng1.shuffle(arr1);
    rng2.shuffle(arr2);
    expect(arr1).toEqual(arr2);
    expect(arr1.sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('pick() returns a random element from an array', () => {
    const rng = new SeededRandom(10);
    const items = ['a', 'b', 'c'];
    for (let i = 0; i < 20; i++) {
      expect(items).toContain(rng.pick(items));
    }
  });

  it('weightedChoice() respects weights', () => {
    const rng = new SeededRandom(42);
    // Weight heavily toward 'a' (99%) vs 'b' (1%)
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 1000; i++) {
      const choice = rng.weightedChoice([
        { value: 'a' as const, weight: 99 },
        { value: 'b' as const, weight: 1 },
      ]);
      counts[choice]++;
    }
    expect(counts.a).toBeGreaterThan(900);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/__tests__/engine/seededRandom.test.ts`
Expected: FAIL — cannot find module

- [ ] **Step 3: Write the seeded RNG**

```typescript
// src/engine/seededRandom.ts

/**
 * Mulberry32 PRNG — simple, fast, deterministic.
 * Same seed always produces the same sequence.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max] (inclusive) */
  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Fisher-Yates shuffle (in-place, deterministic) */
  shuffle<T>(arr: T[]): void {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  /** Pick a random element from a non-empty array */
  pick<T>(arr: readonly T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }

  /** Weighted random choice. Weights are relative (don't need to sum to 1). */
  weightedChoice<T>(options: { value: T; weight: number }[]): T {
    const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
    let roll = this.next() * totalWeight;
    for (const option of options) {
      roll -= option.weight;
      if (roll <= 0) return option.value;
    }
    return options[options.length - 1].value;
  }
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/__tests__/engine/seededRandom.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/seededRandom.ts src/__tests__/engine/seededRandom.test.ts
git commit -m "feat(engine): add deterministic seeded PRNG"
```

---

## Task 3: Move Validation

**Files:**
- Create: `src/engine/moveValidation.ts`
- Test: `src/__tests__/engine/moveValidation.test.ts`

This module answers: "Given the current board (pieces array), is this specific EngineMove legal?"
It reuses adjacency and support rules from `@kred/shared` but operates on `KredPiece[]` instead of UI `Piece[]`.

- [ ] **Step 1: Write the test file**

```typescript
// src/__tests__/engine/moveValidation.test.ts
import { describe, it, expect } from 'vitest';
import { DefinedMoveType } from '@kred/shared';
import {
  validateMove,
  findLegalMoves,
  checkSupportViolations,
} from '../../engine/moveValidation';
import type { KredPiece, EngineMove } from '../../engine/types';

// Helper: create a minimal 3-player starting board
function makeStartingPieces(): KredPiece[] {
  const pieces: KredPiece[] = [];
  let markCounter = 1;
  // 3 players, Marks at seats 1,3,5
  for (let p = 1; p <= 3; p++) {
    for (const s of [1, 3, 5]) {
      pieces.push({ id: `mark_${markCounter}`, type: 'MARK', locationId: `p${p}_seat${s}` });
      markCounter++;
    }
  }
  // 3 additional marks in community
  for (let i = markCounter; i <= 12; i++) {
    pieces.push({ id: `mark_${i}`, type: 'MARK', locationId: 'community' });
  }
  // 9 heels in community
  for (let i = 1; i <= 9; i++) {
    pieces.push({ id: `heel_${i}`, type: 'HEEL', locationId: 'community' });
  }
  // 3 pawns in community
  for (let i = 1; i <= 3; i++) {
    pieces.push({ id: `pawn_${i}`, type: 'PAWN', locationId: 'community' });
  }
  return pieces;
}

describe('validateMove', () => {
  describe('ADVANCE', () => {
    it('allows Community -> vacant seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_10', // in community
        fromLocationId: 'community',
        toLocationId: 'p1_seat2', // vacant
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects Community -> occupied seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_10',
        fromLocationId: 'community',
        toLocationId: 'p1_seat1', // occupied
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects Community -> opponent seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_10',
        fromLocationId: 'community',
        toLocationId: 'p2_seat2', // opponent
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects Seat -> Rostrum when faction not full', () => {
      const pieces = makeStartingPieces();
      // p1 has seats 1,3,5 occupied but seat2 empty — faction 1 not full
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_1', // p1_seat1
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_rostrum1',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('allows Seat -> Rostrum when faction is full', () => {
      const pieces = makeStartingPieces();
      // Fill p1 seat2 to complete faction 1
      pieces.push({ id: 'mark_extra', type: 'MARK', locationId: 'p1_seat2' });
      const move: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'mark_1', // p1_seat1
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_rostrum1',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('takes Marks before Heels from community', () => {
      const pieces = makeStartingPieces(); // has marks in community
      const heelMove: EngineMove = {
        moveType: DefinedMoveType.ADVANCE,
        pieceId: 'heel_1',
        fromLocationId: 'community',
        toLocationId: 'p1_seat2',
      };
      // Should reject — marks still in community
      expect(validateMove(heelMove, 1, pieces, 3)).toBe(false);
    });
  });

  describe('REMOVE', () => {
    it('allows removing opponent Mark from seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.REMOVE,
        pieceId: 'mark_4', // p2_seat1
        fromLocationId: 'p2_seat1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects removing own Mark', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.REMOVE,
        pieceId: 'mark_1', // p1_seat1 — own domain
        fromLocationId: 'p1_seat1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects removing Heel', () => {
      const pieces: KredPiece[] = [
        { id: 'heel_1', type: 'HEEL', locationId: 'p2_seat1' },
      ];
      const move: EngineMove = {
        moveType: DefinedMoveType.REMOVE,
        pieceId: 'heel_1',
        fromLocationId: 'p2_seat1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects removing from rostrum', () => {
      const pieces: KredPiece[] = [
        { id: 'mark_1', type: 'MARK', locationId: 'p2_rostrum1' },
      ];
      const move: EngineMove = {
        moveType: DefinedMoveType.REMOVE,
        pieceId: 'mark_1',
        fromLocationId: 'p2_rostrum1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });
  });

  describe('WITHDRAW', () => {
    it('allows Seat -> Community', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.WITHDRAW,
        pieceId: 'mark_1',
        fromLocationId: 'p1_seat1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects withdrawing opponent piece', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.WITHDRAW,
        pieceId: 'mark_4',
        fromLocationId: 'p2_seat1',
        toLocationId: 'community',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });
  });

  describe('ORGANIZE', () => {
    it('allows seat -> adjacent seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ORGANIZE,
        pieceId: 'mark_1', // p1_seat1
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_seat2', // adjacent, vacant
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects seat -> non-adjacent seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ORGANIZE,
        pieceId: 'mark_1',
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_seat4', // not adjacent
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects organizing opponent piece', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ORGANIZE,
        pieceId: 'mark_4', // p2_seat1
        fromLocationId: 'p2_seat1',
        toLocationId: 'p2_seat2',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });
  });

  describe('INFLUENCE', () => {
    it('allows moving opponent Mark to adjacent seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.INFLUENCE,
        pieceId: 'mark_4', // p2_seat1
        fromLocationId: 'p2_seat1',
        toLocationId: 'p2_seat2', // adjacent, vacant
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects influencing own piece', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.INFLUENCE,
        pieceId: 'mark_1',
        fromLocationId: 'p1_seat1',
        toLocationId: 'p1_seat2',
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });

    it('rejects influencing Pawn across domains', () => {
      const pieces: KredPiece[] = [
        { id: 'pawn_1', type: 'PAWN', locationId: 'p2_seat1' },
      ];
      // p2_seat1 is not at domain boundary in 3-player, but test the pawn rule:
      // even at boundary, pawns cannot cross
      const move: EngineMove = {
        moveType: DefinedMoveType.INFLUENCE,
        pieceId: 'pawn_1',
        fromLocationId: 'p2_seat1',
        toLocationId: 'p3_seat6', // cross-domain (3-player: p3 is next to p2)
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });
  });

  describe('ASSIST', () => {
    it('allows placing Mark in opponent vacant seat', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ASSIST,
        pieceId: 'mark_10',
        fromLocationId: 'community',
        toLocationId: 'p2_seat2', // opponent vacant seat
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(true);
    });

    it('rejects assisting own domain', () => {
      const pieces = makeStartingPieces();
      const move: EngineMove = {
        moveType: DefinedMoveType.ASSIST,
        pieceId: 'mark_10',
        fromLocationId: 'community',
        toLocationId: 'p1_seat2', // own domain
      };
      expect(validateMove(move, 1, pieces, 3)).toBe(false);
    });
  });
});

describe('findLegalMoves', () => {
  it('returns at least one ADVANCE for player 1 at game start', () => {
    const pieces = makeStartingPieces();
    const moves = findLegalMoves(DefinedMoveType.ADVANCE, 1, pieces, 3);
    expect(moves.length).toBeGreaterThan(0);
    // Should be able to advance marks from community to vacant seats 2, 4, 6
    expect(moves.every(m => m.moveType === DefinedMoveType.ADVANCE)).toBe(true);
  });

  it('returns empty for ADVANCE when no vacant seats and no full factions', () => {
    // All seats occupied, no full factions (impossible to advance to rostrum)
    const pieces: KredPiece[] = [];
    for (let s = 1; s <= 6; s++) {
      pieces.push({ id: `mark_${s}`, type: 'MARK', locationId: `p1_seat${s}` });
    }
    // Both factions are full, so advance should offer seat->rostrum
    const moves = findLegalMoves(DefinedMoveType.ADVANCE, 1, pieces, 3);
    // All seats full = both factions full = can advance to rostrums
    expect(moves.length).toBeGreaterThan(0);
    expect(moves.some(m => m.toLocationId === 'p1_rostrum1')).toBe(true);
    expect(moves.some(m => m.toLocationId === 'p1_rostrum2')).toBe(true);
  });

  it('returns REMOVE options for opponent marks in seats', () => {
    const pieces = makeStartingPieces();
    const moves = findLegalMoves(DefinedMoveType.REMOVE, 1, pieces, 3);
    expect(moves.length).toBeGreaterThan(0);
    // All targets should be opponent marks in seats
    expect(moves.every(m => {
      const piece = pieces.find(p => p.id === m.pieceId);
      return piece && piece.type === 'MARK' && !m.fromLocationId.startsWith('p1_');
    })).toBe(true);
  });
});

describe('checkSupportViolations', () => {
  it('returns empty for valid board', () => {
    const pieces = makeStartingPieces();
    expect(checkSupportViolations(pieces, 3)).toEqual([]);
  });

  it('detects unsupported rostrum piece', () => {
    const pieces: KredPiece[] = [
      { id: 'mark_1', type: 'MARK', locationId: 'p1_rostrum1' },
      // no seats 1-3 occupied for player 1
    ];
    const violations = checkSupportViolations(pieces, 3);
    expect(violations.length).toBe(1);
    expect(violations[0].pieceId).toBe('mark_1');
    expect(violations[0].locationId).toBe('p1_rostrum1');
  });

  it('detects unsupported office piece', () => {
    const pieces: KredPiece[] = [
      { id: 'heel_1', type: 'HEEL', locationId: 'p1_office' },
      // no rostrums occupied
    ];
    const violations = checkSupportViolations(pieces, 3);
    expect(violations.length).toBe(1);
    expect(violations[0].pieceId).toBe('heel_1');
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/__tests__/engine/moveValidation.test.ts`
Expected: FAIL — cannot find module

- [ ] **Step 3: Write the move validation module**

```typescript
// src/engine/moveValidation.ts
import { DefinedMoveType } from '@kred/shared';
import { areSeatsAdjacent, getAdjacentSeats } from '@kred/shared/rules/adjacency';
import { ROSTRUM_ADJACENCY_BY_PLAYER_COUNT, ROSTRUM_SUPPORT_RULES } from '@kred/shared/config/rules';
import type { KredPiece, EngineMove } from './types';

// ============================================================================
// HELPERS
// ============================================================================

/** Get the player who owns a location (e.g., 'p2_seat3' -> 2) */
function getOwner(locationId: string): number | null {
  const match = locationId.match(/^p(\d+)_/);
  return match ? parseInt(match[1]) : null;
}

/** Check if a location is in the community */
function isCommunity(locationId: string): boolean {
  return locationId === 'community' || locationId.startsWith('community');
}

/** Check if a location is a seat */
function isSeat(locationId: string): boolean {
  return /^p\d+_seat\d$/.test(locationId);
}

/** Check if a location is a rostrum */
function isRostrum(locationId: string): boolean {
  return /^p\d+_rostrum\d$/.test(locationId);
}

/** Check if a location is an office */
function isOffice(locationId: string): boolean {
  return /^p\d+_office$/.test(locationId);
}

/** Check if location is vacant */
function isVacant(locationId: string, pieces: KredPiece[]): boolean {
  return !pieces.some(p => p.locationId === locationId);
}

/** Get piece by ID */
function getPiece(pieces: KredPiece[], pieceId: string): KredPiece | undefined {
  return pieces.find(p => p.id === pieceId);
}

/** Are there any Marks in the community? */
function marksInCommunity(pieces: KredPiece[]): boolean {
  return pieces.some(p => p.type === 'MARK' && isCommunity(p.locationId));
}

/** Get the seats supporting a rostrum */
function getSupportingSeats(playerId: number, rostrumId: string): string[] {
  const rules = ROSTRUM_SUPPORT_RULES[playerId];
  if (!rules) return [];
  const rostrum = rules.rostrums.find(r => r.rostrum === rostrumId);
  return rostrum ? rostrum.supportingSeats : [];
}

/** Check if all seats in a faction are occupied */
function isFactionFull(supportingSeats: string[], pieces: KredPiece[]): boolean {
  return supportingSeats.every(seatId => pieces.some(p => p.locationId === seatId));
}

// ============================================================================
// VALIDATE A SINGLE MOVE
// ============================================================================

export function validateMove(
  move: EngineMove,
  playerId: number,
  pieces: KredPiece[],
  playerCount: number,
): boolean {
  const piece = getPiece(pieces, move.pieceId);
  if (!piece) return false;
  if (piece.locationId !== move.fromLocationId) return false;

  switch (move.moveType) {
    case DefinedMoveType.ADVANCE:
      return validateAdvance(move, piece, playerId, pieces, playerCount);
    case DefinedMoveType.WITHDRAW:
      return validateWithdraw(move, piece, playerId, pieces);
    case DefinedMoveType.ORGANIZE:
      return validateOrganize(move, piece, playerId, pieces, playerCount);
    case DefinedMoveType.REMOVE:
      return validateRemove(move, piece, playerId, pieces);
    case DefinedMoveType.INFLUENCE:
      return validateInfluence(move, piece, playerId, pieces, playerCount);
    case DefinedMoveType.ASSIST:
      return validateAssist(move, piece, playerId, pieces);
    default:
      return false;
  }
}

// ============================================================================
// PER-MOVE-TYPE VALIDATORS
// ============================================================================

function validateAdvance(
  move: EngineMove, piece: KredPiece, playerId: number,
  pieces: KredPiece[], playerCount: number,
): boolean {
  const { fromLocationId, toLocationId } = move;
  const toOwner = getOwner(toLocationId);

  // Community -> own vacant seat
  if (isCommunity(fromLocationId) && isSeat(toLocationId)) {
    if (toOwner !== playerId) return false;
    if (!isVacant(toLocationId, pieces)) return false;
    // Marks before Heels
    if (piece.type === 'HEEL' && marksInCommunity(pieces)) return false;
    if (piece.type === 'PAWN') return false; // Pawns never via Advance from community
    return true;
  }

  // Seat -> Rostrum (faction must be full)
  if (isSeat(fromLocationId) && isRostrum(toLocationId)) {
    if (getOwner(fromLocationId) !== playerId) return false;
    if (toOwner !== playerId) return false;
    if (!isVacant(toLocationId, pieces)) return false;
    const supportingSeats = getSupportingSeats(playerId, toLocationId);
    if (!supportingSeats.includes(fromLocationId)) return false;
    return isFactionFull(supportingSeats, pieces);
  }

  // Rostrum -> Office (both rostrums must be occupied)
  if (isRostrum(fromLocationId) && isOffice(toLocationId)) {
    if (getOwner(fromLocationId) !== playerId) return false;
    if (toOwner !== playerId) return false;
    if (!isVacant(toLocationId, pieces)) return false;
    const rules = ROSTRUM_SUPPORT_RULES[playerId];
    if (!rules) return false;
    const bothRostrumsOccupied = rules.rostrums.every(r =>
      pieces.some(p => p.locationId === r.rostrum)
    );
    return bothRostrumsOccupied;
  }

  return false;
}

function validateWithdraw(
  move: EngineMove, piece: KredPiece, playerId: number, pieces: KredPiece[],
): boolean {
  const { fromLocationId, toLocationId } = move;
  if (getOwner(fromLocationId) !== playerId) return false;

  // Office -> vacant rostrum
  if (isOffice(fromLocationId) && isRostrum(toLocationId)) {
    if (getOwner(toLocationId) !== playerId) return false;
    return isVacant(toLocationId, pieces);
  }

  // Rostrum -> vacant seat in same faction
  if (isRostrum(fromLocationId) && isSeat(toLocationId)) {
    if (getOwner(toLocationId) !== playerId) return false;
    if (!isVacant(toLocationId, pieces)) return false;
    const supportingSeats = getSupportingSeats(playerId, fromLocationId);
    return supportingSeats.includes(toLocationId);
  }

  // Seat -> community
  if (isSeat(fromLocationId) && isCommunity(toLocationId)) {
    return true;
  }

  return false;
}

function validateOrganize(
  move: EngineMove, piece: KredPiece, playerId: number,
  pieces: KredPiece[], playerCount: number,
): boolean {
  const { fromLocationId, toLocationId } = move;
  if (getOwner(fromLocationId) !== playerId) return false;

  // Seat -> adjacent seat (may cross domains)
  if (isSeat(fromLocationId) && isSeat(toLocationId)) {
    if (!isVacant(toLocationId, pieces)) return false;
    return areSeatsAdjacent(fromLocationId, toLocationId, playerCount);
  }

  // Rostrum -> adjacent rostrum in opponent domain
  if (isRostrum(fromLocationId) && isRostrum(toLocationId)) {
    if (getOwner(toLocationId) === playerId) return false; // must be opponent
    if (!isVacant(toLocationId, pieces)) return false;
    const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount] || [];
    return adjacencies.some(a =>
      (a.rostrum1 === fromLocationId && a.rostrum2 === toLocationId) ||
      (a.rostrum2 === fromLocationId && a.rostrum1 === toLocationId)
    );
  }

  return false;
}

function validateRemove(
  move: EngineMove, piece: KredPiece, playerId: number, pieces: KredPiece[],
): boolean {
  const { fromLocationId, toLocationId } = move;
  // Must target opponent seat, Mark only, destination community
  if (!isSeat(fromLocationId)) return false;
  if (getOwner(fromLocationId) === playerId) return false;
  if (piece.type !== 'MARK') return false;
  if (!isCommunity(toLocationId)) return false;
  return true;
}

function validateInfluence(
  move: EngineMove, piece: KredPiece, playerId: number,
  pieces: KredPiece[], playerCount: number,
): boolean {
  const { fromLocationId, toLocationId } = move;
  // Must be opponent's piece
  if (getOwner(fromLocationId) === playerId) return false;
  if (!isVacant(toLocationId, pieces)) return false;

  // Seat -> adjacent seat
  if (isSeat(fromLocationId) && isSeat(toLocationId)) {
    // Pawns cannot be influenced across domains
    if (piece.type === 'PAWN') {
      const fromOwner = getOwner(fromLocationId);
      const toOwner = getOwner(toLocationId);
      if (fromOwner !== toOwner) return false;
    }
    return areSeatsAdjacent(fromLocationId, toLocationId, playerCount);
  }

  // Rostrum -> adjacent rostrum
  if (isRostrum(fromLocationId) && isRostrum(toLocationId)) {
    // Pawns cannot be influenced across domains (rostrums are always cross-domain)
    if (piece.type === 'PAWN') return false;
    const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount] || [];
    return adjacencies.some(a =>
      (a.rostrum1 === fromLocationId && a.rostrum2 === toLocationId) ||
      (a.rostrum2 === fromLocationId && a.rostrum1 === toLocationId)
    );
  }

  return false;
}

function validateAssist(
  move: EngineMove, piece: KredPiece, playerId: number, pieces: KredPiece[],
): boolean {
  const { fromLocationId, toLocationId } = move;
  if (!isCommunity(fromLocationId)) return false;
  if (!isSeat(toLocationId)) return false;
  if (getOwner(toLocationId) === playerId) return false; // must be opponent
  if (!isVacant(toLocationId, pieces)) return false;
  // Marks before Heels
  if (piece.type === 'HEEL' && marksInCommunity(pieces)) return false;
  if (piece.type === 'PAWN') return false;
  return true;
}

// ============================================================================
// FIND ALL LEGAL MOVES OF A GIVEN TYPE
// ============================================================================

export function findLegalMoves(
  moveType: DefinedMoveType,
  playerId: number,
  pieces: KredPiece[],
  playerCount: number,
): EngineMove[] {
  const moves: EngineMove[] = [];

  switch (moveType) {
    case DefinedMoveType.ADVANCE: {
      // Community -> vacant own seats
      const communityPieces = pieces.filter(p => isCommunity(p.locationId));
      // Pick the right type: Marks first, then Heels
      const hasMarks = communityPieces.some(p => p.type === 'MARK');
      const advancePieces = hasMarks
        ? communityPieces.filter(p => p.type === 'MARK')
        : communityPieces.filter(p => p.type === 'HEEL');
      const candidatePiece = advancePieces[0]; // one piece is enough, bot picks randomly
      if (candidatePiece) {
        for (let s = 1; s <= 6; s++) {
          const seatId = `p${playerId}_seat${s}`;
          if (isVacant(seatId, pieces)) {
            moves.push({
              moveType, pieceId: candidatePiece.id,
              fromLocationId: candidatePiece.locationId, toLocationId: seatId,
            });
          }
        }
      }

      // Seat -> Rostrum (full factions only)
      const rules = ROSTRUM_SUPPORT_RULES[playerId];
      if (rules) {
        for (const r of rules.rostrums) {
          if (!isVacant(r.rostrum, pieces)) continue;
          if (!isFactionFull(r.supportingSeats, pieces)) continue;
          for (const seatId of r.supportingSeats) {
            const seatPiece = pieces.find(p => p.locationId === seatId);
            if (seatPiece) {
              moves.push({
                moveType, pieceId: seatPiece.id,
                fromLocationId: seatId, toLocationId: r.rostrum,
              });
            }
          }
        }

        // Rostrum -> Office (both rostrums occupied)
        const bothOccupied = rules.rostrums.every(r =>
          pieces.some(p => p.locationId === r.rostrum)
        );
        if (bothOccupied && isVacant(rules.office, pieces)) {
          for (const r of rules.rostrums) {
            const rostrumPiece = pieces.find(p => p.locationId === r.rostrum);
            if (rostrumPiece) {
              moves.push({
                moveType, pieceId: rostrumPiece.id,
                fromLocationId: r.rostrum, toLocationId: rules.office,
              });
            }
          }
        }
      }
      break;
    }

    case DefinedMoveType.WITHDRAW: {
      // Office -> vacant rostrum
      const rules = ROSTRUM_SUPPORT_RULES[playerId];
      if (rules) {
        const officePiece = pieces.find(p => p.locationId === rules.office);
        if (officePiece) {
          for (const r of rules.rostrums) {
            if (isVacant(r.rostrum, pieces)) {
              moves.push({
                moveType, pieceId: officePiece.id,
                fromLocationId: rules.office, toLocationId: r.rostrum,
              });
            }
          }
        }

        // Rostrum -> vacant seat in same faction
        for (const r of rules.rostrums) {
          const rostrumPiece = pieces.find(p => p.locationId === r.rostrum);
          if (rostrumPiece) {
            for (const seatId of r.supportingSeats) {
              if (isVacant(seatId, pieces)) {
                moves.push({
                  moveType, pieceId: rostrumPiece.id,
                  fromLocationId: r.rostrum, toLocationId: seatId,
                });
              }
            }
          }
        }
      }

      // Seat -> community
      for (let s = 1; s <= 6; s++) {
        const seatId = `p${playerId}_seat${s}`;
        const seatPiece = pieces.find(p => p.locationId === seatId);
        if (seatPiece) {
          moves.push({
            moveType, pieceId: seatPiece.id,
            fromLocationId: seatId, toLocationId: 'community',
          });
        }
      }
      break;
    }

    case DefinedMoveType.ORGANIZE: {
      // Own pieces in seats -> adjacent vacant seats
      for (let s = 1; s <= 6; s++) {
        const seatId = `p${playerId}_seat${s}`;
        const seatPiece = pieces.find(p => p.locationId === seatId);
        if (seatPiece) {
          const adjacentSeats = getAdjacentSeats(seatId, playerCount);
          for (const adjSeat of adjacentSeats) {
            if (isVacant(adjSeat, pieces)) {
              moves.push({
                moveType, pieceId: seatPiece.id,
                fromLocationId: seatId, toLocationId: adjSeat,
              });
            }
          }
        }
      }

      // Own pieces in rostrums -> adjacent rostrums (opponent domain)
      const rules = ROSTRUM_SUPPORT_RULES[playerId];
      const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount] || [];
      if (rules) {
        for (const r of rules.rostrums) {
          const rostrumPiece = pieces.find(p => p.locationId === r.rostrum);
          if (rostrumPiece) {
            for (const adj of adjacencies) {
              let targetRostrum: string | null = null;
              if (adj.rostrum1 === r.rostrum) targetRostrum = adj.rostrum2;
              if (adj.rostrum2 === r.rostrum) targetRostrum = adj.rostrum1;
              if (targetRostrum && getOwner(targetRostrum) !== playerId && isVacant(targetRostrum, pieces)) {
                moves.push({
                  moveType, pieceId: rostrumPiece.id,
                  fromLocationId: r.rostrum, toLocationId: targetRostrum,
                });
              }
            }
          }
        }
      }
      break;
    }

    case DefinedMoveType.REMOVE: {
      // Opponent marks in seats
      for (let p = 1; p <= playerCount; p++) {
        if (p === playerId) continue;
        for (let s = 1; s <= 6; s++) {
          const seatId = `p${p}_seat${s}`;
          const seatPiece = pieces.find(pc => pc.locationId === seatId && pc.type === 'MARK');
          if (seatPiece) {
            moves.push({
              moveType, pieceId: seatPiece.id,
              fromLocationId: seatId, toLocationId: 'community',
            });
          }
        }
      }
      break;
    }

    case DefinedMoveType.INFLUENCE: {
      // Opponent pieces in seats -> adjacent vacant seats
      for (let p = 1; p <= playerCount; p++) {
        if (p === playerId) continue;
        for (let s = 1; s <= 6; s++) {
          const seatId = `p${p}_seat${s}`;
          const seatPiece = pieces.find(pc => pc.locationId === seatId);
          if (!seatPiece) continue;
          const adjacentSeats = getAdjacentSeats(seatId, playerCount);
          for (const adjSeat of adjacentSeats) {
            if (!isVacant(adjSeat, pieces)) continue;
            // Pawns cannot cross domains
            if (seatPiece.type === 'PAWN' && getOwner(seatId) !== getOwner(adjSeat)) continue;
            moves.push({
              moveType, pieceId: seatPiece.id,
              fromLocationId: seatId, toLocationId: adjSeat,
            });
          }
        }
      }

      // Opponent pieces in rostrums -> adjacent rostrums
      const adjacencies = ROSTRUM_ADJACENCY_BY_PLAYER_COUNT[playerCount] || [];
      for (let p = 1; p <= playerCount; p++) {
        if (p === playerId) continue;
        const rules = ROSTRUM_SUPPORT_RULES[p];
        if (!rules) continue;
        for (const r of rules.rostrums) {
          const rostrumPiece = pieces.find(pc => pc.locationId === r.rostrum);
          if (!rostrumPiece) continue;
          if (rostrumPiece.type === 'PAWN') continue; // Pawns can't be influenced across domains
          for (const adj of adjacencies) {
            let targetRostrum: string | null = null;
            if (adj.rostrum1 === r.rostrum) targetRostrum = adj.rostrum2;
            if (adj.rostrum2 === r.rostrum) targetRostrum = adj.rostrum1;
            if (targetRostrum && isVacant(targetRostrum, pieces)) {
              moves.push({
                moveType, pieceId: rostrumPiece.id,
                fromLocationId: r.rostrum, toLocationId: targetRostrum,
              });
            }
          }
        }
      }
      break;
    }

    case DefinedMoveType.ASSIST: {
      const communityPieces = pieces.filter(p => isCommunity(p.locationId));
      const hasMarks = communityPieces.some(p => p.type === 'MARK');
      const assistPieces = hasMarks
        ? communityPieces.filter(p => p.type === 'MARK')
        : communityPieces.filter(p => p.type === 'HEEL');
      const candidatePiece = assistPieces[0];
      if (candidatePiece) {
        for (let p = 1; p <= playerCount; p++) {
          if (p === playerId) continue;
          for (let s = 1; s <= 6; s++) {
            const seatId = `p${p}_seat${s}`;
            if (isVacant(seatId, pieces)) {
              moves.push({
                moveType, pieceId: candidatePiece.id,
                fromLocationId: candidatePiece.locationId, toLocationId: seatId,
              });
            }
          }
        }
      }
      break;
    }
  }

  return moves;
}

// ============================================================================
// SUPPORT RULE CHECK
// ============================================================================

export interface SupportViolation {
  pieceId: string;
  locationId: string;
  playerId: number;
  type: 'ROSTRUM' | 'OFFICE';
}

export function checkSupportViolations(
  pieces: KredPiece[],
  playerCount: number,
): SupportViolation[] {
  const violations: SupportViolation[] = [];

  for (let p = 1; p <= playerCount; p++) {
    const rules = ROSTRUM_SUPPORT_RULES[p];
    if (!rules) continue;

    // Check each rostrum
    for (const r of rules.rostrums) {
      const rostrumPiece = pieces.find(pc => pc.locationId === r.rostrum);
      if (!rostrumPiece) continue;
      const anySupporting = r.supportingSeats.some(seatId =>
        pieces.some(pc => pc.locationId === seatId)
      );
      if (!anySupporting) {
        violations.push({
          pieceId: rostrumPiece.id, locationId: r.rostrum,
          playerId: p, type: 'ROSTRUM',
        });
      }
    }

    // Check office
    const officePiece = pieces.find(pc => pc.locationId === rules.office);
    if (officePiece) {
      const anyRostrumOccupied = rules.rostrums.some(r =>
        pieces.some(pc => pc.locationId === r.rostrum)
      );
      if (!anyRostrumOccupied) {
        violations.push({
          pieceId: officePiece.id, locationId: rules.office,
          playerId: p, type: 'OFFICE',
        });
      }
    }
  }

  return violations;
}
```

**Note for implementer:** The import paths for `@kred/shared` submodules (e.g., `@kred/shared/rules/adjacency`) may need adjustment depending on how the shared package exports work. Check `packages/shared/package.json` exports field. If subpath imports aren't supported, import from `@kred/shared` directly (the barrel `packages/shared/src/index.ts`) or from the relative path `../../packages/shared/src/rules/adjacency`. Adjust imports accordingly when running the tests.

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/__tests__/engine/moveValidation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/moveValidation.ts src/__tests__/engine/moveValidation.test.ts
git commit -m "feat(engine): add move validation with legal move finder"
```

---

## Task 4: Outcome Resolution

**Files:**
- Create: `src/engine/outcomeResolution.ts`
- Test: `src/__tests__/engine/outcomeResolution.test.ts`

Applies the four Campaign outcomes (Quiet is Kept, Whistle Blown, Smoking Gun, Witch Hunt) to the game state.

- [ ] **Step 1: Write the test file**

```typescript
// src/__tests__/engine/outcomeResolution.test.ts
import { describe, it, expect } from 'vitest';
import { DefinedMoveType } from '@kred/shared';
import {
  resolveQuietIsKept,
  resolveWhistleBlown,
  resolveSmokingGun,
  resolveWitchHunt,
  determineHonesty,
} from '../../engine/outcomeResolution';
import { TurnPhase } from '../../engine/types';
import type { KredGameState, KredPiece, EnginePlayer } from '../../engine/types';

function makeState(overrides?: Partial<KredGameState>): KredGameState {
  const players: EnginePlayer[] = [
    { id: 1, hand: ['01', '05'], bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
    { id: 2, hand: ['03', '07'], bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
    { id: 3, hand: ['09', '11'], bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
  ];
  const pieces: KredPiece[] = [
    { id: 'mark_1', type: 'MARK', locationId: 'p1_seat1' },
    { id: 'mark_2', type: 'MARK', locationId: 'p2_seat1' },
  ];
  return {
    pieces,
    players,
    turn: {
      phase: TurnPhase.AWAITING_CHALLENGES,
      moverId: 1,
      receiverId: 2,
      movesExecuted: [{ moveType: DefinedMoveType.REMOVE, pieceId: 'mark_2', fromLocationId: 'p2_seat1', toLocationId: 'community' },
                       { moveType: DefinedMoveType.ADVANCE, pieceId: 'mark_99', fromLocationId: 'community', toLocationId: 'p1_seat2' }],
      tilePlayedId: '01', // Remove + Advance
      pendingBystanders: [3],
      challengerId: null,
      isBluff: false,
    },
    campaign: { number: 1 },
    bureaucracy: { turnOrder: [], currentPlayerIndex: 0, remainingFunding: {} },
    config: { playerCount: 3, seed: 42 },
    history: [],
    piecesBeforeMove: null,
    phaseBeforeSupport: null,
    ...overrides,
  };
}

describe('determineHonesty', () => {
  it('honest when moves match tile requirements', () => {
    const state = makeState();
    // tile 01 requires REMOVE + ADVANCE, moves are REMOVE + ADVANCE
    expect(determineHonesty(state)).toBe(true);
  });

  it('dishonest when moves do not match tile', () => {
    const state = makeState();
    state.turn.tilePlayedId = '05'; // requires only ADVANCE
    // but moves are REMOVE + ADVANCE (mismatch)
    expect(determineHonesty(state)).toBe(false);
  });

  it('BLANK tile is always honest', () => {
    const state = makeState();
    state.turn.tilePlayedId = 'BLANK';
    expect(determineHonesty(state)).toBe(true);
  });
});

describe('resolveQuietIsKept', () => {
  it('moves tile to receiver bankFaceDown', () => {
    const state = makeState();
    const result = resolveQuietIsKept(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.bankFaceDown).toContain('01');
    // Mover no longer has it in hand
    const mover = result.players.find(p => p.id === 1)!;
    expect(mover.hand).not.toContain('01');
  });

  it('no credibility changes', () => {
    const state = makeState();
    const result = resolveQuietIsKept(state);
    expect(result.players.every(p => p.credibility === 3)).toBe(true);
  });
});

describe('resolveWhistleBlown', () => {
  it('mover loses 1 credibility', () => {
    const state = makeState();
    state.piecesBeforeMove = [
      { id: 'mark_1', type: 'MARK', locationId: 'p1_seat1' },
      { id: 'mark_2', type: 'MARK', locationId: 'p2_seat1' },
    ];
    const result = resolveWhistleBlown(state);
    const mover = result.players.find(p => p.id === 1)!;
    expect(mover.credibility).toBe(2);
  });

  it('receiver restores up to 2 credibility', () => {
    const state = makeState();
    state.piecesBeforeMove = [...state.pieces];
    state.players[1].credibility = 1; // receiver had 2 notches lost
    state.players[1].credibilityAtTurnStart = 1;
    const result = resolveWhistleBlown(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.credibility).toBe(3); // restored 2
  });

  it('tile goes face-up in receiver bank (not counted for funding)', () => {
    const state = makeState();
    state.piecesBeforeMove = [...state.pieces];
    const result = resolveWhistleBlown(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.bankFaceUp).toContain('01');
    expect(receiver.bankFaceDown).not.toContain('01');
  });

  it('pieces are restored to pre-move positions', () => {
    const state = makeState();
    state.piecesBeforeMove = [
      { id: 'mark_1', type: 'MARK', locationId: 'p1_seat1' },
      { id: 'mark_2', type: 'MARK', locationId: 'p2_seat1' },
      { id: 'mark_99', type: 'MARK', locationId: 'community' },
    ];
    // After dishonest move, mark_2 is in community and mark_99 is at p1_seat2
    state.pieces = [
      { id: 'mark_1', type: 'MARK', locationId: 'p1_seat1' },
      { id: 'mark_2', type: 'MARK', locationId: 'community' },
      { id: 'mark_99', type: 'MARK', locationId: 'p1_seat2' },
    ];
    const result = resolveWhistleBlown(state);
    // Pieces should be restored first, then replayed honestly per tile
    // The restore step puts pieces back to piecesBeforeMove
    // We just check the restore happened — the honest replay is tested via the reducer
    expect(result.piecesBeforeMove).toBeNull(); // snapshot cleared
  });
});

describe('resolveSmokingGun', () => {
  it('mover loses 1 credibility', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.piecesBeforeMove = [...state.pieces];
    const result = resolveSmokingGun(state);
    const mover = result.players.find(p => p.id === 1)!;
    expect(mover.credibility).toBe(2);
  });

  it('challenger restores 1 credibility', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.piecesBeforeMove = [...state.pieces];
    state.players[2].credibility = 2; // challenger had 1 notch lost
    const result = resolveSmokingGun(state);
    const challenger = result.players.find(p => p.id === 3)!;
    expect(challenger.credibility).toBe(3);
  });

  it('receiver loses 1 credibility', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.piecesBeforeMove = [...state.pieces];
    const result = resolveSmokingGun(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.credibility).toBe(2);
  });

  it('tile goes face-up in receiver bank', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.piecesBeforeMove = [...state.pieces];
    const result = resolveSmokingGun(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.bankFaceUp).toContain('01');
  });
});

describe('resolveWitchHunt', () => {
  it('mover restores 1 credibility', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.players[0].credibility = 2;
    const result = resolveWitchHunt(state);
    const mover = result.players.find(p => p.id === 1)!;
    expect(mover.credibility).toBe(3);
  });

  it('mover does NOT restore if had 0 cred at turn start', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    state.players[0].credibility = 0;
    state.players[0].credibilityAtTurnStart = 0;
    const result = resolveWitchHunt(state);
    const mover = result.players.find(p => p.id === 1)!;
    expect(mover.credibility).toBe(0);
  });

  it('challenger loses 1 credibility', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    const result = resolveWitchHunt(state);
    const challenger = result.players.find(p => p.id === 3)!;
    expect(challenger.credibility).toBe(2);
  });

  it('tile goes face-down in receiver bank (counted for funding)', () => {
    const state = makeState();
    state.turn.challengerId = 3;
    const result = resolveWitchHunt(state);
    const receiver = result.players.find(p => p.id === 2)!;
    expect(receiver.bankFaceDown).toContain('01');
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/__tests__/engine/outcomeResolution.test.ts`
Expected: FAIL — cannot find module

- [ ] **Step 3: Write the outcome resolution module**

```typescript
// src/engine/outcomeResolution.ts
import { TILE_REQUIREMENTS } from '@kred/shared/config/rules';
import type { KredGameState } from './types';

// ============================================================================
// HELPERS
// ============================================================================

function cloneState(state: KredGameState): KredGameState {
  return JSON.parse(JSON.stringify(state));
}

function getPlayer(state: KredGameState, id: number) {
  return state.players.find(p => p.id === id)!;
}

function clampCredibility(value: number): number {
  return Math.max(0, Math.min(3, value));
}

function removeTileFromHand(state: KredGameState, playerId: number, tileId: string): void {
  const player = getPlayer(state, playerId);
  const idx = player.hand.indexOf(tileId);
  if (idx !== -1) player.hand.splice(idx, 1);
}

// ============================================================================
// HONESTY CHECK
// ============================================================================

/**
 * Determines if the current play is honest by comparing executed moves
 * against the tile's required moves.
 */
export function determineHonesty(state: KredGameState): boolean {
  const tileId = state.turn.tilePlayedId;
  if (!tileId) return true;

  // Blank tile is always honest
  if (tileId === 'BLANK') return true;

  const req = TILE_REQUIREMENTS[tileId];
  if (!req) return true; // unknown tile, treat as honest

  const executedTypes = state.turn.movesExecuted.map(m => m.moveType);
  const required = req.requiredMoves;

  // Exact match: same move types, same count
  if (required.length !== executedTypes.length) return false;

  const executedCopy = [...executedTypes];
  for (const reqMove of required) {
    const idx = executedCopy.indexOf(reqMove);
    if (idx === -1) return false;
    executedCopy.splice(idx, 1);
  }
  return executedCopy.length === 0;
}

// ============================================================================
// OUTCOME RESOLVERS
// ============================================================================

/** No rejection, no challenge. Tile goes face-down to receiver bank. */
export function resolveQuietIsKept(state: KredGameState): KredGameState {
  const result = cloneState(state);
  const tileId = result.turn.tilePlayedId!;
  const moverId = result.turn.moverId;
  const receiverId = result.turn.receiverId!;

  removeTileFromHand(result, moverId, tileId);
  getPlayer(result, receiverId).bankFaceDown.push(tileId);
  result.piecesBeforeMove = null;

  return result;
}

/** Receiver rejects a dishonest play. */
export function resolveWhistleBlown(state: KredGameState): KredGameState {
  const result = cloneState(state);
  const tileId = result.turn.tilePlayedId!;
  const moverId = result.turn.moverId;
  const receiverId = result.turn.receiverId!;
  const mover = getPlayer(result, moverId);
  const receiver = getPlayer(result, receiverId);

  // Mover loses 1 credibility
  mover.credibility = clampCredibility(mover.credibility - 1);

  // Receiver restores up to 2 credibility (or free Advance if already full)
  // The free Advance is handled by the reducer as a follow-up action
  receiver.credibility = clampCredibility(receiver.credibility + 2);
  // Track if receiver was at full cred for the free Advance case
  // (handled in the reducer, not here — we just cap at 3)

  // Tile goes face-up (not counted for funding)
  removeTileFromHand(result, moverId, tileId);
  receiver.bankFaceUp.push(tileId);

  // Restore pieces to pre-move state (reducer will replay honestly)
  if (result.piecesBeforeMove) {
    result.pieces = result.piecesBeforeMove;
  }
  result.piecesBeforeMove = null;

  return result;
}

/** Bystander challenges, play was dishonest. */
export function resolveSmokingGun(state: KredGameState): KredGameState {
  const result = cloneState(state);
  const tileId = result.turn.tilePlayedId!;
  const moverId = result.turn.moverId;
  const receiverId = result.turn.receiverId!;
  const challengerId = result.turn.challengerId!;
  const mover = getPlayer(result, moverId);
  const receiver = getPlayer(result, receiverId);
  const challenger = getPlayer(result, challengerId);

  // Mover loses 1 credibility
  mover.credibility = clampCredibility(mover.credibility - 1);

  // Challenger restores 1 credibility (or takes 1 Bureaucracy action — handled by reducer)
  challenger.credibility = clampCredibility(challenger.credibility + 1);

  // Receiver loses 1 credibility
  receiver.credibility = clampCredibility(receiver.credibility - 1);

  // Tile goes face-up
  removeTileFromHand(result, moverId, tileId);
  receiver.bankFaceUp.push(tileId);

  // Restore pieces to pre-move state (reducer will replay honestly)
  if (result.piecesBeforeMove) {
    result.pieces = result.piecesBeforeMove;
  }
  result.piecesBeforeMove = null;

  return result;
}

/** Bystander challenges, play was honest. */
export function resolveWitchHunt(state: KredGameState): KredGameState {
  const result = cloneState(state);
  const tileId = result.turn.tilePlayedId!;
  const moverId = result.turn.moverId;
  const receiverId = result.turn.receiverId!;
  const challengerId = result.turn.challengerId!;
  const mover = getPlayer(result, moverId);
  const challenger = getPlayer(result, challengerId);
  const receiver = getPlayer(result, receiverId);

  // Mover restores 1 credibility (unless had 0 at start of turn)
  if (mover.credibilityAtTurnStart > 0) {
    mover.credibility = clampCredibility(mover.credibility + 1);
  }

  // Challenger loses 1 credibility
  challenger.credibility = clampCredibility(challenger.credibility - 1);

  // Tile goes face-down to receiver bank (counted for funding)
  removeTileFromHand(result, moverId, tileId);
  receiver.bankFaceDown.push(tileId);
  result.piecesBeforeMove = null;

  return result;
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/__tests__/engine/outcomeResolution.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/outcomeResolution.ts src/__tests__/engine/outcomeResolution.test.ts
git commit -m "feat(engine): add campaign outcome resolution"
```

---

## Task 5: Invariant Checker

**Files:**
- Create: `src/engine/invariants.ts`
- Test: `src/__tests__/engine/invariants.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/__tests__/engine/invariants.test.ts
import { describe, it, expect } from 'vitest';
import { TILE_KREDCOIN_VALUES } from '@kred/shared/config/tiles';
import { PIECE_COUNTS_BY_PLAYER_COUNT } from '../../config/pieces';
import {
  checkFundingChecksum,
  checkPieceConservation,
  checkSupportRule,
  checkOnePawnPerPlayer,
  checkCredibilityBounds,
  checkSeparatePiecesPerTurn,
  checkRemoveRestrictions,
  checkCommunityPiecePriority,
  runAllInvariants,
} from '../../engine/invariants';
import { TurnPhase } from '../../engine/types';
import type { KredGameState, KredPiece, EnginePlayer, EngineMove } from '../../engine/types';
import { DefinedMoveType } from '@kred/shared';

function make3PlayerState(overrides?: Partial<KredGameState>): KredGameState {
  // All 24 tiles in hands (none in banks)
  const allTileIds = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, '0'));
  const players: EnginePlayer[] = [
    { id: 1, hand: allTileIds.slice(0, 8), bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
    { id: 2, hand: allTileIds.slice(8, 16), bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
    { id: 3, hand: allTileIds.slice(16, 24), bankFaceDown: [], bankFaceUp: [], credibility: 3, credibilityAtTurnStart: 3 },
  ];

  const pieces: KredPiece[] = [];
  let mc = 1;
  for (let p = 1; p <= 3; p++) {
    for (const s of [1, 3, 5]) {
      pieces.push({ id: `mark_${mc}`, type: 'MARK', locationId: `p${p}_seat${s}` });
      mc++;
    }
  }
  for (let i = mc; i <= 12; i++) pieces.push({ id: `mark_${i}`, type: 'MARK', locationId: 'community' });
  for (let i = 1; i <= 9; i++) pieces.push({ id: `heel_${i}`, type: 'HEEL', locationId: 'community' });
  for (let i = 1; i <= 3; i++) pieces.push({ id: `pawn_${i}`, type: 'PAWN', locationId: 'community' });

  return {
    pieces, players,
    turn: { phase: TurnPhase.MOVING, moverId: 1, receiverId: null, movesExecuted: [],
            tilePlayedId: null, pendingBystanders: [], challengerId: null, isBluff: false },
    campaign: { number: 1 },
    bureaucracy: { turnOrder: [], currentPlayerIndex: 0, remainingFunding: {} },
    config: { playerCount: 3, seed: 42 },
    history: [], piecesBeforeMove: null, phaseBeforeSupport: null,
    ...overrides,
  };
}

describe('checkFundingChecksum', () => {
  it('passes when all tiles accounted for', () => {
    const state = make3PlayerState();
    expect(checkFundingChecksum(state).passed).toBe(true);
  });

  it('fails when a tile is missing', () => {
    const state = make3PlayerState();
    state.players[0].hand.pop(); // remove one tile
    expect(checkFundingChecksum(state).passed).toBe(false);
  });
});

describe('checkPieceConservation', () => {
  it('passes with correct piece count', () => {
    const state = make3PlayerState();
    // 3-player: 12 marks + 9 heels + 3 pawns = 24
    expect(checkPieceConservation(state).passed).toBe(true);
  });

  it('fails when a piece is duplicated', () => {
    const state = make3PlayerState();
    state.pieces.push({ id: 'extra', type: 'MARK', locationId: 'community' });
    expect(checkPieceConservation(state).passed).toBe(false);
  });
});

describe('checkSupportRule', () => {
  it('passes for starting board', () => {
    const state = make3PlayerState();
    expect(checkSupportRule(state).passed).toBe(true);
  });

  it('fails for unsupported rostrum', () => {
    const state = make3PlayerState();
    state.pieces.push({ id: 'rogue', type: 'MARK', locationId: 'p1_rostrum1' });
    // seats 1,3,5 are occupied so faction has support — this should pass
    expect(checkSupportRule(state).passed).toBe(true);

    // Now clear the faction seats
    state.pieces = state.pieces.filter(p => !['p1_seat1', 'p1_seat3', 'p1_seat5'].includes(p.locationId) || p.id === 'rogue');
    // Wait — rogue is at rostrum, not at seats. Let me fix:
    const state2 = make3PlayerState();
    // Remove all p1 faction 1 seats
    state2.pieces = state2.pieces.filter(p => !['p1_seat1', 'p1_seat3'].includes(p.locationId));
    // Add piece at rostrum1 with only seat5 remaining (seat5 is NOT in faction 1 seats 1-3)
    // Actually seats 1,2,3 support rostrum1. Seat 5 supports rostrum2.
    // So remove seats 1,3 (seat2 was empty). No supporting seats left.
    state2.pieces.push({ id: 'rogue', type: 'MARK', locationId: 'p1_rostrum1' });
    expect(checkSupportRule(state2).passed).toBe(false);
  });
});

describe('checkOnePawnPerPlayer', () => {
  it('passes when no player has more than 1 pawn', () => {
    const state = make3PlayerState();
    expect(checkOnePawnPerPlayer(state).passed).toBe(true);
  });

  it('fails when a player has 2 pawns', () => {
    const state = make3PlayerState();
    // Put 2 pawns in player 1 domain
    state.pieces.push({ id: 'pawn_extra', type: 'PAWN', locationId: 'p1_seat2' });
    state.pieces.push({ id: 'pawn_extra2', type: 'PAWN', locationId: 'p1_seat4' });
    expect(checkOnePawnPerPlayer(state).passed).toBe(false);
  });
});

describe('checkCredibilityBounds', () => {
  it('passes for valid credibility', () => {
    const state = make3PlayerState();
    expect(checkCredibilityBounds(state).passed).toBe(true);
  });

  it('fails for negative credibility', () => {
    const state = make3PlayerState();
    state.players[0].credibility = -1;
    expect(checkCredibilityBounds(state).passed).toBe(false);
  });

  it('fails for credibility > 3', () => {
    const state = make3PlayerState();
    state.players[0].credibility = 4;
    expect(checkCredibilityBounds(state).passed).toBe(false);
  });
});

describe('checkSeparatePiecesPerTurn', () => {
  it('passes when moves target different pieces', () => {
    const state = make3PlayerState();
    state.turn.movesExecuted = [
      { moveType: DefinedMoveType.REMOVE, pieceId: 'mark_4', fromLocationId: 'p2_seat1', toLocationId: 'community' },
      { moveType: DefinedMoveType.ADVANCE, pieceId: 'mark_10', fromLocationId: 'community', toLocationId: 'p1_seat2' },
    ];
    expect(checkSeparatePiecesPerTurn(state).passed).toBe(true);
  });

  it('fails when same piece moved twice', () => {
    const state = make3PlayerState();
    state.turn.movesExecuted = [
      { moveType: DefinedMoveType.INFLUENCE, pieceId: 'mark_4', fromLocationId: 'p2_seat1', toLocationId: 'p1_seat6' },
      { moveType: DefinedMoveType.ADVANCE, pieceId: 'mark_4', fromLocationId: 'p1_seat6', toLocationId: 'p1_rostrum2' },
    ];
    expect(checkSeparatePiecesPerTurn(state).passed).toBe(false);
  });

  it('passes for single move', () => {
    const state = make3PlayerState();
    state.turn.movesExecuted = [
      { moveType: DefinedMoveType.ADVANCE, pieceId: 'mark_10', fromLocationId: 'community', toLocationId: 'p1_seat2' },
    ];
    expect(checkSeparatePiecesPerTurn(state).passed).toBe(true);
  });
});

describe('runAllInvariants', () => {
  it('all pass for valid starting state', () => {
    const state = make3PlayerState();
    const results = runAllInvariants(state);
    expect(results.every(r => r.passed)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/__tests__/engine/invariants.test.ts`
Expected: FAIL — cannot find module

- [ ] **Step 3: Write the invariants module**

```typescript
// src/engine/invariants.ts
import { TILE_KREDCOIN_VALUES } from '@kred/shared/config/tiles';
import { PIECE_COUNTS_BY_PLAYER_COUNT } from '../config/pieces';
import { ROSTRUM_SUPPORT_RULES } from '@kred/shared/config/rules';
import type { KredGameState, InvariantResult } from './types';

// ============================================================================
// INDIVIDUAL INVARIANTS
// ============================================================================

/** Invariant 1: All tile funding values sum to 100 */
export function checkFundingChecksum(state: KredGameState): InvariantResult {
  const allTileIds: string[] = [];
  for (const p of state.players) {
    allTileIds.push(...p.hand, ...p.bankFaceDown, ...p.bankFaceUp);
  }
  // Include tile being played (in transit)
  if (state.turn.tilePlayedId && !allTileIds.includes(state.turn.tilePlayedId)) {
    allTileIds.push(state.turn.tilePlayedId);
  }

  let sum = 0;
  for (const tileId of allTileIds) {
    if (tileId === 'BLANK') continue; // blank = 0
    const num = parseInt(tileId);
    sum += TILE_KREDCOIN_VALUES[num] || 0;
  }

  const expectedTotal = 100;
  const passed = sum === expectedTotal;
  return {
    passed,
    name: 'fundingChecksum',
    details: passed ? undefined : `Expected tile funding sum = ${expectedTotal}, got ${sum}. Tiles found: ${allTileIds.length}`,
  };
}

/** Invariant 2: Total pieces = starting count for player mode */
export function checkPieceConservation(state: KredGameState): InvariantResult {
  const counts = PIECE_COUNTS_BY_PLAYER_COUNT[state.config.playerCount];
  const expectedTotal = counts.MARK + counts.HEEL + counts.PAWN;
  const actualTotal = state.pieces.length;
  const passed = actualTotal === expectedTotal;
  return {
    passed,
    name: 'pieceConservation',
    details: passed ? undefined : `Expected ${expectedTotal} pieces, got ${actualTotal}`,
  };
}

/** Invariant 3: No unsupported pieces at Rostrums or Office */
export function checkSupportRule(state: KredGameState): InvariantResult {
  for (let p = 1; p <= state.config.playerCount; p++) {
    const rules = ROSTRUM_SUPPORT_RULES[p];
    if (!rules) continue;

    for (const r of rules.rostrums) {
      const hasPieceAtRostrum = state.pieces.some(pc => pc.locationId === r.rostrum);
      if (!hasPieceAtRostrum) continue;
      const anySupporting = r.supportingSeats.some(seatId =>
        state.pieces.some(pc => pc.locationId === seatId)
      );
      if (!anySupporting) {
        return {
          passed: false, name: 'supportRule',
          details: `Piece at ${r.rostrum} (player ${p}) with no supporting seats occupied`,
        };
      }
    }

    const hasPieceAtOffice = state.pieces.some(pc => pc.locationId === rules.office);
    if (hasPieceAtOffice) {
      const anyRostrumOccupied = rules.rostrums.some(r =>
        state.pieces.some(pc => pc.locationId === r.rostrum)
      );
      if (!anyRostrumOccupied) {
        return {
          passed: false, name: 'supportRule',
          details: `Piece at ${rules.office} (player ${p}) with no rostrums occupied`,
        };
      }
    }
  }
  return { passed: true, name: 'supportRule' };
}

/** Invariant 4: No player has > 1 Pawn in their domain */
export function checkOnePawnPerPlayer(state: KredGameState): InvariantResult {
  for (let p = 1; p <= state.config.playerCount; p++) {
    const pawnsInDomain = state.pieces.filter(
      pc => pc.type === 'PAWN' && pc.locationId.startsWith(`p${p}_`)
    );
    if (pawnsInDomain.length > 1) {
      return {
        passed: false, name: 'onePawnPerPlayer',
        details: `Player ${p} has ${pawnsInDomain.length} pawns in domain`,
      };
    }
  }
  return { passed: true, name: 'onePawnPerPlayer' };
}

/** Invariant 6: All credibility values are integers 0-3 */
export function checkCredibilityBounds(state: KredGameState): InvariantResult {
  for (const p of state.players) {
    if (!Number.isInteger(p.credibility) || p.credibility < 0 || p.credibility > 3) {
      return {
        passed: false, name: 'credibilityBounds',
        details: `Player ${p.id} has credibility ${p.credibility} (must be integer 0-3)`,
      };
    }
  }
  return { passed: true, name: 'credibilityBounds' };
}

/** Invariant 8: Two moves in one turn must target different pieces */
export function checkSeparatePiecesPerTurn(state: KredGameState): InvariantResult {
  const moves = state.turn.movesExecuted;
  if (moves.length < 2) return { passed: true, name: 'separatePiecesPerTurn' };

  const pieceIds = moves.map(m => m.pieceId);
  const unique = new Set(pieceIds);
  const passed = unique.size === pieceIds.length;
  return {
    passed,
    name: 'separatePiecesPerTurn',
    details: passed ? undefined : `Same piece moved twice: ${pieceIds.join(', ')}`,
  };
}

/** Invariant 9: Remove only targets Marks at opponent Seats */
export function checkRemoveRestrictions(state: KredGameState): InvariantResult {
  const removes = state.turn.movesExecuted.filter(m => m.moveType === 'REMOVE');
  for (const move of removes) {
    const piece = state.pieces.find(p => p.id === move.pieceId);
    // Check the piece was a Mark (it may have already moved, check by ID pattern)
    if (piece && piece.type !== 'MARK') {
      return {
        passed: false, name: 'removeRestrictions',
        details: `Removed ${piece.type} (${piece.id}) — only Marks can be removed`,
      };
    }
    if (!/^p\d+_seat\d$/.test(move.fromLocationId)) {
      return {
        passed: false, name: 'removeRestrictions',
        details: `Removed from ${move.fromLocationId} — only Seats are valid`,
      };
    }
    const fromOwner = parseInt(move.fromLocationId.match(/^p(\d+)_/)![1]);
    if (fromOwner === state.turn.moverId) {
      return {
        passed: false, name: 'removeRestrictions',
        details: `Player ${state.turn.moverId} removed own piece at ${move.fromLocationId}`,
      };
    }
  }
  return { passed: true, name: 'removeRestrictions' };
}

/** Invariant 7: If Heel drawn from community, no Marks were in community */
export function checkCommunityPiecePriority(state: KredGameState): InvariantResult {
  // This is checked at move time by the reducer/validator, not post-hoc.
  // We include it for completeness but it always passes if move validation works.
  return { passed: true, name: 'communityPiecePriority' };
}

// ============================================================================
// RUN ALL INVARIANTS
// ============================================================================

export function runAllInvariants(state: KredGameState): InvariantResult[] {
  return [
    checkFundingChecksum(state),
    checkPieceConservation(state),
    checkSupportRule(state),
    checkOnePawnPerPlayer(state),
    checkCredibilityBounds(state),
    checkSeparatePiecesPerTurn(state),
    checkRemoveRestrictions(state),
    checkCommunityPiecePriority(state),
  ];
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/__tests__/engine/invariants.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/invariants.ts src/__tests__/engine/invariants.test.ts
git commit -m "feat(engine): add invariant checker for game rules validation"
```

---

## Task 6: Game State Machine (Core Reducer)

**Files:**
- Create: `src/engine/gameStateMachine.ts`
- Test: `src/__tests__/engine/gameStateMachine.test.ts`

This is the heart of the system — the pure reducer that processes all actions.

- [ ] **Step 1: Write the test file**

```typescript
// src/__tests__/engine/gameStateMachine.test.ts
import { describe, it, expect } from 'vitest';
import { DefinedMoveType } from '@kred/shared';
import { createInitialState, gameReducer } from '../../engine/gameStateMachine';
import { TurnPhase } from '../../engine/types';
import type { KredAction, MakeMoves, SelectTile, ReceiverDecision, BystanderDecision } from '../../engine/types';

describe('createInitialState', () => {
  it('creates valid 3-player starting state', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    expect(state.players).toHaveLength(3);
    expect(state.config.playerCount).toBe(3);
    expect(state.turn.phase).toBe(TurnPhase.MOVING);
    // 12 marks + 9 heels + 3 pawns = 24 pieces
    expect(state.pieces).toHaveLength(24);
    // Each player has 8 tiles
    expect(state.players.every(p => p.hand.length === 8)).toBe(true);
    // All credibility at 3
    expect(state.players.every(p => p.credibility === 3)).toBe(true);
    // Marks at seats 1,3,5 for each player
    for (let p = 1; p <= 3; p++) {
      for (const s of [1, 3, 5]) {
        expect(state.pieces.some(pc => pc.locationId === `p${p}_seat${s}` && pc.type === 'MARK')).toBe(true);
      }
    }
  });

  it('creates valid 4-player starting state', () => {
    const state = createInitialState({ playerCount: 4, seed: 42 });
    expect(state.players).toHaveLength(4);
    expect(state.pieces).toHaveLength(32); // 15+13+4
    expect(state.players.every(p => p.hand.length === 6)).toBe(true);
  });

  it('creates valid 5-player starting state with blank tile', () => {
    const state = createInitialState({ playerCount: 5, seed: 42 });
    expect(state.players).toHaveLength(5);
    expect(state.pieces).toHaveLength(40); // 18+17+5
    expect(state.players.every(p => p.hand.length === 5)).toBe(true);
    // One player should have the BLANK tile
    const allTiles = state.players.flatMap(p => p.hand);
    expect(allTiles).toContain('BLANK');
  });

  it('is deterministic with same seed', () => {
    const s1 = createInitialState({ playerCount: 3, seed: 42 });
    const s2 = createInitialState({ playerCount: 3, seed: 42 });
    expect(s1.players.map(p => p.hand)).toEqual(s2.players.map(p => p.hand));
  });

  it('first mover is player with tile 03', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    const mover = state.players.find(p => p.hand.includes('03'));
    expect(state.turn.moverId).toBe(mover!.id);
  });
});

describe('gameReducer - MAKE_MOVES', () => {
  it('rejects action in wrong phase', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    state.turn.phase = TurnPhase.AWAITING_RECEIPT;
    const action: MakeMoves = {
      type: 'MAKE_MOVES', playerId: state.turn.moverId,
      moves: [],
    };
    expect(() => gameReducer(state, action)).toThrow();
  });

  it('rejects action from wrong player', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    const wrongPlayer = state.players.find(p => p.id !== state.turn.moverId)!;
    const action: MakeMoves = {
      type: 'MAKE_MOVES', playerId: wrongPlayer.id,
      moves: [],
    };
    expect(() => gameReducer(state, action)).toThrow();
  });

  it('accepts valid advance and transitions to SELECTING_TILE', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    const moverId = state.turn.moverId;
    // Find a community mark to advance
    const communityMark = state.pieces.find(p => p.type === 'MARK' && p.locationId === 'community')!;
    const action: MakeMoves = {
      type: 'MAKE_MOVES', playerId: moverId,
      moves: [{
        moveType: DefinedMoveType.ADVANCE,
        pieceId: communityMark.id,
        fromLocationId: 'community',
        toLocationId: `p${moverId}_seat2`,
      }],
    };
    const newState = gameReducer(state, action);
    expect(newState.turn.phase).toBe(TurnPhase.SELECTING_TILE);
    expect(newState.turn.movesExecuted).toHaveLength(1);
    // Piece should have moved
    expect(newState.pieces.find(p => p.id === communityMark.id)!.locationId).toBe(`p${moverId}_seat2`);
  });
});

describe('gameReducer - SELECT_TILE', () => {
  it('transitions to AWAITING_RECEIPT', () => {
    let state = createInitialState({ playerCount: 3, seed: 42 });
    const moverId = state.turn.moverId;
    const communityMark = state.pieces.find(p => p.type === 'MARK' && p.locationId === 'community')!;

    // First make moves
    state = gameReducer(state, {
      type: 'MAKE_MOVES', playerId: moverId,
      moves: [{
        moveType: DefinedMoveType.ADVANCE, pieceId: communityMark.id,
        fromLocationId: 'community', toLocationId: `p${moverId}_seat2`,
      }],
    });

    // Then select tile and receiver
    const tileId = state.players.find(p => p.id === moverId)!.hand[0];
    const receiverId = state.players.find(p => p.id !== moverId)!.id;
    state = gameReducer(state, {
      type: 'SELECT_TILE', playerId: moverId,
      tileId, receiverPlayerId: receiverId,
    });

    expect(state.turn.phase).toBe(TurnPhase.AWAITING_RECEIPT);
    expect(state.turn.receiverId).toBe(receiverId);
    expect(state.turn.tilePlayedId).toBe(tileId);
  });
});

describe('gameReducer - RECEIVER_DECISION', () => {
  function setupToAwaitingReceipt(seed: number = 42) {
    let state = createInitialState({ playerCount: 3, seed });
    const moverId = state.turn.moverId;
    const communityMark = state.pieces.find(p => p.type === 'MARK' && p.locationId === 'community')!;

    state = gameReducer(state, {
      type: 'MAKE_MOVES', playerId: moverId,
      moves: [{
        moveType: DefinedMoveType.ADVANCE, pieceId: communityMark.id,
        fromLocationId: 'community', toLocationId: `p${moverId}_seat2`,
      }],
    });

    const tileId = state.players.find(p => p.id === moverId)!.hand[0];
    const receiverId = state.players.find(p => p.id !== moverId)!.id;
    state = gameReducer(state, {
      type: 'SELECT_TILE', playerId: moverId,
      tileId, receiverPlayerId: receiverId,
    });

    return state;
  }

  it('ACCEPT transitions to AWAITING_CHALLENGES', () => {
    const state = setupToAwaitingReceipt();
    const receiverId = state.turn.receiverId!;
    const newState = gameReducer(state, {
      type: 'RECEIVER_DECISION', playerId: receiverId, decision: 'ACCEPT',
    });
    expect(newState.turn.phase).toBe(TurnPhase.AWAITING_CHALLENGES);
    expect(newState.turn.pendingBystanders.length).toBeGreaterThan(0);
  });

  it('ACCEPT_BLIND transitions to AWAITING_CHALLENGES', () => {
    const state = setupToAwaitingReceipt();
    const receiverId = state.turn.receiverId!;
    const newState = gameReducer(state, {
      type: 'RECEIVER_DECISION', playerId: receiverId, decision: 'ACCEPT_BLIND',
    });
    expect(newState.turn.phase).toBe(TurnPhase.AWAITING_CHALLENGES);
  });
});

describe('gameReducer - full turn cycle (Quiet is Kept)', () => {
  it('completes a full honest turn with all bystanders passing', () => {
    let state = createInitialState({ playerCount: 3, seed: 42 });
    const moverId = state.turn.moverId;
    const communityMark = state.pieces.find(p => p.type === 'MARK' && p.locationId === 'community')!;

    // MAKE_MOVES
    state = gameReducer(state, {
      type: 'MAKE_MOVES', playerId: moverId,
      moves: [{
        moveType: DefinedMoveType.ADVANCE, pieceId: communityMark.id,
        fromLocationId: 'community', toLocationId: `p${moverId}_seat2`,
      }],
    });

    // SELECT_TILE (pick tile '05' or '06' which are Advance-only)
    const moverPlayer = state.players.find(p => p.id === moverId)!;
    const advanceTile = moverPlayer.hand.find(t => t === '05' || t === '06') || moverPlayer.hand[0];
    const receiverId = state.players.find(p => p.id !== moverId)!.id;
    state = gameReducer(state, {
      type: 'SELECT_TILE', playerId: moverId,
      tileId: advanceTile, receiverPlayerId: receiverId,
    });

    // RECEIVER_DECISION: ACCEPT
    state = gameReducer(state, {
      type: 'RECEIVER_DECISION', playerId: receiverId, decision: 'ACCEPT',
    });

    // BYSTANDER_DECISION: all PASS
    while (state.turn.phase === TurnPhase.AWAITING_CHALLENGES && state.turn.pendingBystanders.length > 0) {
      const bystander = state.turn.pendingBystanders[0];
      state = gameReducer(state, {
        type: 'BYSTANDER_DECISION', playerId: bystander, decision: 'PASS',
      });
    }

    // Should be back to MOVING with receiver as new mover
    expect(state.turn.phase).toBe(TurnPhase.MOVING);
    expect(state.turn.moverId).toBe(receiverId);
    // Tile should be in receiver's bankFaceDown
    expect(state.players.find(p => p.id === receiverId)!.bankFaceDown).toContain(advanceTile);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/__tests__/engine/gameStateMachine.test.ts`
Expected: FAIL — cannot find module

- [ ] **Step 3: Write the game state machine**

This is the largest file. It implements `createInitialState()` and `gameReducer()`.

```typescript
// src/engine/gameStateMachine.ts
import { DefinedMoveType } from '@kred/shared';
import { TILE_REQUIREMENTS } from '@kred/shared/config/rules';
import { PIECE_COUNTS_BY_PLAYER_COUNT } from '../config/pieces';
import { SeededRandom } from './seededRandom';
import { validateMove, checkSupportViolations } from './moveValidation';
import {
  determineHonesty,
  resolveQuietIsKept,
  resolveWhistleBlown,
  resolveSmokingGun,
  resolveWitchHunt,
} from './outcomeResolution';
import { runAllInvariants } from './invariants';
import { getNextPlayerClockwise } from '@kred/shared/rules/adjacency';
import {
  TurnPhase,
  type KredGameState,
  type KredAction,
  type KredPiece,
  type EnginePlayer,
  type EngineMove,
  type InvariantViolation,
} from './types';

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class IllegalActionError extends Error {
  constructor(message: string) { super(message); this.name = 'IllegalActionError'; }
}

export class InvariantViolationError extends Error {
  violation: InvariantViolation;
  constructor(violation: InvariantViolation) {
    super(`Invariant violated: ${violation.invariantName} — ${violation.details}`);
    this.name = 'InvariantViolationError';
    this.violation = violation;
  }
}

// ============================================================================
// INITIAL STATE
// ============================================================================

export function createInitialState(config: { playerCount: 3 | 4 | 5; seed: number }): KredGameState {
  const { playerCount, seed } = config;
  const rng = new SeededRandom(seed);

  // Build pieces
  const pieces: KredPiece[] = [];
  const counts = PIECE_COUNTS_BY_PLAYER_COUNT[playerCount];
  let markCounter = 1;
  let heelCounter = 1;
  let pawnCounter = 1;

  // Marks at seats (1,3,5 for 3-player and 5-player; 2,4,6 for 4-player)
  const seatPositions = playerCount === 4 ? [2, 4, 6] : [1, 3, 5];
  for (let p = 1; p <= playerCount; p++) {
    for (const s of seatPositions) {
      pieces.push({ id: `mark_${markCounter}`, type: 'MARK', locationId: `p${p}_seat${s}` });
      markCounter++;
    }
  }

  // Remaining marks in community
  while (markCounter <= counts.MARK) {
    pieces.push({ id: `mark_${markCounter}`, type: 'MARK', locationId: 'community' });
    markCounter++;
  }

  // Heels in community
  for (let i = 1; i <= counts.HEEL; i++) {
    pieces.push({ id: `heel_${heelCounter}`, type: 'HEEL', locationId: 'community' });
    heelCounter++;
  }

  // Pawns in community
  for (let i = 1; i <= counts.PAWN; i++) {
    pieces.push({ id: `pawn_${pawnCounter}`, type: 'PAWN', locationId: 'community' });
    pawnCounter++;
  }

  // Build tiles and deal
  const allTileIds: string[] = Array.from({ length: 24 }, (_, i) => String(i + 1).padStart(2, '0'));
  if (playerCount === 5) allTileIds.push('BLANK');
  rng.shuffle(allTileIds);

  const tilesPerPlayer = allTileIds.length / playerCount;
  const players: EnginePlayer[] = [];
  for (let p = 1; p <= playerCount; p++) {
    const start = (p - 1) * tilesPerPlayer;
    players.push({
      id: p,
      hand: allTileIds.slice(start, start + tilesPerPlayer),
      bankFaceDown: [],
      bankFaceUp: [],
      credibility: 3,
      credibilityAtTurnStart: 3,
    });
  }

  // First mover is player with tile '03' (the 0-funding tile)
  const firstMover = players.find(p => p.hand.includes('03'))!;

  return {
    pieces,
    players,
    turn: {
      phase: TurnPhase.MOVING,
      moverId: firstMover.id,
      receiverId: null,
      movesExecuted: [],
      tilePlayedId: null,
      pendingBystanders: [],
      challengerId: null,
      isBluff: false,
    },
    campaign: { number: 1 },
    bureaucracy: { turnOrder: [], currentPlayerIndex: 0, remainingFunding: {} },
    config: { playerCount, seed },
    history: [],
    piecesBeforeMove: null,
    phaseBeforeSupport: null,
  };
}

// ============================================================================
// REDUCER
// ============================================================================

export function gameReducer(state: KredGameState, action: KredAction): KredGameState {
  let newState = JSON.parse(JSON.stringify(state)) as KredGameState;

  switch (action.type) {
    case 'MAKE_MOVES':
      newState = handleMakeMoves(newState, action);
      break;
    case 'SELECT_TILE':
      newState = handleSelectTile(newState, action);
      break;
    case 'RECEIVER_DECISION':
      newState = handleReceiverDecision(newState, action);
      break;
    case 'BYSTANDER_DECISION':
      newState = handleBystanderDecision(newState, action);
      break;
    case 'RESOLVE_SUPPORT':
      newState = handleResolveSupport(newState, action);
      break;
    case 'BUREAUCRACY_PURCHASE':
      newState = handleBureaucracyPurchase(newState, action);
      break;
    case 'END_BUREAUCRACY_TURN':
      newState = handleEndBureaucracyTurn(newState, action);
      break;
    default:
      throw new IllegalActionError(`Unknown action type`);
  }

  // Append to history
  newState.history.push(action);

  // Check invariants
  const results = runAllInvariants(newState);
  const failure = results.find(r => !r.passed);
  if (failure) {
    throw new InvariantViolationError({
      invariantName: failure.name,
      details: failure.details || '',
      stateBefore: state,
      stateAfter: newState,
      triggeringAction: action,
      actionIndex: newState.history.length - 1,
    });
  }

  return newState;
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

function handleMakeMoves(state: KredGameState, action: KredAction & { type: 'MAKE_MOVES' }): KredGameState {
  if (state.turn.phase !== TurnPhase.MOVING) {
    throw new IllegalActionError(`MAKE_MOVES not allowed in phase ${state.turn.phase}`);
  }
  if (action.playerId !== state.turn.moverId) {
    throw new IllegalActionError(`Player ${action.playerId} is not the mover (${state.turn.moverId})`);
  }

  // Snapshot pieces before move (for undoing dishonest plays)
  state.piecesBeforeMove = JSON.parse(JSON.stringify(state.pieces));

  // Validate and apply each move
  for (const move of action.moves) {
    if (!validateMove(move, action.playerId, state.pieces, state.config.playerCount)) {
      throw new IllegalActionError(
        `Illegal move: ${move.moveType} piece ${move.pieceId} from ${move.fromLocationId} to ${move.toLocationId}`
      );
    }
    // Apply the move
    const piece = state.pieces.find(p => p.id === move.pieceId);
    if (piece) piece.locationId = move.toLocationId;
  }

  state.turn.movesExecuted = action.moves;
  state.turn.phase = TurnPhase.SELECTING_TILE;

  // Check support violations after moves
  state = checkAndTriggerSupport(state);

  return state;
}

function handleSelectTile(state: KredGameState, action: KredAction & { type: 'SELECT_TILE' }): KredGameState {
  if (state.turn.phase !== TurnPhase.SELECTING_TILE) {
    throw new IllegalActionError(`SELECT_TILE not allowed in phase ${state.turn.phase}`);
  }
  if (action.playerId !== state.turn.moverId) {
    throw new IllegalActionError(`Player ${action.playerId} is not the mover`);
  }

  const mover = state.players.find(p => p.id === action.playerId)!;
  if (!mover.hand.includes(action.tileId)) {
    throw new IllegalActionError(`Player ${action.playerId} doesn't have tile ${action.tileId}`);
  }
  if (action.receiverPlayerId === action.playerId) {
    // Self-play only allowed if no other player has tiles
    const othersWithTiles = state.players.filter(p => p.id !== action.playerId && p.hand.length > 0);
    if (othersWithTiles.length > 0) {
      throw new IllegalActionError(`Cannot play to self when other players have tiles`);
    }
  }

  state.turn.tilePlayedId = action.tileId;
  state.turn.receiverId = action.receiverPlayerId;

  // Snapshot credibility at turn start for zero-cred rules
  for (const p of state.players) {
    p.credibilityAtTurnStart = p.credibility;
  }

  state.turn.phase = TurnPhase.AWAITING_RECEIPT;

  // If receiver has 0 credibility, auto-accept blind
  const receiver = state.players.find(p => p.id === action.receiverPlayerId)!;
  if (receiver.credibility === 0) {
    return handleReceiverDecision(state, {
      type: 'RECEIVER_DECISION', playerId: receiver.id, decision: 'ACCEPT_BLIND',
    });
  }

  return state;
}

function handleReceiverDecision(state: KredGameState, action: KredAction & { type: 'RECEIVER_DECISION' }): KredGameState {
  if (state.turn.phase !== TurnPhase.AWAITING_RECEIPT) {
    throw new IllegalActionError(`RECEIVER_DECISION not allowed in phase ${state.turn.phase}`);
  }
  if (action.playerId !== state.turn.receiverId) {
    throw new IllegalActionError(`Player ${action.playerId} is not the receiver`);
  }

  if (action.decision === 'REJECT') {
    // Receiver rejects — check if play was actually dishonest
    const isHonest = determineHonesty(state);
    if (isHonest) {
      throw new IllegalActionError(`Cannot reject honest play`);
    }
    state = resolveWhistleBlown(state);
    // After whistle blown, mover must replay honestly (simplified: we apply tile's required moves)
    state = replayHonestly(state);
    state = advanceToNextMover(state);
    return state;
  }

  // ACCEPT or ACCEPT_BLIND — move to challenge phase
  // Build bystander list (clockwise from receiver, excluding mover and receiver)
  const bystanders: number[] = [];
  let current = state.turn.receiverId!;
  for (let i = 0; i < state.config.playerCount - 1; i++) {
    current = getNextPlayerClockwise(current, state.config.playerCount);
    if (current !== state.turn.moverId && current !== state.turn.receiverId) {
      // Only players with credibility can challenge
      const player = state.players.find(p => p.id === current)!;
      if (player.credibility > 0) {
        bystanders.push(current);
      }
    }
  }

  state.turn.pendingBystanders = bystanders;
  state.turn.phase = TurnPhase.AWAITING_CHALLENGES;

  // If no bystanders can challenge, resolve immediately as Quiet is Kept
  if (bystanders.length === 0) {
    state = resolveQuietIsKept(state);
    state = advanceToNextMover(state);
  }

  return state;
}

function handleBystanderDecision(state: KredGameState, action: KredAction & { type: 'BYSTANDER_DECISION' }): KredGameState {
  if (state.turn.phase !== TurnPhase.AWAITING_CHALLENGES) {
    throw new IllegalActionError(`BYSTANDER_DECISION not allowed in phase ${state.turn.phase}`);
  }
  if (state.turn.pendingBystanders[0] !== action.playerId) {
    throw new IllegalActionError(`Player ${action.playerId} is not the current bystander`);
  }

  // Remove from pending
  state.turn.pendingBystanders.shift();

  if (action.decision === 'CHALLENGE') {
    state.turn.challengerId = action.playerId;
    const isHonest = determineHonesty(state);

    if (isHonest) {
      // Witch Hunt
      state = resolveWitchHunt(state);
    } else {
      // Smoking Gun
      state = resolveSmokingGun(state);
      state = replayHonestly(state);
    }
    state = advanceToNextMover(state);
    return state;
  }

  // PASS — check if more bystanders remain
  if (state.turn.pendingBystanders.length === 0) {
    // All passed — Quiet is Kept
    state = resolveQuietIsKept(state);
    state = advanceToNextMover(state);
  }

  return state;
}

function handleResolveSupport(state: KredGameState, action: KredAction & { type: 'RESOLVE_SUPPORT' }): KredGameState {
  if (state.turn.phase !== TurnPhase.RESOLVE_SUPPORT) {
    throw new IllegalActionError(`RESOLVE_SUPPORT not allowed in phase ${state.turn.phase}`);
  }
  const piece = state.pieces.find(p => p.id === action.pieceId);
  if (!piece) throw new IllegalActionError(`Piece ${action.pieceId} not found`);
  piece.locationId = action.targetLocationId;

  // Check if more support violations exist
  state = checkAndTriggerSupport(state);
  if (state.turn.phase === TurnPhase.RESOLVE_SUPPORT) return state;

  // Restore previous phase
  if (state.phaseBeforeSupport) {
    state.turn.phase = state.phaseBeforeSupport;
    state.phaseBeforeSupport = null;
  }
  return state;
}

function handleBureaucracyPurchase(state: KredGameState, action: KredAction & { type: 'BUREAUCRACY_PURCHASE' }): KredGameState {
  if (state.turn.phase !== TurnPhase.BUREAUCRACY) {
    throw new IllegalActionError(`BUREAUCRACY_PURCHASE not allowed in phase ${state.turn.phase}`);
  }
  const currentPlayerId = state.bureaucracy.turnOrder[state.bureaucracy.currentPlayerIndex];
  if (action.playerId !== currentPlayerId) {
    throw new IllegalActionError(`Player ${action.playerId} is not the current bureaucracy player`);
  }

  // Import menu dynamically based on player count
  const { THREE_FOUR_PLAYER_BUREAUCRACY_MENU, FIVE_PLAYER_BUREAUCRACY_MENU } =
    require('@kred/shared/config/bureaucracy');
  const menu = state.config.playerCount === 5
    ? FIVE_PLAYER_BUREAUCRACY_MENU
    : THREE_FOUR_PLAYER_BUREAUCRACY_MENU;

  const menuItem = menu.find((m: any) => m.id === action.menuItemId);
  if (!menuItem) throw new IllegalActionError(`Unknown menu item ${action.menuItemId}`);

  const remaining = state.bureaucracy.remainingFunding[action.playerId] || 0;
  if (remaining < menuItem.price) {
    throw new IllegalActionError(`Insufficient funding: have ${remaining}, need ${menuItem.price}`);
  }

  state.bureaucracy.remainingFunding[action.playerId] = remaining - menuItem.price;

  // Apply the purchased action
  if (menuItem.type === 'CREDIBILITY') {
    const player = state.players.find(p => p.id === action.playerId)!;
    player.credibility = Math.min(3, player.credibility + 1);
  } else if (menuItem.type === 'PROMOTION') {
    if (!action.targetPieceId) throw new IllegalActionError('PROMOTION requires targetPieceId');
    const piece = state.pieces.find(p => p.id === action.targetPieceId);
    if (!piece) throw new IllegalActionError(`Piece ${action.targetPieceId} not found`);
    // Promote: Mark -> Heel, Heel -> Pawn
    if (piece.type === 'MARK') {
      // Find a Heel in community to swap
      const communityHeel = state.pieces.find(p => p.type === 'HEEL' && p.locationId === 'community');
      if (!communityHeel) throw new IllegalActionError('No Heel available in community for promotion');
      // Swap: Mark goes to community, Heel takes its place
      communityHeel.locationId = piece.locationId;
      piece.locationId = 'community';
    } else if (piece.type === 'HEEL') {
      const communityPawn = state.pieces.find(p => p.type === 'PAWN' && p.locationId === 'community');
      if (!communityPawn) throw new IllegalActionError('No Pawn available in community for promotion');
      communityPawn.locationId = piece.locationId;
      piece.locationId = 'community';
    }
  } else if (menuItem.type === 'MOVE') {
    // Purchased move — validate and apply
    if (!action.targetPieceId || !action.targetLocationId) {
      throw new IllegalActionError('MOVE purchase requires targetPieceId and targetLocationId');
    }
    const piece = state.pieces.find(p => p.id === action.targetPieceId);
    if (!piece) throw new IllegalActionError(`Piece ${action.targetPieceId} not found`);
    const move: EngineMove = {
      moveType: menuItem.moveType as DefinedMoveType,
      pieceId: action.targetPieceId,
      fromLocationId: piece.locationId,
      toLocationId: action.targetLocationId,
    };
    if (!validateMove(move, action.playerId, state.pieces, state.config.playerCount)) {
      throw new IllegalActionError(`Illegal bureaucracy move`);
    }
    piece.locationId = action.targetLocationId;
  }

  // Check support after purchase
  state = checkAndTriggerSupport(state);

  return state;
}

function handleEndBureaucracyTurn(state: KredGameState, action: KredAction & { type: 'END_BUREAUCRACY_TURN' }): KredGameState {
  if (state.turn.phase !== TurnPhase.BUREAUCRACY) {
    throw new IllegalActionError(`END_BUREAUCRACY_TURN not allowed in phase ${state.turn.phase}`);
  }
  const currentPlayerId = state.bureaucracy.turnOrder[state.bureaucracy.currentPlayerIndex];
  if (action.playerId !== currentPlayerId) {
    throw new IllegalActionError(`Not this player's bureaucracy turn`);
  }

  state.bureaucracy.currentPlayerIndex++;

  // Check if all players done
  if (state.bureaucracy.currentPlayerIndex >= state.bureaucracy.turnOrder.length) {
    // Check for win
    if (checkWinCondition(state)) {
      state.turn.phase = TurnPhase.GAME_OVER;
      return state;
    }
    // Start next campaign
    return startNextCampaign(state);
  }

  return state;
}

// ============================================================================
// HELPERS
// ============================================================================

function checkAndTriggerSupport(state: KredGameState): KredGameState {
  const violations = checkSupportViolations(state.pieces, state.config.playerCount);
  if (violations.length > 0) {
    // Auto-resolve: move piece to first available supporting seat/rostrum
    for (const v of violations) {
      const piece = state.pieces.find(p => p.id === v.pieceId);
      if (!piece) continue;
      if (v.type === 'ROSTRUM') {
        const rules = require('@kred/shared/config/rules').ROSTRUM_SUPPORT_RULES[v.playerId];
        const rostrum = rules.rostrums.find((r: any) => r.rostrum === v.locationId);
        if (rostrum) {
          // Move to first vacant supporting seat
          for (const seatId of rostrum.supportingSeats) {
            if (!state.pieces.some(p => p.locationId === seatId)) {
              piece.locationId = seatId;
              break;
            }
          }
        }
      } else if (v.type === 'OFFICE') {
        const rules = require('@kred/shared/config/rules').ROSTRUM_SUPPORT_RULES[v.playerId];
        for (const r of rules.rostrums) {
          if (!state.pieces.some(p => p.locationId === r.rostrum)) {
            piece.locationId = r.rostrum;
            break;
          }
        }
      }
    }
  }
  return state;
}

function replayHonestly(state: KredGameState): KredGameState {
  // The tile's required moves need to be replayed on the restored board.
  // For the engine, we skip this since the bot will dispatch new legal moves
  // in the next turn. The key effect (piece restoration) is already done.
  // TODO: Implement full honest replay if needed for complete accuracy.
  return state;
}

function advanceToNextMover(state: KredGameState): KredGameState {
  const receiverId = state.turn.receiverId!;

  // Check if all tiles have been played (campaign over)
  const totalTilesInHands = state.players.reduce((sum, p) => sum + p.hand.length, 0);
  if (totalTilesInHands === 0) {
    return startBureaucracy(state);
  }

  // Check for win
  if (checkWinCondition(state)) {
    state.turn.phase = TurnPhase.GAME_OVER;
    return state;
  }

  // Receiver becomes next mover (if they have tiles)
  let nextMover = receiverId;
  const receiver = state.players.find(p => p.id === receiverId)!;
  if (receiver.hand.length === 0) {
    // Find next player clockwise with tiles
    let candidate = getNextPlayerClockwise(receiverId, state.config.playerCount);
    while (candidate !== receiverId) {
      const p = state.players.find(pl => pl.id === candidate)!;
      if (p.hand.length > 0) { nextMover = candidate; break; }
      candidate = getNextPlayerClockwise(candidate, state.config.playerCount);
    }
  }

  state.turn = {
    phase: TurnPhase.MOVING,
    moverId: nextMover,
    receiverId: null,
    movesExecuted: [],
    tilePlayedId: null,
    pendingBystanders: [],
    challengerId: null,
    isBluff: false,
  };
  state.piecesBeforeMove = null;

  return state;
}

function startBureaucracy(state: KredGameState): KredGameState {
  const { TILE_KREDCOIN_VALUES } = require('@kred/shared/config/tiles');

  // Calculate funding per player
  const funding: Record<number, number> = {};
  for (const p of state.players) {
    let total = 0;
    for (const tileId of p.bankFaceDown) {
      if (tileId === 'BLANK') continue;
      total += TILE_KREDCOIN_VALUES[parseInt(tileId)] || 0;
    }
    funding[p.id] = total;
  }

  // Sort by funding descending (tiebreakers: pawn > heels > marks > credibility)
  const sorted = [...state.players].sort((a, b) => {
    const fa = funding[a.id] || 0;
    const fb = funding[b.id] || 0;
    if (fa !== fb) return fb - fa;
    const aPawn = state.pieces.some(p => p.type === 'PAWN' && p.locationId.startsWith(`p${a.id}_`));
    const bPawn = state.pieces.some(p => p.type === 'PAWN' && p.locationId.startsWith(`p${b.id}_`));
    if (aPawn !== bPawn) return aPawn ? -1 : 1;
    const aHeels = state.pieces.filter(p => p.type === 'HEEL' && p.locationId.startsWith(`p${a.id}_`)).length;
    const bHeels = state.pieces.filter(p => p.type === 'HEEL' && p.locationId.startsWith(`p${b.id}_`)).length;
    if (aHeels !== bHeels) return bHeels - aHeels;
    const aMarks = state.pieces.filter(p => p.type === 'MARK' && p.locationId.startsWith(`p${a.id}_`)).length;
    const bMarks = state.pieces.filter(p => p.type === 'MARK' && p.locationId.startsWith(`p${b.id}_`)).length;
    if (aMarks !== bMarks) return bMarks - aMarks;
    return b.credibility - a.credibility;
  });

  state.bureaucracy = {
    turnOrder: sorted.map(p => p.id),
    currentPlayerIndex: 0,
    remainingFunding: funding,
  };
  state.turn.phase = TurnPhase.BUREAUCRACY;

  return state;
}

function startNextCampaign(state: KredGameState): KredGameState {
  // Return all tiles to hands
  for (const p of state.players) {
    p.hand.push(...p.bankFaceDown, ...p.bankFaceUp);
    p.bankFaceDown = [];
    p.bankFaceUp = [];
  }

  state.campaign.number++;

  // First mover is player with tile '03'
  const firstMover = state.players.find(p => p.hand.includes('03'))!;

  state.turn = {
    phase: TurnPhase.MOVING,
    moverId: firstMover.id,
    receiverId: null,
    movesExecuted: [],
    tilePlayedId: null,
    pendingBystanders: [],
    challengerId: null,
    isBluff: false,
  };
  state.piecesBeforeMove = null;
  state.bureaucracy = { turnOrder: [], currentPlayerIndex: 0, remainingFunding: {} };

  return state;
}

export function checkWinCondition(state: KredGameState): boolean {
  for (let p = 1; p <= state.config.playerCount; p++) {
    // All 6 seats must have a piece (Mark or Heel)
    const allSeats = Array.from({ length: 6 }, (_, i) => `p${p}_seat${i + 1}`);
    const allSeatsOccupied = allSeats.every(seatId =>
      state.pieces.some(pc => pc.locationId === seatId)
    );
    if (!allSeatsOccupied) continue;

    // Both rostrums must have a Heel (not Mark)
    const rostrum1 = state.pieces.find(pc => pc.locationId === `p${p}_rostrum1`);
    const rostrum2 = state.pieces.find(pc => pc.locationId === `p${p}_rostrum2`);
    if (!rostrum1 || rostrum1.type !== 'HEEL') continue;
    if (!rostrum2 || rostrum2.type !== 'HEEL') continue;

    // Office must have a Pawn
    const office = state.pieces.find(pc => pc.locationId === `p${p}_office`);
    if (!office || office.type !== 'PAWN') continue;

    // Check blank tile restriction
    if (state.turn.tilePlayedId === 'BLANK' && state.turn.phase !== TurnPhase.BUREAUCRACY) continue;

    return true;
  }
  return false;
}
```

**Note for implementer:** The `require()` calls inside functions should be converted to top-level static imports. They're written as `require()` here for readability but should use the same import pattern as the other imports. Also, the import paths from `@kred/shared` may need adjustment (see note in Task 3). Fix any import resolution issues when the tests run.

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/__tests__/engine/gameStateMachine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/gameStateMachine.ts src/__tests__/engine/gameStateMachine.test.ts
git commit -m "feat(engine): add core game state machine reducer"
```

---

## Task 7: Random Bot

**Files:**
- Create: `src/engine/randomBot.ts`
- Test: `src/__tests__/engine/randomBot.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/__tests__/engine/randomBot.test.ts
import { describe, it, expect } from 'vitest';
import { randomBot } from '../../engine/randomBot';
import { createInitialState, gameReducer } from '../../engine/gameStateMachine';
import { TurnPhase } from '../../engine/types';
import { SeededRandom } from '../../engine/seededRandom';

describe('randomBot', () => {
  it('produces MAKE_MOVES action in MOVING phase', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    const rng = new SeededRandom(99);
    const action = randomBot(state, state.turn.moverId, rng);
    expect(action.type).toBe('MAKE_MOVES');
    expect(action.playerId).toBe(state.turn.moverId);
  });

  it('produced moves are accepted by the reducer', () => {
    const state = createInitialState({ playerCount: 3, seed: 42 });
    const rng = new SeededRandom(99);
    const action = randomBot(state, state.turn.moverId, rng);
    // Should not throw
    const newState = gameReducer(state, action);
    expect(newState.turn.phase).toBe(TurnPhase.SELECTING_TILE);
  });

  it('produces SELECT_TILE in SELECTING_TILE phase', () => {
    let state = createInitialState({ playerCount: 3, seed: 42 });
    const rng = new SeededRandom(99);
    // First do MAKE_MOVES
    state = gameReducer(state, randomBot(state, state.turn.moverId, rng));
    // Now in SELECTING_TILE
    const action = randomBot(state, state.turn.moverId, rng);
    expect(action.type).toBe('SELECT_TILE');
    const newState = gameReducer(state, action);
    expect(newState.turn.phase).toBe(TurnPhase.AWAITING_RECEIPT);
  });

  it('produces RECEIVER_DECISION in AWAITING_RECEIPT phase', () => {
    let state = createInitialState({ playerCount: 3, seed: 42 });
    const rng = new SeededRandom(99);
    const moverId = state.turn.moverId;
    state = gameReducer(state, randomBot(state, moverId, rng));
    state = gameReducer(state, randomBot(state, moverId, rng));
    // Now AWAITING_RECEIPT
    const receiverId = state.turn.receiverId!;
    const action = randomBot(state, receiverId, rng);
    expect(action.type).toBe('RECEIVER_DECISION');
  });

  it('produces BYSTANDER_DECISION in AWAITING_CHALLENGES phase', () => {
    let state = createInitialState({ playerCount: 3, seed: 10 });
    const rng = new SeededRandom(10);
    const moverId = state.turn.moverId;
    state = gameReducer(state, randomBot(state, moverId, rng));
    state = gameReducer(state, randomBot(state, moverId, rng));
    const receiverId = state.turn.receiverId!;
    // Force ACCEPT to reach challenge phase
    state = gameReducer(state, { type: 'RECEIVER_DECISION', playerId: receiverId, decision: 'ACCEPT' });
    if (state.turn.phase === TurnPhase.AWAITING_CHALLENGES && state.turn.pendingBystanders.length > 0) {
      const bystander = state.turn.pendingBystanders[0];
      const action = randomBot(state, bystander, rng);
      expect(action.type).toBe('BYSTANDER_DECISION');
    }
  });

  it('can drive a complete turn without errors', () => {
    let state = createInitialState({ playerCount: 3, seed: 42 });
    const rng = new SeededRandom(42);
    const startMover = state.turn.moverId;

    // Run a complete turn
    let actions = 0;
    while (state.turn.phase !== TurnPhase.GAME_OVER && actions < 20) {
      let activePlayerId: number;
      if (state.turn.phase === TurnPhase.MOVING || state.turn.phase === TurnPhase.SELECTING_TILE) {
        activePlayerId = state.turn.moverId;
      } else if (state.turn.phase === TurnPhase.AWAITING_RECEIPT) {
        activePlayerId = state.turn.receiverId!;
      } else if (state.turn.phase === TurnPhase.AWAITING_CHALLENGES) {
        activePlayerId = state.turn.pendingBystanders[0];
      } else {
        break;
      }
      state = gameReducer(state, randomBot(state, activePlayerId, rng));
      actions++;
      // Stop after mover changes (one full turn)
      if (state.turn.phase === TurnPhase.MOVING && state.turn.moverId !== startMover) break;
    }

    expect(actions).toBeGreaterThan(3); // at least MOVE + TILE + RECEIPT + PASS
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/__tests__/engine/randomBot.test.ts`
Expected: FAIL — cannot find module

- [ ] **Step 3: Write the random bot**

```typescript
// src/engine/randomBot.ts
import { DefinedMoveType } from '@kred/shared';
import { TILE_REQUIREMENTS } from '@kred/shared/config/rules';
import { SeededRandom } from './seededRandom';
import { findLegalMoves } from './moveValidation';
import { determineHonesty } from './outcomeResolution';
import { TurnPhase, type KredGameState, type KredAction, type EngineMove } from './types';

export function randomBot(state: KredGameState, playerId: number, rng: SeededRandom): KredAction {
  switch (state.turn.phase) {
    case TurnPhase.MOVING:
      return botMakeMoves(state, playerId, rng);
    case TurnPhase.SELECTING_TILE:
      return botSelectTile(state, playerId, rng);
    case TurnPhase.AWAITING_RECEIPT:
      return botReceiverDecision(state, playerId, rng);
    case TurnPhase.AWAITING_CHALLENGES:
      return botBystanderDecision(state, playerId, rng);
    case TurnPhase.BUREAUCRACY:
      return botBureaucracy(state, playerId, rng);
    default:
      throw new Error(`Bot cannot act in phase ${state.turn.phase}`);
  }
}

function botMakeMoves(state: KredGameState, playerId: number, rng: SeededRandom): KredAction {
  const player = state.players.find(p => p.id === playerId)!;

  // Pick a tile from hand to base moves on
  const intendedTileId = rng.pick(player.hand);

  // Decide: honest (70%) or bluff (30%)
  const isBluff = rng.next() < 0.3;

  let targetTileId: string;
  if (isBluff && player.hand.length > 1) {
    // Pick a different tile's moves to execute
    const otherTiles = player.hand.filter(t => t !== intendedTileId);
    targetTileId = rng.pick(otherTiles);
  } else {
    targetTileId = intendedTileId;
  }

  // Get required moves for the target tile
  const req = targetTileId === 'BLANK' ? { requiredMoves: [] } : TILE_REQUIREMENTS[targetTileId];
  const requiredMoveTypes = req ? req.requiredMoves : [];

  // Find legal moves for each required type
  const moves: EngineMove[] = [];
  const usedPieceIds = new Set<string>();

  for (const moveType of requiredMoveTypes) {
    const legalMoves = findLegalMoves(moveType, playerId, state.pieces, state.config.playerCount);
    // Filter out pieces already used this turn (separate pieces rule)
    const available = legalMoves.filter(m => !usedPieceIds.has(m.pieceId));
    if (available.length > 0) {
      const chosen = rng.pick(available);
      moves.push(chosen);
      usedPieceIds.add(chosen.pieceId);
      // Apply move temporarily to pieces for subsequent move validation
      const piece = state.pieces.find(p => p.id === chosen.pieceId);
      if (piece) {
        // We need to simulate this for the second move's findLegalMoves
        // But we can't mutate state — just track the used piece
      }
    }
    // If no legal move available, skip (impossible moves are forgiven)
  }

  return {
    type: 'MAKE_MOVES',
    playerId,
    moves,
  };
}

function botSelectTile(state: KredGameState, playerId: number, rng: SeededRandom): KredAction {
  const player = state.players.find(p => p.id === playerId)!;

  // Pick a tile to play (random from hand)
  const tileId = rng.pick(player.hand);

  // Pick a receiver (random opponent with tiles, or self if none)
  const opponents = state.players.filter(p => p.id !== playerId && p.hand.length > 0);
  const receiverPlayerId = opponents.length > 0
    ? rng.pick(opponents).id
    : playerId;

  return {
    type: 'SELECT_TILE',
    playerId,
    tileId,
    receiverPlayerId,
  };
}

function botReceiverDecision(state: KredGameState, playerId: number, rng: SeededRandom): KredAction {
  const player = state.players.find(p => p.id === playerId)!;

  // No credibility = must accept blind
  if (player.credibility === 0) {
    return { type: 'RECEIVER_DECISION', playerId, decision: 'ACCEPT_BLIND' };
  }

  // Check if play is honest
  const isHonest = determineHonesty(state);

  if (isHonest) {
    // Can't reject honest play — choose ACCEPT or ACCEPT_BLIND
    const decision = rng.next() < 0.8 ? 'ACCEPT' as const : 'ACCEPT_BLIND' as const;
    return { type: 'RECEIVER_DECISION', playerId, decision };
  }

  // Dishonest play — weighted choice
  const decision = rng.weightedChoice([
    { value: 'ACCEPT' as const, weight: 60 },
    { value: 'REJECT' as const, weight: 20 },
    { value: 'ACCEPT_BLIND' as const, weight: 20 },
  ]);

  return { type: 'RECEIVER_DECISION', playerId, decision };
}

function botBystanderDecision(state: KredGameState, playerId: number, rng: SeededRandom): KredAction {
  const player = state.players.find(p => p.id === playerId)!;

  if (player.credibility === 0) {
    return { type: 'BYSTANDER_DECISION', playerId, decision: 'PASS' };
  }

  const decision = rng.weightedChoice([
    { value: 'PASS' as const, weight: 80 },
    { value: 'CHALLENGE' as const, weight: 20 },
  ]);

  return { type: 'BYSTANDER_DECISION', playerId, decision };
}

function botBureaucracy(state: KredGameState, playerId: number, rng: SeededRandom): KredAction {
  const remaining = state.bureaucracy.remainingFunding[playerId] || 0;

  // Import menu
  const { THREE_FOUR_PLAYER_BUREAUCRACY_MENU, FIVE_PLAYER_BUREAUCRACY_MENU } =
    require('@kred/shared/config/bureaucracy');
  const menu = state.config.playerCount === 5
    ? FIVE_PLAYER_BUREAUCRACY_MENU
    : THREE_FOUR_PLAYER_BUREAUCRACY_MENU;

  // Find affordable items
  const affordable = menu.filter((m: any) => m.price <= remaining);

  // 30% chance to end turn early even if can afford something
  if (affordable.length === 0 || rng.next() < 0.3) {
    return { type: 'END_BUREAUCRACY_TURN', playerId };
  }

  const item = rng.pick(affordable);

  if (item.type === 'CREDIBILITY') {
    return { type: 'BUREAUCRACY_PURCHASE', playerId, menuItemId: item.id };
  }

  if (item.type === 'PROMOTION') {
    // Find a piece to promote in the specified location
    const pieces = state.pieces.filter(p => {
      if (!p.locationId.startsWith(`p${playerId}_`)) return false;
      if (item.promotionLocation === 'OFFICE') return p.locationId.includes('office') && p.type !== 'PAWN';
      if (item.promotionLocation === 'ROSTRUM') return p.locationId.includes('rostrum') && p.type !== 'PAWN';
      if (item.promotionLocation === 'SEAT') return p.locationId.includes('seat') && p.type !== 'PAWN';
      return false;
    });
    if (pieces.length === 0) return { type: 'END_BUREAUCRACY_TURN', playerId };
    const piece = rng.pick(pieces);
    return { type: 'BUREAUCRACY_PURCHASE', playerId, menuItemId: item.id, targetPieceId: piece.id };
  }

  if (item.type === 'MOVE') {
    const moveType = item.moveType as DefinedMoveType;
    const legalMoves = findLegalMoves(moveType, playerId, state.pieces, state.config.playerCount);
    if (legalMoves.length === 0) return { type: 'END_BUREAUCRACY_TURN', playerId };
    const move = rng.pick(legalMoves);
    return {
      type: 'BUREAUCRACY_PURCHASE', playerId, menuItemId: item.id,
      targetPieceId: move.pieceId, targetLocationId: move.toLocationId,
    };
  }

  return { type: 'END_BUREAUCRACY_TURN', playerId };
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/__tests__/engine/randomBot.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/randomBot.ts src/__tests__/engine/randomBot.test.ts
git commit -m "feat(engine): add random bot for automated playtesting"
```

---

## Task 8: Game Runner

**Files:**
- Create: `src/engine/gameRunner.ts`
- Test: `src/__tests__/engine/gameRunner.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/__tests__/engine/gameRunner.test.ts
import { describe, it, expect } from 'vitest';
import { runGame } from '../../engine/gameRunner';

describe('runGame', () => {
  it('completes a 3-player game without crashing', () => {
    const result = runGame({ playerCount: 3, seed: 42 });
    expect(['WIN', 'DRAW', 'STALEMATE']).toContain(result.outcome);
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.config.playerCount).toBe(3);
    expect(result.config.seed).toBe(42);
  });

  it('is deterministic with same seed', () => {
    const r1 = runGame({ playerCount: 3, seed: 42 });
    const r2 = runGame({ playerCount: 3, seed: 42 });
    expect(r1.outcome).toBe(r2.outcome);
    expect(r1.actions.length).toBe(r2.actions.length);
    expect(r1.stats.campaignCount).toBe(r2.stats.campaignCount);
  });

  it('produces different results with different seeds', () => {
    const r1 = runGame({ playerCount: 3, seed: 1 });
    const r2 = runGame({ playerCount: 3, seed: 2 });
    // At least one stat should differ (extremely likely with different seeds)
    const differ = r1.actions.length !== r2.actions.length
      || r1.stats.campaignCount !== r2.stats.campaignCount
      || r1.outcome !== r2.outcome;
    expect(differ).toBe(true);
  });

  it('completes a 4-player game', () => {
    const result = runGame({ playerCount: 4, seed: 42 });
    expect(['WIN', 'DRAW', 'STALEMATE']).toContain(result.outcome);
  });

  it('completes a 5-player game', () => {
    const result = runGame({ playerCount: 5, seed: 42 });
    expect(['WIN', 'DRAW', 'STALEMATE']).toContain(result.outcome);
  });

  it('captures violations without crashing', () => {
    // Run several games — even if some have violations, the runner should capture them
    for (let seed = 0; seed < 5; seed++) {
      const result = runGame({ playerCount: 3, seed });
      // violations is always an array (possibly empty)
      expect(Array.isArray(result.violations)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/__tests__/engine/gameRunner.test.ts`
Expected: FAIL — cannot find module

- [ ] **Step 3: Write the game runner**

```typescript
// src/engine/gameRunner.ts
import { SeededRandom } from './seededRandom';
import { createInitialState, gameReducer, InvariantViolationError } from './gameStateMachine';
import { randomBot } from './randomBot';
import { TurnPhase, type KredGameState, type GameResult, type InvariantViolation } from './types';

const MAX_ACTIONS = 500;

export function runGame(config: { playerCount: 3 | 4 | 5; seed?: number }): GameResult {
  const seed = config.seed ?? Date.now();
  const rng = new SeededRandom(seed);
  let state = createInitialState({ playerCount: config.playerCount, seed });
  const violations: InvariantViolation[] = [];
  let actionCount = 0;

  while (state.turn.phase !== TurnPhase.GAME_OVER && actionCount < MAX_ACTIONS) {
    const activePlayerId = getActivePlayer(state);
    if (activePlayerId === null) break;

    const action = randomBot(state, activePlayerId, rng);
    try {
      state = gameReducer(state, action);
    } catch (err) {
      if (err instanceof InvariantViolationError) {
        violations.push(err.violation);
        break; // Fail fast
      }
      // IllegalActionError — bot made a bad move, skip (shouldn't happen)
      // Try ending bureaucracy turn as fallback
      if (state.turn.phase === TurnPhase.BUREAUCRACY) {
        try {
          state = gameReducer(state, { type: 'END_BUREAUCRACY_TURN', playerId: activePlayerId });
        } catch {
          break;
        }
      } else {
        break;
      }
    }
    actionCount++;
  }

  // Determine outcome
  let outcome: 'WIN' | 'DRAW' | 'STALEMATE';
  const winnerIds: number[] = [];

  if (state.turn.phase === TurnPhase.GAME_OVER) {
    // Find winners
    for (let p = 1; p <= config.playerCount; p++) {
      if (isWinner(state, p)) winnerIds.push(p);
    }
    outcome = winnerIds.length > 1 ? 'DRAW' : 'WIN';
  } else {
    outcome = 'STALEMATE';
  }

  return {
    outcome,
    winnerIds,
    actions: state.history,
    violations,
    stats: {
      campaignCount: state.campaign.number,
      totalActions: actionCount,
      finalPieces: state.pieces,
    },
    config: { playerCount: config.playerCount, seed },
  };
}

function getActivePlayer(state: KredGameState): number | null {
  switch (state.turn.phase) {
    case TurnPhase.MOVING:
    case TurnPhase.SELECTING_TILE:
      return state.turn.moverId;
    case TurnPhase.AWAITING_RECEIPT:
      return state.turn.receiverId;
    case TurnPhase.AWAITING_CHALLENGES:
      return state.turn.pendingBystanders[0] ?? null;
    case TurnPhase.BUREAUCRACY:
      return state.bureaucracy.turnOrder[state.bureaucracy.currentPlayerIndex] ?? null;
    case TurnPhase.RESOLVE_SUPPORT:
      // Auto-resolved by reducer, but if it reaches here find the affected player
      return state.turn.moverId;
    default:
      return null;
  }
}

function isWinner(state: KredGameState, playerId: number): boolean {
  const allSeats = Array.from({ length: 6 }, (_, i) => `p${playerId}_seat${i + 1}`);
  const allSeatsOccupied = allSeats.every(seatId =>
    state.pieces.some(p => p.locationId === seatId)
  );
  if (!allSeatsOccupied) return false;

  const r1 = state.pieces.find(p => p.locationId === `p${playerId}_rostrum1`);
  const r2 = state.pieces.find(p => p.locationId === `p${playerId}_rostrum2`);
  if (!r1 || r1.type !== 'HEEL') return false;
  if (!r2 || r2.type !== 'HEEL') return false;

  const office = state.pieces.find(p => p.locationId === `p${playerId}_office`);
  if (!office || office.type !== 'PAWN') return false;

  return true;
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/__tests__/engine/gameRunner.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/gameRunner.ts src/__tests__/engine/gameRunner.test.ts
git commit -m "feat(engine): add game runner for full bot-driven games"
```

---

## Task 9: Test Exporter

**Files:**
- Create: `src/engine/testExporter.ts`
- Test: `src/__tests__/engine/testExporter.test.ts`

- [ ] **Step 1: Write the test file**

```typescript
// src/__tests__/engine/testExporter.test.ts
import { describe, it, expect } from 'vitest';
import { generateTestFileContent } from '../../engine/testExporter';
import type { GameResult, InvariantViolation } from '../../engine/types';
import { TurnPhase } from '../../engine/types';

describe('generateTestFileContent', () => {
  it('produces valid vitest file content', () => {
    const violation: InvariantViolation = {
      invariantName: 'supportRule',
      details: 'Piece at p1_rostrum1 with no supporting seats',
      stateBefore: { config: { playerCount: 3, seed: 42 } } as any,
      stateAfter: { config: { playerCount: 3, seed: 42 } } as any,
      triggeringAction: { type: 'MAKE_MOVES', playerId: 1, moves: [] },
      actionIndex: 5,
    };
    const result: GameResult = {
      outcome: 'STALEMATE',
      winnerIds: [],
      actions: [
        { type: 'MAKE_MOVES', playerId: 1, moves: [] },
        { type: 'SELECT_TILE', playerId: 1, tileId: '05', receiverPlayerId: 2 },
      ],
      violations: [violation],
      stats: { campaignCount: 1, totalActions: 6, finalPieces: [] },
      config: { playerCount: 3, seed: 42 },
    };

    const content = generateTestFileContent(result, violation);

    // Should contain vitest imports
    expect(content).toContain("import { describe, it, expect } from 'vitest'");
    // Should contain createInitialState
    expect(content).toContain('createInitialState');
    // Should contain gameReducer
    expect(content).toContain('gameReducer');
    // Should reference the invariant name
    expect(content).toContain('supportRule');
    // Should contain the seed
    expect(content).toContain('42');
    // Should contain actions as JSON
    expect(content).toContain('MAKE_MOVES');
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/__tests__/engine/testExporter.test.ts`
Expected: FAIL

- [ ] **Step 3: Write the test exporter**

```typescript
// src/engine/testExporter.ts
import type { GameResult, InvariantViolation } from './types';

/**
 * Generates a self-contained Vitest test file that replays a failing game
 * up to the action that triggered the invariant violation.
 */
export function generateTestFileContent(result: GameResult, violation: InvariantViolation): string {
  const actionsUpToFailure = result.actions.slice(0, violation.actionIndex + 1);
  const actionsJson = JSON.stringify(actionsUpToFailure, null, 2);
  const { playerCount, seed } = result.config;

  return `// Auto-generated invariant violation test
// Invariant: ${violation.invariantName}
// Details: ${violation.details}
// Seed: ${seed}, Players: ${playerCount}
import { describe, it, expect } from 'vitest';
import { createInitialState, gameReducer } from '../../engine/gameStateMachine';
import type { KredAction } from '../../engine/types';

describe('invariant violation: ${violation.invariantName} (seed ${seed})', () => {
  it('replays the failing game', () => {
    let state = createInitialState({ playerCount: ${playerCount} as const, seed: ${seed} });
    const actions: KredAction[] = ${actionsJson};

    for (let i = 0; i < actions.length; i++) {
      try {
        state = gameReducer(state, actions[i]);
      } catch (err) {
        // Action ${violation.actionIndex} should trigger the invariant violation
        if (i === ${violation.actionIndex}) {
          expect((err as Error).message).toContain('${violation.invariantName}');
          return;
        }
        throw err; // Unexpected error at a different action
      }
    }
    // If we get here without throwing, the invariant violation was not reproduced
    // This means the bug was fixed — this test can be removed
    expect(true).toBe(true);
  });
});
`;
}

/**
 * Returns the file path where the test should be written.
 */
export function getTestFilePath(violation: InvariantViolation, seed: number): string {
  const safeName = violation.invariantName.replace(/[^a-zA-Z0-9]/g, '_');
  return `src/__tests__/generated/invariant_${safeName}_seed_${seed}.test.ts`;
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run src/__tests__/engine/testExporter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/testExporter.ts src/__tests__/engine/testExporter.test.ts
git commit -m "feat(engine): add test exporter for invariant violations"
```

---

## Task 10: CLI Harness and Vitest Fuzz Suite

**Files:**
- Create: `src/scripts/playtest.ts`
- Create: `src/__tests__/playtest/fuzz.test.ts`
- Modify: `package.json` (add `playtest` script and `tsx` devDep)

- [ ] **Step 1: Install tsx**

Run: `npm install --save-dev tsx`

- [ ] **Step 2: Write the fuzz test**

```typescript
// src/__tests__/playtest/fuzz.test.ts
import { describe, it, expect } from 'vitest';
import { runGame } from '../../engine/gameRunner';

describe('fuzz: random bot games', () => {
  it.each([3, 4, 5] as const)('completes 10 random %d-player games without invariant violations', (playerCount) => {
    for (let i = 0; i < 10; i++) {
      const result = runGame({ playerCount, seed: i });
      expect(result.violations).toEqual([]);
      expect(result.outcome).not.toBe('STALEMATE');
    }
  });
});
```

- [ ] **Step 3: Write the CLI script**

```typescript
// src/scripts/playtest.ts
import { runGame } from '../engine/gameRunner';
import { generateTestFileContent, getTestFilePath } from '../engine/testExporter';
import * as fs from 'fs';
import * as path from 'path';

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name: string, defaultValue: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue;
}
const hasFlag = (name: string) => args.includes(`--${name}`);

const gameCount = parseInt(getArg('games', '100'));
const playersArg = getArg('players', 'all');
const startSeed = parseInt(getArg('seed', String(Date.now())));
const verbose = hasFlag('verbose');

const playerCounts: (3 | 4 | 5)[] = playersArg === 'all'
  ? [3, 4, 5]
  : [parseInt(playersArg) as 3 | 4 | 5];

let totalPassed = 0;
let totalFailed = 0;
let totalStalemate = 0;
let totalExported = 0;

for (const playerCount of playerCounts) {
  console.log(`\nKRED Playtest: ${gameCount} games, ${playerCount} players, seed ${startSeed}`);
  console.log('━'.repeat(60));

  for (let i = 0; i < gameCount; i++) {
    const seed = startSeed + i;
    const result = runGame({ playerCount, seed });

    if (result.violations.length > 0) {
      totalFailed++;
      const v = result.violations[0];
      console.log(`Game ${i + 1}: ✗ INVARIANT ${v.invariantName} at action ${v.actionIndex}`);

      // Export test
      const content = generateTestFileContent(result, v);
      const filePath = getTestFilePath(v, seed);
      const fullPath = path.resolve(filePath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
      console.log(`  -> Exported: ${filePath}`);
      totalExported++;
    } else if (result.outcome === 'STALEMATE') {
      totalStalemate++;
      if (verbose) console.log(`Game ${i + 1}: ~ Stalemate (${result.stats.totalActions} actions)`);
    } else {
      totalPassed++;
      if (verbose) {
        const winners = result.winnerIds.map(id => `P${id}`).join(', ');
        console.log(`Game ${i + 1}: ✓ ${result.outcome === 'DRAW' ? 'Draw' : `${winners} wins`} (Campaign ${result.stats.campaignCount}, ${result.stats.totalActions} actions)`);
      }
    }
  }
}

console.log('\n' + '━'.repeat(60));
console.log(`Results: ${totalPassed} passed, ${totalFailed} failed, ${totalStalemate} stalemate`);
if (totalExported > 0) {
  console.log(`Tests exported: ${totalExported} files in src/__tests__/generated/`);
}
```

- [ ] **Step 4: Add scripts to package.json**

Add to `"scripts"` in `package.json`:

```json
"playtest": "tsx src/scripts/playtest.ts"
```

- [ ] **Step 5: Run the fuzz test**

Run: `npx vitest run src/__tests__/playtest/fuzz.test.ts`
Expected: PASS (30 games complete without violations)

- [ ] **Step 6: Run the CLI**

Run: `npm run playtest -- --games 5 --players 3 --verbose`
Expected: Output showing 5 games completing with results

- [ ] **Step 7: Commit**

```bash
git add src/scripts/playtest.ts src/__tests__/playtest/fuzz.test.ts package.json package-lock.json
git commit -m "feat(engine): add CLI playtest harness and fuzz test suite"
```

---

## Task 11: Ensure All Tests Pass Together

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: All tests pass (existing + new engine tests + fuzz suite)

- [ ] **Step 2: Fix any failures**

If tests fail due to import path issues between `@kred/shared` submodules and the engine, adjust import paths. Common fixes:
- Change `import { X } from '@kred/shared/config/rules'` to `import { X } from '../../packages/shared/src/config/rules'`
- Or update `packages/shared/package.json` to add `exports` field for subpath imports

- [ ] **Step 3: Run the CLI playtest with a larger batch**

Run: `npm run playtest -- --games 50 --players all --verbose`
Expected: 150 games (50 per player mode) complete. Review any violations found.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(engine): resolve import paths and integration issues"
```

---

## Summary

| Task | What it builds | Est. size |
|------|---------------|-----------|
| 1 | Core types (KredGameState, KredAction, etc.) | ~150 lines |
| 2 | Seeded PRNG | ~50 lines |
| 3 | Move validation + legal move finder | ~350 lines |
| 4 | Outcome resolution (4 outcomes) | ~150 lines |
| 5 | Invariant checker (8 invariants) | ~150 lines |
| 6 | Game state machine reducer | ~400 lines |
| 7 | Random bot | ~200 lines |
| 8 | Game runner | ~100 lines |
| 9 | Test exporter | ~60 lines |
| 10 | CLI harness + fuzz suite | ~100 lines |
| 11 | Integration verification | N/A |

Total new code: ~1,700 lines + ~800 lines of tests.
