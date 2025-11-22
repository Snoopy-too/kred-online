import { describe, it, expect } from 'vitest';
import { DefinedMoveType, MoveRequirementType } from '../../types/move';
import {
  DEFINED_MOVES,
  TilePlayOptionType,
  TILE_PLAY_OPTIONS,
  TILE_REQUIREMENTS,
  ROSTRUM_SUPPORT_RULES
} from '../../config/rules';

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

describe('TILE_REQUIREMENTS Configuration', () => {
  describe('Structure and Completeness', () => {
    it('should define all 25 tiles (24 numbered + BLANK)', () => {
      const tileIds = Object.keys(TILE_REQUIREMENTS);
      expect(tileIds).toHaveLength(25);

      // Check all numbered tiles 01-24
      for (let i = 1; i <= 24; i++) {
        const tileId = i.toString().padStart(2, '0');
        expect(tileIds).toContain(tileId);
      }

      // Check BLANK tile
      expect(tileIds).toContain('BLANK');
    });

    it('should have all required properties for each tile', () => {
      Object.values(TILE_REQUIREMENTS).forEach((requirement) => {
        expect(requirement).toHaveProperty('tileId');
        expect(requirement).toHaveProperty('requiredMoves');
        expect(requirement).toHaveProperty('description');
        expect(requirement).toHaveProperty('canBeRejected');
      });
    });

    it('should have valid tile IDs', () => {
      Object.values(TILE_REQUIREMENTS).forEach((requirement) => {
        expect(requirement.tileId).toBeTruthy();
        expect(requirement.tileId.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty descriptions', () => {
      Object.values(TILE_REQUIREMENTS).forEach((requirement) => {
        expect(requirement.description).toBeTruthy();
        expect(requirement.description.length).toBeGreaterThan(0);
      });
    });

    it('should have valid requiredMoves arrays', () => {
      Object.values(TILE_REQUIREMENTS).forEach((requirement) => {
        expect(Array.isArray(requirement.requiredMoves)).toBe(true);
      });
    });

    it('should have boolean canBeRejected property', () => {
      Object.values(TILE_REQUIREMENTS).forEach((requirement) => {
        expect(typeof requirement.canBeRejected).toBe('boolean');
      });
    });
  });

  describe('Tiles by Move Requirements', () => {
    it('should have exactly 2 tiles requiring REMOVE + ADVANCE (01-02)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 2 &&
          req.requiredMoves.includes(DefinedMoveType.REMOVE) &&
          req.requiredMoves.includes(DefinedMoveType.ADVANCE)
      );
      expect(tiles).toHaveLength(2);
      expect(tiles.map((t) => t.tileId)).toEqual(expect.arrayContaining(['01', '02']));
    });

    it('should have exactly 2 tiles requiring INFLUENCE + ADVANCE (03-04)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 2 &&
          req.requiredMoves.includes(DefinedMoveType.INFLUENCE) &&
          req.requiredMoves.includes(DefinedMoveType.ADVANCE)
      );
      expect(tiles).toHaveLength(2);
      expect(tiles.map((t) => t.tileId)).toEqual(expect.arrayContaining(['03', '04']));
    });

    it('should have exactly 2 tiles requiring only ADVANCE (05-06)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 1 &&
          req.requiredMoves.includes(DefinedMoveType.ADVANCE)
      );
      expect(tiles).toHaveLength(2);
      expect(tiles.map((t) => t.tileId)).toEqual(expect.arrayContaining(['05', '06']));
    });

    it('should have exactly 2 tiles requiring ASSIST + ADVANCE (07-08)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 2 &&
          req.requiredMoves.includes(DefinedMoveType.ASSIST) &&
          req.requiredMoves.includes(DefinedMoveType.ADVANCE)
      );
      expect(tiles).toHaveLength(2);
      expect(tiles.map((t) => t.tileId)).toEqual(expect.arrayContaining(['07', '08']));
    });

    it('should have exactly 2 tiles requiring REMOVE + ORGANIZE (09-10)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 2 &&
          req.requiredMoves.includes(DefinedMoveType.REMOVE) &&
          req.requiredMoves.includes(DefinedMoveType.ORGANIZE)
      );
      expect(tiles).toHaveLength(2);
      expect(tiles.map((t) => t.tileId)).toEqual(expect.arrayContaining(['09', '10']));
    });

    it('should have exactly 1 tile requiring only INFLUENCE (11)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 1 &&
          req.requiredMoves.includes(DefinedMoveType.INFLUENCE)
      );
      expect(tiles).toHaveLength(1);
      expect(tiles[0].tileId).toBe('11');
    });

    it('should have exactly 1 tile requiring only ORGANIZE (12)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 1 &&
          req.requiredMoves.includes(DefinedMoveType.ORGANIZE)
      );
      expect(tiles).toHaveLength(1);
      expect(tiles[0].tileId).toBe('12');
    });

    it('should have exactly 2 tiles requiring ASSIST + ORGANIZE (13-14)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 2 &&
          req.requiredMoves.includes(DefinedMoveType.ASSIST) &&
          req.requiredMoves.includes(DefinedMoveType.ORGANIZE)
      );
      expect(tiles).toHaveLength(2);
      expect(tiles.map((t) => t.tileId)).toEqual(expect.arrayContaining(['13', '14']));
    });

    it('should have exactly 2 tiles requiring only REMOVE (15-16)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 1 &&
          req.requiredMoves.includes(DefinedMoveType.REMOVE)
      );
      expect(tiles).toHaveLength(2);
      expect(tiles.map((t) => t.tileId)).toEqual(expect.arrayContaining(['15', '16']));
    });

    it('should have exactly 2 tiles requiring INFLUENCE + WITHDRAW (17-18)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 2 &&
          req.requiredMoves.includes(DefinedMoveType.INFLUENCE) &&
          req.requiredMoves.includes(DefinedMoveType.WITHDRAW)
      );
      expect(tiles).toHaveLength(2);
      expect(tiles.map((t) => t.tileId)).toEqual(expect.arrayContaining(['17', '18']));
    });

    it('should have exactly 3 tiles requiring only WITHDRAW (19-21)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 1 &&
          req.requiredMoves.includes(DefinedMoveType.WITHDRAW)
      );
      expect(tiles).toHaveLength(3);
      expect(tiles.map((t) => t.tileId)).toEqual(expect.arrayContaining(['19', '20', '21']));
    });

    it('should have exactly 3 tiles requiring ASSIST + WITHDRAW (22-24)', () => {
      const tiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) =>
          req.requiredMoves.length === 2 &&
          req.requiredMoves.includes(DefinedMoveType.ASSIST) &&
          req.requiredMoves.includes(DefinedMoveType.WITHDRAW)
      );
      expect(tiles).toHaveLength(3);
      expect(tiles.map((t) => t.tileId)).toEqual(expect.arrayContaining(['22', '23', '24']));
    });
  });

  describe('BLANK Tile', () => {
    const blank = TILE_REQUIREMENTS['BLANK'];

    it('should exist', () => {
      expect(blank).toBeDefined();
    });

    it('should have tileId of BLANK', () => {
      expect(blank.tileId).toBe('BLANK');
    });

    it('should have no required moves', () => {
      expect(blank.requiredMoves).toHaveLength(0);
    });

    it('should be rejectable', () => {
      expect(blank.canBeRejected).toBe(true);
    });

    it('should have description mentioning wild tile', () => {
      expect(blank.description.toLowerCase()).toContain('blank');
    });
  });

  describe('Rejection Rules', () => {
    it('should mark all numbered tiles (01-24) as non-rejectable', () => {
      for (let i = 1; i <= 24; i++) {
        const tileId = i.toString().padStart(2, '0');
        const tile = TILE_REQUIREMENTS[tileId];
        expect(tile.canBeRejected).toBe(false);
      }
    });

    it('should mark only BLANK tile as rejectable', () => {
      const rejectableTiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) => req.canBeRejected
      );
      expect(rejectableTiles).toHaveLength(1);
      expect(rejectableTiles[0].tileId).toBe('BLANK');
    });

    it('should have 24 non-rejectable tiles', () => {
      const nonRejectableTiles = Object.values(TILE_REQUIREMENTS).filter(
        (req) => !req.canBeRejected
      );
      expect(nonRejectableTiles).toHaveLength(24);
    });
  });

  describe('Move Distribution', () => {
    it('should use all 6 move types across all tiles', () => {
      const usedMoves = new Set<DefinedMoveType>();
      Object.values(TILE_REQUIREMENTS).forEach((req) => {
        req.requiredMoves.forEach((move) => usedMoves.add(move));
      });

      expect(usedMoves.size).toBe(6);
      expect(usedMoves).toContain(DefinedMoveType.REMOVE);
      expect(usedMoves).toContain(DefinedMoveType.ADVANCE);
      expect(usedMoves).toContain(DefinedMoveType.INFLUENCE);
      expect(usedMoves).toContain(DefinedMoveType.ASSIST);
      expect(usedMoves).toContain(DefinedMoveType.WITHDRAW);
      expect(usedMoves).toContain(DefinedMoveType.ORGANIZE);
    });

    it('should have tiles with 0, 1, or 2 required moves only', () => {
      Object.values(TILE_REQUIREMENTS).forEach((req) => {
        expect([0, 1, 2]).toContain(req.requiredMoves.length);
      });
    });

    it('should have correct count of tiles by move count', () => {
      const noMoves = Object.values(TILE_REQUIREMENTS).filter(
        (req) => req.requiredMoves.length === 0
      );
      const oneMoves = Object.values(TILE_REQUIREMENTS).filter(
        (req) => req.requiredMoves.length === 1
      );
      const twoMoves = Object.values(TILE_REQUIREMENTS).filter(
        (req) => req.requiredMoves.length === 2
      );

      expect(noMoves).toHaveLength(1); // BLANK
      expect(oneMoves).toHaveLength(9); // Tiles 05-06, 11-12, 15-16, 19-21
      expect(twoMoves).toHaveLength(15); // Remaining tiles
    });
  });

  describe('Consistency Checks', () => {
    it('should have matching tileId in key and value', () => {
      Object.entries(TILE_REQUIREMENTS).forEach(([key, value]) => {
        expect(key).toBe(value.tileId);
      });
    });

    it('should have unique tile IDs', () => {
      const tileIds = Object.values(TILE_REQUIREMENTS).map((req) => req.tileId);
      const uniqueIds = new Set(tileIds);
      expect(uniqueIds.size).toBe(tileIds.length);
    });

    it('should have valid move types in requiredMoves', () => {
      const validMoves = Object.values(DefinedMoveType);
      Object.values(TILE_REQUIREMENTS).forEach((req) => {
        req.requiredMoves.forEach((move) => {
          expect(validMoves).toContain(move);
        });
      });
    });
  });
});

