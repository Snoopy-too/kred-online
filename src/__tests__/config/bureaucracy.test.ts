import { describe, it, expect } from 'vitest';
import {
  THREE_FOUR_PLAYER_BUREAUCRACY_MENU,
  FIVE_PLAYER_BUREAUCRACY_MENU
} from '../../config/bureaucracy';

describe('THREE_FOUR_PLAYER_BUREAUCRACY_MENU Configuration', () => {
  describe('Structure and Completeness', () => {
    it('should have exactly 10 menu items', () => {
      expect(THREE_FOUR_PLAYER_BUREAUCRACY_MENU).toHaveLength(10);
    });

    it('should have all items with required fields', () => {
      THREE_FOUR_PLAYER_BUREAUCRACY_MENU.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('description');
        expect(typeof item.id).toBe('string');
        expect(typeof item.type).toBe('string');
        expect(typeof item.price).toBe('number');
        expect(typeof item.description).toBe('string');
      });
    });

    it('should have unique IDs for all items', () => {
      const ids = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('Item Types', () => {
    it('should have 3 PROMOTION items', () => {
      const promotions = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'PROMOTION'
      );
      expect(promotions).toHaveLength(3);
    });

    it('should have 6 MOVE items', () => {
      const moves = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'MOVE'
      );
      expect(moves).toHaveLength(6);
    });

    it('should have 1 CREDIBILITY item', () => {
      const credibility = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'CREDIBILITY'
      );
      expect(credibility).toHaveLength(1);
    });

    it('should have moveType for all MOVE items', () => {
      const moves = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'MOVE'
      );
      moves.forEach(move => {
        expect(move).toHaveProperty('moveType');
        expect(move.moveType).toBeDefined();
      });
    });

    it('should have promotionLocation for all PROMOTION items', () => {
      const promotions = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'PROMOTION'
      );
      promotions.forEach(promotion => {
        expect(promotion).toHaveProperty('promotionLocation');
        expect(promotion.promotionLocation).toBeDefined();
      });
    });
  });

  describe('Specific Items', () => {
    it('should have promote_office at price 18', () => {
      const item = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'promote_office');
      expect(item).toBeDefined();
      expect(item!.type).toBe('PROMOTION');
      expect(item!.promotionLocation).toBe('OFFICE');
      expect(item!.price).toBe(18);
    });

    it('should have move_assist at price 15', () => {
      const item = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_assist');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('ASSIST');
      expect(item!.price).toBe(15);
    });

    it('should have move_remove at price 15', () => {
      const item = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_remove');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('REMOVE');
      expect(item!.price).toBe(15);
    });

    it('should have move_influence at price 15', () => {
      const item = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_influence');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('INFLUENCE');
      expect(item!.price).toBe(15);
    });

    it('should have promote_rostrum at price 12', () => {
      const item = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'promote_rostrum');
      expect(item).toBeDefined();
      expect(item!.type).toBe('PROMOTION');
      expect(item!.promotionLocation).toBe('ROSTRUM');
      expect(item!.price).toBe(12);
    });

    it('should have move_advance at price 9', () => {
      const item = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_advance');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('ADVANCE');
      expect(item!.price).toBe(9);
    });

    it('should have move_withdraw at price 9', () => {
      const item = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_withdraw');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('WITHDRAW');
      expect(item!.price).toBe(9);
    });

    it('should have move_organize at price 9', () => {
      const item = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_organize');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('ORGANIZE');
      expect(item!.price).toBe(9);
    });

    it('should have promote_seat at price 6', () => {
      const item = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'promote_seat');
      expect(item).toBeDefined();
      expect(item!.type).toBe('PROMOTION');
      expect(item!.promotionLocation).toBe('SEAT');
      expect(item!.price).toBe(6);
    });

    it('should have credibility at price 3', () => {
      const item = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'credibility');
      expect(item).toBeDefined();
      expect(item!.type).toBe('CREDIBILITY');
      expect(item!.price).toBe(3);
    });
  });

  describe('Price Ordering', () => {
    it('should be ordered by price from highest to lowest', () => {
      const prices = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.map(item => item.price);
      const sortedPrices = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedPrices);
    });

    it('should have price range from 3 to 18', () => {
      const prices = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.map(item => item.price);
      expect(Math.min(...prices)).toBe(3);
      expect(Math.max(...prices)).toBe(18);
    });
  });

  describe('Move Coverage', () => {
    it('should include all 6 move types', () => {
      const moveItems = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'MOVE'
      );
      const moveTypes = moveItems.map(item => item.moveType);
      expect(moveTypes).toContain('ADVANCE');
      expect(moveTypes).toContain('WITHDRAW');
      expect(moveTypes).toContain('ORGANIZE');
      expect(moveTypes).toContain('ASSIST');
      expect(moveTypes).toContain('REMOVE');
      expect(moveTypes).toContain('INFLUENCE');
    });
  });

  describe('Promotion Coverage', () => {
    it('should include all 3 promotion locations', () => {
      const promotionItems = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'PROMOTION'
      );
      const locations = promotionItems.map(item => item.promotionLocation);
      expect(locations).toContain('OFFICE');
      expect(locations).toContain('ROSTRUM');
      expect(locations).toContain('SEAT');
    });

    it('should have promotion prices decrease by location hierarchy', () => {
      const office = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(
        i => i.promotionLocation === 'OFFICE'
      );
      const rostrum = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(
        i => i.promotionLocation === 'ROSTRUM'
      );
      const seat = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.find(
        i => i.promotionLocation === 'SEAT'
      );
      expect(office!.price).toBeGreaterThan(rostrum!.price);
      expect(rostrum!.price).toBeGreaterThan(seat!.price);
    });
  });
});

