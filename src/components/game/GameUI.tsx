'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGame } from './GameProvider';
import { useGameLoopControls } from './GameLoop';
import { TopBar } from '@/components/ui/TopBar';
import { Navigation, NavigationBottom } from '@/components/ui/Navigation';
import { NotificationContainer } from '@/components/ui/Notification';
import { CafeView } from '@/components/cafe/CafeView';
import { MaidPanel } from '@/components/panels/MaidPanel';
import { MenuPanel } from '@/components/panels/MenuPanel';
import { FacilityPanel } from '@/components/panels/FacilityPanel';
import { FinancePanel } from '@/components/panels/FinancePanel';
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
  const { startNewDay, isBusinessHours } = useGameLoopControls();
  
  // Modal states
  const [showHireMaidModal, setShowHireMaidModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDailySummaryModal, setShowDailySummaryModal] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [customersServedToday, setCustomersServedToday] = useState(0);
  
  // Track previous business hours state to detect end of day
  const prevIsBusinessHoursRef = useRef(isBusinessHours);
  
  // Show daily summary modal when business hours end
  useEffect(() => {
    // Detect transition from business hours to non-business hours
    if (prevIsBusinessHoursRef.current && !isBusinessHours) {
      setShowDailySummaryModal(true);
    }
    prevIsBusinessHoursRef.current = isBusinessHours;
  }, [isBusinessHours]);

  // Handle notification dismiss
  const handleDismissNotification = useCallback((notificationId: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', notificationId });
  }, [dispatch]);

  // Handle hire maid
  const handleHireMaid = useCallback((maid: Maid) => {
    const hireCost = hireCostByLevel[0];
    if (state.finance.gold >= hireCost) {
      dispatch({ type: 'HIRE_MAID', maid });
      dispatch({ type: 'DEDUCT_GOLD', amount: hireCost });
      dispatch({
        type: 'UPDATE_STATISTICS',
        updates: { maidsHired: state.statistics.maidsHired + 1 },
      });
    }
    setShowHireMaidModal(false);
  }, [dispatch, state.finance.gold, state.statistics.maidsHired]);

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
    setCustomersServedToday(0);
    setShowDailySummaryModal(false);
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
      
      {/* Main Content Area - Requirements: 9.1 */}
      <main className="flex-1 overflow-auto pb-16 sm:pb-0">
        {renderActivePanel()}
      </main>
      
      {/* Bottom Navigation for Mobile */}
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
        isOpen={showDailySummaryModal}
        onClose={() => setShowDailySummaryModal(false)}
        onStartNewDay={handleStartNewDay}
        day={state.day}
        finance={state.finance}
        maids={state.maids}
        customersServedToday={customersServedToday}
        statistics={state.statistics}
      />
      
      <SaveLoadModal
        isOpen={showSaveLoadModal}
        onClose={() => setShowSaveLoadModal(false)}
        gameState={state}
        onLoadGame={handleLoadGame}
        onNewGame={handleNewGame}
      />
    </div>
  );
}

export default GameUI;
