/**
 * Integration Tests for Game Systems
 * Tests maid system, customer system, menu system, finance system, facility system
 * Requirements: 2.x, 3.x, 4.x, 5.x, 6.x
 */
import { describe, it, expect } from 'vitest';
import {
  generateRandomMaid,
  calculateEfficiency,
  getMaxMaids,
  getExperienceForLevel,
} from '@/systems/maidSystem';
import {
  generateCustomer,
  calculateSatisfaction,
  calculateTip,
  getSpawnInterval,
} from '@/systems/customerSystem';
import {
  getAvailableItems,
  getPriceRange,
} from '@/systems/menuSystem';
import {
  addRevenue,
  addExpense,
  deductGold,
  calculateDailyOperatingCost,
  canAfford,
} from '@/systems/financeSystem';
import {
  calculateMaxSeats,
  calculateSatisfactionBonus,
} from '@/systems/facilitySystem';
import { initialGameState, GAME_CONSTANTS } from '@/data/initialState';
import { Finance } from '@/types';

describe('Game Systems Integration Tests', () => {
  // ==================== Maid System Tests ====================
  describe('Maid System', () => {
    describe('generateRandomMaid', () => {
      it('should generate a valid maid with all required properties', () => {
        const maid = generateRandomMaid();
        
        expect(maid.id).toBeDefined();
        expect(maid.name).toBeDefined();
        expect(maid.avatar).toBeDefined();
        expect(maid.personality).toBeDefined();
        expect(maid.stats).toBeDefined();
        expect(maid.level).toBe(1);
        expect(maid.stamina).toBe(100);
        expect(maid.mood).toBeGreaterThanOrEqual(70);
      });

      it('should generate maids with stats in valid range', () => {
        for (let i = 0; i < 10; i++) {
          const maid = generateRandomMaid();
          
          expect(maid.stats.charm).toBeGreaterThanOrEqual(1);
          expect(maid.stats.charm).toBeLessThanOrEqual(100);
          expect(maid.stats.skill).toBeGreaterThanOrEqual(1);
          expect(maid.stats.skill).toBeLessThanOrEqual(100);
          expect(maid.stats.stamina).toBeGreaterThanOrEqual(1);
          expect(maid.stats.stamina).toBeLessThanOrEqual(100);
          expect(maid.stats.speed).toBeGreaterThanOrEqual(1);
          expect(maid.stats.speed).toBeLessThanOrEqual(100);
        }
      });
    });

    describe('calculateEfficiency', () => {
      it('should return reduced efficiency for low stamina', () => {
        const maid = generateRandomMaid();
        maid.stamina = 15; // Below threshold
        
        const efficiency = calculateEfficiency(maid);
        const normalMaid = { ...maid, stamina: 100 };
        const normalEfficiency = calculateEfficiency(normalMaid);
        
        expect(efficiency).toBeLessThan(normalEfficiency);
      });

      it('should return higher efficiency for higher stats', () => {
        const lowStatMaid = generateRandomMaid();
        lowStatMaid.stats = { charm: 20, skill: 20, stamina: 20, speed: 20 };
        lowStatMaid.stamina = 100;
        
        const highStatMaid = generateRandomMaid();
        highStatMaid.stats = { charm: 80, skill: 80, stamina: 80, speed: 80 };
        highStatMaid.stamina = 100;
        
        expect(calculateEfficiency(highStatMaid)).toBeGreaterThan(calculateEfficiency(lowStatMaid));
      });
    });

    describe('getMaxMaids', () => {
      it('should return correct max maids for each cafe level', () => {
        // Level 1: 2 + (1-1) = 2, but capped at min 2
        expect(getMaxMaids(1)).toBe(2);
        // Level 5: 2 + (5-1) = 6
        expect(getMaxMaids(5)).toBe(6);
        // Level 10: 2 + (10-1) = 11, capped at 11
        expect(getMaxMaids(10)).toBe(11);
      });
    });

    describe('getExperienceForLevel', () => {
      it('should return increasing experience requirements', () => {
        const exp1 = getExperienceForLevel(1);
        const exp5 = getExperienceForLevel(5);
        const exp10 = getExperienceForLevel(10);
        
        expect(exp5).toBeGreaterThan(exp1);
        expect(exp10).toBeGreaterThan(exp5);
      });
    });
  });

  // ==================== Customer System Tests ====================
  describe('Customer System', () => {
    describe('generateCustomer', () => {
      it('should generate a valid customer', () => {
        const customer = generateCustomer(50, 'spring');
        
        expect(customer.id).toBeDefined();
        expect(customer.name).toBeDefined();
        expect(customer.type).toBeDefined();
        // Patience is randomized based on customer type, so just check it's in valid range
        expect(customer.patience).toBeGreaterThanOrEqual(30);
        expect(customer.patience).toBeLessThanOrEqual(100);
        expect(customer.satisfaction).toBe(50);
      });

      it('should generate different customer types', () => {
        const types = new Set<string>();
        
        for (let i = 0; i < 50; i++) {
          const customer = generateCustomer(80, 'summer');
          types.add(customer.type);
        }
        
        // Should have at least regular customers
        expect(types.has('regular')).toBe(true);
      });
    });

    describe('calculateSatisfaction', () => {
      it('should return satisfaction between 0 and 100', () => {
        const maid = generateRandomMaid();
        const customer = generateCustomer(50, 'spring');
        
        const satisfaction = calculateSatisfaction(maid, customer, 5);
        
        expect(satisfaction).toBeGreaterThanOrEqual(0);
        expect(satisfaction).toBeLessThanOrEqual(100);
      });

      it('should decrease satisfaction with longer wait time', () => {
        const maid = generateRandomMaid();
        const customer = generateCustomer(50, 'spring');
        
        const shortWait = calculateSatisfaction(maid, customer, 1);
        const longWait = calculateSatisfaction(maid, customer, 10);
        
        expect(longWait).toBeLessThanOrEqual(shortWait);
      });
    });

    describe('calculateTip', () => {
      it('should return higher tip for higher satisfaction', () => {
        const lowTip = calculateTip(30, 50);
        const highTip = calculateTip(90, 50);
        
        expect(highTip).toBeGreaterThan(lowTip);
      });

      it('should return higher tip for higher charm', () => {
        const lowCharmTip = calculateTip(80, 20);
        const highCharmTip = calculateTip(80, 80);
        
        expect(highCharmTip).toBeGreaterThan(lowCharmTip);
      });
    });

    describe('getSpawnInterval', () => {
      it('should return shorter interval for higher reputation', () => {
        const lowRepInterval = getSpawnInterval(20, 1);
        const highRepInterval = getSpawnInterval(80, 1);
        
        expect(highRepInterval).toBeLessThan(lowRepInterval);
      });
    });
  });


  // ==================== Menu System Tests ====================
  describe('Menu System', () => {
    describe('getAvailableItems', () => {
      it('should return only unlocked items', () => {
        const items = getAvailableItems(initialGameState.menuItems, 'spring');
        
        items.forEach(item => {
          expect(item.unlocked).toBe(true);
        });
      });

      it('should filter seasonal items correctly', () => {
        const springItems = getAvailableItems(initialGameState.menuItems, 'spring');
        
        // Spring items should not include winter-only items
        springItems.forEach(item => {
          if (item.season) {
            expect(item.season).toBe('spring');
          }
        });
      });
    });

    describe('getPriceRange', () => {
      it('should return valid price range', () => {
        const basePrice = 50;
        const range = getPriceRange(basePrice);
        
        expect(range.min).toBe(basePrice * GAME_CONSTANTS.MIN_PRICE_MULTIPLIER);
        expect(range.max).toBe(basePrice * GAME_CONSTANTS.MAX_PRICE_MULTIPLIER);
      });
    });
  });

  // ==================== Finance System Tests ====================
  describe('Finance System', () => {
    let finance: Finance;

    beforeEach(() => {
      finance = { ...initialGameState.finance };
    });

    describe('addRevenue', () => {
      it('should add revenue correctly', () => {
        const result = addRevenue(finance, 100);
        
        expect(result.gold).toBe(finance.gold + 100);
        expect(result.dailyRevenue).toBe(100);
      });

      it('should not add negative revenue', () => {
        const result = addRevenue(finance, -50);
        
        expect(result.gold).toBe(finance.gold);
        expect(result.dailyRevenue).toBe(0);
      });
    });

    describe('addExpense', () => {
      it('should add expense correctly', () => {
        const result = addExpense(finance, 50);
        
        expect(result.dailyExpenses).toBe(50);
      });
    });

    describe('deductGold', () => {
      it('should deduct gold correctly', () => {
        const result = deductGold(finance, 200);
        
        expect(result.gold).toBe(finance.gold - 200);
      });

      it('should not allow negative gold', () => {
        const result = deductGold(finance, finance.gold + 1000);
        
        expect(result.gold).toBe(0);
      });
    });

    describe('canAfford', () => {
      it('should return true when can afford', () => {
        expect(canAfford(1000, 500)).toBe(true);
      });

      it('should return false when cannot afford', () => {
        expect(canAfford(100, 500)).toBe(false);
      });

      it('should return true when exact amount', () => {
        expect(canAfford(500, 500)).toBe(true);
      });
    });

    describe('calculateDailyOperatingCost', () => {
      it('should calculate operating cost based on maids and facility', () => {
        const maids = [generateRandomMaid(), generateRandomMaid()];
        const facility = initialGameState.facility;
        
        const cost = calculateDailyOperatingCost(maids, facility);
        
        expect(cost).toBeGreaterThan(0);
      });

      it('should return higher cost for more maids', () => {
        const facility = initialGameState.facility;
        const oneMaid = [generateRandomMaid()];
        const threeMaids = [generateRandomMaid(), generateRandomMaid(), generateRandomMaid()];
        
        const costOne = calculateDailyOperatingCost(oneMaid, facility);
        const costThree = calculateDailyOperatingCost(threeMaids, facility);
        
        expect(costThree).toBeGreaterThan(costOne);
      });
    });
  });

  // ==================== Facility System Tests ====================
  describe('Facility System', () => {
    describe('calculateMaxSeats', () => {
      it('should return correct seats for each level', () => {
        expect(calculateMaxSeats(1)).toBe(GAME_CONSTANTS.BASE_SEATS);
        expect(calculateMaxSeats(2)).toBe(GAME_CONSTANTS.BASE_SEATS + GAME_CONSTANTS.SEATS_PER_LEVEL);
        expect(calculateMaxSeats(10)).toBe(GAME_CONSTANTS.BASE_SEATS + 9 * GAME_CONSTANTS.SEATS_PER_LEVEL);
      });
    });

    describe('calculateSatisfactionBonus', () => {
      it('should return 0 for no purchased decorations', () => {
        const decorations = initialGameState.facility.decorations.map(d => ({
          ...d,
          purchased: false,
        }));
        
        const bonus = calculateSatisfactionBonus(decorations);
        
        expect(bonus).toBe(0);
      });

      it('should sum up satisfaction bonuses', () => {
        const decorations = initialGameState.facility.decorations.map((d, i) => ({
          ...d,
          purchased: i < 2, // First 2 purchased
        }));
        
        const bonus = calculateSatisfactionBonus(decorations);
        const expectedBonus = decorations
          .filter(d => d.purchased)
          .reduce((sum, d) => sum + d.satisfactionBonus, 0);
        
        expect(bonus).toBe(expectedBonus);
      });
    });
  });
});
