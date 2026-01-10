'use client';

import React from 'react';
import { useGame } from '@/components/game/GameProvider';
import { useLandscapeMode } from '@/hooks/useLandscapeMode';
import { PanelType } from '@/types';

interface NavItem {
  id: PanelType;
  label: string;
  icon: string;
  shortLabel?: string;
}

const navItems: NavItem[] = [
  { id: 'cafe', label: '咖啡厅', icon: '☕', shortLabel: '厅' },
  { id: 'maids', label: '女仆', icon: '👧', shortLabel: '仆' },
  { id: 'menu', label: '菜单', icon: '📋', shortLabel: '单' },
  { id: 'facility', label: '设施', icon: '🏠', shortLabel: '施' },
  { id: 'finance', label: '财务', icon: '💹', shortLabel: '财' },
  { id: 'achievements', label: '成就', icon: '🏆', shortLabel: '就' },
  { id: 'settings', label: '设置', icon: '⚙️', shortLabel: '设' },
];

export function Navigation() {
  const { state, dispatch } = useGame();
  const { activePanel } = state;

  const handleNavClick = (panel: PanelType) => {
    dispatch({ type: 'SET_ACTIVE_PANEL', panel });
  };

  return (
    <nav className="bg-white border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-center sm:justify-start gap-2 overflow-x-auto py-2">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={activePanel === item.id}
              onClick={() => handleNavClick(item.id)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function NavButton({ item, isActive, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-2 rounded-lg
        font-medium text-sm whitespace-nowrap
        transition-all duration-200
        ${
          isActive
            ? 'bg-pink-100 text-pink-600 shadow-sm border border-pink-200'
            : 'text-gray-600 hover:bg-pink-50 hover:text-pink-500'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="text-base">{item.icon}</span>
      <span className="hidden sm:inline">{item.label}</span>
      <span className="sm:hidden">{item.shortLabel || item.label}</span>
    </button>
  );
}

// Vertical navigation variant for sidebar layouts
export function NavigationVertical() {
  const { state, dispatch } = useGame();
  const { activePanel } = state;

  const handleNavClick = (panel: PanelType) => {
    dispatch({ type: 'SET_ACTIVE_PANEL', panel });
  };

  return (
    <nav className="bg-white border-r border-pink-100 w-16 sm:w-48 flex-shrink-0">
      <div className="flex flex-col gap-2 p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg
              font-medium text-sm
              transition-all duration-200
              ${
                activePanel === item.id
                  ? 'bg-pink-100 text-pink-600 shadow-sm border border-pink-200'
                  : 'text-gray-600 hover:bg-pink-50 hover:text-pink-500'
              }
            `}
            aria-current={activePanel === item.id ? 'page' : undefined}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// Bottom navigation for mobile (hidden in landscape mode)
export function NavigationBottom() {
  const { state, dispatch } = useGame();
  const { activePanel } = state;
  const isLandscape = useLandscapeMode();

  const handleNavClick = (panel: PanelType) => {
    dispatch({ type: 'SET_ACTIVE_PANEL', panel });
  };

  // Hide bottom navigation in landscape mode (Requirements: 8.3)
  if (isLandscape) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 sm:hidden z-40 shadow-lg safe-area-bottom">
      <div className="flex items-center justify-around py-1 px-1">
        {navItems.map((item) => (
          <NavBottomButton
            key={item.id}
            item={item}
            isActive={activePanel === item.id}
            onClick={() => handleNavClick(item.id)}
          />
        ))}
      </div>
    </nav>
  );
}

// Side navigation for landscape mode (Requirements: 8.3)
export function NavigationSide() {
  const { state, dispatch } = useGame();
  const { activePanel } = state;
  const isLandscape = useLandscapeMode();

  const handleNavClick = (panel: PanelType) => {
    dispatch({ type: 'SET_ACTIVE_PANEL', panel });
  };

  // Only show side navigation in landscape mode
  if (!isLandscape) {
    return null;
  }

  return (
    <nav className="nav-side-landscape">
      <div className="flex flex-col items-center py-1 gap-0.5 overflow-y-auto flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`nav-item ${activePanel === item.id ? 'active' : ''}`}
            aria-current={activePanel === item.id ? 'page' : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.shortLabel || item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

interface NavBottomButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}

function NavBottomButton({ item, isActive, onClick }: NavBottomButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-0.5 
        min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl
        transition-all duration-200 active:scale-95 active:opacity-80 select-none
        ${
          isActive
            ? 'text-pink-600 bg-pink-50 shadow-sm'
            : 'text-gray-500 hover:text-pink-500 active:bg-pink-50/50'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>
        {item.icon}
      </span>
      <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
        {item.shortLabel || item.label}
      </span>
    </button>
  );
}

export default Navigation;
