'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from './translations';

/**
 * i18n 上下文
 * 提供语言切换和翻译功能
 */
interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

/**
 * i18n Provider 组件
 * 管理语言状态并提供翻译函数
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('zh');
  const [isInitialized, setIsInitialized] = useState(false);

  // 从 localStorage 加载语言设置
  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'zh') {
      setLanguageState(saved);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // 同步警告：确保语言切换后翻译更新
  const t = translations[language] as TranslationKeys;

  if (!isInitialized) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * 使用翻译的 Hook
 * @returns 翻译函数 t 和当前语言
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    // 返回默认值，避免崩溃
    return {
      language: 'zh' as Language,
      setLanguage: (_lang: Language) => {},
      t: translations.zh,
    };
  }
  return context;
}

/**
 * 语言切换组件 props
 */
export interface LanguageSwitcherProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}
