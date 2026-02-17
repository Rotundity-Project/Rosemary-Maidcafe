/**
 * 新手引导覆盖层组件
 * 显示引导步骤和提示气泡
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useGame } from '@/components/game/GameProvider';
import { getCurrentStepConfig, getGuideProgress, canAdvanceToNextStep, shouldShowGuideBubble, getActiveTip } from '@/systems/guideSystem';
import { GuideStep } from '@/types';

export function GuideOverlay() {
  const { state, dispatch } = useGame();
  
  // 空值检查
  const guide = state.guide;
  const guideIsActive = guide?.isActive ?? false;
  const currentStep = guide?.currentStep ?? 'complete';
  
  // 检查是否应该显示引导
  const shouldShowGuide = guideIsActive && currentStep !== 'complete';
  
  // 获取当前步骤配置
  const currentStepConfig = getCurrentStepConfig(state);
  
  // 获取引导进度
  const progress = getGuideProgress(state);
  
  // 处理下一步
  const handleNext = useCallback(() => {
    if (canAdvanceToNextStep(state)) {
      // 如果当前步骤完成了，自动进入下一步
      if (currentStep !== 'welcome') {
        dispatch({ type: 'COMPLETE_GUIDE_STEP', step: currentStep as GuideStep });
      }
      dispatch({ type: 'NEXT_GUIDE_STEP' });
    }
  }, [state, dispatch, currentStep]);
  
  // 处理跳过引导
  const handleSkip = useCallback(() => {
    dispatch({ type: 'SKIP_GUIDE' });
  }, [dispatch]);
  
  // 处理关闭提示
  const handleCloseTip = useCallback((tipId: string) => {
    dispatch({ type: 'ADD_SHOWN_TIP', tipId });
  }, [dispatch]);
  
  // 键盘事件
  useEffect(() => {
    if (!shouldShowGuide) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldShowGuide, handleNext, handleSkip]);
  
  // 如果不应该显示引导，不渲染
  if (!shouldShowGuide || !currentStepConfig) {
    return null;
  }
  
  return (
    <div className="guide-overlay">
      {/* 欢迎/引导对话框 */}
      <div className="guide-modal">
        <div className="guide-header">
          <span className="guide-icon">📖</span>
          <h3>{currentStepConfig.title}</h3>
        </div>
        
        <p className="guide-description">{currentStepConfig.description}</p>
        
        {/* 进度条 */}
        <div className="guide-progress">
          <div className="guide-progress-bar">
            <div 
              className="guide-progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="guide-progress-text">{progress}% 完成</span>
        </div>
        
        {/* 高亮面板提示 */}
        {currentStepConfig.highlightPanel && (
          <div className="guide-highlight-panel">
            💡 提示：点击"{getPanelName(currentStepConfig.highlightPanel)}"面板
          </div>
        )}
        
        {/* 操作按钮 */}
        <div className="guide-buttons">
          <button 
            className="guide-btn guide-btn-skip"
            onClick={handleSkip}
          >
            跳过引导
          </button>
          <button 
            className="guide-btn guide-btn-next"
            onClick={handleNext}
          >
            {currentStep === 'welcome' ? '开始引导' : '下一步'}
          </button>
        </div>
      </div>
      
      {/* 提示气泡 */}
      <TipBubble 
        tip={getActiveTip(state)} 
        onClose={handleCloseTip}
      />
      
      <style jsx>{`
        .guide-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          pointer-events: none;
        }
        
        .guide-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 30px;
          max-width: 420px;
          width: 90%;
          color: white;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          pointer-events: auto;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        .guide-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .guide-icon {
          font-size: 32px;
        }
        
        .guide-header h3 {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
        }
        
        .guide-description {
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 20px;
          opacity: 0.95;
        }
        
        .guide-progress {
          margin-bottom: 16px;
        }
        
        .guide-progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .guide-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffd700, #ffed4e);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .guide-progress-text {
          font-size: 12px;
          opacity: 0.8;
        }
        
        .guide-highlight-panel {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 20px;
          font-size: 13px;
          text-align: center;
        }
        
        .guide-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .guide-btn {
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .guide-btn-skip {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }
        
        .guide-btn-skip:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        
        .guide-btn-next {
          background: #ffd700;
          color: #333;
        }
        
        .guide-btn-next:hover {
          background: #ffed4e;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

// 提示气泡组件
function TipBubble({ 
  tip, 
  onClose 
}: { 
  tip: { id: string; message: string; position: 'top' | 'bottom' | 'left' | 'right' } | null; 
  onClose: (id: string) => void;
}) {
  if (!tip) return null;
  
  return (
    <div className={`tip-bubble tip-${tip.position}`}>
      <div className="tip-content">
        <span className="tip-icon">💡</span>
        <p>{tip.message}</p>
      </div>
      <button 
        className="tip-close"
        onClick={() => onClose(tip.id)}
      >
        ×
      </button>
      
      <style jsx>{`
        .tip-bubble {
          position: fixed;
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          max-width: 280px;
          z-index: 999;
          animation: fadeIn 0.3s ease;
          pointer-events: auto;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .tip-top {
          top: 100px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .tip-bottom {
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .tip-left {
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .tip-right {
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .tip-content {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        
        .tip-icon {
          font-size: 20px;
        }
        
        .tip-content p {
          margin: 0;
          font-size: 13px;
          color: #333;
          line-height: 1.5;
        }
        
        .tip-close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          font-size: 18px;
          color: #999;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }
        
        .tip-close:hover {
          color: #333;
        }
      `}</style>
    </div>
  );
}

// 获取面板名称
function getPanelName(panel: string): string {
  const panelNames: Record<string, string> = {
    'cafe': '咖啡厅',
    'maids': '女仆',
    'menu': '菜单',
    'facility': '设施',
    'finance': '财务',
    'tasks': '任务',
    'achievements': '成就',
    'settings': '设置',
  };
  return panelNames[panel] || panel;
}
