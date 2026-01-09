'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { GameState, GameAction } from '@/types';
import { gameReducer } from '@/systems/gameReducer';
import { initialGameState, GAME_CONSTANTS } from '@/data/initialState';
import { migrateMaidAvatars } from '@/utils/storage';

// ==================== Context Types ====================

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

// ==================== Context Creation ====================

const GameContext = createContext<GameContextValue | null>(null);

// ==================== Storage Utilities ====================

/**
 * 从 localStorage 加载游戏状态
 */
function loadGameFromStorage(): GameState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const savedData = localStorage.getItem(GAME_CONSTANTS.SAVE_KEY);
    if (!savedData) {
      return null;
    }

    const parsed = JSON.parse(savedData);
    
    // 验证版本
    if (parsed.version !== GAME_CONSTANTS.SAVE_VERSION) {
      console.warn('Save data version mismatch, starting new game');
      return null;
    }

    // 验证基本结构
    if (!parsed.gameState || typeof parsed.gameState !== 'object') {
      console.warn('Invalid save data structure');
      return null;
    }

    return parsed.gameState as GameState;
  } catch (error) {
    console.error('Failed to load game from storage:', error);
    return null;
  }
}

/**
 * 保存游戏状态到 localStorage
 */
function saveGameToStorage(state: GameState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const saveData = {
      version: GAME_CONSTANTS.SAVE_VERSION,
      timestamp: Date.now(),
      gameState: state,
    };

    localStorage.setItem(GAME_CONSTANTS.SAVE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('Failed to save game to storage:', error);
  }
}

// ==================== Provider Props ====================

interface GameProviderProps {
  children: ReactNode;
}

// ==================== Provider Component ====================

export function GameProvider({ children }: GameProviderProps) {
  // 初始化状态，尝试从 localStorage 加载
  const [state, dispatch] = useReducer(gameReducer, initialGameState, (initial) => {
    const savedState = loadGameFromStorage();
    return savedState || initial;
  });

  // 自动保存逻辑 - 当状态变化时保存
  useEffect(() => {
    // 使用防抖来避免频繁保存
    const timeoutId = setTimeout(() => {
      saveGameToStorage(state);
    }, 1000); // 1秒防抖

    return () => clearTimeout(timeoutId);
  }, [state]);

  // 页面关闭前保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGameToStorage(state);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  const contextValue: GameContextValue = {
    state,
    dispatch,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// ==================== Custom Hook ====================

/**
 * 使用游戏状态的 Hook
 * @throws 如果在 GameProvider 外部使用会抛出错误
 */
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}

/**
 * 只获取游戏状态的 Hook（不包含 dispatch）
 */
export function useGameState(): GameState {
  const { state } = useGame();
  return state;
}

/**
 * 只获取 dispatch 的 Hook
 */
export function useGameDispatch(): React.Dispatch<GameAction> {
  const { dispatch } = useGame();
  return dispatch;
}

export default GameProvider;
