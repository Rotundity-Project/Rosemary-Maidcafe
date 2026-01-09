'use client';

import { useGame } from '@/components/game/GameProvider';
import { SeatGrid } from './Seat';
import { MaidCard } from './MaidCard';
import { MaidDetailPanel } from './MaidDetailPanel';
import { CustomerCard } from './CustomerCard';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { MaidRole } from '@/types';

export function CafeView() {
  const { state, dispatch } = useGame();
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
    <div className="flex flex-col gap-4 p-4 min-h-full">
      {/* Status Banner */}
      {!isBusinessHours && (
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <span className="text-gray-600">
            🌙 营业时间已结束 (9:00 - 21:00)
          </span>
        </div>
      )}
      
      {isPaused && isBusinessHours && (
        <div className="bg-yellow-50 rounded-xl p-3 text-center">
          <span className="text-yellow-700">
            ⏸️ 游戏已暂停
          </span>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Cafe Area - Seats */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span>🏠</span>
                <span>咖啡厅大厅</span>
                <span className="text-sm text-gray-500">
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
              />
              
              {/* Empty state */}
              {customers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🍵</div>
                  <p>还没有顾客光临</p>
                  <p className="text-sm">开始营业后顾客会陆续到来</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-4">
          {/* Waiting Customers */}
          {waitingCustomers.length > 0 && (
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
          )}

          {/* Active Maids */}
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

          {/* Resting Maids */}
          {restingMaids.length > 0 && (
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
          )}
        </div>
      </div>

      {/* Selected Details Panel */}
      {(selectedCustomer || selectedMaid) && (
        <div className="border-t border-gray-100 pt-4">
          {/* Selected Customer Details - Full width */}
          {selectedCustomer && !selectedMaid && (
            <Card variant="outlined">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span>👤</span>
                  <span>顾客详情</span>
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
                <div className="flex items-center gap-2">
                  <span>👧</span>
                  <span>女仆详情</span>
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

          {/* Both selected - Two columns */}
          {selectedCustomer && selectedMaid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="outlined">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span>顾客详情</span>
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
                  <div className="flex items-center gap-2">
                    <span>👧</span>
                    <span>女仆详情</span>
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
