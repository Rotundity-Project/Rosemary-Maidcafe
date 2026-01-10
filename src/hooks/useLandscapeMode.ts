'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect landscape mode on mobile devices
 * Landscape mode is defined as: orientation is landscape AND viewport height < 500px
 * This helps distinguish mobile landscape from desktop landscape
 * 
 * State Persistence (Requirements: 8.4):
 * This hook only manages UI state (isLandscape boolean) and does not affect
 * game state. Game state is managed by GameProvider using React's useReducer,
 * which preserves state across re-renders caused by orientation changes.
 * Additionally, game state is persisted to localStorage for extra safety.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export function useLandscapeMode(): boolean {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const checkLandscapeMode = () => {
      const isLandscapeOrientation = window.matchMedia('(orientation: landscape)').matches;
      const isShortHeight = window.innerHeight < 500;
      setIsLandscape(isLandscapeOrientation && isShortHeight);
    };

    // Initial check
    checkLandscapeMode();

    // Listen for resize and orientation change events
    window.addEventListener('resize', checkLandscapeMode);
    window.addEventListener('orientationchange', checkLandscapeMode);

    // Also listen for media query changes
    const mediaQuery = window.matchMedia('(orientation: landscape) and (max-height: 500px)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsLandscape(e.matches);
    };
    
    // Use addEventListener if available (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMediaChange);
    }

    return () => {
      window.removeEventListener('resize', checkLandscapeMode);
      window.removeEventListener('orientationchange', checkLandscapeMode);
      
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  return isLandscape;
}

export default useLandscapeMode;
