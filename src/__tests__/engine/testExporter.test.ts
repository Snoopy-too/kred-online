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

    expect(content).toContain("import { describe, it, expect } from 'vitest'");
    expect(content).toContain('createInitialState');
    expect(content).toContain('gameReducer');
    expect(content).toContain('supportRule');
    expect(content).toContain('42');
    expect(content).toContain('MAKE_MOVES');
  });
});
