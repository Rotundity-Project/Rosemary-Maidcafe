'use client';

import React, { useEffect, useState } from 'react';
import { Notification as NotificationType, NotificationType as NotificationVariant } from '@/types';

interface NotificationItemProps {
  notification: NotificationType;
  onDismiss: (id: string) => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

const variantStyles: Record<NotificationVariant, { bg: string; border: string; icon: string }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'ℹ️',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✅',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: '⚠️',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '❌',
  },
  achievement: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: '🏆',
  },
};

export function NotificationItem({
  notification,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 5000,
}: NotificationItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const styles = variantStyles[notification.type];

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(notification.id), 300);
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissDelay, notification.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${styles.bg} ${styles.border}
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      <span className="text-lg flex-shrink-0">{styles.icon}</span>
      <p className="flex-1 text-sm text-gray-700">
        {notification.message}
      </p>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="关闭通知"
      >
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

// Notification Container - displays all notifications
interface NotificationContainerProps {
  notifications: NotificationType[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
}

const positionStyles: Record<string, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
};

export function NotificationContainer({
  notifications,
  onDismiss,
  position = 'top-right',
  maxVisible = 5,
}: NotificationContainerProps) {
  const visibleNotifications = notifications.slice(0, maxVisible);

  if (visibleNotifications.length === 0) return null;

  return (
    <div
      className={`
        fixed z-50 ${positionStyles[position]}
        flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]
        pointer-events-none
      `}
    >
      {visibleNotifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  );
}

// Toast function for creating notifications
export function createNotification(
  type: NotificationVariant,
  message: string
): NotificationType {
  return {
    id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    message,
    timestamp: Date.now(),
  };
}

export default NotificationContainer;
