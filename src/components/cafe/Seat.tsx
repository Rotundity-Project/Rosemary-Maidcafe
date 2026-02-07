'use client';

import React from 'react';
import { Customer, CustomerStatus } from '@/types';
import { PatienceBar } from '@/components/ui/ProgressBar';

interface SeatProps {
  seatId: string;
  customer: Customer | null;
  onSeatClick?: (seatId: string) => void;
  onCustomerClick?: (customerId: string) => void;
  selectedCustomerId?: string | null;
  isHighlighted?: boolean;
}

const statusIcons: Record<CustomerStatus, string> = {
  waiting_seat: '🚶',
  seated: '🪑',
  ordering: '📋',
  waiting_order: '⏳',
  eating: '🍽️',
  paying: '💳',
  leaving: '👋',
};

export function Seat({
  seatId,
  customer,
  onSeatClick,
  onCustomerClick,
  selectedCustomerId,
  isHighlighted = false,
}: SeatProps) {
  const isEmpty = !customer;
  const isSelected = customer && selectedCustomerId === customer.id;
  const isPatienceLow = customer && customer.patience < 30;
  const isPatienceCritical = customer && customer.patience < 15;

  const handleClick = () => {
    if (customer && onCustomerClick) {
      onCustomerClick(customer.id);
    } else if (isEmpty && onSeatClick) {
      onSeatClick(seatId);
    }
  };

  // Extract seat number from seatId
  const seatNumber = seatId.replace('seat-', '');

  return (
    <div
      onClick={handleClick}
      className={`
        relative p-2 rounded-lg min-h-[72px]
        transition-all duration-200
        ${isEmpty 
          ? `
            bg-gray-50 
            border border-dashed border-gray-200
            ${onSeatClick ? 'cursor-pointer hover:border-pink-300 hover:bg-pink-50' : ''}
          `
          : `
            bg-white border
            ${isSelected 
              ? 'border-pink-500 shadow-md' 
              : 'border-gray-100'
            }
            ${onCustomerClick ? 'cursor-pointer hover:border-pink-300' : ''}
            ${isPatienceCritical ? 'motion-safe:animate-pulse border-red-400' : ''}
          `
        }
        ${isHighlighted ? 'ring-2 ring-pink-400 ring-offset-1' : ''}
      `}
    >
      {isEmpty ? (
        /* Empty Seat - Compact */
        <div className="flex items-center justify-center h-full gap-2">
          <span className="text-xl opacity-40">🪑</span>
          <span className="text-xs text-gray-400">
            {seatNumber}号
          </span>
        </div>
      ) : (
        /* Occupied Seat - Compact inline layout */
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <span className="text-2xl">{customer.avatar}</span>
            {customer.type === 'vip' && (
              <span className="absolute -top-1 -right-1 text-xs">⭐</span>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-gray-900 truncate">
                {customer.name}
              </span>
              <span className="text-xs">{statusIcons[customer.status]}</span>
            </div>
            
            {/* Patience bar - compact */}
            <div className="mt-1">
              <PatienceBar value={customer.patience} size="xs" />
            </div>
            
            {/* Order price if available */}
            {customer.order.totalPrice > 0 && (
              <div className="text-[10px] text-pink-600 font-medium mt-0.5">
                ¥{customer.order.totalPrice}
              </div>
            )}
          </div>
          
          {/* Seat number badge */}
          <div className="text-[10px] text-gray-400 self-start">
            {seatNumber}
          </div>
        </div>
      )}
      
      {/* Low patience indicator */}
      {isPatienceLow && !isPatienceCritical && (
        <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-500" />
      )}
    </div>
  );
}

// Seat Grid component for displaying multiple seats
interface SeatGridProps {
  maxSeats: number;
  customers: Customer[];
  onSeatClick?: (seatId: string) => void;
  onCustomerClick?: (customerId: string) => void;
  selectedCustomerId?: string | null;
  isLandscape?: boolean;
}

/**
 * SeatGrid - Displays cafe seats in a responsive grid layout
 * 
 * Responsive column counts per design spec (Property 11):
 * - < 480px (xs): 2 columns
 * - 480px - 640px (sm): 3 columns  
 * - 640px - 768px (md): 4 columns
 * - 768px - 1024px (lg): 5 columns
 * - >= 1024px (xl): 6 columns
 * 
 * Landscape mode: 4 columns with compact spacing
 * 
 * Requirements: 3.4, 8.2
 */
export function SeatGrid({
  maxSeats,
  customers,
  onSeatClick,
  onCustomerClick,
  selectedCustomerId,
  isLandscape = false,
}: SeatGridProps) {
  // Create seat IDs
  const seatIds = Array.from({ length: maxSeats }, (_, i) => `seat-${i + 1}`);
  
  // Map customers to seats
  const customerBySeat = new Map<string, Customer>();
  customers.forEach(customer => {
    if (customer.seatId && customer.status !== 'waiting_seat') {
      customerBySeat.set(customer.seatId, customer);
    }
  });

  // Responsive grid columns based on viewport width
  // xs (<480px): 2 cols, sm (480-640px): 3 cols, md (640-768px): 4 cols, 
  // lg (768-1024px): 5 cols, xl (>=1024px): 6 cols
  // Landscape mode: 4 columns with compact spacing
  const gridClass = isLandscape 
    ? 'grid-cols-4 gap-1' 
    : 'grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2';

  return (
    <div 
      className={`grid ${gridClass}`}
      data-testid="seat-grid"
    >
      {seatIds.map(seatId => (
        <Seat
          key={seatId}
          seatId={seatId}
          customer={customerBySeat.get(seatId) || null}
          onSeatClick={onSeatClick}
          onCustomerClick={onCustomerClick}
          selectedCustomerId={selectedCustomerId}
        />
      ))}
    </div>
  );
}

export default Seat;
