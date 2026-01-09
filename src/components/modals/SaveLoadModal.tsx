'use client';

import React, { useState, useRef } from 'react';
import { GameState } from '@/types';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  saveGame,
  exportSave,
  downloadSave,
  importSave,
  getSaveInfo,
  deleteSave,
} from '@/utils/storage';
import { formatTimestamp, formatDay } from '@/utils/formatters';

type TabType = 'save' | 'export' | 'import' | 'new';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onLoadGame: (state: GameState) => void;
  onNewGame: () => void;
}

export function SaveLoadModal({
  isOpen,
  onClose,
  gameState,
  onLoadGame,
  onNewGame,
}: SaveLoadModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('save');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearMessage = () => setMessage(null);

  // Handle manual save
  const handleSave = () => {
    setIsLoading(true);
    const result = saveGame(gameState);
    setIsLoading(false);
    
    if (result.success) {
      setMessage({ type: 'success', text: '游戏已保存！' });
    } else {
      setMessage({ type: 'error', text: result.error || '保存失败' });
    }
  };

  // Handle export
  const handleExport = () => {
    setIsLoading(true);
    const result = exportSave(gameState);
    setIsLoading(false);
    
    if (result.success && result.data) {
      downloadSave(result.data);
      setMessage({ type: 'success', text: '存档已导出！' });
    } else {
      setMessage({ type: 'error', text: result.error || '导出失败' });
    }
  };

  // Handle import file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Handle import
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const result = await importSave(file);
    setIsLoading(false);

    if (result.success && result.data) {
      onLoadGame(result.data);
      setMessage({ type: 'success', text: '存档已导入！' });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setMessage({ type: 'error', text: result.error || '导入失败' });
    }
  };

  // Handle new game
  const handleNewGame = () => {
    setShowNewGameConfirm(true);
  };

  const confirmNewGame = () => {
    deleteSave();
    onNewGame();
    setShowNewGameConfirm(false);
    onClose();
  };

  // Get current save info
  const saveInfo = getSaveInfo();

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'save', label: '保存', icon: '💾' },
    { id: 'export', label: '导出', icon: '📤' },
    { id: 'import', label: '导入', icon: '📥' },
    { id: 'new', label: '新游戏', icon: '🆕' },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="💾 存档管理"
        size="lg"
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                clearMessage();
              }}
              className={`
                flex-1 py-2 px-4 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className={`
            p-3 rounded-xl mb-4 text-sm
            ${message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
            }
          `}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === 'save' && (
            <SaveTab
              gameState={gameState}
              saveInfo={saveInfo}
              isLoading={isLoading}
              onSave={handleSave}
            />
          )}
          {activeTab === 'export' && (
            <ExportTab
              gameState={gameState}
              isLoading={isLoading}
              onExport={handleExport}
            />
          )}
          {activeTab === 'import' && (
            <ImportTab
              isLoading={isLoading}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              onImport={handleImport}
            />
          )}
          {activeTab === 'new' && (
            <NewGameTab onNewGame={handleNewGame} />
          )}
        </div>
      </Modal>

      {/* New Game Confirmation */}
      <ConfirmModal
        isOpen={showNewGameConfirm}
        onClose={() => setShowNewGameConfirm(false)}
        onConfirm={confirmNewGame}
        title="确认开始新游戏"
        message="开始新游戏将删除当前存档，此操作无法撤销。确定要继续吗？"
        confirmText="确认"
        cancelText="取消"
        variant="danger"
      />
    </>
  );
}


// Save Tab Component
interface SaveTabProps {
  gameState: GameState;
  saveInfo: ReturnType<typeof getSaveInfo>;
  isLoading: boolean;
  onSave: () => void;
}

function SaveTab({ gameState, saveInfo, isLoading, onSave }: SaveTabProps) {
  return (
    <div className="space-y-4">
      {/* Current Game Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          当前游戏进度
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">天数:</span>
            <span className="ml-2 font-medium">{formatDay(gameState.day)}</span>
          </div>
          <div>
            <span className="text-gray-500">金币:</span>
            <span className="ml-2 font-medium">💰 {gameState.finance.gold.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">女仆数:</span>
            <span className="ml-2 font-medium">{gameState.maids.length} 名</span>
          </div>
          <div>
            <span className="text-gray-500">声望:</span>
            <span className="ml-2 font-medium">⭐ {gameState.reputation}</span>
          </div>
        </div>
      </div>

      {/* Last Save Info */}
      {saveInfo.success && saveInfo.data && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h4 className="text-sm font-medium text-blue-700 mb-2">
            上次保存
          </h4>
          <div className="text-sm text-blue-600">
            <div>时间: {formatTimestamp(saveInfo.data.timestamp)}</div>
            <div>进度: {formatDay(saveInfo.data.day)}</div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onSave}
        isLoading={isLoading}
        className="w-full"
      >
        💾 保存游戏
      </Button>

      <p className="text-xs text-gray-500 text-center">
        游戏会自动保存，但你也可以手动保存以确保进度安全
      </p>
    </div>
  );
}

// Export Tab Component
interface ExportTabProps {
  gameState: GameState;
  isLoading: boolean;
  onExport: () => void;
}

function ExportTab({ gameState, isLoading, onExport }: ExportTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          导出存档
        </h4>
        <p className="text-sm text-gray-500 mb-4">
          将当前游戏进度导出为 JSON 文件，可用于备份或在其他设备上继续游戏。
        </p>
        <div className="text-sm text-gray-600">
          <div>当前进度: {formatDay(gameState.day)}</div>
          <div>金币: 💰 {gameState.finance.gold.toLocaleString()}</div>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        onClick={onExport}
        isLoading={isLoading}
        className="w-full"
      >
        📤 导出存档文件
      </Button>

      <p className="text-xs text-gray-500 text-center">
        导出的文件将保存到你的下载文件夹
      </p>
    </div>
  );
}

// Import Tab Component
interface ImportTabProps {
  isLoading: boolean;
  onFileSelect: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function ImportTab({ isLoading, onFileSelect, fileInputRef, onImport }: ImportTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-yellow-700 mb-2">
          ⚠️ 注意
        </h4>
        <p className="text-sm text-yellow-600">
          导入存档将覆盖当前游戏进度，请确保已备份当前存档。
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          导入存档
        </h4>
        <p className="text-sm text-gray-500">
          选择之前导出的 JSON 存档文件来恢复游戏进度。
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onImport}
        className="hidden"
      />

      <Button
        variant="primary"
        size="lg"
        onClick={onFileSelect}
        isLoading={isLoading}
        className="w-full"
      >
        📥 选择存档文件
      </Button>

      <p className="text-xs text-gray-500 text-center">
        支持 .json 格式的存档文件
      </p>
    </div>
  );
}

// New Game Tab Component
interface NewGameTabProps {
  onNewGame: () => void;
}

function NewGameTab({ onNewGame }: NewGameTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-red-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-red-700 mb-2">
          ⚠️ 警告
        </h4>
        <p className="text-sm text-red-600">
          开始新游戏将删除所有当前进度，包括女仆、金币、成就等。此操作无法撤销！
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          新游戏
        </h4>
        <p className="text-sm text-gray-500">
          从头开始，体验全新的咖啡厅经营之旅。建议先导出当前存档作为备份。
        </p>
      </div>

      <Button
        variant="danger"
        size="lg"
        onClick={onNewGame}
        className="w-full"
      >
        🆕 开始新游戏
      </Button>

      <p className="text-xs text-gray-500 text-center">
        点击后需要再次确认
      </p>
    </div>
  );
}

export default SaveLoadModal;
