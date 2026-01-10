'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory, Season } from '@/types';
import { useGame } from '@/components/game/GameProvider';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { GAME_CONSTANTS } from '@/data/initialState';

const categoryLabels: Record<MenuCategory, string> = {
  drinks: '饮品',
  desserts: '甜点',
  main: '主食',
  special: '特别菜品',
};

const categoryIcons: Record<MenuCategory, string> = {
  drinks: '☕',
  desserts: '🍰',
  main: '🍽️',
  special: '🎀',
};

const seasonLabels: Record<Season, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
};

const seasonIcons: Record<Season, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
};

type FilterCategory = MenuCategory | 'all';

export function MenuPanel() {
  const { state, dispatch } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showUnlocked, setShowUnlocked] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Detect mobile viewport (< 768px as per Requirements 4.2)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const categories: FilterCategory[] = ['all', 'drinks', 'desserts', 'main', 'special'];

  const filteredItems = state.menuItems.filter((item) => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const unlockedMatch = showUnlocked ? item.unlocked : !item.unlocked;
    return categoryMatch && unlockedMatch;
  });

  const handleUnlockItem = (itemId: string) => {
    const item = state.menuItems.find((i) => i.id === itemId);
    if (item && state.finance.gold >= item.unlockCost) {
      dispatch({ type: 'UNLOCK_MENU_ITEM', itemId });
      dispatch({ type: 'DEDUCT_GOLD', amount: item.unlockCost });
    }
  };

  const handleSetPrice = (itemId: string, price: number) => {
    dispatch({ type: 'SET_ITEM_PRICE', itemId, price });
  };

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
    // On mobile, show the bottom drawer when selecting an item
    if (isMobile) {
      setShowMobileDetail(true);
    }
  };

  const handleCloseMobileDetail = () => {
    setShowMobileDetail(false);
  };

  const unlockedCount = state.menuItems.filter((i) => i.unlocked).length;
  const totalCount = state.menuItems.length;

  return (
    <div className="min-h-full flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">
          📋 菜单管理
        </h2>
        <div className="text-sm text-gray-500">
          已解锁 {unlockedCount} / {totalCount} 项
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-2">
        <Button
          variant={showUnlocked ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setShowUnlocked(true)}
        >
          已解锁菜单
        </Button>
        <Button
          variant={!showUnlocked ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setShowUnlocked(false)}
        >
          可解锁菜单
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-3 py-1.5 rounded-xl text-sm font-medium
              transition-all duration-200
              ${selectedCategory === category
                ? 'bg-pink-500 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {category === 'all' ? '🍴 全部' : `${categoryIcons[category]} ${categoryLabels[category]}`}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Menu Items List - Full width on mobile, flex-1 on desktop */}
        <div className="flex-1 min-h-0 overflow-auto w-full">
          <Card className="h-full">
            <CardHeader>
              {showUnlocked ? '已解锁菜单' : '可解锁菜单'}
            </CardHeader>
            <CardBody>
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📋</div>
                  <p>没有符合条件的菜单项</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      currentSeason={state.season}
                      gold={state.finance.gold}
                      selected={selectedItem?.id === item.id}
                      onClick={() => handleSelectItem(item)}
                      onUnlock={() => handleUnlockItem(item.id)}
                    />
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Item Details - Desktop only (side panel) */}
        {selectedItem && !isMobile && (
          <div className="w-full lg:w-80">
            <MenuItemDetailCard
              item={state.menuItems.find((i) => i.id === selectedItem.id) || selectedItem}
              currentSeason={state.season}
              gold={state.finance.gold}
              onUnlock={() => handleUnlockItem(selectedItem.id)}
              onSetPrice={handleSetPrice}
            />
          </div>
        )}
      </div>

      {/* Item Details - Mobile only (Bottom Drawer) */}
      {isMobile && selectedItem && (
        <BottomDrawer
          isOpen={showMobileDetail}
          onClose={handleCloseMobileDetail}
          title={`${selectedItem.name} 详情`}
          height="auto"
        >
          <MenuItemDetailCard
            item={state.menuItems.find((i) => i.id === selectedItem.id) || selectedItem}
            currentSeason={state.season}
            gold={state.finance.gold}
            onUnlock={() => handleUnlockItem(selectedItem.id)}
            onSetPrice={handleSetPrice}
            isMobile={true}
          />
        </BottomDrawer>
      )}
    </div>
  );
}


// Menu Item Card Component
interface MenuItemCardProps {
  item: MenuItem;
  currentSeason: Season;
  gold: number;
  selected: boolean;
  onClick: () => void;
  onUnlock: () => void;
}