describe('FIVE_PLAYER_BUREAUCRACY_MENU Configuration', () => {
  describe('Structure and Completeness', () => {
    it('should have exactly 10 menu items', () => {
      expect(FIVE_PLAYER_BUREAUCRACY_MENU).toHaveLength(10);
    });

    it('should have all items with required fields', () => {
      FIVE_PLAYER_BUREAUCRACY_MENU.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('description');
        expect(typeof item.id).toBe('string');
        expect(typeof item.type).toBe('string');
        expect(typeof item.price).toBe('number');
        expect(typeof item.description).toBe('string');
      });
    });

    it('should have unique IDs for all items', () => {
      const ids = FIVE_PLAYER_BUREAUCRACY_MENU.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('Item Types', () => {
    it('should have 3 PROMOTION items', () => {
      const promotions = FIVE_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'PROMOTION'
      );
      expect(promotions).toHaveLength(3);
    });

    it('should have 6 MOVE items', () => {
      const moves = FIVE_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'MOVE'
      );
      expect(moves).toHaveLength(6);
    });

    it('should have 1 CREDIBILITY item', () => {
      const credibility = FIVE_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'CREDIBILITY'
      );
      expect(credibility).toHaveLength(1);
    });

    it('should have moveType for all MOVE items', () => {
      const moves = FIVE_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'MOVE'
      );
      moves.forEach(move => {
        expect(move).toHaveProperty('moveType');
        expect(move.moveType).toBeDefined();
      });
    });

    it('should have promotionLocation for all PROMOTION items', () => {
      const promotions = FIVE_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'PROMOTION'
      );
      promotions.forEach(promotion => {
        expect(promotion).toHaveProperty('promotionLocation');
        expect(promotion.promotionLocation).toBeDefined();
      });
    });
  });

  describe('Specific Items', () => {
    it('should have promote_office at price 12', () => {
      const item = FIVE_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'promote_office');
      expect(item).toBeDefined();
      expect(item!.type).toBe('PROMOTION');
      expect(item!.promotionLocation).toBe('OFFICE');
      expect(item!.price).toBe(12);
    });

    it('should have move_assist at price 10', () => {
      const item = FIVE_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_assist');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('ASSIST');
      expect(item!.price).toBe(10);
    });

    it('should have move_remove at price 10', () => {
      const item = FIVE_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_remove');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('REMOVE');
      expect(item!.price).toBe(10);
    });

    it('should have move_influence at price 10', () => {
      const item = FIVE_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_influence');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('INFLUENCE');
      expect(item!.price).toBe(10);
    });

    it('should have promote_rostrum at price 8', () => {
      const item = FIVE_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'promote_rostrum');
      expect(item).toBeDefined();
      expect(item!.type).toBe('PROMOTION');
      expect(item!.promotionLocation).toBe('ROSTRUM');
      expect(item!.price).toBe(8);
    });

    it('should have move_advance at price 6', () => {
      const item = FIVE_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_advance');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('ADVANCE');
      expect(item!.price).toBe(6);
    });

    it('should have move_withdraw at price 6', () => {
      const item = FIVE_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_withdraw');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('WITHDRAW');
      expect(item!.price).toBe(6);
    });

    it('should have move_organize at price 6', () => {
      const item = FIVE_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'move_organize');
      expect(item).toBeDefined();
      expect(item!.type).toBe('MOVE');
      expect(item!.moveType).toBe('ORGANIZE');
      expect(item!.price).toBe(6);
    });

    it('should have promote_seat at price 4', () => {
      const item = FIVE_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'promote_seat');
      expect(item).toBeDefined();
      expect(item!.type).toBe('PROMOTION');
      expect(item!.promotionLocation).toBe('SEAT');
      expect(item!.price).toBe(4);
    });

    it('should have credibility at price 2', () => {
      const item = FIVE_PLAYER_BUREAUCRACY_MENU.find(i => i.id === 'credibility');
      expect(item).toBeDefined();
      expect(item!.type).toBe('CREDIBILITY');
      expect(item!.price).toBe(2);
    });
  });

  describe('Price Ordering', () => {
    it('should be ordered by price from highest to lowest', () => {
      const prices = FIVE_PLAYER_BUREAUCRACY_MENU.map(item => item.price);
      const sortedPrices = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedPrices);
    });

    it('should have price range from 2 to 12', () => {
      const prices = FIVE_PLAYER_BUREAUCRACY_MENU.map(item => item.price);
      expect(Math.min(...prices)).toBe(2);
      expect(Math.max(...prices)).toBe(12);
    });
  });

  describe('Move Coverage', () => {
    it('should include all 6 move types', () => {
      const moveItems = FIVE_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'MOVE'
      );
      const moveTypes = moveItems.map(item => item.moveType);
      expect(moveTypes).toContain('ADVANCE');
      expect(moveTypes).toContain('WITHDRAW');
      expect(moveTypes).toContain('ORGANIZE');
      expect(moveTypes).toContain('ASSIST');
      expect(moveTypes).toContain('REMOVE');
      expect(moveTypes).toContain('INFLUENCE');
    });
  });

  describe('Promotion Coverage', () => {
    it('should include all 3 promotion locations', () => {
      const promotionItems = FIVE_PLAYER_BUREAUCRACY_MENU.filter(
        item => item.type === 'PROMOTION'
      );
      const locations = promotionItems.map(item => item.promotionLocation);
      expect(locations).toContain('OFFICE');
      expect(locations).toContain('ROSTRUM');
      expect(locations).toContain('SEAT');
    });

    it('should have promotion prices decrease by location hierarchy', () => {
      const office = FIVE_PLAYER_BUREAUCRACY_MENU.find(
        i => i.promotionLocation === 'OFFICE'
      );
      const rostrum = FIVE_PLAYER_BUREAUCRACY_MENU.find(
        i => i.promotionLocation === 'ROSTRUM'
      );
      const seat = FIVE_PLAYER_BUREAUCRACY_MENU.find(
        i => i.promotionLocation === 'SEAT'
      );
      expect(office!.price).toBeGreaterThan(rostrum!.price);
      expect(rostrum!.price).toBeGreaterThan(seat!.price);
    });
  });
});

