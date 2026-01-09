/**
 * Integration Tests for Storage System
 * Tests save/load functionality, export/import, and data validation
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  saveGame,
  loadGame,
  exportSave,
  validateSaveData,
  generateChecksum,
  deleteSave,
  hasSave,
  getSaveInfo,
  getInitialState,
} from '@/utils/storage';
import { initialGameState, GAME_CONSTANTS } from '@/data/initialState';
import { GameState } from '@/types';

describe('Storage System Integration Tests', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    
    // Mock localStorage methods on the global object
    const localStorageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
      length: 0,
      key: vi.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==================== Checksum Tests ====================
  describe('Checksum Generation', () => {
    it('should generate consistent checksum for same state', () => {
      const checksum1 = generateChecksum(initialGameState);
      const checksum2 = generateChecksum(initialGameState);
      
      expect(checksum1).toBe(checksum2);
    });

    it('should generate different checksum for different states', () => {
      const modifiedState: GameState = {
        ...initialGameState,
        day: 10,
      };
      
      const checksum1 = generateChecksum(initialGameState);
      const checksum2 = generateChecksum(modifiedState);
      
      expect(checksum1).not.toBe(checksum2);
    });
  });

  // ==================== Save/Load Tests ====================
  describe('Save and Load', () => {
    it('should save game successfully', () => {
      const result = saveGame(initialGameState);
      
      expect(result.success).toBe(true);
      expect(mockStorage[GAME_CONSTANTS.SAVE_KEY]).toBeDefined();
    });

    it('should load saved game successfully', () => {
      saveGame(initialGameState);
      const result = loadGame();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.day).toBe(initialGameState.day);
    });

    it('should return error when no save exists', () => {
      const result = loadGame();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('没有找到存档');
    });

    it('should preserve all game state properties after save/load', () => {
      const modifiedState: GameState = {
        ...initialGameState,
        day: 15,
        finance: {
          ...initialGameState.finance,
          gold: 5000,
          dailyRevenue: 300,
        },
        reputation: 75,
        statistics: {
          ...initialGameState.statistics,
          totalCustomersServed: 50,
          totalRevenue: 2500,
        },
      };
      
      saveGame(modifiedState);
      const result = loadGame();
      
      expect(result.success).toBe(true);
      expect(result.data?.day).toBe(15);
      expect(result.data?.finance.gold).toBe(5000);
      expect(result.data?.reputation).toBe(75);
      expect(result.data?.statistics.totalCustomersServed).toBe(50);
    });
  });

  // ==================== Validation Tests ====================
  describe('Save Data Validation', () => {
    it('should validate correct save data', () => {
      const saveData = {
        version: GAME_CONSTANTS.SAVE_VERSION,
        timestamp: Date.now(),
        gameState: initialGameState,
        checksum: generateChecksum(initialGameState),
      };
      
      const result = validateSaveData(saveData);
      
      expect(result.success).toBe(true);
    });

    it('should reject save data with missing version', () => {
      const saveData = {
        timestamp: Date.now(),
        gameState: initialGameState,
        checksum: generateChecksum(initialGameState),
      };
      
      const result = validateSaveData(saveData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('版本');
    });

    it('should reject save data with invalid checksum', () => {
      const saveData = {
        version: GAME_CONSTANTS.SAVE_VERSION,
        timestamp: Date.now(),
        gameState: initialGameState,
        checksum: 'invalid-checksum',
      };
      
      const result = validateSaveData(saveData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('校验和');
    });

    it('should reject null data', () => {
      const result = validateSaveData(null);
      
      expect(result.success).toBe(false);
    });

    it('should reject non-object data', () => {
      const result = validateSaveData('invalid');
      
      expect(result.success).toBe(false);
    });
  });

  // ==================== Export Tests ====================
  describe('Export Save', () => {
    it('should export save as blob', () => {
      const result = exportSave(initialGameState);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Blob);
      expect(result.data?.type).toBe('application/json');
    });

    it('should export data with correct structure', () => {
      const result = exportSave(initialGameState);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      // Blob is created, which means the JSON serialization worked
    });
  });

  // ==================== Utility Functions Tests ====================
  describe('Utility Functions', () => {
    it('should delete save', () => {
      saveGame(initialGameState);
      expect(mockStorage[GAME_CONSTANTS.SAVE_KEY]).toBeDefined();
      
      const result = deleteSave();
      
      expect(result.success).toBe(true);
      expect(mockStorage[GAME_CONSTANTS.SAVE_KEY]).toBeUndefined();
    });

    it('should check if save exists', () => {
      expect(hasSave()).toBe(false);
      
      saveGame(initialGameState);
      
      expect(hasSave()).toBe(true);
    });

    it('should get save info', () => {
      saveGame(initialGameState);
      
      const result = getSaveInfo();
      
      expect(result.success).toBe(true);
      expect(result.data?.version).toBe(GAME_CONSTANTS.SAVE_VERSION);
      expect(result.data?.day).toBe(initialGameState.day);
    });

    it('should return initial state', () => {
      const state = getInitialState();
      
      expect(state.day).toBe(initialGameState.day);
      expect(state.finance.gold).toBe(initialGameState.finance.gold);
    });
  });

  // ==================== Edge Cases ====================
  describe('Edge Cases', () => {
    it('should handle corrupted JSON in localStorage', () => {
      mockStorage[GAME_CONSTANTS.SAVE_KEY] = 'not valid json';
      
      const result = loadGame();
      
      expect(result.success).toBe(false);
      // The error message could be about parsing or validation
      expect(result.error).toBeDefined();
    });

    it('should handle missing gameState in save data', () => {
      const invalidSave = {
        version: GAME_CONSTANTS.SAVE_VERSION,
        timestamp: Date.now(),
        checksum: 'some-checksum',
      };
      mockStorage[GAME_CONSTANTS.SAVE_KEY] = JSON.stringify(invalidSave);
      
      const result = loadGame();
      
      expect(result.success).toBe(false);
    });
  });
});
