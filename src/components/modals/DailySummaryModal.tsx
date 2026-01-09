'use client';

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
      size="md"
      closeOnOverlayClick={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      {/* Summary Header */}
      <div className={`
        p-3 rounded-xl mb-4 text-center
        ${isProfitable 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
        }
      `}>
        <span className="text-3xl mr-2">{isProfitable ? '🎉' : '😢'}</span>
        <span className="text-lg font-bold text-gray-900">
          {isProfitable ? '今天是盈利的一天！' : '今天有些亏损...'}
        </span>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl text-center bg-green-50">
          <div className="text-xl mb-1">💰</div>
          <div className="text-xs text-gray-500 mb-1">收入</div>
          <div className="font-bold text-green-600">{formatGold(finance.dailyRevenue)}</div>
        </div>
        <div className="p-3 rounded-xl text-center bg-red-50">
          <div className="text-xl mb-1">💸</div>
          <div className="text-xs text-gray-500 mb-1">支出</div>
          <div className="font-bold text-red-600">{formatGold(finance.dailyExpenses)}</div>
        </div>
        <div className={`p-3 rounded-xl text-center ${isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-xl mb-1">{isProfitable ? '📈' : '📉'}</div>
          <div className="text-xs text-gray-500 mb-1">利润</div>
          <div className={`font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
            {profit > 0 ? '+' : ''}{formatGold(profit)}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 mb-4">
        {/* Service Stats */}
        <div className="flex-1 bg-blue-50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <div>
              <div className="text-xs text-gray-500">累计服务顾客</div>
              <div className="font-bold text-blue-600">{statistics.totalCustomersServed} 人</div>
            </div>
          </div>
        </div>
        {/* Current Balance */}
        <div className="flex-1 bg-pink-50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <div>
              <div className="text-xs text-gray-500">当前余额</div>
              <div className="font-bold text-pink-600">{formatGold(finance.gold)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-3 border-t border-gray-100">
        <Button variant="primary" size="lg" onClick={handleStartNewDay}>
          🌅 开始新的一天
        </Button>
      </div>
    </Modal>
  );
}

export default DailySummaryModal;
