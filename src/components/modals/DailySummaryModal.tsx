'use client';

import { Maid, Finance, GameStatistics, Facility } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatGold } from '@/utils/formatters';
import { calculateDailyOperatingCost } from '@/systems/financeSystem';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNewDay: () => void;
  day: number;
  finance: Finance;
  maids: Maid[];
  facility: Facility;
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
  facility,
  statistics,
}: DailySummaryModalProps) {
  // 计算当日实际支出
  const dailyOperatingCost = calculateDailyOperatingCost(maids, facility);
  const totalExpenses = finance.dailyExpenses + dailyOperatingCost;
  const profit = finance.dailyRevenue - totalExpenses;
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
      size="md"
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      {/* Summary Header - Larger text on mobile for readability */}
      <div className={`
        p-4 sm:p-3 rounded-xl mb-4 sm:mb-4 text-center
        ${isProfitable 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
        }
      `}>
        <span className="text-4xl sm:text-3xl mr-2">{isProfitable ? '🎉' : '😢'}</span>
        <span className="text-lg sm:text-lg font-bold text-gray-900">
          {isProfitable ? '今天是盈利的一天！' : '今天有些亏损...'}
        </span>
      </div>

      {/* Financial Summary - Larger touch targets and text on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-4">
        <div className="p-4 sm:p-3 rounded-xl text-center bg-green-50">
          <div className="text-2xl sm:text-xl mb-1">💰</div>
          <div className="text-sm sm:text-xs text-gray-500 mb-1">收入</div>
          <div className="font-bold text-base sm:text-base text-green-600">{formatGold(finance.dailyRevenue)}</div>
        </div>
        <div className="p-4 sm:p-3 rounded-xl text-center bg-red-50">
          <div className="text-2xl sm:text-xl mb-1">💸</div>
          <div className="text-sm sm:text-xs text-gray-500 mb-1">支出</div>
          <div className="font-bold text-base sm:text-base text-red-600">{formatGold(totalExpenses)}</div>
        </div>
        <div className={`p-4 sm:p-3 rounded-xl text-center ${isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-2xl sm:text-xl mb-1">{isProfitable ? '📈' : '📉'}</div>
          <div className="text-sm sm:text-xs text-gray-500 mb-1">利润</div>
          <div className={`font-bold text-base sm:text-base ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            {profit > 0 ? '+' : ''}{formatGold(profit)}
          </div>
        </div>
      </div>

      {/* Stats Row - Stack on very small screens, row on larger */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 mb-4 sm:mb-4">
        {/* Service Stats */}
        <div className="flex-1 bg-blue-50 rounded-xl p-4 sm:p-3">
          <div className="flex items-center gap-3 sm:gap-2">
            <span className="text-2xl sm:text-xl">👥</span>
            <div>
              <div className="text-sm sm:text-xs text-gray-500">累计服务顾客</div>
              <div className="font-bold text-lg sm:text-base text-blue-600">{statistics.totalCustomersServed} 人</div>
            </div>
          </div>
        </div>
        {/* Current Balance */}
        <div className="flex-1 bg-pink-50 rounded-xl p-4 sm:p-3">
          <div className="flex items-center gap-3 sm:gap-2">
            <span className="text-2xl sm:text-xl">💰</span>
            <div>
              <div className="text-sm sm:text-xs text-gray-500">当前余额</div>
              <div className="font-bold text-lg sm:text-base text-pink-600">{formatGold(finance.gold)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button - Full width on mobile */}
      <div className="flex justify-center pt-4 sm:pt-3 border-t border-gray-100">
        <Button variant="primary" size="lg" onClick={handleStartNewDay} className="w-full sm:w-auto touch-target">
          🌅 开始新的一天
        </Button>
      </div>
    </Modal>
  );
}

export default DailySummaryModal;
