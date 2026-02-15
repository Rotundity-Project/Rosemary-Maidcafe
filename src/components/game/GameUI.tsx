'use client';

import { useState, useCallback } from 'react';
import { useGame } from './GameProvider';
import { useGameLoopControls } from './GameLoop';
import { TopBar } from '@/components/ui/TopBar';
import { Navigation, NavigationBottom, NavigationSide } from '@/components/ui/Navigation';
import { NotificationContainer } from '@/components/ui/Notification';
import { KeyboardHints } from '@/components/ui/KeyboardHints';
import { CafeView } from '@/components/cafe/CafeView';
import { MaidPanel } from '@/components/panels/MaidPanel';
import { MenuPanel } from '@/components/panels/MenuPanel';
import { FacilityPanel } from '@/components/panels/FacilityPanel';
import { FinancePanel } from '@/components/panels/FinancePanel';
import { TaskPanel } from '@/components/panels/TaskPanel';
import { AchievementPanel } from '@/components/panels/AchievementPanel';
import { SettingsPanel } from '@/components/panels/SettingsPanel';
import { HireMaidModal } from '@/components/modals/HireMaidModal';
import { EventModal } from '@/components/modals/EventModal';
import { DailySummaryModal } from '@/components/modals/DailySummaryModal';
import { SaveLoadModal } from '@/components/modals/SaveLoadModal';
import { GameEvent, Maid, GameState } from '@/types';
import { hireCostByLevel } from '@/data/maidNames';

/**
 * 主游戏界面组件
 * 集成 TopBar、Navigation，根据 activePanel 显示对应面板
 * 显示通知和弹窗
 * Requirements: 9.1, 9.2, 9.3, 9.8
 */
export function GameUI() {
  const { state, dispatch } = useGame();
  const { startNewDay } = useGameLoopControls();
  
  // Modal states
  const [showHireMaidModal, setShowHireMaidModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);

  // Handle notification dismiss
  const handleDismissNotification = useCallback((notificationId: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', notificationId });
  }, [dispatch]);

  // Handle hire maid
  const handleHireMaid = useCallback((maid: Maid) => {
    const hireCost = hireCostByLevel[0];
    const maxMaids = state.facility.cafeLevel + 2;
    
    // 检查女仆数量是否已达上限
    if (state.maids.length >= maxMaids) {
      return;
    }
    
    if (state.finance.gold >= hireCost) {
      dispatch({ type: 'HIRE_MAID', maid });
      dispatch({ type: 'DEDUCT_GOLD', amount: hireCost });
    }
    setShowHireMaidModal(false);
  }, [dispatch, state.finance.gold, state.maids.length, state.facility.cafeLevel]);

  // Handle load game
  const handleLoadGame = useCallback((loadedState: GameState) => {
    dispatch({ type: 'LOAD_GAME', state: loadedState });
  }, [dispatch]);

  // Handle new game
  const handleNewGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, [dispatch]);

  // Handle start new day from daily summary
  const handleStartNewDay = useCallback(() => {
    startNewDay();
  }, [startNewDay]);

  // Handle event modal close
  const handleCloseEventModal = useCallback(() => {
    setShowEventModal(false);
    setCurrentEvent(null);
  }, []);

  // Render active panel based on state
  const renderActivePanel = () => {
    switch (state.activePanel) {
      case 'cafe':
        return <CafeView />;
      case 'maids':
        return <MaidPanel />;
      case 'menu':
        return <MenuPanel />;
      case 'facility':
        return <FacilityPanel />;
      case 'finance':
        return <FinancePanel />;
      case 'tasks':
        return <TaskPanel />;
      case 'achievements':
        return <AchievementPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <CafeView />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Bar - Requirements: 9.2 */}
      <TopBar />
      
      {/* Navigation - Requirements: 9.3 */}
      <Navigation />
      
      {/* Main Content Area with Side Navigation for Landscape - Requirements: 8.3, 9.1 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Side Navigation for Landscape Mode */}
        <NavigationSide />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-16 sm:pb-0">
          {renderActivePanel()}
        </main>
      </div>
      
      {/* Bottom Navigation for Mobile (hidden in landscape) */}
      <NavigationBottom />
      
      {/* Notifications - Requirements: 9.8 */}
      <NotificationContainer
        notifications={state.notifications}
        onDismiss={handleDismissNotification}
        position="top-right"
        maxVisible={5}
      />
      
      {/* Modals */}
      <HireMaidModal
        isOpen={showHireMaidModal}
        onClose={() => setShowHireMaidModal(false)}
        onHire={handleHireMaid}
        hireCost={hireCostByLevel[0]}
        gold={state.finance.gold}
      />
      
      <EventModal
        isOpen={showEventModal}
        onClose={handleCloseEventModal}
        event={currentEvent}
      />
      
      <DailySummaryModal
        isOpen={state.dailySummaryOpen}
        onClose={() => dispatch({ type: 'CLOSE_DAILY_SUMMARY' })}
        onStartNewDay={handleStartNewDay}
        day={state.day}
        finance={state.finance}
        maids={state.maids}
        customersServedToday={state.runtime.customersServedToday}
        statistics={state.statistics}
      />
      
      <SaveLoadModal
        isOpen={showSaveLoadModal}
        onClose={() => setShowSaveLoadModal(false)}
        gameState={state}
        onLoadGame={handleLoadGame}
        onNewGame={handleNewGame}
      />
      
      {/* Keyboard Hints */}
      <KeyboardHints />
    </div>
  );
}

export default GameUI;
