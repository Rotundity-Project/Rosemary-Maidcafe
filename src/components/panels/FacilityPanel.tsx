'use client';

import React, { useState } from 'react';
import { Area, Decoration, Equipment } from '@/types';
import { useGame } from '@/components/game/GameProvider';
import { Card, CardHeader, CardBody, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GAME_CONSTANTS } from '@/data/initialState';
import { equipmentUpgradeCostMultiplier, equipmentEffectBonus } from '@/data/equipment';

const areaLabels: Record<Area, string> = {
  main: '主厅',
  outdoor: '户外座位',
  vip_room: 'VIP包间',
  stage: '表演舞台',
};

const areaIcons: Record<Area, string> = {
  main: '🏠',
  outdoor: '🌳',
  vip_room: '👑',
  stage: '🎭',
};

const areaDescriptions: Record<Area, string> = {
  main: '咖啡厅的主要营业区域',
  outdoor: '户外露天座位，天气好时顾客满意度+10%',
  vip_room: 'VIP专属包间，可接待VIP顾客',
  stage: '表演舞台，可举办特别活动',
};

const areaCosts: Record<Area, number> = {
  main: 0,
  outdoor: 2000,
  vip_room: 5000,
  stage: 8000,
};

type TabType = 'upgrade' | 'decorations' | 'equipment' | 'areas';

export function FacilityPanel() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('upgrade');

  const { facility, finance } = state;
  const maxSeats = GAME_CONSTANTS.BASE_SEATS + (facility.cafeLevel - 1) * GAME_CONSTANTS.SEATS_PER_LEVEL;
  const nextLevelSeats = GAME_CONSTANTS.BASE_SEATS + facility.cafeLevel * GAME_CONSTANTS.SEATS_PER_LEVEL;
  const upgradeCost = facility.cafeLevel * 500;
  const canUpgrade = facility.cafeLevel < GAME_CONSTANTS.MAX_CAFE_LEVEL && finance.gold >= upgradeCost;

  const handleUpgradeCafe = () => {
    if (canUpgrade) {
      dispatch({ type: 'UPGRADE_CAFE' });
      dispatch({ type: 'DEDUCT_GOLD', amount: upgradeCost });
    }
  };

  const handleBuyDecoration = (decorationId: string) => {
    const decoration = facility.decorations.find((d) => d.id === decorationId);
    if (decoration && !decoration.purchased && finance.gold >= decoration.cost) {
      dispatch({ type: 'BUY_DECORATION', decorationId });
      dispatch({ type: 'DEDUCT_GOLD', amount: decoration.cost });
    }
  };

  const handleUpgradeEquipment = (equipmentId: string) => {
    const equipment = facility.equipment.find((e) => e.id === equipmentId);
    if (equipment && equipment.level < equipment.maxLevel) {
      const cost = Math.floor(equipment.upgradeCost * equipmentUpgradeCostMultiplier[equipment.level - 1]);
      if (finance.gold >= cost) {
        dispatch({ type: 'UPGRADE_EQUIPMENT', equipmentId });
        dispatch({ type: 'DEDUCT_GOLD', amount: cost });
      }
    }
  };

  const handleUnlockArea = (area: Area) => {
    const cost = areaCosts[area];
    if (!facility.unlockedAreas.includes(area) && finance.gold >= cost) {
      dispatch({ type: 'UNLOCK_AREA', area });
      dispatch({ type: 'DEDUCT_GOLD', amount: cost });
    }
  };

  const totalSatisfactionBonus = facility.decorations
    .filter((d) => d.purchased)
    .reduce((sum, d) => sum + d.satisfactionBonus, 0);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'upgrade', label: '升级', icon: '⬆️' },
    { id: 'decorations', label: '装饰', icon: '🎨' },
    { id: 'equipment', label: '设备', icon: '🔧' },
    { id: 'areas', label: '区域', icon: '🗺️' },
  ];

  return (
    <div className="min-h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          🏪 设施管理
        </h2>
        <div className="text-sm text-gray-500">
          💰 {finance.gold} 金币
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="咖啡厅等级"
          value={`Lv.${facility.cafeLevel}`}
          icon={<span className="text-xl">🏠</span>}
        />
        <StatCard
          label="座位数"
          value={maxSeats}
          icon={<span className="text-xl">🪑</span>}
        />
        <StatCard
          label="满意度加成"
          value={`+${totalSatisfactionBonus}%`}
          icon={<span className="text-xl">😊</span>}
        />
        <StatCard
          label="已解锁区域"
          value={facility.unlockedAreas.length}
          icon={<span className="text-xl">🗺️</span>}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors
              border-b-2 -mb-px
              ${activeTab === tab.id
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === 'upgrade' && (
          <UpgradeTab
            cafeLevel={facility.cafeLevel}
            maxSeats={maxSeats}
            nextLevelSeats={nextLevelSeats}
            upgradeCost={upgradeCost}
            canUpgrade={canUpgrade}
            gold={finance.gold}
            onUpgrade={handleUpgradeCafe}
          />
        )}
        {activeTab === 'decorations' && (
          <DecorationsTab
            decorations={facility.decorations}
            gold={finance.gold}
            onBuy={handleBuyDecoration}
          />
        )}
        {activeTab === 'equipment' && (
          <EquipmentTab
            equipment={facility.equipment}
            gold={finance.gold}
            onUpgrade={handleUpgradeEquipment}
          />
        )}
        {activeTab === 'areas' && (
          <AreasTab
            unlockedAreas={facility.unlockedAreas}
            gold={finance.gold}
            onUnlock={handleUnlockArea}
          />
        )}
      </div>
    </div>
  );
}