describe('ROSTRUM_SUPPORT_RULES Configuration', () => {
  describe('Structure and Completeness', () => {
    it('should define rules for all 5 players', () => {
      const playerIds = Object.keys(ROSTRUM_SUPPORT_RULES).map(Number);
      expect(playerIds).toHaveLength(5);
      expect(playerIds).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
    });

    it('should have all required properties for each player', () => {
      Object.values(ROSTRUM_SUPPORT_RULES).forEach((player) => {
        expect(player).toHaveProperty('playerId');
        expect(player).toHaveProperty('rostrums');
        expect(player).toHaveProperty('office');
      });
    });

    it('should have matching playerId in key and value', () => {
      Object.entries(ROSTRUM_SUPPORT_RULES).forEach(([key, value]) => {
        expect(Number(key)).toBe(value.playerId);
      });
    });
  });

  describe('Rostrum Configuration', () => {
    it('should have exactly 2 rostrums per player', () => {
      Object.values(ROSTRUM_SUPPORT_RULES).forEach((player) => {
        expect(player.rostrums).toHaveLength(2);
      });
    });

    it('should have all required properties for each rostrum', () => {
      Object.values(ROSTRUM_SUPPORT_RULES).forEach((player) => {
        player.rostrums.forEach((rostrum) => {
          expect(rostrum).toHaveProperty('rostrum');
          expect(rostrum).toHaveProperty('supportingSeats');
        });
      });
    });

    it('should have correct rostrum names for each player', () => {
      for (let playerId = 1; playerId <= 5; playerId++) {
        const player = ROSTRUM_SUPPORT_RULES[playerId];
        expect(player.rostrums[0].rostrum).toBe(`p${playerId}_rostrum1`);
        expect(player.rostrums[1].rostrum).toBe(`p${playerId}_rostrum2`);
      }
    });

    it('should have exactly 3 supporting seats per rostrum', () => {
      Object.values(ROSTRUM_SUPPORT_RULES).forEach((player) => {
        player.rostrums.forEach((rostrum) => {
          expect(rostrum.supportingSeats).toHaveLength(3);
        });
      });
    });

    it('should have valid seat arrays', () => {
      Object.values(ROSTRUM_SUPPORT_RULES).forEach((player) => {
        player.rostrums.forEach((rostrum) => {
          expect(Array.isArray(rostrum.supportingSeats)).toBe(true);
          rostrum.supportingSeats.forEach((seat) => {
            expect(typeof seat).toBe('string');
            expect(seat.length).toBeGreaterThan(0);
          });
        });
      });
    });
  });

  describe('Seat Groupings', () => {
    it('should have seats 1-3 supporting rostrum1 for all players', () => {
      for (let playerId = 1; playerId <= 5; playerId++) {
        const player = ROSTRUM_SUPPORT_RULES[playerId];
        const rostrum1 = player.rostrums.find(r => r.rostrum === `p${playerId}_rostrum1`);

        expect(rostrum1).toBeDefined();
        expect(rostrum1!.supportingSeats).toEqual([
          `p${playerId}_seat1`,
          `p${playerId}_seat2`,
          `p${playerId}_seat3`
        ]);
      }
    });

    it('should have seats 4-6 supporting rostrum2 for all players', () => {
      for (let playerId = 1; playerId <= 5; playerId++) {
        const player = ROSTRUM_SUPPORT_RULES[playerId];
        const rostrum2 = player.rostrums.find(r => r.rostrum === `p${playerId}_rostrum2`);

        expect(rostrum2).toBeDefined();
        expect(rostrum2!.supportingSeats).toEqual([
          `p${playerId}_seat4`,
          `p${playerId}_seat5`,
          `p${playerId}_seat6`
        ]);
      }
    });

    it('should have no seat supporting multiple rostrums', () => {
      Object.values(ROSTRUM_SUPPORT_RULES).forEach((player) => {
        const allSeats = player.rostrums.flatMap(r => r.supportingSeats);
        const uniqueSeats = new Set(allSeats);
        expect(allSeats.length).toBe(uniqueSeats.size);
      });
    });

    it('should have all 6 seats accounted for per player', () => {
      for (let playerId = 1; playerId <= 5; playerId++) {
        const player = ROSTRUM_SUPPORT_RULES[playerId];
        const allSeats = player.rostrums.flatMap(r => r.supportingSeats);

        expect(allSeats).toHaveLength(6);
        for (let seatNum = 1; seatNum <= 6; seatNum++) {
          expect(allSeats).toContain(`p${playerId}_seat${seatNum}`);
        }
      }
    });
  });

  describe('Office Configuration', () => {
    it('should have correct office name for each player', () => {
      for (let playerId = 1; playerId <= 5; playerId++) {
        const player = ROSTRUM_SUPPORT_RULES[playerId];
        expect(player.office).toBe(`p${playerId}_office`);
      }
    });

    it('should have non-empty office strings', () => {
      Object.values(ROSTRUM_SUPPORT_RULES).forEach((player) => {
        expect(player.office).toBeTruthy();
        expect(player.office.length).toBeGreaterThan(0);
      });
    });

    it('should have unique office names', () => {
      const offices = Object.values(ROSTRUM_SUPPORT_RULES).map(p => p.office);
      const uniqueOffices = new Set(offices);
      expect(offices.length).toBe(uniqueOffices.size);
    });
  });

  describe('Individual Player Configurations', () => {
    it('should have correct configuration for Player 1', () => {
      const p1 = ROSTRUM_SUPPORT_RULES[1];
      expect(p1.playerId).toBe(1);
      expect(p1.office).toBe('p1_office');
      expect(p1.rostrums).toHaveLength(2);
    });

    it('should have correct configuration for Player 2', () => {
      const p2 = ROSTRUM_SUPPORT_RULES[2];
      expect(p2.playerId).toBe(2);
      expect(p2.office).toBe('p2_office');
      expect(p2.rostrums).toHaveLength(2);
    });

    it('should have correct configuration for Player 3', () => {
      const p3 = ROSTRUM_SUPPORT_RULES[3];
      expect(p3.playerId).toBe(3);
      expect(p3.office).toBe('p3_office');
      expect(p3.rostrums).toHaveLength(2);
    });

    it('should have correct configuration for Player 4', () => {
      const p4 = ROSTRUM_SUPPORT_RULES[4];
      expect(p4.playerId).toBe(4);
      expect(p4.office).toBe('p4_office');
      expect(p4.rostrums).toHaveLength(2);
    });

    it('should have correct configuration for Player 5', () => {
      const p5 = ROSTRUM_SUPPORT_RULES[5];
      expect(p5.playerId).toBe(5);
      expect(p5.office).toBe('p5_office');
      expect(p5.rostrums).toHaveLength(2);
    });
  });

  describe('Consistency Checks', () => {
    it('should have consistent structure across all players', () => {
      const structures = Object.values(ROSTRUM_SUPPORT_RULES).map(player => ({
        rostrumCount: player.rostrums.length,
        totalSeats: player.rostrums.flatMap(r => r.supportingSeats).length,
        seatsPerRostrum: player.rostrums.map(r => r.supportingSeats.length)
      }));

      // All should be identical
      structures.forEach(structure => {
        expect(structure.rostrumCount).toBe(2);
        expect(structure.totalSeats).toBe(6);
        expect(structure.seatsPerRostrum).toEqual([3, 3]);
      });
    });

    it('should have unique rostrum names across all players', () => {
      const allRostrums = Object.values(ROSTRUM_SUPPORT_RULES).flatMap(
        player => player.rostrums.map(r => r.rostrum)
      );
      const uniqueRostrums = new Set(allRostrums);
      expect(allRostrums.length).toBe(uniqueRostrums.size);
      expect(allRostrums).toHaveLength(10); // 5 players × 2 rostrums
    });

    it('should have unique seat names across all players', () => {
      const allSeats = Object.values(ROSTRUM_SUPPORT_RULES).flatMap(
        player => player.rostrums.flatMap(r => r.supportingSeats)
      );
      const uniqueSeats = new Set(allSeats);
      expect(allSeats.length).toBe(uniqueSeats.size);
      expect(allSeats).toHaveLength(30); // 5 players × 6 seats
    });
  });
});
