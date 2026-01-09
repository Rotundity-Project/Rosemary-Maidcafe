'use client';

import { Maid, MaidRole, MaidPersonality } from '@/types';
import { StaminaBar } from '@/components/ui/ProgressBar';
import { MaidAvatar } from '@/components/ui/MaidAvatar';
import { calculateEfficiency } from '@/systems/maidSystem';

interface MaidDetailPanelProps {
  maid: Maid;
  onRoleChange: (maidId: string, role: MaidRole) => void;
}

const roleLabels: Record<MaidRole, string> = {
  greeter: '迎宾',
  server: '服务员',
  barista: '咖啡师',
  entertainer: '表演者',
  resting: '休息',
};

const roleIcons: Record<MaidRole, string> = {
  greeter: '🎀',
  server: '🍽️',
  barista: '☕',
  entertainer: '🎤',
  resting: '💤',
};

const personalityLabels: Record<MaidPersonality, string> = {
  cheerful: '开朗',
  cool: '冷酷',
  shy: '害羞',
  energetic: '活力',
  elegant: '优雅',
};

const personalityEmojis: Record<MaidPersonality, string> = {
  cheerful: '😊',
  cool: '😎',
  shy: '😳',
  energetic: '🤩',
  elegant: '🥰',
};

export function MaidDetailPanel({ maid, onRoleChange }: MaidDetailPanelProps) {
  const efficiency = calculateEfficiency(maid);
  const isLowStamina = maid.stamina < 20;
  const isWorking = maid.status.isWorking;

  const availableRoles: MaidRole[] = ['server', 'greeter', 'barista', 'entertainer'];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left: Avatar + Basic Info */}
      <div className="flex gap-4 md:w-56 flex-shrink-0">
        <div className="relative">
          <MaidAvatar src={maid.avatar} name={maid.name} size="lg" />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
            <span className="text-base">{personalityEmojis[maid.personality]}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-800">{maid.name}</span>
            <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
              Lv.{maid.level}
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {personalityLabels[maid.personality]}性格 · {roleLabels[maid.role]}
          </div>
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-1">体力 {Math.round(maid.stamina)}%</div>
            <StaminaBar value={maid.stamina} size="sm" />
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">经验 {maid.experience}/{maid.level * 100}</div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full"
                style={{ width: `${(maid.experience / (maid.level * 100)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Stats Grid - 2x3 */}
      <div className="flex-1 max-w-md">
        <div className="grid grid-cols-3 gap-2">
          <StatBox label="魅力" value={maid.stats.charm} icon="💕" color="pink" />
          <StatBox label="技能" value={maid.stats.skill} icon="⭐" color="blue" />
          <StatBox label="体质" value={maid.stats.stamina} icon="💪" color="green" />
          <StatBox label="速度" value={maid.stats.speed} icon="⚡" color="yellow" />
          <StatBox 
            label="效率" 
            value={Math.round(efficiency)} 
            icon={isLowStamina ? "⚠️" : "📊"} 
            color={isLowStamina ? "red" : "purple"} 
            suffix="%" 
          />
          <StatBox 
            label="心情" 
            value={Math.round(maid.mood)} 
            icon={maid.mood >= 80 ? '😊' : maid.mood >= 50 ? '😐' : '😢'} 
            color="pink" 
            suffix="%" 
          />
        </div>
      </div>

      {/* Right: Role Selection - 2x2 Grid */}
      <div className="flex-shrink-0">
        <div className="text-sm font-medium text-gray-700 mb-2">设置职位</div>
        <div className="grid grid-cols-2 gap-2">
          {availableRoles.map(role => (
            <button
              key={role}
              onClick={() => onRoleChange(maid.id, role)}
              disabled={isWorking}
              className={`
                px-4 py-3 rounded-xl transition-all text-sm flex flex-col items-center gap-1 min-w-[80px]
                ${maid.role === role 
                  ? 'bg-pink-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
                ${isWorking ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className="text-xl">{roleIcons[role]}</span>
              <span className="font-medium">{roleLabels[role]}</span>
            </button>
          ))}
        </div>
        {isWorking && (
          <div className="text-xs text-yellow-600 mt-2">
            ⚠️ 工作中，无法切换职位
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Box Component
function StatBox({ label, value, icon, color, suffix = '' }: { 
  label: string; 
  value: number; 
  icon: string;
  color: 'pink' | 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  suffix?: string;
}) {
  const colorClasses = {
    pink: 'bg-pink-50 text-pink-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className={`rounded-xl p-3 text-center ${colorClasses[color]}`}>
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-bold text-lg">{value}{suffix}</div>
    </div>
  );
}

export default MaidDetailPanel;
