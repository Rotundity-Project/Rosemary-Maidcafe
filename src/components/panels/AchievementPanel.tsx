'use client';

import React, { useState } from 'react';
import { Achievement } from '@/types';
import { useGame } from '@/components/game/GameProvider';
import { useI18n } from '@/i18n';
import { Card, CardHeader, CardBody, StatCard } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

type FilterType = 'all' | 'unlocked' | 'locked';

const conditionTypeIcons: Record<string, string> = {
  totalCustomersServed: '👥',
  totalRevenue: '💰',
  totalDaysPlayed: '📅',
  maidsHired: '👧',
  totalTipsEarned: '💵',
  perfectServicesCount: '⭐',
};

export function AchievementPanel() {
  const { state } = useGame();
  const { t } = useI18n();
  const [filter, setFilter] = useState<FilterType>('all');

  const { achievements, statistics } = state;
  const achievementPanel = t.achievementPanel;
  const achievementStats = achievementPanel.statistics as unknown as Record<string, string>;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  // Group achievements by condition type
  const groupedAchievements = filteredAchievements.reduce((groups, achievement) => {
    const type = achievement.condition.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);

  // Get current value for a condition type
  const getCurrentValue = (type: string): number => {
    const statsMap: Record<string, number> = {
      totalCustomersServed: statistics.totalCustomersServed,
      totalRevenue: statistics.totalRevenue,
      totalDaysPlayed: statistics.totalDaysPlayed,
      totalTipsEarned: statistics.totalTipsEarned,
      perfectServicesCount: statistics.perfectServicesCount,
      maidsHired: statistics.maidsHired,
    };
    return statsMap[type] || 0;
  };

  return (
    <div className="min-h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          🏆 {achievementPanel.achievementSystem}
        </h2>
        <div className="text-sm text-gray-500">
          {achievementPanel.unlocked} {unlockedCount} / {totalCount}
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="text-4xl">🏆</div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">{achievementPanel.achievementProgress}</div>
              <ProgressBar
                value={unlockedCount}
                max={totalCount}
                color="yellow"
                size="lg"
                showLabel
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label={achievementStats.totalCustomersServed}
          value={statistics.totalCustomersServed}
          icon={<span className="text-xl">👥</span>}
        />
        <StatCard
          label={achievementStats.totalRevenue}
          value={statistics.totalRevenue}
          icon={<span className="text-xl">💰</span>}
        />
        <StatCard
          label={achievementStats.totalDaysPlayed}
          value={statistics.totalDaysPlayed}
          icon={<span className="text-xl">📅</span>}
        />
        <StatCard
          label={achievementStats.maidsHired}
          value={statistics.maidsHired}
          icon={<span className="text-xl">👧</span>}
        />
        <StatCard
          label={achievementStats.totalTipsEarned}
          value={statistics.totalTipsEarned}
          icon={<span className="text-xl">💵</span>}
        />
        <StatCard
          label={achievementStats.perfectServicesCount}
          value={statistics.perfectServicesCount}
          icon={<span className="text-xl">⭐</span>}
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label={`${achievementPanel.all} (${totalCount})`}
        />
        <FilterButton
          active={filter === 'unlocked'}
          onClick={() => setFilter('unlocked')}
          label={`${achievementPanel.unlocked} (${unlockedCount})`}
          color="green"
        />
        <FilterButton
          active={filter === 'locked'}
          onClick={() => setFilter('locked')}
          label={`${achievementPanel.locked} (${totalCount - unlockedCount})`}
          color="gray"
        />
      </div>

      {/* Achievements List */}
      <div className="flex-1 min-h-0 overflow-auto space-y-4">
        {Object.entries(groupedAchievements).map(([type, typeAchievements]) => (
          <Card key={type}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span>{conditionTypeIcons[type] || '🎯'}</span>
                <span>{achievementStats[type] || type}</span>
                <span className="text-sm text-gray-500">
                  ({typeAchievements.filter((a) => a.unlocked).length}/{typeAchievements.length})
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {typeAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    currentValue={getCurrentValue(achievement.condition.type)}
                    t={t}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        ))}

        {filteredAchievements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🏆</div>
            <p>{achievementPanel.noMatchingAchievements}</p>
          </div>
        )}
      </div>
    </div>
  );
}


// Filter Button Component
interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: 'pink' | 'green' | 'gray';
}

function FilterButton({ active, onClick, label, color = 'pink' }: FilterButtonProps) {
  const activeColors = {
    pink: 'bg-pink-500 text-white',
    green: 'bg-green-500 text-white',
    gray: 'bg-gray-500 text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-xl text-sm font-medium transition-colors
        ${active
          ? activeColors[color]
          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
        }
      `}
    >
      {label}
    </button>
  );
}

// Achievement Card Component
interface AchievementCardProps {
  achievement: Achievement;
  currentValue: number;
  t: any;
}

function AchievementCard({ achievement, currentValue, t }: AchievementCardProps) {
  const { unlocked, name, description, reward, condition, unlockedDate } = achievement;
  const progress = Math.min((currentValue / condition.target) * 100, 100);
  const achievementPanel = t.achievementPanel;

  return (
    <div
      className={`
        p-4 rounded-xl border-2 transition-all
        ${unlocked
          ? 'border-yellow-400 bg-yellow-50'
          : 'border-gray-100 bg-gray-50'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          text-3xl p-2 rounded-xl
          ${unlocked
            ? 'bg-yellow-100'
            : 'bg-gray-200 grayscale'
          }
        `}>
          {unlocked ? '🏆' : '🔒'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-medium truncate ${
              unlocked
                ? 'text-yellow-700'
                : 'text-gray-700'
            }`}>
              {name}
            </h4>
            {unlocked && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-200 text-yellow-800">
                ✓
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-0.5">
            {description}
          </p>

          {/* Progress */}
          {!unlocked && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{achievementPanel.progress}</span>
                <span>{currentValue} / {condition.target}</span>
              </div>
              <ProgressBar
                value={currentValue}
                max={condition.target}
                color={progress >= 100 ? 'green' : 'blue'}
                size="sm"
              />
            </div>
          )}

          {/* Reward */}
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-sm ${
              unlocked ? 'text-yellow-600' : 'text-gray-500'
            }`}>
              {achievementPanel.reward}: 💰 {reward}
            </span>
            {unlocked && unlockedDate && (
              <span className="text-xs text-gray-400">
                {new Date(unlockedDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchievementPanel;
