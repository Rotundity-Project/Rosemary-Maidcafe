'use client';

import React from 'react';
import { useGame } from '@/components/game/GameProvider';
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
        <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 overflow-x-auto py-2">
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
      <div className="flex flex-col gap-1 p-2">
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

// Bottom navigation for mobile
export function NavigationBottom() {
  const { state, dispatch } = useGame();
  const { activePanel } = state;

  const handleNavClick = (panel: PanelType) => {
    dispatch({ type: 'SET_ACTIVE_PANEL', panel });
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 sm:hidden z-40 shadow-lg">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`
              flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[48px]
              transition-all duration-200
              ${
                activePanel === item.id
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-500 hover:text-pink-500'
              }
            `}
            aria-current={activePanel === item.id ? 'page' : undefined}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.shortLabel || item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Navigation;
