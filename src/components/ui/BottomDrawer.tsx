'use client';

import React, { ReactNode, useEffect, useCallback, useRef, useState } from 'react';

interface BottomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  height?: 'auto' | 'half' | 'full';
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const heightStyles: Record<string, string> = {
  auto: 'max-h-[85vh]',
  half: 'h-[50vh]',
  full: 'h-[90vh]',
};

export function BottomDrawer({
  isOpen,
  onClose,
  title,
  height = 'auto',
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
}: BottomDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentTranslateY, setCurrentTranslateY] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setCurrentTranslateY(0);
      onClose();
    }, 300);
  }, [onClose]);

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    },
    [handleClose]
  );

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  // Touch/drag handlers for swipe-to-close
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    setDragStartY(clientY);
  }, []);

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      
      const deltaY = clientY - dragStartY;
      // Only allow dragging downward
      if (deltaY > 0) {
        setCurrentTranslateY(deltaY);
      }
    },
    [isDragging, dragStartY]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // If dragged more than 100px down, close the drawer
    if (currentTranslateY > 100) {
      handleClose();
    } else {
      // Snap back to original position
      setCurrentTranslateY(0);
    }
  }, [isDragging, currentTranslateY, handleClose]);

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleDragMove(e.clientY);
    },
    [handleDragMove]
  );

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Add/remove mouse move and up listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={`
          absolute inset-0 bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${isClosing ? 'opacity-0' : 'opacity-100'}
        `}
        onClick={closeOnOverlayClick ? handleClose : undefined}
        aria-hidden="true"
      />

      {/* Drawer Content */}
      <div
        ref={drawerRef}
        className={`
          absolute bottom-0 left-0 right-0
          bg-white rounded-t-2xl shadow-2xl
          ${heightStyles[height]}
          transform transition-transform
          ${isDragging ? '' : 'duration-300 ease-out'}
          ${isClosing ? 'translate-y-full' : ''}
          safe-area-bottom
        `}
        style={{
          transform: isClosing 
            ? 'translateY(100%)' 
            : `translateY(${currentTranslateY}px)`,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-target"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100">
            {title && (
              <h2
                id="drawer-title"
                className="text-lg font-semibold text-gray-800"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors touch-target close-btn-mobile btn-mobile-press mobile-no-tap-highlight"
                aria-label="关闭"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-4 py-4 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default BottomDrawer;
