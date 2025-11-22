import { describe, it, expect } from 'vitest';
import { DefinedMoveType, MoveRequirementType } from '../../types/move';
import { DEFINED_MOVES } from '../../config/rules';

describe('DEFINED_MOVES Configuration', () => {
  describe('Structure and Completeness', () => {
    it('should define all six move types', () => {
      const moveTypes = Object.keys(DEFINED_MOVES);
      expect(moveTypes).toHaveLength(6);
      expect(moveTypes).toContain(DefinedMoveType.REMOVE);
      expect(moveTypes).toContain(DefinedMoveType.ADVANCE);
      expect(moveTypes).toContain(DefinedMoveType.INFLUENCE);
      expect(moveTypes).toContain(DefinedMoveType.ASSIST);
      expect(moveTypes).toContain(DefinedMoveType.WITHDRAW);
      expect(moveTypes).toContain(DefinedMoveType.ORGANIZE);
    });

    it('should have all required properties for each move', () => {
      Object.values(DEFINED_MOVES).forEach((move) => {
        expect(move).toHaveProperty('type');
        expect(move).toHaveProperty('category');
        expect(move).toHaveProperty('requirement');
        expect(move).toHaveProperty('description');
        expect(move).toHaveProperty('options');
        expect(move).toHaveProperty('canTargetOwnDomain');
        expect(move).toHaveProperty('canTargetOpponentDomain');
        expect(move).toHaveProperty('affectsCommunity');
      });
    });

    it('should have valid category values (M or O)', () => {
      Object.values(DEFINED_MOVES).forEach((move) => {
        expect(['M', 'O']).toContain(move.category);
      });
    });

    it('should have valid requirement types', () => {
      Object.values(DEFINED_MOVES).forEach((move) => {
        expect([MoveRequirementType.MANDATORY, MoveRequirementType.OPTIONAL]).toContain(
          move.requirement
        );
      });
    });

    it('should have non-empty descriptions and options', () => {
      Object.values(DEFINED_MOVES).forEach((move) => {
        expect(move.description).toBeTruthy();
        expect(move.description.length).toBeGreaterThan(0);
        expect(Array.isArray(move.options)).toBe(true);
        expect(move.options.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Optional Moves (Category O)', () => {
    const optionalMoves = Object.values(DEFINED_MOVES).filter(
      (move) => move.category === 'O'
    );

    it('should have exactly 3 optional moves', () => {
      expect(optionalMoves).toHaveLength(3);
    });

    it('should mark all optional moves as OPTIONAL requirement', () => {
      optionalMoves.forEach((move) => {
        expect(move.requirement).toBe(MoveRequirementType.OPTIONAL);
      });
    });

    it('should include REMOVE as optional', () => {
      const remove = DEFINED_MOVES[DefinedMoveType.REMOVE];
      expect(remove.category).toBe('O');
      expect(remove.requirement).toBe(MoveRequirementType.OPTIONAL);
    });

    it('should include INFLUENCE as optional', () => {
      const influence = DEFINED_MOVES[DefinedMoveType.INFLUENCE];
      expect(influence.category).toBe('O');
      expect(influence.requirement).toBe(MoveRequirementType.OPTIONAL);
    });

    it('should include ASSIST as optional', () => {
      const assist = DEFINED_MOVES[DefinedMoveType.ASSIST];
      expect(assist.category).toBe('O');
      expect(assist.requirement).toBe(MoveRequirementType.OPTIONAL);
    });
  });

  describe('Mandatory Moves (Category M)', () => {
    const mandatoryMoves = Object.values(DEFINED_MOVES).filter(
      (move) => move.category === 'M'
    );

    it('should have exactly 3 mandatory moves', () => {
      expect(mandatoryMoves).toHaveLength(3);
    });

    it('should mark all mandatory moves as MANDATORY requirement', () => {
      mandatoryMoves.forEach((move) => {
        expect(move.requirement).toBe(MoveRequirementType.MANDATORY);
      });
    });

    it('should include ADVANCE as mandatory', () => {
      const advance = DEFINED_MOVES[DefinedMoveType.ADVANCE];
      expect(advance.category).toBe('M');
      expect(advance.requirement).toBe(MoveRequirementType.MANDATORY);
    });

    it('should include WITHDRAW as mandatory', () => {
      const withdraw = DEFINED_MOVES[DefinedMoveType.WITHDRAW];
      expect(withdraw.category).toBe('M');
      expect(withdraw.requirement).toBe(MoveRequirementType.MANDATORY);
    });

    it('should include ORGANIZE as mandatory', () => {
      const organize = DEFINED_MOVES[DefinedMoveType.ORGANIZE];
      expect(organize.category).toBe('M');
      expect(organize.requirement).toBe(MoveRequirementType.MANDATORY);
    });
  });

  describe('REMOVE Move', () => {
    const remove = DEFINED_MOVES[DefinedMoveType.REMOVE];

    it('should not target own domain', () => {
      expect(remove.canTargetOwnDomain).toBe(false);
    });

    it('should target opponent domain', () => {
      expect(remove.canTargetOpponentDomain).toBe(true);
    });

    it('should affect community', () => {
      expect(remove.affectsCommunity).toBe(true);
    });

    it('should have 2 options', () => {
      expect(remove.options).toHaveLength(2);
    });
  });

  describe('ADVANCE Move', () => {
    const advance = DEFINED_MOVES[DefinedMoveType.ADVANCE];

    it('should target own domain', () => {
      expect(advance.canTargetOwnDomain).toBe(true);
    });

    it('should not target opponent domain', () => {
      expect(advance.canTargetOpponentDomain).toBe(false);
    });

    it('should affect community', () => {
      expect(advance.affectsCommunity).toBe(true);
    });

    it('should have 3 options (community->seat, seat->rostrum, rostrum->office)', () => {
      expect(advance.options).toHaveLength(3);
    });
  });

  describe('INFLUENCE Move', () => {
    const influence = DEFINED_MOVES[DefinedMoveType.INFLUENCE];

    it('should not target own domain', () => {
      expect(influence.canTargetOwnDomain).toBe(false);
    });

    it('should target opponent domain', () => {
      expect(influence.canTargetOpponentDomain).toBe(true);
    });

    it('should not affect community', () => {
      expect(influence.affectsCommunity).toBe(false);
    });

    it('should have 2 options', () => {
      expect(influence.options).toHaveLength(2);
    });
  });

  describe('ASSIST Move', () => {
    const assist = DEFINED_MOVES[DefinedMoveType.ASSIST];

    it('should not target own domain', () => {
      expect(assist.canTargetOwnDomain).toBe(false);
    });

    it('should target opponent domain', () => {
      expect(assist.canTargetOpponentDomain).toBe(true);
    });

    it('should affect community', () => {
      expect(assist.affectsCommunity).toBe(true);
    });

    it('should have 1 option', () => {
      expect(assist.options).toHaveLength(1);
    });
  });

  describe('WITHDRAW Move', () => {
    const withdraw = DEFINED_MOVES[DefinedMoveType.WITHDRAW];

    it('should target own domain', () => {
      expect(withdraw.canTargetOwnDomain).toBe(true);
    });

    it('should not target opponent domain', () => {
      expect(withdraw.canTargetOpponentDomain).toBe(false);
    });

    it('should affect community', () => {
      expect(withdraw.affectsCommunity).toBe(true);
    });

    it('should have 3 options (office->rostrum, rostrum->seat, seat->community)', () => {
      expect(withdraw.options).toHaveLength(3);
    });
  });

  describe('ORGANIZE Move', () => {
    const organize = DEFINED_MOVES[DefinedMoveType.ORGANIZE];

    it('should target own domain', () => {
      expect(organize.canTargetOwnDomain).toBe(true);
    });

    it('should target opponent domain', () => {
      expect(organize.canTargetOpponentDomain).toBe(true);
    });

    it('should not affect community', () => {
      expect(organize.affectsCommunity).toBe(false);
    });

    it('should have 2 options', () => {
      expect(organize.options).toHaveLength(2);
    });
  });

  describe('Domain Targeting Rules', () => {
    it('should have correct moves that can target own domain', () => {
      const ownDomainMoves = Object.values(DEFINED_MOVES)
        .filter((move) => move.canTargetOwnDomain)
        .map((move) => move.type);

      expect(ownDomainMoves).toContain(DefinedMoveType.ADVANCE);
      expect(ownDomainMoves).toContain(DefinedMoveType.WITHDRAW);
      expect(ownDomainMoves).toContain(DefinedMoveType.ORGANIZE);
      expect(ownDomainMoves).toHaveLength(3);
    });

    it('should have correct moves that can target opponent domain', () => {
      const opponentDomainMoves = Object.values(DEFINED_MOVES)
        .filter((move) => move.canTargetOpponentDomain)
        .map((move) => move.type);

      expect(opponentDomainMoves).toContain(DefinedMoveType.REMOVE);
      expect(opponentDomainMoves).toContain(DefinedMoveType.INFLUENCE);
      expect(opponentDomainMoves).toContain(DefinedMoveType.ASSIST);
      expect(opponentDomainMoves).toContain(DefinedMoveType.ORGANIZE);
      expect(opponentDomainMoves).toHaveLength(4);
    });

    it('should have correct moves that affect community', () => {
      const communityMoves = Object.values(DEFINED_MOVES)
        .filter((move) => move.affectsCommunity)
        .map((move) => move.type);

      expect(communityMoves).toContain(DefinedMoveType.REMOVE);
      expect(communityMoves).toContain(DefinedMoveType.ADVANCE);
      expect(communityMoves).toContain(DefinedMoveType.ASSIST);
      expect(communityMoves).toContain(DefinedMoveType.WITHDRAW);
      expect(communityMoves).toHaveLength(4);
    });

    it('should have moves that do not affect community', () => {
      const nonCommunityMoves = Object.values(DEFINED_MOVES)
        .filter((move) => !move.affectsCommunity)
        .map((move) => move.type);

      expect(nonCommunityMoves).toContain(DefinedMoveType.INFLUENCE);
      expect(nonCommunityMoves).toContain(DefinedMoveType.ORGANIZE);
      expect(nonCommunityMoves).toHaveLength(2);
    });
  });
});
