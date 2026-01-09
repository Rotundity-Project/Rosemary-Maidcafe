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
};

const personalityLabels: Record<MaidPersonality, string> = {
  cheerful: '开朗',
  cool: '冷静',
  shy: '害羞',
  energetic: '活力',
  elegant: '优雅',
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

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            maid={candidate}
            isSelected={selectedCandidate?.id === candidate.id}
            canAfford={canAfford}
            onSelect={() => setSelectedCandidate(candidate)}
            onHire={() => handleHire(candidate)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <Button variant="secondary" onClick={refreshCandidates}>
          🔄 刷新候选人
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          {selectedCandidate && (
            <Button
              variant="primary"
              onClick={() => handleHire(selectedCandidate)}
              disabled={!canAfford}
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
}

function CandidateCard({ maid, isSelected, canAfford, onSelect, onHire }: CandidateCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        p-4 rounded-xl cursor-pointer transition-all duration-200
        border-2
        ${isSelected
          ? 'border-pink-500 bg-pink-50 shadow-lg'
          : 'border-gray-100 hover:border-pink-300 hover:shadow-md'
        }
      `}
    >
      {/* Avatar and Name */}
      <div className="flex flex-col items-center mb-3">
        <MaidAvatar src={maid.avatar} name={maid.name} size="xl" className="mb-2" />
        <div className="font-bold text-gray-900">
          {maid.name}
        </div>
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="text-sm">{personalityEmojis[maid.personality]}</span>
          <span className="text-sm text-gray-500">
            {personalityLabels[maid.personality]}
          </span>
        </div>
      </div>

      {/* Personality Description */}
      <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded-lg text-center min-h-[3rem]">
        {personalityDescriptions[maid.personality]}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1 mb-3 text-xs">
        <StatItem label="💕 魅力" value={maid.stats.charm} color="pink" />
        <StatItem label="⭐ 技能" value={maid.stats.skill} color="blue" />
        <StatItem label="💪 体质" value={maid.stats.stamina} color="green" />
        <StatItem label="⚡ 速度" value={maid.stats.speed} color="yellow" />
      </div>

      {/* Total Stats */}
      <div className="text-center text-xs text-gray-500 mb-3">
        总属性: <span className="font-bold text-purple-600">
          {maid.stats.charm + maid.stats.skill + maid.stats.stamina + maid.stats.speed}
        </span>
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
        className="w-full"
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
}

function StatItem({ label, value, color }: StatItemProps) {
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
