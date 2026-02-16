'use client';

import React from 'react';
import { Maid, MaidRole, MaidPersonality } from '@/types';
import { StaminaBar } from '@/components/ui/ProgressBar';
import { MaidAvatar } from '@/components/ui/MaidAvatar';

interface MaidCardProps {
  maid: Maid;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

const roleLabels: Record<MaidRole, string> = {
  greeter: '迎宾',
  server: '服务员',
  barista: '咖啡师',
  entertainer: '表演者',
};

const roleColors: Record<MaidRole, string> = {
  greeter: 'bg-pink-100 text-pink-700',
  server: 'bg-blue-100 text-blue-700',
  barista: 'bg-amber-100 text-amber-700',
  entertainer: 'bg-purple-100 text-purple-700',
};

const taskLabels: Record<string, string> = {
  serving: '服务中',
  greeting: '迎宾中',
  preparing: '准备中',
  entertaining: '表演中',
};

const roleIcons: Record<MaidRole, string> = {
  greeter: '👋',
  server: '🍽️',
  barista: '☕',
  entertainer: '🎭',
};

const personalityEmojis: Record<MaidPersonality, string> = {
  cheerful: '😊',
  cool: '😎',
  shy: '😳',
  energetic: '⚡',
  elegant: '✨',
  gentle: '🌸',
  playful: '🎀',
};

export function MaidCard({
  maid,
  onClick,
  selected = false,
  compact = false,
}: MaidCardProps) {
  const isLowStamina = maid.stamina < 20;
  const isResting = maid.status.isResting;
  const isWorking = maid.status.isWorking;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`
          relative cursor-pointer transition-all duration-200
          ${selected ? 'ring-2 ring-pink-500 ring-offset-2 rounded-full' : ''}
          ${onClick ? 'hover:scale-105' : ''}
          ${isResting ? 'opacity-60' : ''}
        `}
      >
        <MaidAvatar src={maid.avatar} name={maid.name} size="sm" />
        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
          <span className="text-xs">{roleIcons[maid.role]}</span>
        </div>
        {isLowStamina && !isResting && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative p-3 rounded-xl bg-white
        border-2 transition-all duration-200
        ${selected 
          ? 'border-pink-500 shadow-lg shadow-pink-500/20' 
          : 'border-gray-100'
        }
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-pink-300' : ''}
        ${isResting ? 'opacity-75' : ''}
      `}
    >
      {/* Role Badge */}
      <div className="absolute -top-2 -right-2">
        <span className={`
          text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1
          ${roleColors[maid.role]}
        `}>
          <span>{roleIcons[maid.role]}</span>
          <span>{roleLabels[maid.role]}</span>
        </span>
      </div>

      {/* Level Badge */}
      <div className="absolute -top-2 -left-2">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
          Lv.{maid.level}
        </span>
      </div>

      {/* Avatar and Name */}
      <div className="flex items-center gap-3 mb-2 mt-1">
        <div className="relative">
          <MaidAvatar src={maid.avatar} name={maid.name} size="md" />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
            <span className="text-sm">{personalityEmojis[maid.personality]}</span>
          </div>
        </div>
        <div>
          <div className="font-medium text-gray-800">
            {maid.name}
          </div>
          <div className="text-xs text-gray-500">
            {maid.status.currentTask 
              ? (taskLabels[maid.status.currentTask] || maid.status.currentTask)
              : (isResting ? '正在休息' : '待命中')}
          </div>
        </div>
      </div>

      {/* Stamina Bar */}
      <div className="mb-2">
        <StaminaBar value={maid.stamina} size="sm" />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-2 text-xs text-center">
        <div className="bg-pink-50 rounded-lg p-1">
          <div className="text-pink-600">💕</div>
          <div className="text-gray-600">{maid.stats.charm}</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-1">
          <div className="text-blue-600">⭐</div>
          <div className="text-gray-600">{maid.stats.skill}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-1">
          <div className="text-green-600">💪</div>
          <div className="text-gray-600">{maid.stats.stamina}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-1">
          <div className="text-yellow-600">⚡</div>
          <div className="text-gray-600">{maid.stats.speed}</div>
        </div>
      </div>

      {/* Working indicator */}
      {isWorking && maid.status.servingCustomerId && (
        <div className="mt-2 text-xs text-center text-pink-600 animate-pulse">
          🍽️ 正在服务顾客...
        </div>
      )}

      {/* Low stamina warning */}
      {isLowStamina && !isResting && (
        <div className="mt-2 text-xs text-center text-red-600">
          ⚠️ 体力不足，效率降低50%
        </div>
      )}
    </div>
  );
}

export default MaidCard;
