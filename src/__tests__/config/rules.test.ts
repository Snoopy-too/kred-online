import { describe, it, expect } from 'vitest';
import { DefinedMoveType, MoveRequirementType } from '../../types/move';
import { DEFINED_MOVES, TilePlayOptionType, TILE_PLAY_OPTIONS } from '../../config/rules';

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

describe('TILE_PLAY_OPTIONS Configuration', () => {
  describe('Structure and Completeness', () => {
    it('should define all four tile play option types', () => {
      const optionTypes = Object.keys(TILE_PLAY_OPTIONS);
      expect(optionTypes).toHaveLength(4);
      expect(optionTypes).toContain(TilePlayOptionType.NO_MOVE);
      expect(optionTypes).toContain(TilePlayOptionType.ONE_OPTIONAL);
      expect(optionTypes).toContain(TilePlayOptionType.ONE_MANDATORY);
      expect(optionTypes).toContain(TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY);
    });

    it('should have all required properties for each option', () => {
      Object.values(TILE_PLAY_OPTIONS).forEach((option) => {
        expect(option).toHaveProperty('optionType');
        expect(option).toHaveProperty('description');
        expect(option).toHaveProperty('allowedMoveTypes');
        expect(option).toHaveProperty('maxOptionalMoves');
        expect(option).toHaveProperty('maxMandatoryMoves');
        expect(option).toHaveProperty('requiresAction');
      });
    });

    it('should have non-empty descriptions', () => {
      Object.values(TILE_PLAY_OPTIONS).forEach((option) => {
        expect(option.description).toBeTruthy();
        expect(option.description.length).toBeGreaterThan(0);
      });
    });

    it('should have valid allowedMoveTypes arrays', () => {
      Object.values(TILE_PLAY_OPTIONS).forEach((option) => {
        expect(Array.isArray(option.allowedMoveTypes)).toBe(true);
      });
    });
  });

  describe('NO_MOVE Option', () => {
    const noMove = TILE_PLAY_OPTIONS[TilePlayOptionType.NO_MOVE];

    it('should have correct option type', () => {
      expect(noMove.optionType).toBe(TilePlayOptionType.NO_MOVE);
    });

    it('should allow no moves', () => {
      expect(noMove.allowedMoveTypes).toHaveLength(0);
    });

    it('should have zero max optional moves', () => {
      expect(noMove.maxOptionalMoves).toBe(0);
    });

    it('should have zero max mandatory moves', () => {
      expect(noMove.maxMandatoryMoves).toBe(0);
    });

    it('should not require action', () => {
      expect(noMove.requiresAction).toBe(false);
    });
  });

  describe('ONE_OPTIONAL Option', () => {
    const oneOptional = TILE_PLAY_OPTIONS[TilePlayOptionType.ONE_OPTIONAL];

    it('should have correct option type', () => {
      expect(oneOptional.optionType).toBe(TilePlayOptionType.ONE_OPTIONAL);
    });

    it('should allow exactly 3 optional move types', () => {
      expect(oneOptional.allowedMoveTypes).toHaveLength(3);
      expect(oneOptional.allowedMoveTypes).toContain(DefinedMoveType.REMOVE);
      expect(oneOptional.allowedMoveTypes).toContain(DefinedMoveType.INFLUENCE);
      expect(oneOptional.allowedMoveTypes).toContain(DefinedMoveType.ASSIST);
    });

    it('should have max optional moves of 1', () => {
      expect(oneOptional.maxOptionalMoves).toBe(1);
    });

    it('should have zero max mandatory moves', () => {
      expect(oneOptional.maxMandatoryMoves).toBe(0);
    });

    it('should require action', () => {
      expect(oneOptional.requiresAction).toBe(true);
    });
  });

  describe('ONE_MANDATORY Option', () => {
    const oneMandatory = TILE_PLAY_OPTIONS[TilePlayOptionType.ONE_MANDATORY];

    it('should have correct option type', () => {
      expect(oneMandatory.optionType).toBe(TilePlayOptionType.ONE_MANDATORY);
    });

    it('should allow exactly 3 mandatory move types', () => {
      expect(oneMandatory.allowedMoveTypes).toHaveLength(3);
      expect(oneMandatory.allowedMoveTypes).toContain(DefinedMoveType.ADVANCE);
      expect(oneMandatory.allowedMoveTypes).toContain(DefinedMoveType.WITHDRAW);
      expect(oneMandatory.allowedMoveTypes).toContain(DefinedMoveType.ORGANIZE);
    });

    it('should have zero max optional moves', () => {
      expect(oneMandatory.maxOptionalMoves).toBe(0);
    });

    it('should have max mandatory moves of 1', () => {
      expect(oneMandatory.maxMandatoryMoves).toBe(1);
    });

    it('should require action', () => {
      expect(oneMandatory.requiresAction).toBe(true);
    });
  });

  describe('ONE_OPTIONAL_AND_ONE_MANDATORY Option', () => {
    const oneOfEach = TILE_PLAY_OPTIONS[TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY];

    it('should have correct option type', () => {
      expect(oneOfEach.optionType).toBe(TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY);
    });

    it('should allow all 6 move types', () => {
      expect(oneOfEach.allowedMoveTypes).toHaveLength(6);
      // Optional moves
      expect(oneOfEach.allowedMoveTypes).toContain(DefinedMoveType.REMOVE);
      expect(oneOfEach.allowedMoveTypes).toContain(DefinedMoveType.INFLUENCE);
      expect(oneOfEach.allowedMoveTypes).toContain(DefinedMoveType.ASSIST);
      // Mandatory moves
      expect(oneOfEach.allowedMoveTypes).toContain(DefinedMoveType.ADVANCE);
      expect(oneOfEach.allowedMoveTypes).toContain(DefinedMoveType.WITHDRAW);
      expect(oneOfEach.allowedMoveTypes).toContain(DefinedMoveType.ORGANIZE);
    });

    it('should have max optional moves of 1', () => {
      expect(oneOfEach.maxOptionalMoves).toBe(1);
    });

    it('should have max mandatory moves of 1', () => {
      expect(oneOfEach.maxMandatoryMoves).toBe(1);
    });

    it('should require action', () => {
      expect(oneOfEach.requiresAction).toBe(true);
    });
  });

  describe('Action Requirements', () => {
    it('should have exactly 1 option that does not require action', () => {
      const noActionOptions = Object.values(TILE_PLAY_OPTIONS).filter(
        (opt) => !opt.requiresAction
      );
      expect(noActionOptions).toHaveLength(1);
      expect(noActionOptions[0].optionType).toBe(TilePlayOptionType.NO_MOVE);
    });

    it('should have exactly 3 options that require action', () => {
      const actionOptions = Object.values(TILE_PLAY_OPTIONS).filter(
        (opt) => opt.requiresAction
      );
      expect(actionOptions).toHaveLength(3);
    });
  });

  describe('Move Count Constraints', () => {
    it('should have correct total move limits for each option', () => {
      const noMove = TILE_PLAY_OPTIONS[TilePlayOptionType.NO_MOVE];
      expect(noMove.maxOptionalMoves + noMove.maxMandatoryMoves).toBe(0);

      const oneOptional = TILE_PLAY_OPTIONS[TilePlayOptionType.ONE_OPTIONAL];
      expect(oneOptional.maxOptionalMoves + oneOptional.maxMandatoryMoves).toBe(1);

      const oneMandatory = TILE_PLAY_OPTIONS[TilePlayOptionType.ONE_MANDATORY];
      expect(oneMandatory.maxOptionalMoves + oneMandatory.maxMandatoryMoves).toBe(1);

      const oneOfEach = TILE_PLAY_OPTIONS[TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY];
      expect(oneOfEach.maxOptionalMoves + oneOfEach.maxMandatoryMoves).toBe(2);
    });

    it('should have non-negative move counts', () => {
      Object.values(TILE_PLAY_OPTIONS).forEach((option) => {
        expect(option.maxOptionalMoves).toBeGreaterThanOrEqual(0);
        expect(option.maxMandatoryMoves).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Allowed Move Types Consistency', () => {
    it('should match allowedMoveTypes with move counts for ONE_OPTIONAL', () => {
      const oneOptional = TILE_PLAY_OPTIONS[TilePlayOptionType.ONE_OPTIONAL];
      // Should only have optional moves
      oneOptional.allowedMoveTypes.forEach((moveType) => {
        const move = DEFINED_MOVES[moveType];
        expect(move.requirement).toBe(MoveRequirementType.OPTIONAL);
      });
    });

    it('should match allowedMoveTypes with move counts for ONE_MANDATORY', () => {
      const oneMandatory = TILE_PLAY_OPTIONS[TilePlayOptionType.ONE_MANDATORY];
      // Should only have mandatory moves
      oneMandatory.allowedMoveTypes.forEach((moveType) => {
        const move = DEFINED_MOVES[moveType];
        expect(move.requirement).toBe(MoveRequirementType.MANDATORY);
      });
    });

    it('should have both optional and mandatory moves for ONE_OPTIONAL_AND_ONE_MANDATORY', () => {
      const oneOfEach = TILE_PLAY_OPTIONS[TilePlayOptionType.ONE_OPTIONAL_AND_ONE_MANDATORY];

      const optionalMoves = oneOfEach.allowedMoveTypes.filter(
        (moveType) => DEFINED_MOVES[moveType].requirement === MoveRequirementType.OPTIONAL
      );
      const mandatoryMoves = oneOfEach.allowedMoveTypes.filter(
        (moveType) => DEFINED_MOVES[moveType].requirement === MoveRequirementType.MANDATORY
      );

      expect(optionalMoves.length).toBe(3);
      expect(mandatoryMoves.length).toBe(3);
    });
  });
});