describe('Bureaucracy Menu Comparison', () => {
  describe('Structural Similarity', () => {
    it('should have the same number of items in both menus', () => {
      expect(THREE_FOUR_PLAYER_BUREAUCRACY_MENU.length).toBe(
        FIVE_PLAYER_BUREAUCRACY_MENU.length
      );
    });

    it('should have the same item IDs in both menus', () => {
      const threeIds = THREE_FOUR_PLAYER_BUREAUCRACY_MENU.map(i => i.id).sort();
      const fiveIds = FIVE_PLAYER_BUREAUCRACY_MENU.map(i => i.id).sort();
      expect(threeIds).toEqual(fiveIds);
    });

    it('should have the same item types in both menus', () => {
      THREE_FOUR_PLAYER_BUREAUCRACY_MENU.forEach((item, index) => {
        const fiveItem = FIVE_PLAYER_BUREAUCRACY_MENU[index];
        expect(item.type).toBe(fiveItem.type);
        expect(item.moveType).toBe(fiveItem.moveType);
        expect(item.promotionLocation).toBe(fiveItem.promotionLocation);
      });
    });
  });

  describe('Price Differences', () => {
    it('should have different prices for all items (5-player is cheaper)', () => {
      THREE_FOUR_PLAYER_BUREAUCRACY_MENU.forEach((threeItem, index) => {
        const fiveItem = FIVE_PLAYER_BUREAUCRACY_MENU[index];
        expect(fiveItem.price).toBeLessThan(threeItem.price);
      });
    });

    it('should have consistent price ratios across item types', () => {
      // 5-player prices are 2/3 of 3-4 player prices
      THREE_FOUR_PLAYER_BUREAUCRACY_MENU.forEach((threeItem, index) => {
        const fiveItem = FIVE_PLAYER_BUREAUCRACY_MENU[index];
        const ratio = fiveItem.price / threeItem.price;
        expect(ratio).toBeCloseTo(2/3, 1);
      });
    });
  });
});
