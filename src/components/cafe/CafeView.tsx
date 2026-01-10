'use client';

import { useGame } from '@/components/game/GameProvider';
import { useLandscapeMode } from '@/hooks/useLandscapeMode';
import { SeatGrid } from './Seat';
import { MaidCard } from './MaidCard';
import { MaidDetailPanel } from './MaidDetailPanel';
import { CustomerCard } from './CustomerCard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { CollapsibleCard } from '@/components/ui/CollapsibleCard';
import { MaidRole } from '@/types';

export function CafeView() {
  const { state, dispatch } = useGame();
  const isLandscape = useLandscapeMode();
  const { 
    customers, 
    maids, 
    facility, 
    selectedCustomerId, 
    selectedMaidId,
    isPaused,
    isBusinessHours,
  } = state;

  // Handle customer selection
  const handleCustomerClick = (customerId: string) => {
    dispatch({
      type: 'SELECT_CUSTOMER',
      customerId: selectedCustomerId === customerId ? null : customerId,
    });
  };

  // Handle maid selection
  const handleMaidClick = (maidId: string) => {
    dispatch({
      type: 'SELECT_MAID',
      maidId: selectedMaidId === maidId ? null : maidId,
    });
  };

  // Handle maid role change
  const handleRoleChange = (maidId: string, role: MaidRole) => {
    dispatch({
      type: 'ASSIGN_ROLE',
      maidId,
      role,
    });
  };

  // Handle maid rest toggle
  const handleToggleRest = (maidId: string) => {
    dispatch({
      type: 'TOGGLE_MAID_REST',
      maidId,
    });
  };

  // Get waiting customers (not yet seated)
  const waitingCustomers = customers.filter(c => c.status === 'waiting_seat');
  
  // Get active maids (not resting)
  const activeMaids = maids.filter(m => !m.status.isResting);
  const restingMaids = maids.filter(m => m.status.isResting);

  // Get selected customer and maid details
  const selectedCustomer = selectedCustomerId 
    ? customers.find(c => c.id === selectedCustomerId) 
    : null;
  const selectedMaid = selectedMaidId 
    ? maids.find(m => m.id === selectedMaidId) 
    : null;

  return (
    <div className={`flex flex-col gap-4 p-4 min-h-full ${isLandscape ? 'p-2 gap-2' : ''}`}>
      {/* Status Banner */}
      {!isBusinessHours && (
        <div className={`bg-gray-50 rounded-xl p-3 text-center ${isLandscape ? 'p-2 text-sm' : ''}`}>
          <span className="text-gray-600">
            🌙 营业时间已结束 (9:00 - 21:00)
          </span>
        </div>
      )}
      
      {isPaused && isBusinessHours && (
        <div className={`bg-yellow-50 rounded-xl p-3 text-center ${isLandscape ? 'p-2 text-sm' : ''}`}>
          <span className="text-yellow-700">
            ⏸️ 游戏已暂停
          </span>
        </div>
      )}

      {/* Main Layout: 
          - Landscape mode: Two columns (main + sidebar) - Requirements: 8.2
          - Mobile (<1024px): Single column vertical layout
          - Desktop (>=1024px): Two columns with sidebar
      */}
      <div className={`flex-1 ${
        isLandscape 
          ? 'flex flex-row gap-2 overflow-hidden' 
          : 'flex flex-col lg:grid lg:grid-cols-3 gap-4'
      }`}>
        {/* Main Cafe Area - Seats */}
        <div className={isLandscape ? 'flex-1 overflow-auto' : 'lg:col-span-2'}>
          <Card className={`h-full ${isLandscape ? 'card-landscape-compact' : ''}`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span>🏠</span>
                <span className={isLandscape ? 'text-sm' : ''}>咖啡厅大厅</span>
                <span className={`text-gray-500 ${isLandscape ? 'text-xs' : 'text-sm'}`}>
                  (等级 {facility.cafeLevel})
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <SeatGrid
                maxSeats={facility.maxSeats}
                customers={customers}
                onCustomerClick={handleCustomerClick}
                selectedCustomerId={selectedCustomerId}
                isLandscape={isLandscape}
              />
              
              {/* Empty state */}
              {customers.length === 0 && (
                <div className={`text-center py-8 text-gray-500 ${isLandscape ? 'py-4' : ''}`}>
                  <div className={`mb-2 ${isLandscape ? 'text-2xl' : 'text-4xl'}`}>🍵</div>
                  <p className={isLandscape ? 'text-sm' : ''}>还没有顾客光临</p>
                  <p className={`${isLandscape ? 'text-xs' : 'text-sm'}`}>开始营业后顾客会陆续到来</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Side Panel - Landscape: always visible sidebar, Mobile: collapsible, Desktop: regular cards */}
        <div className={`flex flex-col gap-4 ${
          isLandscape ? 'w-48 flex-shrink-0 overflow-auto gap-2' : ''
        }`}>
          {/* Waiting Customers */}
          {waitingCustomers.length > 0 && (
            <>
              {/* Landscape: Compact Card */}
              {isLandscape ? (
                <Card className="card-landscape-compact">
                  <CardHeader>
                    <div className="flex items-center gap-1 text-xs">
                      <span>🚶</span>
                      <span>等待</span>
                      <span className="bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full text-[10px]">
                        {waitingCustomers.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="flex flex-wrap gap-1">
                      {waitingCustomers.slice(0, 4).map(customer => (
                        <CustomerCard
                          key={customer.id}
                          customer={customer}
                          onClick={() => handleCustomerClick(customer.id)}
                          selected={selectedCustomerId === customer.id}
                          compact
                        />
                      ))}
                      {waitingCustomers.length > 4 && (
                        <span className="text-xs text-gray-400">+{waitingCustomers.length - 4}</span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <>
                  {/* Mobile: CollapsibleCard */}
                  <div className="lg:hidden">
                    <CollapsibleCard
                      title="等待入座"
                      icon="🚶"
                      badge={waitingCustomers.length}
                      defaultExpanded={false}
                    >
                      <div className="flex flex-wrap gap-2">
                        {waitingCustomers.map(customer => (
                          <CustomerCard
                            key={customer.id}
                            customer={customer}
                            onClick={() => handleCustomerClick(customer.id)}
                            selected={selectedCustomerId === customer.id}
                            compact
                          />
                        ))}
                      </div>
                    </CollapsibleCard>
                  </div>
                  {/* Desktop: Regular Card */}
                  <div className="hidden lg:block">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <span>🚶</span>
                          <span>等待入座</span>
                          <span className="text-sm bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                            {waitingCustomers.length}
                          </span>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <div className="flex flex-wrap gap-2">
                          {waitingCustomers.map(customer => (
                            <CustomerCard
                              key={customer.id}
                              customer={customer}
                              onClick={() => handleCustomerClick(customer.id)}
                              selected={selectedCustomerId === customer.id}
                              compact
                            />
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}

          {/* Active Maids */}
          <>
            {/* Landscape: Compact Card */}
            {isLandscape ? (
              <Card className="card-landscape-compact">
                <CardHeader>
                  <div className="flex items-center gap-1 text-xs">
                    <span>👧</span>
                    <span>工作</span>
                    <span className="bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-[10px]">
                      {activeMaids.length}
                    </span>
                  </div>
                </CardHeader>
                <CardBody>
                  {activeMaids.length > 0 ? (
                    <div className="space-y-1">
                      {activeMaids.slice(0, 3).map(maid => (
                        <MaidCard
                          key={maid.id}
                          maid={maid}
                          onClick={() => handleMaidClick(maid.id)}
                          selected={selectedMaidId === maid.id}
                          compact
                        />
                      ))}
                      {activeMaids.length > 3 && (
                        <span className="text-xs text-gray-400">+{activeMaids.length - 3}</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-gray-500">
                      <p className="text-xs">无女仆工作</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            ) : (
              <>
                {/* Mobile: CollapsibleCard */}
                <div className="lg:hidden">
                  <CollapsibleCard
                    title="工作中"
                    icon="👧"
                    badge={activeMaids.length}
                    defaultExpanded={false}
                  >
                    {activeMaids.length > 0 ? (
                      <div className="space-y-2">
                        {activeMaids.map(maid => (
                          <MaidCard
                            key={maid.id}
                            maid={maid}
                            onClick={() => handleMaidClick(maid.id)}
                            selected={selectedMaidId === maid.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <div className="text-2xl mb-1">👧</div>
                        <p className="text-sm">还没有女仆在工作</p>
                        <p className="text-xs">前往女仆管理雇佣女仆</p>
                      </div>
                    )}
                  </CollapsibleCard>
                </div>
                {/* Desktop: Regular Card */}
                <div className="hidden lg:block">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span>👧</span>
                        <span>工作中的女仆</span>
                        <span className="text-sm bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          {activeMaids.length}
                        </span>
                      </div>
                    </CardHeader>
                    <CardBody>
                      {activeMaids.length > 0 ? (
                        <div className="space-y-2">
                          {activeMaids.map(maid => (
                            <MaidCard
                              key={maid.id}
                              maid={maid}
                              onClick={() => handleMaidClick(maid.id)}
                              selected={selectedMaidId === maid.id}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <div className="text-2xl mb-1">👧</div>
                          <p className="text-sm">还没有女仆在工作</p>
                          <p className="text-xs">前往女仆管理雇佣女仆</p>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              </>
            )}
          </>

          {/* Resting Maids */}
          {restingMaids.length > 0 && (
            <>
              {/* Landscape: Compact Card */}
              {isLandscape ? (
                <Card className="card-landscape-compact">
                  <CardHeader>
                    <div className="flex items-center gap-1 text-xs">
                      <span>💤</span>
                      <span>休息</span>
                      <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">
                        {restingMaids.length}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="flex flex-wrap gap-1">
                      {restingMaids.slice(0, 3).map(maid => (
                        <MaidCard
                          key={maid.id}
                          maid={maid}
                          onClick={() => handleMaidClick(maid.id)}
                          selected={selectedMaidId === maid.id}
                          compact
                        />
                      ))}
                      {restingMaids.length > 3 && (
                        <span className="text-xs text-gray-400">+{restingMaids.length - 3}</span>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <>
                  {/* Mobile: CollapsibleCard */}
                  <div className="lg:hidden">
                    <CollapsibleCard
                      title="休息中"
                      icon="💤"
                      badge={restingMaids.length}
                      defaultExpanded={false}
                    >
                      <div className="flex flex-wrap gap-2">
                        {restingMaids.map(maid => (
                          <MaidCard
                            key={maid.id}
                            maid={maid}
                            onClick={() => handleMaidClick(maid.id)}
                            selected={selectedMaidId === maid.id}
                            compact
                          />
                        ))}
                      </div>
                    </CollapsibleCard>
                  </div>
                  {/* Desktop: Regular Card */}
                  <div className="hidden lg:block">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <span>💤</span>
                          <span>休息中</span>
                          <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {restingMaids.length}
                          </span>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <div className="flex flex-wrap gap-2">
                          {restingMaids.map(maid => (
                            <MaidCard
                              key={maid.id}
                              maid={maid}
                              onClick={() => handleMaidClick(maid.id)}
                              selected={selectedMaidId === maid.id}
                              compact
                            />
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Selected Details Panel - Shows at bottom on all screen sizes, hidden in landscape to save space */}
      {(selectedCustomer || selectedMaid) && !isLandscape && (
        <div className="border-t border-gray-100 pt-4">
          {/* Selected Customer Details - Full width */}
          {selectedCustomer && !selectedMaid && (
            <Card variant="outlined">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span>顾客详情</span>
                  </div>
                  {/* Close button for mobile */}
                  <button
                    onClick={() => dispatch({ type: 'SELECT_CUSTOMER', customerId: null })}
                    className="lg:hidden touch-target flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    aria-label="关闭详情"
                  >
                    <span className="text-gray-400">✕</span>
                  </button>
                </div>
              </CardHeader>
              <CardBody>
                <CustomerCard
                  customer={selectedCustomer}
                  selected
                />
              </CardBody>
            </Card>
          )}

          {/* Selected Maid Details - Full width */}
          {selectedMaid && !selectedCustomer && (
            <Card variant="outlined">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>👧</span>
                    <span>女仆详情</span>
                  </div>
                  {/* Close button for mobile */}
                  <button
                    onClick={() => dispatch({ type: 'SELECT_MAID', maidId: null })}
                    className="lg:hidden touch-target flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    aria-label="关闭详情"
                  >
                    <span className="text-gray-400">✕</span>
                  </button>
                </div>
              </CardHeader>
              <CardBody>
                <MaidDetailPanel
                  maid={selectedMaid}
                  onRoleChange={handleRoleChange}
                  onToggleRest={handleToggleRest}
                />
              </CardBody>
            </Card>
          )}

          {/* Both selected - Two columns on desktop, stacked on mobile */}
          {selectedCustomer && selectedMaid && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card variant="outlined">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>顾客详情</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                      onClick={() => dispatch({ type: 'SELECT_CUSTOMER', customerId: null })}
                      className="lg:hidden touch-target flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      aria-label="关闭顾客详情"
                    >
                      <span className="text-gray-400">✕</span>
                    </button>
                  </div>
                </CardHeader>
                <CardBody>
                  <CustomerCard
                    customer={selectedCustomer}
                    selected
                  />
                </CardBody>
              </Card>
              <Card variant="outlined">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>👧</span>
                      <span>女仆详情</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                      onClick={() => dispatch({ type: 'SELECT_MAID', maidId: null })}
                      className="lg:hidden touch-target flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                      aria-label="关闭女仆详情"
                    >
                      <span className="text-gray-400">✕</span>
                    </button>
                  </div>
                </CardHeader>
                <CardBody>
                  <MaidDetailPanel
                    maid={selectedMaid}
                    onRoleChange={handleRoleChange}
                    onToggleRest={handleToggleRest}
                  />
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CafeView;