function MenuItemCard({
  item,
  currentSeason,
  gold,
  selected,
  onClick,
}: MenuItemCardProps) {
  const isSeasonalAvailable = !item.season || item.season === currentSeason;
  const canAfford = gold >= item.unlockCost;

  return (
    <div
      onClick={onClick}
      className={`
        p-3 rounded-xl cursor-pointer transition-all duration-200
        border-2
        ${selected
          ? 'border-pink-500 bg-pink-50'
          : 'border-gray-100 hover:border-pink-300'
        }
        ${!item.unlocked ? 'opacity-80' : ''}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{item.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 truncate">
              {item.name}
            </span>
            {item.season && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                {seasonIcons[item.season]}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">{item.nameEn}</div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600`}>
          {categoryIcons[item.category]} {categoryLabels[item.category]}
        </span>
        {item.unlocked ? (
          <span className="text-sm font-medium text-green-600">
            💰 {item.currentPrice}
          </span>
        ) : (
          <span className={`text-sm font-medium ${canAfford ? 'text-amber-600' : 'text-red-500'}`}>
            🔒 {item.unlockCost}
          </span>
        )}
      </div>

      {item.unlocked && (
        <div className="mt-2">
          <ProgressBar
            value={item.popularity}
            max={100}
            color="pink"
            size="xs"
            label="人气"
          />
        </div>
      )}

      {item.season && !isSeasonalAvailable && (
        <div className="mt-2 text-xs text-amber-600">
          ⚠️ 仅在{seasonLabels[item.season]}可用
        </div>
      )}
    </div>
  );
}

// Menu Item Detail Card Component
interface MenuItemDetailCardProps {
  item: MenuItem;
  currentSeason: Season;
  gold: number;
  onUnlock: () => void;
  onSetPrice: (itemId: string, price: number) => void;
  isMobile?: boolean;
}

function MenuItemDetailCard({
  item,
  currentSeason,
  gold,
  onUnlock,
  onSetPrice,
  isMobile = false,
}: MenuItemDetailCardProps) {
  const minPrice = Math.floor(item.basePrice * GAME_CONSTANTS.MIN_PRICE_MULTIPLIER);
  const maxPrice = Math.floor(item.basePrice * GAME_CONSTANTS.MAX_PRICE_MULTIPLIER);
  const isSeasonalAvailable = !item.season || item.season === currentSeason;
  const canAfford = gold >= item.unlockCost;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseInt(e.target.value, 10);
    if (!isNaN(newPrice) && newPrice >= minPrice && newPrice <= maxPrice) {
      onSetPrice(item.id, newPrice);
    }
  };

  const content = (
    <>
      {/* Header */}
      <div className="text-center mb-4">
        <div className="text-6xl mb-2">{item.icon}</div>
        <h3 className="text-lg font-bold text-gray-800">
          {item.name}
        </h3>
        <div className="text-sm text-gray-500">{item.nameEn}</div>
      </div>

      {/* Category and Season */}
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
        <span className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {categoryIcons[item.category]} {categoryLabels[item.category]}
        </span>
        {item.season && (
          <span className={`text-sm px-2 py-1 rounded-full ${
            isSeasonalAvailable
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {seasonIcons[item.season]} {seasonLabels[item.season]}限定
          </span>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">基础价格</span>
          <span className="font-medium">💰 {item.basePrice}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">制作时间</span>
          <span className="font-medium">⏱️ {item.prepTime}秒</span>
        </div>
        {item.unlocked && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">人气度</span>
            <span className="font-medium">🔥 {item.popularity}%</span>
          </div>
        )}
      </div>

      {item.unlocked ? (
        <>
          {/* Price Adjustment */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              调整价格
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{minPrice}</span>
              <input
                type="range"
                min={minPrice}
                max={maxPrice}
                value={item.currentPrice}
                onChange={handlePriceChange}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500 touch-target"
              />
              <span className="text-sm text-gray-500">{maxPrice}</span>
            </div>
            <div className="text-center mt-2">
              <span className="text-lg font-bold text-pink-600">
                💰 {item.currentPrice}
              </span>
            </div>
          </div>

          {/* Popularity */}
          <div className="mb-4">
            <ProgressBar
              value={item.popularity}
              max={100}
              color="pink"
              size="md"
              showLabel
              label="人气度"
            />
          </div>

          {/* Status */}
          <div className="text-center text-sm text-green-600">
            ✅ 已解锁
          </div>
        </>
      ) : (
        <>
          {/* Unlock Button */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">
              解锁费用: 💰 {item.unlockCost}
            </div>
            <Button
              variant="primary"
              onClick={onUnlock}
              disabled={!canAfford}
              className="w-full"
            >
              {canAfford ? '🔓 解锁菜单' : '💰 金币不足'}
            </Button>
          </div>
        </>
      )}
    </>
  );

  // On mobile, return content directly (it's inside BottomDrawer)
  if (isMobile) {
    return <div className="pb-4">{content}</div>;
  }

  // On desktop, wrap in Card
  return (
    <Card className="h-full">
      <CardBody>
        {content}
      </CardBody>
    </Card>
  );
}

export default MenuPanel;
