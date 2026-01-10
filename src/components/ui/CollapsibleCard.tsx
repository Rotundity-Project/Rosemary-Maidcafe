'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface CollapsibleCardProps {
  title: string;
  icon: string;
  badge?: number;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * CollapsibleCard - A card component that can be expanded/collapsed
 * 
 * Features:
 * - Smooth expand/collapse animation using CSS transitions
 * - Shows title, icon, and optional badge count
 * - Defaults to collapsed on mobile (< 640px), expanded on desktop
 * - Touch-friendly with 44px minimum touch target
 * 
 * Requirements: 3.2
 */
export function CollapsibleCard({
  title,
  icon,
  badge,
  defaultExpanded,
  children,
  className = '',
}: CollapsibleCardProps) {
  // Determine initial expanded state based on viewport width
  const [isExpanded, setIsExpanded] = useState(() => {
    if (defaultExpanded !== undefined) {
      return defaultExpanded;
    }
    // Default: collapsed on mobile (< 640px), expanded on desktop
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640;
    }
    return false; // SSR fallback: collapsed
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  // Update content height when children change or expansion state changes
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, isExpanded]);

  // Handle window resize to update default state
  useEffect(() => {
    if (defaultExpanded !== undefined) return; // Don't auto-adjust if explicitly set

    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      // Only auto-collapse on mobile if currently expanded and was auto-expanded
      if (isMobile && isExpanded) {
        setIsExpanded(false);
      }
    };

    // Debounce resize handler
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [defaultExpanded, isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-100 shadow-sm
        overflow-hidden transition-shadow duration-200
        hover:shadow-md
        ${className}
      `}
      data-testid="collapsible-card"
    >
      {/* Header - clickable area */}
      <button
        type="button"
        onClick={toggleExpanded}
        className={`
          w-full flex items-center justify-between
          px-4 py-3 touch-target
          text-left cursor-pointer
          transition-colors duration-150
          hover:bg-gray-50 active:bg-gray-100
          focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-inset
        `}
        aria-expanded={isExpanded}
        aria-controls={`collapsible-content-${title.replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Icon */}
          <span className="text-lg flex-shrink-0" role="img" aria-hidden="true">
            {icon}
          </span>
          
          {/* Title */}
          <span className="font-medium text-gray-800 truncate">
            {title}
          </span>
          
          {/* Badge */}
          {badge !== undefined && badge > 0 && (
            <span className="flex-shrink-0 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold bg-pink-500 text-white">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>

        {/* Expand/Collapse indicator */}
        <span
          className={`
            flex-shrink-0 text-gray-400 transition-transform duration-200
            ${isExpanded ? 'rotate-180' : 'rotate-0'}
          `}
          aria-hidden="true"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Collapsible content */}
      <div
        id={`collapsible-content-${title.replace(/\s+/g, '-')}`}
        className="overflow-hidden transition-all duration-200 ease-out"
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : '0px',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div
          ref={contentRef}
          className="px-4 pb-4 pt-1 border-t border-gray-50"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default CollapsibleCard;
