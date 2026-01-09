'use client';

import React from 'react';
import { Maid, Finance, GameStatistics } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatGold } from '@/utils/formatters';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewDay: () => void;
  day: number;
  finance: Finance;
  maids: Maid[];
  customersServedToday: number;
  statistics: GameStatistics;
}

export function DailySummaryModal({
  isOpen,
  onClose,
  onStartNewDay,
  day,
  finance,
  maids,
  customersServedToday,
  statistics,
}: DailySummaryModalProps) {
  const profit = finance.dailyRevenue - finance.dailyExpenses;
  const isProfitable = profit >= 0;

  const handleStartNewDay = () => {
    onStartNewDay();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📊 第 ${day} 天总结`}
      size="lg"
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      {/* Summary Header */}
      <div className={`
        p-4 rounded-xl mb-4 text-center
        ${isProfitable 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
        }
      `}>
        <div className="text-4xl mb-2">
          {isProfitable ? '🎉' : '😢'}
        </div>
        <div className="text-lg font-bold text-gray-900">
          {isProfitable ? '今天是盈利的一天！' : '今天有些亏损...'}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <FinanceCard
          label="收入"
          value={finance.dailyRevenue}
          icon="💰"
          color="green"
        />
        <FinanceCard
          label="支出"
          value={finance.dailyExpenses}
          icon="💸"
          color="red"
        />
        <FinanceCard
          label="利润"
          value={profit}
          icon={isProfitable ? '📈' : '📉'}
          color={isProfitable ? 'green' : 'red'}
          showSign
        />
      </div>

      {/* Service Stats */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          服务统计
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            label="今日服务顾客"
            value={customersServedToday}
            icon="👥"
          />
          <StatItem
            label="累计服务顾客"
            value={statistics.totalCustomersServed}
            icon="📊"
          />
        </div>
      </div>

      {/* Maid Performance */}
      {maids.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            女仆表现
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {maids.map((maid) => (
              <MaidPerformanceItem key={maid.id} maid={maid} />
            ))}
          </div>
        </div>
      )}

      {/* Current Balance */}
      <div className="bg-pink-50 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">当前金币余额</span>
          <span className="text-xl font-bold text-pink-600">
            💰 {formatGold(finance.gold)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-4 border-t border-gray-100">
        <Button variant="primary" size="lg" onClick={handleStartNewDay}>
          🌅 开始新的一天
        </Button>
      </div>
    </Modal>
  );
}


// Finance Card Component
interface FinanceCardProps {
  label: string;
  value: number;
  icon: string;
  color: 'green' | 'red';
  showSign?: boolean;
}

function FinanceCard({ label, value, icon, color, showSign = false }: FinanceCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className={`p-3 rounded-xl text-center ${colorClasses[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="font-bold">
        {showSign && value > 0 ? '+' : ''}{formatGold(value)}
      </div>
    </div>
  );
}

// Stat Item Component
interface StatItemProps {
  label: string;
  value: number;
  icon: string;
}

function StatItem({ label, value, icon }: StatItemProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

// Maid Performance Item Component
interface MaidPerformanceItemProps {
  maid: Maid;
}

function MaidPerformanceItem({ maid }: MaidPerformanceItemProps) {
  const staminaColor = maid.stamina < 20 ? 'text-red-500' : maid.stamina < 50 ? 'text-yellow-500' : 'text-green-500';
  const moodColor = maid.mood < 30 ? 'text-red-500' : maid.mood < 60 ? 'text-yellow-500' : 'text-pink-500';

  return (
    <div className="flex items-center justify-between p-2 bg-white rounded-xl">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{maid.avatar}</span>
        <div>
          <div className="font-medium text-gray-900 text-sm">
            {maid.name}
          </div>
          <div className="text-xs text-gray-500">
            Lv.{maid.level}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-center">
          <div className="text-xs text-gray-500">体力</div>
          <div className={`font-medium ${staminaColor}`}>
            {Math.round(maid.stamina)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">心情</div>
          <div className={`font-medium ${moodColor}`}>
            {Math.round(maid.mood)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailySummaryModal;
