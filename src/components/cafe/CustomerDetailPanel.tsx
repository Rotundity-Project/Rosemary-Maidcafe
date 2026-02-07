'use client';

import React, { useMemo } from 'react';
import { useGame } from '@/components/game/GameProvider';
import { Button } from '@/components/ui/Button';
import { calculateEfficiency } from '@/systems/maidSystem';
import { Customer, MenuItem } from '@/types';

export function CustomerDetailPanel({ customer }: { customer: Customer }) {
  const { state, dispatch } = useGame();

  const menuById = useMemo(() => {
    const map = new Map<string, MenuItem>();
    state.menuItems.forEach(item => map.set(item.id, item));
    return map;
  }, [state.menuItems]);

  const orderLines = useMemo(() => {
    return customer.order.items.map(line => {
      const item = menuById.get(line.menuItemId);
      return {
        id: line.menuItemId,
        name: item?.name ?? line.menuItemId,
        quantity: line.quantity,
      };
    });
  }, [customer.order.items, menuById]);

  const availableMaids = useMemo(() => {
    return state.maids
      .filter(m => !m.status.isResting && !m.status.isWorking && m.status.servingCustomerId === null && m.stamina >= 10)
      .sort((a, b) => calculateEfficiency(b) - calculateEfficiency(a));
  }, [state.maids]);

  const canServeNow = customer.status === 'seated' && availableMaids.length > 0;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-3">
        <div className="text-sm text-gray-600">订单内容</div>
        {orderLines.length === 0 ? (
          <div className="text-sm text-gray-400 mt-2">暂无订单</div>
        ) : (
          <div className="mt-2 space-y-1 text-sm">
            {orderLines.map(line => (
              <div key={line.id} className="flex items-center justify-between">
                <span className="text-gray-700 truncate">{line.name}</span>
                <span className="text-gray-500">×{line.quantity}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
              <span className="text-gray-500">合计</span>
              <span className="font-semibold text-pink-600">¥{customer.order.totalPrice}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={canServeNow ? 'primary' : 'secondary'}
          disabled={!canServeNow}
          className="flex-1"
          onClick={() => {
            if (!canServeNow) return;
            const maid = availableMaids[0];
            dispatch({ type: 'START_SERVICE', maidId: maid.id, customerId: customer.id });
          }}
        >
          {availableMaids.length === 0 ? '暂无空闲女仆' : customer.status === 'seated' ? '立即安排服务' : '当前不可服务'}
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => dispatch({ type: 'SELECT_CUSTOMER', customerId: null })}
        >
          取消选择
        </Button>
      </div>
    </div>
  );
}

export default CustomerDetailPanel;

