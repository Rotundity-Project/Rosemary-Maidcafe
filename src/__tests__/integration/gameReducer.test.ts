/**
 * Integration Tests for Game Reducer
 * Tests complete game flow, state transitions, and all reducer actions
 * Requirements: All
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer } from '@/systems/gameReducer';
import { initialGameState, GAME_CONSTANTS } from '@/data/initialState';
import { GameState, Maid, Customer, GameEvent } from '@/types';

describe('Game Reducer Integration Tests', () => {
  let state: GameState;

  beforeEach(() => {
    state = { ...initialGameState };
  });

  // ==================== Time Control Tests ====================
  describe('Time Control', () => {
    it('should not advance time when paused', () => {
      state.isPaused = true;
      const newState = gameReducer(state, { type: 'TICK', deltaTime: 1000 });
      expect(newState.time).toBe(state.time);
    });

    it('should advance time when not paused during business hours', () => {
      state.isPaused = false;
      state.isBusinessHours = true;
      const newState = gameReducer(state, { type: 'TICK', deltaTime: 1000 });
      expect(newState.time).toBe(state.time + GAME_CONSTANTS.TIME_INCREMENT);
    });

    it('should toggle pause state', () => {
      const newState = gameReducer(state, { type: 'TOGGLE_PAUSE' });
      expect(newState.isPaused).toBe(!state.isPaused);
    });

    it('should end business hours when time reaches closing time', () => {
      state.isPaused = false;
      state.isBusinessHours = true;
      state.time = GAME_CONSTANTS.BUSINESS_END_TIME - GAME_CONSTANTS.TIME_INCREMENT;
      
      const newState = gameReducer(state, { type: 'TICK', deltaTime: 1000 });
      expect(newState.time).toBe(GAME_CONSTANTS.BUSINESS_END_TIME);
      expect(newState.isBusinessHours).toBe(false);
    });

    it('should handle END_DAY action correctly', () => {
      state.finance.dailyRevenue = 500;
      state.finance.dailyExpenses = 200;
      
      const newState = gameReducer(state, { type: 'END_DAY' });
      
      expect(newState.isPaused).toBe(true);
      expect(newState.isBusinessHours).toBe(false);
      expect(newState.finance.history).toHaveLength(1);
      expect(newState.finance.history[0].profit).toBe(300);
    });

    it('should handle START_NEW_DAY action correctly', () => {
      state.day = 1;
      state.time = GAME_CONSTANTS.BUSINESS_END_TIME;
      state.finance.dailyRevenue = 500;
      state.finance.dailyExpenses = 200;
      
      const newState = gameReducer(state, { type: 'START_NEW_DAY' });
      
      expect(newState.day).toBe(2);
      expect(newState.time).toBe(GAME_CONSTANTS.BUSINESS_START_TIME);
      expect(newState.finance.dailyRevenue).toBe(0);
      expect(newState.finance.dailyExpenses).toBe(0);
      expect(newState.isBusinessHours).toBe(true);
      expect(newState.statistics.totalDaysPlayed).toBe(1);
    });
  });


  // ==================== Maid Management Tests ====================
  describe('Maid Management', () => {
    const createTestMaid = (id: string = 'test-maid-1'): Maid => ({
      id,
      name: 'Test Maid',
      avatar: '👧',
      personality: 'cheerful',
      stats: { charm: 50, skill: 50, stamina: 50, speed: 50 },
      experience: 0,
      level: 1,
      role: 'server',
      status: { isWorking: false, isResting: false, currentTask: null, servingCustomerId: null },
      mood: 80,
      stamina: 100,
      hireDate: Date.now(),
    });

    it('should hire a maid', () => {
      const maid = createTestMaid();
      const newState = gameReducer(state, { type: 'HIRE_MAID', maid });
      
      expect(newState.maids).toHaveLength(1);
      expect(newState.maids[0].id).toBe(maid.id);
      expect(newState.statistics.maidsHired).toBe(1);
    });

    it('should not hire maid when at max capacity', () => {
      // Fill up to max maids (cafeLevel 1 = 3 max maids)
      const maxMaids = state.facility.cafeLevel + 2;
      for (let i = 0; i < maxMaids; i++) {
        state = gameReducer(state, { type: 'HIRE_MAID', maid: createTestMaid(`maid-${i}`) });
      }
      
      const extraMaid = createTestMaid('extra-maid');
      const newState = gameReducer(state, { type: 'HIRE_MAID', maid: extraMaid });
      
      expect(newState.maids).toHaveLength(maxMaids);
    });

    it('should fire a maid', () => {
      const maid = createTestMaid();
      state = gameReducer(state, { type: 'HIRE_MAID', maid });
      
      const newState = gameReducer(state, { type: 'FIRE_MAID', maidId: maid.id });
      
      expect(newState.maids).toHaveLength(0);
    });

    it('should assign role to maid', () => {
      const maid = createTestMaid();
      state = gameReducer(state, { type: 'HIRE_MAID', maid });
      
      const newState = gameReducer(state, { 
        type: 'ASSIGN_ROLE', 
        maidId: maid.id, 
        role: 'barista' 
      });
      
      expect(newState.maids[0].role).toBe('barista');
    });

    it('should update maid properties', () => {
      const maid = createTestMaid();
      state = gameReducer(state, { type: 'HIRE_MAID', maid });
      
      const newState = gameReducer(state, { 
        type: 'UPDATE_MAID', 
        maidId: maid.id, 
        updates: { stamina: 50, mood: 60 } 
      });
      
      expect(newState.maids[0].stamina).toBe(50);
      expect(newState.maids[0].mood).toBe(60);
    });
  });

  // ==================== Customer Management Tests ====================
  describe('Customer Management', () => {
    const createTestCustomer = (id: string = 'test-customer-1'): Customer => ({
      id,
      type: 'regular',
      name: 'Test Customer',
      avatar: '👤',
      order: { items: [], totalPrice: 50, preparedItems: [] },
      patience: 100,
      satisfaction: 50,
      status: 'seated',
      arrivalTime: Date.now(),
      seatId: 'seat-1',
    });

    it('should spawn a customer', () => {
      const customer = createTestCustomer();
      const newState = gameReducer(state, { type: 'SPAWN_CUSTOMER', customer });
      
      expect(newState.customers).toHaveLength(1);
      expect(newState.customers[0].id).toBe(customer.id);
    });

    it('should update customer properties', () => {
      const customer = createTestCustomer();
      state = gameReducer(state, { type: 'SPAWN_CUSTOMER', customer });
      
      const newState = gameReducer(state, { 
        type: 'UPDATE_CUSTOMER', 
        customerId: customer.id, 
        updates: { patience: 50, satisfaction: 80 } 
      });
      
      expect(newState.customers[0].patience).toBe(50);
      expect(newState.customers[0].satisfaction).toBe(80);
    });

    it('should remove a customer', () => {
      const customer = createTestCustomer();
      state = gameReducer(state, { type: 'SPAWN_CUSTOMER', customer });
      
      const newState = gameReducer(state, { type: 'REMOVE_CUSTOMER', customerId: customer.id });
      
      expect(newState.customers).toHaveLength(0);
    });
  });


  // ==================== Menu Management Tests ====================
  describe('Menu Management', () => {
    it('should unlock a menu item with sufficient gold', () => {
      const lockedItem = state.menuItems.find(item => !item.unlocked && item.unlockCost > 0);
      if (!lockedItem) return;
      
      state.finance.gold = lockedItem.unlockCost + 100;
      
      const newState = gameReducer(state, { type: 'UNLOCK_MENU_ITEM', itemId: lockedItem.id });
      
      const unlockedItem = newState.menuItems.find(item => item.id === lockedItem.id);
      expect(unlockedItem?.unlocked).toBe(true);
      expect(newState.finance.gold).toBe(100);
    });

    it('should not unlock menu item with insufficient gold', () => {
      const lockedItem = state.menuItems.find(item => !item.unlocked && item.unlockCost > 0);
      if (!lockedItem) return;
      
      state.finance.gold = lockedItem.unlockCost - 1;
      
      const newState = gameReducer(state, { type: 'UNLOCK_MENU_ITEM', itemId: lockedItem.id });
      
      const item = newState.menuItems.find(i => i.id === lockedItem.id);
      expect(item?.unlocked).toBe(false);
    });

    it('should set item price within valid range', () => {
      const unlockedItem = state.menuItems.find(item => item.unlocked);
      if (!unlockedItem) return;
      
      const newPrice = unlockedItem.basePrice * 1.5;
      const newState = gameReducer(state, { 
        type: 'SET_ITEM_PRICE', 
        itemId: unlockedItem.id, 
        price: newPrice 
      });
      
      const item = newState.menuItems.find(i => i.id === unlockedItem.id);
      expect(item?.currentPrice).toBe(newPrice);
    });

    it('should clamp price to valid range', () => {
      const unlockedItem = state.menuItems.find(item => item.unlocked);
      if (!unlockedItem) return;
      
      const tooHighPrice = unlockedItem.basePrice * 10;
      const newState = gameReducer(state, { 
        type: 'SET_ITEM_PRICE', 
        itemId: unlockedItem.id, 
        price: tooHighPrice 
      });
      
      const item = newState.menuItems.find(i => i.id === unlockedItem.id);
      const maxPrice = unlockedItem.basePrice * GAME_CONSTANTS.MAX_PRICE_MULTIPLIER;
      expect(item?.currentPrice).toBe(maxPrice);
    });
  });

  // ==================== Facility Management Tests ====================
  describe('Facility Management', () => {
    it('should upgrade cafe level', () => {
      state.finance.gold = 10000;
      
      const newState = gameReducer(state, { type: 'UPGRADE_CAFE' });
      
      expect(newState.facility.cafeLevel).toBe(2);
      expect(newState.facility.maxSeats).toBe(GAME_CONSTANTS.BASE_SEATS + GAME_CONSTANTS.SEATS_PER_LEVEL);
    });

    it('should not upgrade cafe beyond max level', () => {
      state.facility.cafeLevel = GAME_CONSTANTS.MAX_CAFE_LEVEL;
      state.finance.gold = 100000;
      
      const newState = gameReducer(state, { type: 'UPGRADE_CAFE' });
      
      expect(newState.facility.cafeLevel).toBe(GAME_CONSTANTS.MAX_CAFE_LEVEL);
    });

    it('should buy decoration', () => {
      const decoration = state.facility.decorations.find(d => !d.purchased);
      if (!decoration) return;
      
      state.finance.gold = decoration.cost + 100;
      
      const newState = gameReducer(state, { type: 'BUY_DECORATION', decorationId: decoration.id });
      
      const boughtDecoration = newState.facility.decorations.find(d => d.id === decoration.id);
      expect(boughtDecoration?.purchased).toBe(true);
    });

    it('should upgrade equipment', () => {
      const equipment = state.facility.equipment.find(e => e.level < e.maxLevel);
      if (!equipment) return;
      
      state.finance.gold = 10000;
      
      const newState = gameReducer(state, { type: 'UPGRADE_EQUIPMENT', equipmentId: equipment.id });
      
      const upgradedEquipment = newState.facility.equipment.find(e => e.id === equipment.id);
      expect(upgradedEquipment?.level).toBe(equipment.level + 1);
    });

    it('should unlock area', () => {
      state.finance.gold = 10000;
      
      const newState = gameReducer(state, { type: 'UNLOCK_AREA', area: 'outdoor' });
      
      expect(newState.facility.unlockedAreas).toContain('outdoor');
    });
  });


  // ==================== Finance Tests ====================
  describe('Finance Management', () => {
    it('should add revenue correctly', () => {
      // Create fresh state for this test
      const freshState = { ...initialGameState };
      const amount = 100;
      const newState = gameReducer(freshState, { type: 'ADD_REVENUE', amount });
      
      expect(newState.finance.gold).toBe(freshState.finance.gold + amount);
      expect(newState.finance.dailyRevenue).toBe(freshState.finance.dailyRevenue + amount);
      expect(newState.statistics.totalRevenue).toBe(freshState.statistics.totalRevenue + amount);
    });

    it('should not add negative revenue', () => {
      const freshState = { ...initialGameState };
      const newState = gameReducer(freshState, { type: 'ADD_REVENUE', amount: -100 });
      
      expect(newState.finance.gold).toBe(freshState.finance.gold);
      expect(newState.finance.dailyRevenue).toBe(freshState.finance.dailyRevenue);
    });

    it('should add expense correctly', () => {
      const freshState = { ...initialGameState };
      const amount = 50;
      const newState = gameReducer(freshState, { type: 'ADD_EXPENSE', amount });
      
      expect(newState.finance.dailyExpenses).toBe(freshState.finance.dailyExpenses + amount);
    });

    it('should deduct gold correctly', () => {
      const amount = 200;
      const newState = gameReducer(state, { type: 'DEDUCT_GOLD', amount });
      
      expect(newState.finance.gold).toBe(state.finance.gold - amount);
    });

    it('should not allow gold to go below zero', () => {
      const newState = gameReducer(state, { type: 'DEDUCT_GOLD', amount: state.finance.gold + 1000 });
      
      expect(newState.finance.gold).toBe(0);
    });
  });

  // ==================== Event Tests ====================
  describe('Event System', () => {
    const createTestEvent = (): GameEvent => ({
      id: 'test-event',
      type: 'positive',
      name: 'Test Event',
      description: 'A test event',
      effects: [{ target: 'revenue', modifier: 1.5, isMultiplier: true }],
      duration: 60,
      icon: '🎉',
    });

    it('should trigger an event', () => {
      const event = createTestEvent();
      const newState = gameReducer(state, { type: 'TRIGGER_EVENT', event });
      
      expect(newState.activeEvents).toHaveLength(1);
      expect(newState.eventHistory).toHaveLength(1);
    });

    it('should end an event', () => {
      const event = createTestEvent();
      state = gameReducer(state, { type: 'TRIGGER_EVENT', event });
      
      const newState = gameReducer(state, { type: 'END_EVENT', eventId: event.id });
      
      expect(newState.activeEvents).toHaveLength(0);
      expect(newState.eventHistory).toHaveLength(1); // History preserved
    });
  });

  // ==================== Achievement Tests ====================
  describe('Achievement System', () => {
    it('should unlock achievement and award gold', () => {
      const achievement = state.achievements.find(a => !a.unlocked);
      if (!achievement) return;
      
      const initialGold = state.finance.gold;
      const newState = gameReducer(state, { type: 'UNLOCK_ACHIEVEMENT', achievementId: achievement.id });
      
      const unlockedAchievement = newState.achievements.find(a => a.id === achievement.id);
      expect(unlockedAchievement?.unlocked).toBe(true);
      expect(unlockedAchievement?.unlockedDate).not.toBeNull();
      expect(newState.finance.gold).toBe(initialGold + achievement.reward);
    });

    it('should not unlock already unlocked achievement', () => {
      const achievement = state.achievements[0];
      state.achievements[0] = { ...achievement, unlocked: true };
      
      const initialGold = state.finance.gold;
      const newState = gameReducer(state, { type: 'UNLOCK_ACHIEVEMENT', achievementId: achievement.id });
      
      expect(newState.finance.gold).toBe(initialGold);
    });

    it('should update statistics', () => {
      const newState = gameReducer(state, { 
        type: 'UPDATE_STATISTICS', 
        updates: { totalCustomersServed: 10, totalRevenue: 500 } 
      });
      
      expect(newState.statistics.totalCustomersServed).toBe(10);
      expect(newState.statistics.totalRevenue).toBe(500);
    });
  });

  // ==================== UI State Tests ====================
  describe('UI State', () => {
    it('should set active panel', () => {
      const newState = gameReducer(state, { type: 'SET_ACTIVE_PANEL', panel: 'maids' });
      expect(newState.activePanel).toBe('maids');
    });

    it('should select maid', () => {
      const newState = gameReducer(state, { type: 'SELECT_MAID', maidId: 'maid-1' });
      expect(newState.selectedMaidId).toBe('maid-1');
    });

    it('should select customer', () => {
      const newState = gameReducer(state, { type: 'SELECT_CUSTOMER', customerId: 'customer-1' });
      expect(newState.selectedCustomerId).toBe('customer-1');
    });

    it('should add notification', () => {
      const notification = {
        id: 'notif-1',
        type: 'success' as const,
        message: 'Test notification',
        timestamp: Date.now(),
      };
      
      const newState = gameReducer(state, { type: 'ADD_NOTIFICATION', notification });
      
      expect(newState.notifications).toHaveLength(1);
      expect(newState.notifications[0].message).toBe('Test notification');
    });

    it('should remove notification', () => {
      const notification = {
        id: 'notif-1',
        type: 'success' as const,
        message: 'Test notification',
        timestamp: Date.now(),
      };
      state = gameReducer(state, { type: 'ADD_NOTIFICATION', notification });
      
      const newState = gameReducer(state, { type: 'REMOVE_NOTIFICATION', notificationId: 'notif-1' });
      
      expect(newState.notifications).toHaveLength(0);
    });
  });

  // ==================== Storage Tests ====================
  describe('Storage Actions', () => {
    it('should load game state', () => {
      const loadedState: GameState = {
        ...initialGameState,
        day: 10,
        finance: { ...initialGameState.finance, gold: 5000 },
      };
      
      const newState = gameReducer(state, { type: 'LOAD_GAME', state: loadedState });
      
      expect(newState.day).toBe(10);
      expect(newState.finance.gold).toBe(5000);
    });

    it('should reset game to initial state', () => {
      state.day = 50;
      state.finance.gold = 10000;
      
      const newState = gameReducer(state, { type: 'RESET_GAME' });
      
      expect(newState.day).toBe(initialGameState.day);
      expect(newState.finance.gold).toBe(initialGameState.finance.gold);
    });
  });
});