// Upgrade Tab Component
interface UpgradeTabProps {
  cafeLevel: number;
  maxSeats: number;
  nextLevelSeats: number;
  upgradeCost: number;
  canUpgrade: boolean;
  gold: number;
  onUpgrade: () => void;
}

function UpgradeTab({
  cafeLevel,
  maxSeats,
  nextLevelSeats,
  upgradeCost,
  canUpgrade,
  gold,
  onUpgrade,
}: UpgradeTabProps) {
  const isMaxLevel = cafeLevel >= GAME_CONSTANTS.MAX_CAFE_LEVEL;

  return (
    <Card>
      <CardHeader>咖啡厅升级</CardHeader>
      <CardBody>
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">🏠</div>
          <h3 className="text-2xl font-bold text-gray-800">
            等级 {cafeLevel}
          </h3>
          <div className="text-gray-500">
            {isMaxLevel ? '已达到最高等级' : `下一级: 等级 ${cafeLevel + 1}`}
          </div>
        </div>

        <div className="mb-6">
          <ProgressBar
            value={cafeLevel}
            max={GAME_CONSTANTS.MAX_CAFE_LEVEL}
            color="pink"
            size="lg"
            showLabel
            label="等级进度"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <div className="text-sm text-gray-500 mb-1">当前座位数</div>
            <div className="text-2xl font-bold text-gray-800">
              🪑 {maxSeats}
            </div>
          </div>
          {!isMaxLevel && (
            <div className="p-4 bg-pink-50 rounded-xl text-center">
              <div className="text-sm text-gray-500 mb-1">升级后座位数</div>
              <div className="text-2xl font-bold text-pink-600">
                🪑 {nextLevelSeats}
              </div>
            </div>
          )}
        </div>

        {!isMaxLevel && (
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">
              升级费用: 💰 {upgradeCost}
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={onUpgrade}
              disabled={!canUpgrade}
              className="w-full max-w-xs"
            >
              {gold >= upgradeCost ? '⬆️ 升级咖啡厅' : '💰 金币不足'}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

// Decorations Tab Component
interface DecorationsTabProps {
  decorations: Decoration[];
  gold: number;
  onBuy: (decorationId: string) => void;
}

function DecorationsTab({ decorations, gold, onBuy }: DecorationsTabProps) {
  const purchased = decorations.filter((d) => d.purchased);
  const available = decorations.filter((d) => !d.purchased);

  return (
    <div className="space-y-4">
      {/* Purchased Decorations */}
      <Card>
        <CardHeader>已购买装饰 ({purchased.length})</CardHeader>
        <CardBody>
          {purchased.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              还没有购买任何装饰
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {purchased.map((decoration) => (
                <div
                  key={decoration.id}
                  className="p-3 bg-green-50 rounded-xl text-center"
                >
                  <div className="font-medium text-gray-800">
                    {decoration.name}
                  </div>
                  <div className="text-sm text-green-600">
                    +{decoration.satisfactionBonus}% 满意度
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Available Decorations */}
      <Card>
        <CardHeader>装饰商店</CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {available.map((decoration) => {
              const canAfford = gold >= decoration.cost;
              return (
                <div
                  key={decoration.id}
                  className="p-3 border border-gray-100 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {decoration.name}
                    </div>
                    <div className="text-sm text-pink-600">
                      +{decoration.satisfactionBonus}% 满意度
                    </div>
                  </div>
                  <Button
                    variant={canAfford ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => onBuy(decoration.id)}
                    disabled={!canAfford}
                  >
                    💰 {decoration.cost}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}


// Equipment Tab Component
interface EquipmentTabProps {
  equipment: Equipment[];
  gold: number;
  onUpgrade: (equipmentId: string) => void;
}

function EquipmentTab({ equipment, gold, onUpgrade }: EquipmentTabProps) {
  return (
    <Card>
      <CardHeader>设备升级</CardHeader>
      <CardBody>
        <div className="space-y-4">
          {equipment.map((equip) => {
            const isMaxLevel = equip.level >= equip.maxLevel;
            const upgradeCost = isMaxLevel
              ? 0
              : Math.floor(equip.upgradeCost * equipmentUpgradeCostMultiplier[equip.level - 1]);
            const canAfford = gold >= upgradeCost;
            const currentBonus = equipmentEffectBonus[equip.level - 1] || 0;
            const nextBonus = equipmentEffectBonus[equip.level] || 0;

            return (
              <div
                key={equip.id}
                className="p-4 border border-gray-100 rounded-xl"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-800">
                      {equip.name}
                    </div>
                    <div className="text-sm text-gray-500">{equip.effect}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      Lv.{equip.level}
                    </div>
                    <div className="text-xs text-gray-500">
                      最高 Lv.{equip.maxLevel}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <ProgressBar
                    value={equip.level}
                    max={equip.maxLevel}
                    color="purple"
                    size="sm"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">当前效果: </span>
                    <span className="text-green-600">+{currentBonus}%</span>
                    {!isMaxLevel && (
                      <>
                        <span className="text-gray-400 mx-1">→</span>
                        <span className="text-pink-600">+{nextBonus}%</span>
                      </>
                    )}
                  </div>
                  {!isMaxLevel && (
                    <Button
                      variant={canAfford ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => onUpgrade(equip.id)}
                      disabled={!canAfford}
                    >
                      💰 {upgradeCost}
                    </Button>
                  )}
                  {isMaxLevel && (
                    <span className="text-sm text-green-600">✅ 已满级</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

// Areas Tab Component
interface AreasTabProps {
  unlockedAreas: Area[];
  gold: number;
  onUnlock: (area: Area) => void;
}

function AreasTab({ unlockedAreas, gold, onUnlock }: AreasTabProps) {
  const allAreas: Area[] = ['main', 'outdoor', 'vip_room', 'stage'];

  return (
    <Card>
      <CardHeader>区域解锁</CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allAreas.map((area) => {
            const isUnlocked = unlockedAreas.includes(area);
            const cost = areaCosts[area];
            const canAfford = gold >= cost;

            return (
              <div
                key={area}
                className={`
                  p-4 rounded-xl border-2 transition-colors
                  ${isUnlocked
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100'
                  }
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-3xl">{areaIcons[area]}</div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {areaLabels[area]}
                    </div>
                    {isUnlocked && (
                      <span className="text-xs text-green-600">✅ 已解锁</span>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  {areaDescriptions[area]}
                </div>

                {!isUnlocked && cost > 0 && (
                  <Button
                    variant={canAfford ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => onUnlock(area)}
                    disabled={!canAfford}
                    className="w-full"
                  >
                    {canAfford ? `🔓 解锁 (💰 ${cost})` : `💰 ${cost} (金币不足)`}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

export default FacilityPanel;
