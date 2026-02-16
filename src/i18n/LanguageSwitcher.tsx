'use client';

import React from 'react';
import { useI18n, LanguageSwitcherProps } from '@/i18n';

/**
 * 语言切换组件
 * 提供中英文切换功能
 */
export function LanguageSwitcher({ className = '', size = 'md' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useI18n();

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const buttonBase = `rounded-lg font-medium transition-all duration-200 border-2 ${
    sizeClasses[size]
  }`;

  return (
    <div className={`flex gap-1 ${className}`}>
      <button
        onClick={() => setLanguage('zh')}
        className={`${buttonBase} ${
          language === 'zh'
            ? 'bg-pink-500 border-pink-500 text-white'
            : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-500'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`${buttonBase} ${
          language === 'en'
            ? 'bg-pink-500 border-pink-500 text-white'
            : 'bg-white border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-500'
        }`}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;
