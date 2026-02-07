'use client';

import React from 'react';
import { Customer, CustomerType, CustomerStatus } from '@/types';
import { PatienceBar } from '@/components/ui/ProgressBar';

interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}

const customerTypeLabels: Record<CustomerType, string> = {
  regular: '普通',
  vip: 'VIP',
  critic: '评论家',
  group: '团体',
};

const customerTypeColors: Record<CustomerType, string> = {
  regular: 'bg-gray-100 text-gray-700',
  vip: 'bg-yellow-100 text-yellow-700',
  critic: 'bg-purple-100 text-purple-700',
  group: 'bg-blue-100 text-blue-700',
};

const customerStatusLabels: Record<CustomerStatus, string> = {
  waiting_seat: '等待入座',
  seated: '已入座',
  ordering: '点餐中',
  waiting_order: '等待上餐',
  eating: '用餐中',
  paying: '结账中',
  leaving: '离开中',
};

export function CustomerCard({
  customer,
  onClick,
  selected = false,
  compact = false,
}: CustomerCardProps) {
  const isPatienceLow = customer.patience < 30;
  const isPatienceCritical = customer.patience < 15;

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`
          relative cursor-pointer transition-all duration-200
          ${selected ? 'ring-2 ring-pink-500 ring-offset-2' : ''}
          ${onClick ? 'hover:scale-105' : ''}
        `}
      >
        <div className="text-3xl">{customer.avatar}</div>
        <div className="absolute -top-1 -right-1">
          <span className={`
            text-[10px] px-1 rounded-full font-medium
            ${customerTypeColors[customer.type]}
          `}>
            {customer.type === 'vip' ? '⭐' : ''}
          </span>
        </div>
        {isPatienceLow && (
          <div className={`
            absolute -bottom-1 left-1/2 -translate-x-1/2
            w-2 h-2 rounded-full
            ${isPatienceCritical ? 'bg-red-500 motion-safe:animate-pulse' : 'bg-yellow-500'}
          `} />
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
        ${isPatienceCritical ? 'motion-safe:animate-pulse' : ''}
      `}
    >
      {/* Customer Type Badge */}
      <div className="absolute -top-2 -right-2">
        <span className={`
          text-xs px-2 py-0.5 rounded-full font-medium
          ${customerTypeColors[customer.type]}
        `}>
          {customerTypeLabels[customer.type]}
        </span>
      </div>

      {/* Avatar and Name */}
      <div className="flex items-center gap-3 mb-2">
        <div className="text-4xl">{customer.avatar}</div>
        <div>
          <div className="font-medium text-gray-900">
            {customer.name}
          </div>
          <div className="text-xs text-gray-500">
            {customerStatusLabels[customer.status]}
          </div>
        </div>
      </div>

      {/* Patience Bar */}
      <div className="mb-2">
        <PatienceBar value={customer.patience} size="sm" />
      </div>

      {/* Service Progress Bar - only for waiting_order status */}
      {customer.status === 'waiting_order' && customer.serviceProgress !== undefined && (
        <div className="mb-2">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <span>🍽️</span>
            <span>服务进度</span>
            <span className="text-pink-600 font-medium">{Math.round(customer.serviceProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-400 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${customer.serviceProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Order Status */}
      {customer.order.items.length > 0 && (
        <div className="text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span>🍽️</span>
            <span>
              {customer.order.preparedItems.length}/{customer.order.items.length} 已准备
            </span>
          </div>
          <div className="text-pink-600 font-medium">
            ¥{customer.order.totalPrice}
          </div>
        </div>
      )}

      {/* Satisfaction indicator (when eating or paying) */}
      {(customer.status === 'eating' || customer.status === 'paying') && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span>😊</span>
          <span className={`
            font-medium
            ${customer.satisfaction >= 80 ? 'text-green-600' : 
              customer.satisfaction >= 50 ? 'text-yellow-600' : 'text-red-600'}
          `}>
            满意度: {Math.round(customer.satisfaction)}%
          </span>
        </div>
      )}
    </div>
  );
}

export default CustomerCard;
