/**
 * Haptic Feedback Utilities
 * Provides tactile feedback for mobile devices using the Vibration API
 * 
 * Note: Only works on devices that support navigator.vibrate
 * Most iOS devices don't support this API, but Android devices generally do.
 */

/**
 * Check if the device supports haptic feedback
 */
export function supportsHapticFeedback(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Light tap feedback - for button clicks and selections
 */
export function lightTap(): void {
  if (supportsHapticFeedback()) {
    navigator.vibrate(10);
  }
}

/**
 * Medium tap feedback - for important actions
 */
export function mediumTap(): void {
  if (supportsHapticFeedback()) {
    navigator.vibrate(20);
  }
}

/**
 * Heavy tap feedback - for significant actions
 */
export function heavyTap(): void {
  if (supportsHapticFeedback()) {
    navigator.vibrate(30);
  }
}

/**
 * Success feedback - for successful operations
 */
export function successFeedback(): void {
  if (supportsHapticFeedback()) {
    navigator.vibrate([50, 30, 50]);
  }
}

/**
 * Error feedback - for errors and warnings
 */
export function errorFeedback(): void {
  if (supportsHapticFeedback()) {
    navigator.vibrate([100, 50, 100]);
  }
}

/**
 * Selection feedback - for option changes
 */
export function selectionFeedback(): void {
  if (supportsHapticFeedback()) {
    navigator.vibrate(5);
  }
}

/**
 * Custom haptic pattern
 * @param pattern - Vibration pattern (ms or array of ms)
 */
export function customHaptic(pattern: number | number[]): void {
  if (supportsHapticFeedback()) {
    navigator.vibrate(pattern);
  }
}
