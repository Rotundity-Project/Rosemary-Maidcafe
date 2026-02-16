'use client';

import React, { useState } from 'react';
import { useGame } from '@/components/game/GameProvider';
import { useAudio } from '@/components/game/AudioProvider';
import { useI18n } from '@/i18n';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { deleteSave, exportSave, downloadSave, saveGame } from '@/utils/storage';

export function SettingsPanel() {
  const { state, dispatch } = useGame();
  const { settings, setMuted, setBgmEnabled, setSfxEnabled, setBgmVolume, setSfxVolume, playSfx } = useAudio();
  const { t, language, setLanguage } = useI18n();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);

  // 导出存档
  const handleExportSave = () => {
    const result = exportSave(state);
    if (result.success && result.data) {
      downloadSave(result.data);
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          id: `notif_${Date.now()}`,
          type: 'success',
          message: '存档已导出',
          timestamp: Date.now(),
        },
      });
    }
  };

  // 手动保存
  const handleManualSave = () => {
    const result = saveGame(state);
    dispatch({
      type: 'ADD_NOTIFICATION',
      notification: {
        id: `notif_${Date.now()}`,
        type: result.success ? 'success' : 'error',
        message: result.success ? '游戏已保存' : `保存失败: ${result.error}`,
        timestamp: Date.now(),
      },
    });
  };

  // 复制游戏信息到剪贴板
  const handleCopyGameInfo = async () => {
    const info = `🌿 迷迭香咖啡厅 - 第 ${state.day} 天
💰 金币: ${state.finance.gold.toLocaleString()}
⭐ 声望: ${state.reputation}
👩‍⚕️ 女仆: ${state.maids.length}人
📊 服务顾客: ${state.statistics.totalCustomersServed}
💕 总收入: ${state.statistics.totalRevenue.toLocaleString()}`;

    try {
      await navigator.clipboard.writeText(info);
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          id: `notif_${Date.now()}`,
          type: 'success',
          message: '游戏信息已复制到剪贴板',
          timestamp: Date.now(),
        },
      });
    } catch {
      dispatch({
        type: 'ADD_NOTIFICATION',
        notification: {
          id: `notif_${Date.now()}`,
          type: 'error',
          message: '复制失败',
          timestamp: Date.now(),
        },
      });
    }
  };

  // 删除存档
  const handleDeleteSave = () => {
    if (deleteStep < 2) {
      setDeleteStep(deleteStep + 1);
      return;
    }

    // 执行删除
    deleteSave();
    
    // 重置游戏状态
    dispatch({ type: 'RESET_GAME' });
    
    setShowDeleteConfirm(false);
    setDeleteStep(0);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteStep(0);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          ⚙️ 设置
        </h2>
      </div>

      {/* Game Info */}
      <Card>
        <CardHeader>📊 游戏信息</CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-pink-50 rounded-lg p-3">
              <div className="text-gray-500">游戏天数</div>
              <div className="text-xl font-bold text-pink-600">{state.day} 天</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-gray-500">声望</div>
              <div className="text-xl font-bold text-purple-600">{state.reputation}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-gray-500">金币</div>
              <div className="text-xl font-bold text-yellow-600">{state.finance.gold.toLocaleString()}</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-gray-500">女仆数量</div>
              <div className="text-xl font-bold text-blue-600">{state.maids.length}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>📈 统计数据</CardHeader>
        <CardBody>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">服务顾客总数</span>
              <span className="font-medium">{state.statistics.totalCustomersServed}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">总收入</span>
              <span className="font-medium text-yellow-600">💰 {state.statistics.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">总小费</span>
              <span className="font-medium text-pink-600">💕 {state.statistics.totalTipsEarned.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">完美服务次数</span>
              <span className="font-medium text-purple-600">⭐ {state.statistics.perfectServicesCount}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">雇佣女仆总数</span>
              <span className="font-medium">{state.statistics.maidsHired}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>🔊 音频</CardHeader>
        <CardBody>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">静音</span>
              <input
                type="checkbox"
                checked={settings.muted}
                onChange={(e) => {
                  setMuted(e.target.checked);
                  playSfx('click');
                }}
                className="h-4 w-4 accent-pink-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">背景音乐</span>
              <input
                type="checkbox"
                checked={settings.bgmEnabled}
                onChange={(e) => {
                  setBgmEnabled(e.target.checked);
                  playSfx('click');
                }}
                disabled={settings.muted}
                className="h-4 w-4 accent-pink-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">音乐音量</span>
                <span className="text-gray-500">{Math.round(settings.bgmVolume * 100)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.bgmVolume * 100)}
                onChange={(e) => setBgmVolume(Number(e.target.value) / 100)}
                onPointerUp={() => playSfx('click')}
                disabled={settings.muted || !settings.bgmEnabled}
                className="w-full accent-pink-500 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">音效</span>
              <input
                type="checkbox"
                checked={settings.sfxEnabled}
                onChange={(e) => {
                  setSfxEnabled(e.target.checked);
                  playSfx('click');
                }}
                disabled={settings.muted}
                className="h-4 w-4 accent-pink-500 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">音效音量</span>
                <span className="text-gray-500">{Math.round(settings.sfxVolume * 100)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.sfxVolume * 100)}
                onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
                onPointerUp={() => playSfx('click')}
                disabled={settings.muted || !settings.sfxEnabled}
                className="w-full accent-pink-500 disabled:opacity-50"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>🌐 {t.language}</CardHeader>
        <CardBody>
          <div className="flex justify-center">
            <LanguageSwitcher size="lg" />
          </div>
        </CardBody>
      </Card>

      {/* Save Management */}
      <Card>
        <CardHeader>💾 存档管理</CardHeader>
        <CardBody>
          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={handleManualSave}
              className="w-full"
            >
              💾 手动保存
            </Button>
            
            <Button
              variant="secondary"
              onClick={handleExportSave}
              className="w-full"
            >
              📤 导出存档
            </Button>

            <Button
              variant="secondary"
              onClick={handleCopyGameInfo}
              className="w-full"
            >
              📋 复制游戏信息
            </Button>
            
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full"
            >
              🗑️ 删除存档并重新开始
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>ℹ️ 关于</CardHeader>
        <CardBody>
          <div className="text-sm text-gray-600 space-y-2">
            <p>🌿 迷迭香咖啡厅 v0.1.0</p>
            <p>一款二次元风格的女仆咖啡厅经营模拟游戏</p>
            <p className="text-xs text-gray-400">游戏数据自动保存到浏览器本地存储</p>
          </div>
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        title="⚠️ 确认删除存档"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            {deleteStep === 0 && (
              <div className="space-y-2">
                <p className="text-red-600 font-medium">警告：此操作不可撤销！</p>
                <p className="text-gray-600 text-sm">
                  删除存档将清除所有游戏进度，包括：
                </p>
                <ul className="text-sm text-gray-500 list-disc list-inside">
                  <li>所有女仆</li>
                  <li>金币和声望</li>
                  <li>设施升级</li>
                  <li>成就进度</li>
                </ul>
              </div>
            )}
            {deleteStep === 1 && (
              <div className="space-y-2">
                <p className="text-red-600 font-bold text-lg">真的要删除吗？</p>
                <p className="text-gray-600">
                  你已经玩了 <span className="font-bold text-pink-600">{state.day}</span> 天，
                  赚了 <span className="font-bold text-yellow-600">{state.statistics.totalRevenue.toLocaleString()}</span> 金币
                </p>
              </div>
            )}
            {deleteStep === 2 && (
              <div className="space-y-2">
                <p className="text-red-600 font-bold text-xl">最后确认！</p>
                <p className="text-gray-600">点击下方按钮将永久删除存档</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCancelDelete}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSave}
              className="flex-1"
            >
              {deleteStep === 0 && '继续'}
              {deleteStep === 1 && '确认删除'}
              {deleteStep === 2 && '永久删除'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SettingsPanel;
