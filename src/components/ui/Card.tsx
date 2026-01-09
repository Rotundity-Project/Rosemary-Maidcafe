'use client';

import React, { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
}

const variantStyles: Record<string, string> = {
  default: 'bg-white border border-gray-100',
  outlined: 'bg-transparent border-2 border-gray-200',
  elevated: 'bg-white shadow-lg',
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${hoverable ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${clickable ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Card Header component
interface CardHeaderProps {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ children, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      <div className="font-semibold text-gray-800">
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Card Body component
interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={`text-gray-600 ${className}`}>
      {children}
    </div>
  );
}

// Card Footer component
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-3 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

// Stat Card - for displaying statistics
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  className = '',
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-gray-500',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <Card className={className} padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {value}
          </p>
          {trend && trendValue && (
            <p className={`text-sm mt-1 ${trendColors[trend]}`}>
              {trendIcons[trend]} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-pink-100 rounded-xl text-pink-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export default Card;
