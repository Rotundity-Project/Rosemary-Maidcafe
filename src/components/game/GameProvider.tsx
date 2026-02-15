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
import { initialGameState } from '@/data/initialState';
import { loadGame, saveGame } from '@/utils/storage';

// ==================== Context Types ====================

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

// ==================== Context Creation ====================

const GameContext = createContext<GameContextValue | null>(null);

// ==================== Provider Props ====================

interface GameProviderProps {
  children: ReactNode;
}

// ==================== Provider Component ====================

export function GameProvider({ children }: GameProviderProps) {
  // 初始化状态，尝试从 localStorage 加载
  const [state, dispatch] = useReducer(gameReducer, initialGameState, (initial) => {
    const loaded = loadGame();
    if (loaded.success && loaded.data) {
      return loaded.data;
    }
    return initial;
  });

  const stateRef = React.useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 自动保存逻辑 - 定时节流保存，带错误处理
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const intervalId = window.setInterval(() => {
      try {
        const result = saveGame(stateRef.current);
        if (!result.success) {
          console.warn('[GameProvider] Auto-save failed:', result.error);
        }
      } catch (error) {
        console.error('[GameProvider] Auto-save error:', error);
      }
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, []);

  // 页面关闭前保存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      try {
        const result = saveGame(stateRef.current);
        if (!result.success) {
          console.warn('[GameProvider] Save on exit failed:', result.error);
        }
      } catch (error) {
        console.error('[GameProvider] Save on exit error:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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
