'use client';

import { useState, useEffect } from 'react';

/**
 * 键盘快捷键提示组件
 * 显示游戏中的可用快捷键
 */
export function KeyboardHints() {
  const [visible, setVisible] = useState(false);

  // 按 ? 键显示/隐藏快捷键提示
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !event.repeat) {
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-4 left-4 text-xs text-gray-400 hover:text-gray-600 bg-white/80 px-2 py-1 rounded shadow"
      >
        按 ? 显示快捷键
      </button>
    );
  }

  const hints = [
    { key: '空格', action: '暂停/继续游戏' },
    { key: '1-8', action: '切换面板' },
    { key: '?', action: '显示/隐藏快捷键' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setVisible(false)}>
      <div 
        className="bg-white rounded-lg shadow-xl p-6 max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">⌨️ 键盘快捷键</h3>
          <button 
            onClick={() => setVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <ul className="space-y-2">
          {hints.map((hint, index) => (
            <li key={index} className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono min-w-[60px] text-center">
                {hint.key}
              </kbd>
              <span className="text-gray-600">{hint.action}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-gray-400 text-center">
          游戏中更多快捷键即将推出
        </p>
      </div>
    </div>
  );
}

export default KeyboardHints;
