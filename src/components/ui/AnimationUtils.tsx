// Animation utility functions for staggered animations
export function getStaggerDelay(index: number, baseDelay: number = 50): string {
  return `${index * baseDelay}ms`;
}

// CSS variable-based animation names
export const AnimationTypes = {
  FADE_IN: 'animate-fade-in',
  SLIDE_UP: 'animate-slide-in-bottom',
  SLIDE_DOWN: 'animate-slide-in-top',
  SLIDE_LEFT: 'animate-slide-in-left',
  SLIDE_RIGHT: 'animate-slide-in-right',
  SCALE_IN: 'animate-scale-in',
  BOUNCE_LIGHT: 'animate-bounce-light',
  PULSE: 'animate-pulse-loop',
  GLOW: 'animate-glow',
  FLOAT: 'animate-float',
} as const;

// Animation presets for common use cases
export const AnimationPresets = {
  modalEnter: 'animate-scale-in',
  modalExit: 'animate-scale-out',
  notificationIn: 'animate-notification-in',
  notificationOut: 'animate-notification-out',
  cardHover: 'transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
  buttonClick: 'transition-transform duration-100 active:scale-95',
  listItem: 'animate-slide-in-bottom',
  achievement: 'animate-achievement',
} as const;
