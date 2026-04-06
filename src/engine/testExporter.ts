import type { GameResult, InvariantViolation } from './types';

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
        if (i === ${violation.actionIndex}) {
          expect((err as Error).message).toContain('${violation.invariantName}');
          return;
        }
        throw err;
      }
    }
    expect(true).toBe(true);
  });
});
`;
}

export function getTestFilePath(violation: InvariantViolation, seed: number): string {
  const safeName = violation.invariantName.replace(/[^a-zA-Z0-9]/g, '_');
  return `src/__tests__/generated/invariant_${safeName}_seed_${seed}.test.ts`;
}
