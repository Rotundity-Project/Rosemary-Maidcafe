'use client';

import React from 'react';
import { DailyFinance } from '@/types';
import { useGame } from '@/components/game/GameProvider';
import { useI18n } from '@/i18n';
import { Card, CardHeader, CardBody, StatCard } from '@/components/ui/Card';

export function FinancePanel() {
  const { state } = useGame();
  const { t } = useI18n();
  const { finance, day, maids } = state;
  const financePanel = t.financePanel;

  // Calculate daily wage expenses
  const dailyWages = maids.length * 20; // Base wage per maid
  const todayProfit = finance.dailyRevenue - finance.dailyExpenses;

  // Get last 7 days of history (or less if not enough data)
  const recentHistory = finance.history.slice(-7);

  // Calculate totals from history
  const totalRevenue = recentHistory.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = recentHistory.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = recentHistory.reduce((sum, d) => sum + d.profit, 0);

  // Find max value for chart scaling
  const maxValue = Math.max(
    ...recentHistory.map((d) => Math.max(d.revenue, d.expenses)),
    finance.dailyRevenue,
    finance.dailyExpenses,
    100
  );

  return (
    <div className="min-h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          💰 {financePanel.financeManagement}
        </h2>
        <div className="text-sm text-gray-500">
          {financePanel.day.replace('{day}', String(day))}
        </div>
      </div>

      {/* Current Balance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label={financePanel.currentGold}
          value={`💰 ${finance.gold}`}
          icon={<span className="text-xl">🏦</span>}
        />
        <StatCard
          label={financePanel.todayRevenue}
          value={`+${finance.dailyRevenue}`}
          icon={<span className="text-xl">📈</span>}
          trend="up"
        />
        <StatCard
          label={financePanel.todayExpenses}
          value={`-${finance.dailyExpenses}`}
          icon={<span className="text-xl">📉</span>}
          trend="down"
        />
        <StatCard
          label={financePanel.todayProfit}
          value={todayProfit >= 0 ? `+${todayProfit}` : `${todayProfit}`}
          icon={<span className="text-xl">💵</span>}
          trend={todayProfit >= 0 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* 7-Day Chart */}
        <Card>
          <CardHeader>{financePanel.revenueExpenseTrend}</CardHeader>
          <CardBody>
            {recentHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>{financePanel.noHistoryData}</p>
                <p className="text-sm">{financePanel.completeFirstDayTip}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Chart */}
                <div className="h-48 flex items-end gap-2">
                  {recentHistory.map((dayData, index) => (
                    <DayBar
                      key={dayData.day}
                      data={dayData}
                      maxValue={maxValue}
                      isLatest={index === recentHistory.length - 1}
                      revenueLabel={financePanel.revenue}
                      expensesLabel={financePanel.expenses}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-gray-600">{financePanel.revenue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span className="text-gray-600">{financePanel.expenses}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">{financePanel.totalProfit}</div>
                    <div className="font-bold text-green-600">+{totalRevenue}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">{financePanel.expenses}</div>
                    <div className="font-bold text-red-600">-{totalExpenses}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">{financePanel.totalProfit}</div>
                    <div className={`font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalProfit >= 0 ? '+' : ''}{totalProfit}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>{financePanel.financialDetails}</CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Today's Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {financePanel.todayDetails}
                </h4>
                <div className="space-y-2">
                  <ExpenseItem
                    label={financePanel.customerSpending}
                    amount={finance.dailyRevenue}
                    type="income"
                    icon="🍽️"
                  />
                  <ExpenseItem
                    label={financePanel.maidWages}
                    amount={dailyWages}
                    type="expense"
                    icon="👧"
                    note={financePanel.maidCount.replace('{count}', String(maids.length))}
                  />
                  <ExpenseItem
                    label={financePanel.otherExpenses}
                    amount={Math.max(0, finance.dailyExpenses - dailyWages)}
                    type="expense"
                    icon="📦"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Operating Costs Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {financePanel.dailyOperatingCosts}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>👧 {financePanel.maidWages}</span>
                    <span>{financePanel.perMaidPerDay}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>🏠 {financePanel.rent}</span>
                    <span>{financePanel.basedOnLevel}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>💡 {financePanel.utilities}</span>
                    <span>{financePanel.basedOnEquipment}</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="p-3 bg-pink-50 rounded-xl">
                <div className="text-sm font-medium text-pink-700 mb-1">
                  💡 {financePanel.businessTip}
                </div>
                <div className="text-xs text-pink-600">
                  {todayProfit < 0
                    ? financePanel.todayLossTip
                    : todayProfit < 100
                    ? financePanel.lowProfitTip
                    : financePanel.goodBusinessTip}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* History Table */}
      {recentHistory.length > 0 && (
        <Card>
          <CardHeader>{financePanel.history}</CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500">{financePanel.date}</th>
                    <th className="text-right py-2 px-3 text-gray-500">{financePanel.revenue}</th>
                    <th className="text-right py-2 px-3 text-gray-500">{financePanel.expenses}</th>
                    <th className="text-right py-2 px-3 text-gray-500">{financePanel.todayProfit}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...recentHistory].reverse().map((dayData) => (
                    <tr
                      key={dayData.day}
                      className="border-b border-gray-50"
                    >
                      <td className="py-2 px-3 text-gray-800">
                        {financePanel.day.replace('{day}', String(dayData.day))}
                      </td>
                      <td className="py-2 px-3 text-right text-green-600">
                        +{dayData.revenue}
                      </td>
                      <td className="py-2 px-3 text-right text-red-600">
                        -{dayData.expenses}
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${
                        dayData.profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {dayData.profit >= 0 ? '+' : ''}{dayData.profit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}


// Day Bar Component for Chart
interface DayBarProps {
  data: DailyFinance;
  maxValue: number;
  isLatest: boolean;
  revenueLabel: string;
  expensesLabel: string;
}

function DayBar({ data, maxValue, isLatest, revenueLabel, expensesLabel }: DayBarProps) {
  const revenueHeight = (data.revenue / maxValue) * 100;
  const expenseHeight = (data.expenses / maxValue) * 100;

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="flex-1 w-full flex items-end gap-1">
        {/* Revenue Bar */}
        <div
          className={`flex-1 rounded-t transition-all duration-300 ${
            isLatest ? 'bg-green-500' : 'bg-green-400'
          }`}
          style={{ height: `${revenueHeight}%`, minHeight: '4px' }}
          title={`${revenueLabel}: ${data.revenue}`}
        />
        {/* Expense Bar */}
        <div
          className={`flex-1 rounded-t transition-all duration-300 ${
            isLatest ? 'bg-red-500' : 'bg-red-400'
          }`}
          style={{ height: `${expenseHeight}%`, minHeight: '4px' }}
          title={`${expensesLabel}: ${data.expenses}`}
        />
      </div>
      <div className={`text-xs mt-1 ${isLatest ? 'font-bold text-pink-600' : 'text-gray-500'}`}>
        {data.day}
      </div>
    </div>
  );
}

// Expense Item Component
interface ExpenseItemProps {
  label: string;
  amount: number;
  type: 'income' | 'expense';
  icon: string;
  note?: string;
}

function ExpenseItem({ label, amount, type, icon, note }: ExpenseItemProps) {
  if (amount === 0) return null;

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-gray-700">{label}</span>
        {note && (
          <span className="text-xs text-gray-500">({note})</span>
        )}
      </div>
      <span className={`font-medium ${
        type === 'income' ? 'text-green-600' : 'text-red-600'
      }`}>
        {type === 'income' ? '+' : '-'}{amount}
      </span>
    </div>
  );
}

export default FinancePanel;
