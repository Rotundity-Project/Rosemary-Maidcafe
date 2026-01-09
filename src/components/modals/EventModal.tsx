'use client';

import React from 'react';
import { GameEvent, EventType, EventEffectTarget } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const eventTypeStyles: Record<EventType, { bg: string; border: string; icon: string; label: string }> = {
  positive: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '🎉',
    label: '好消息',
  },
  negative: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '⚠️',
    label: '坏消息',
  },
  seasonal: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: '🎊',
    label: '季节活动',
  },
};

const effectTargetLabels: Record<EventEffectTarget, string> = {
  revenue: '收入',
  customers: '顾客数量',
  satisfaction: '满意度',
  reputation: '声望',
};

const effectTargetIcons: Record<EventEffectTarget, string> = {
  revenue: '💰',
  customers: '👥',
  satisfaction: '😊',
  reputation: '⭐',
};

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: GameEvent | null;
}

export function EventModal({ isOpen, onClose, event }: EventModalProps) {
  if (!event) return null;

  const typeStyle = eventTypeStyles[event.type];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${typeStyle.icon} ${typeStyle.label}`}
      size="md"
      footer={
        <Button variant="primary" onClick={onClose}>
          知道了
        </Button>
      }
    >
      {/* Event Header */}
      <div className={`p-4 rounded-lg ${typeStyle.bg} ${typeStyle.border} border mb-4`}>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{event.icon}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {event.name}
            </h3>
            <p className="text-sm text-gray-600">
              {event.description}
            </p>
          </div>
        </div>
      </div>

      {/* Event Effects */}
      {event.effects.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            事件效果:
          </h4>
          <div className="space-y-2">
            {event.effects.map((effect, index) => (
              <EffectItem
                key={index}
                target={effect.target}
                modifier={effect.modifier}
                isMultiplier={effect.isMultiplier}
              />
            ))}
          </div>
        </div>
      )}

      {/* Duration */}
      {event.duration > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>⏱️</span>
            <span>持续时间: {formatDuration(event.duration)}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}

// Effect Item Component
interface EffectItemProps {
  target: EventEffectTarget;
  modifier: number;
  isMultiplier: boolean;
}

function EffectItem({ target, modifier, isMultiplier }: EffectItemProps) {
  const isBuffEffect = isMultiplier ? modifier > 1 : modifier > 0;
  const effectColor = isBuffEffect ? 'text-green-600' : 'text-red-600';
  const bgColor = isBuffEffect ? 'bg-green-50' : 'bg-red-50';

  const formatModifier = () => {
    if (isMultiplier) {
      const percent = Math.round((modifier - 1) * 100);
      return percent >= 0 ? `+${percent}%` : `${percent}%`;
    }
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${bgColor}`}>
      <div className="flex items-center gap-2">
        <span>{effectTargetIcons[target]}</span>
        <span className="text-gray-700">
          {effectTargetLabels[target]}
        </span>
      </div>
      <span className={`font-bold ${effectColor}`}>
        {formatModifier()}
      </span>
    </div>
  );
}

// Format duration helper
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${remainingMinutes}分钟`;
}

export default EventModal;
