'use client';

import { useState, useCallback } from 'react';
import { Maid, MaidPersonality } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MaidAvatar } from '@/components/ui/MaidAvatar';
import { generateRandomMaid } from '@/systems/maidSystem';
import { personalityDescriptions } from '@/data/maidNames';
import { getAllUsedImages } from '@/data/maidImages';
import { useGame } from '@/components/game/GameProvider';

const personalityEmojis: Record<MaidPersonality, string> = {
  cheerful: '😊',
  cool: '😎',
  shy: '😳',
  energetic: '⚡',
  elegant: '✨',
  gentle: '🌸',
  playful: '🎀',
};

const personalityLabels: Record<MaidPersonality, string> = {
  cheerful: '开朗',
  cool: '冷静',
  shy: '害羞',
  energetic: '活力',
  elegant: '优雅',
  gentle: '温柔',
  playful: '俏皮',
};

interface HireMaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHire: (maid: Maid) => void;
  hireCost: number;
  gold: number;
}

export function HireMaidModal({
  isOpen,
  onClose,
  onHire,
  hireCost,
  gold,
}: HireMaidModalProps) {
  const { state } = useGame();
  const [candidates, setCandidates] = useState<Maid[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Maid | null>(null);
  const [initialized, setInitialized] = useState(false);
  const canAfford = gold >= hireCost;

  const refreshCandidates = useCallback(() => {
    // Get all used images from current maids
    const usedImages = getAllUsedImages(state.maids);
    const newCandidates: Maid[] = [];
    const candidateImages: string[] = [...usedImages];
    
    // Generate 3 candidates with unique images
    for (let i = 0; i < 3; i++) {
      const candidate = generateRandomMaid(candidateImages);
      newCandidates.push(candidate);
      candidateImages.push(candidate.avatar);
    }
    
    setCandidates(newCandidates);
    setSelectedCandidate(null);
  }, [state.maids]);

  // Initialize candidates when modal first opens
  // Using a flag to track initialization instead of useEffect
  if (isOpen && !initialized) {
    refreshCandidates();
    setInitialized(true);
  }
  
  // Reset initialization flag when modal closes
  if (!isOpen && initialized) {
    setInitialized(false);
  }

  const handleHire = (maid: Maid) => {
    if (canAfford) {
      onHire(maid);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="👧 雇佣新女仆"
      size="xl"
    >
      {/* Cost Info */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-xl">
        <span className="text-sm text-gray-600">
          雇佣费用: <span className="font-bold text-pink-600">💰 {hireCost}</span>
        </span>
        <span className={`text-sm font-medium ${canAfford ? 'text-green-600' : 'text-red-500'}`}>
          当前金币: 💰 {gold.toLocaleString()}
        </span>
      </div>

      {/* Candidates - Horizontal scroll on mobile, grid on desktop */}
      <div className="flex sm:grid sm:grid-cols-3 gap-3 mb-4 overflow-x-auto sm:overflow-visible scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            maid={candidate}
            isSelected={selectedCandidate?.id === candidate.id}
            canAfford={canAfford}
            onSelect={() => setSelectedCandidate(candidate)}
            onHire={() => handleHire(candidate)}
            isCompact
          />
        ))}
      </div>

      {/* Actions - Stack on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={refreshCandidates} className="w-full sm:w-auto">
          🔄 刷新候选人
        </Button>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            取消
          </Button>
          {selectedCandidate && (
            <Button
              variant="primary"
              onClick={() => handleHire(selectedCandidate)}
              disabled={!canAfford}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {canAfford ? `雇佣 ${selectedCandidate.name}` : '金币不足'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}


// Candidate Card Component
interface CandidateCardProps {
  maid: Maid;
  isSelected: boolean;
  canAfford: boolean;
  onSelect: () => void;
  onHire: () => void;
  isCompact?: boolean;
}

function CandidateCard({ maid, isSelected, canAfford, onSelect, onHire, isCompact }: CandidateCardProps) {
  if (isCompact) {
    // Mobile compact card - horizontal scroll
    const totalStats = maid.stats.charm + maid.stats.skill + maid.stats.stamina + maid.stats.speed;
    return (
      <div
        onClick={onSelect}
        className={`
          flex-shrink-0 w-[160px] p-3 rounded-xl cursor-pointer transition-all duration-150 active:scale-95 touch-feedback
          border-2
          ${isSelected
            ? 'border-pink-500 bg-pink-50 shadow-lg'
            : 'border-gray-100 bg-white hover:border-pink-300 active:border-pink-400'
          }
        `}
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Avatar and Name */}
        <div className="flex items-center gap-2 mb-2">
          <MaidAvatar src={maid.avatar} name={maid.name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-gray-900 truncate">{maid.name}</div>
            <div className="flex items-center gap-1">
              <span>{personalityEmojis[maid.personality]}</span>
              <span className="text-xs text-gray-500">{personalityLabels[maid.personality]}</span>
            </div>
          </div>
        </div>

        {/* Stats - 2x2 grid */}
        <div className="grid grid-cols-2 gap-1 mb-2">
          <div className="bg-pink-50 rounded px-1.5 py-1 flex justify-between text-xs">
            <span>💕</span><span className="font-bold">{maid.stats.charm}</span>
          </div>
          <div className="bg-blue-50 rounded px-1.5 py-1 flex justify-between text-xs">
            <span>⭐</span><span className="font-bold">{maid.stats.skill}</span>
          </div>
          <div className="bg-green-50 rounded px-1.5 py-1 flex justify-between text-xs">
            <span>💪</span><span className="font-bold">{maid.stats.stamina}</span>
          </div>
          <div className="bg-yellow-50 rounded px-1.5 py-1 flex justify-between text-xs">
            <span>⚡</span><span className="font-bold">{maid.stats.speed}</span>
          </div>
        </div>

        {/* Total */}
        <div className="text-center text-xs text-gray-500 mb-2">
          总属性: <span className="font-bold text-purple-600">{totalStats}</span>
        </div>

        {/* Hire Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHire();
          }}
          disabled={!canAfford}
          className={`
            w-full py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95
            ${isSelected
              ? 'bg-pink-500 text-white'
              : 'bg-pink-100 text-pink-700'
            }
            ${!canAfford ? 'opacity-50 cursor-not-allowed' : 'active:bg-pink-600'}
          `}
        >
          {canAfford ? '雇佣' : '不足'}
        </button>
      </div>
    );
  }

  // Desktop card - vertical layout
  return (
    <div
      onClick={onSelect}
      className={`
        p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200
        border-2 touch-target
        ${isSelected
          ? 'border-pink-500 bg-pink-50 shadow-lg'
          : 'border-gray-100 hover:border-pink-300 hover:shadow-md active:bg-gray-50'
        }
      `}
    >
      {/* Mobile: Horizontal layout, Desktop: Vertical layout */}
      <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <MaidAvatar src={maid.avatar} name={maid.name} size="xl" className="sm:mb-2" />
        </div>
        
        {/* Info Section */}
        <div className="flex-1 sm:flex-none sm:w-full">
          {/* Name and Personality */}
          <div className="sm:text-center mb-2 sm:mb-3">
            <div className="font-bold text-gray-900">
              {maid.name}
            </div>
            <div className="flex items-center sm:justify-center gap-1 mt-1">
              <span className="text-sm">{personalityEmojis[maid.personality]}</span>
              <span className="text-sm text-gray-500">
                {personalityLabels[maid.personality]}
              </span>
            </div>
          </div>

          {/* Stats - Compact on mobile */}
          <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 text-xs">
            <StatItem label="💕" value={maid.stats.charm} color="pink" compact />
            <StatItem label="⭐" value={maid.stats.skill} color="blue" compact />
            <StatItem label="💪" value={maid.stats.stamina} color="green" compact />
            <StatItem label="⚡" value={maid.stats.speed} color="yellow" compact />
          </div>

          {/* Total Stats - Mobile only inline */}
          <div className="text-center text-xs text-gray-500 mt-2 sm:mb-3">
            总属性: <span className="font-bold text-purple-600">
              {maid.stats.charm + maid.stats.skill + maid.stats.stamina + maid.stats.speed}
            </span>
          </div>
        </div>
      </div>

      {/* Personality Description - Hidden on mobile for space */}
      <div className="hidden sm:block text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded-lg text-center min-h-[3rem]">
        {personalityDescriptions[maid.personality]}
      </div>

      {/* Hire Button */}
      <Button
        variant={isSelected ? 'primary' : 'secondary'}
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onHire();
        }}
        disabled={!canAfford}
        className="w-full mt-2 sm:mt-0"
      >
        {canAfford ? '雇佣' : '金币不足'}
      </Button>
    </div>
  );
}

// Stat Item Component
interface StatItemProps {
  label: string;
  value: number;
  color: 'pink' | 'blue' | 'green' | 'yellow';
  compact?: boolean;
}

function StatItem({ label, value, color, compact: _compact }: StatItemProps) {
  const colorClasses = {
    pink: 'bg-pink-50',
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
  };

  return (
    <div className={`flex items-center justify-between p-1.5 ${colorClasses[color]} rounded-lg`}>
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export default HireMaidModal;
