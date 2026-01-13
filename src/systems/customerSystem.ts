import { Customer, CustomerType, CustomerStatus, Order, OrderItem, MenuItem, Maid, Season } from '@/types';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `customer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 从数组中随机选择一个元素
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 生成指定范围内的随机整数
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 将值限制在指定范围内
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// 顾客名字池
const customerFirstNames = [
  '小明', '小红', '小华', '小丽', '小强', '小芳', '小军', '小燕',
  '阿杰', '阿美', '阿伟', '阿玲', '大卫', '玛丽', '约翰', '艾米',
  '太郎', '花子', '健一', '美咲', '翔太', '由美', '拓也', '真由',
];

const customerLastNames = [
  '王', '李', '张', '刘', '陈', '杨', '黄', '赵',
  '周', '吴', '徐', '孙', '马', '朱', '胡', '郭',
];

// 顾客头像池
const customerAvatars = [
  '👤', '👨', '👩', '🧑', '👴', '👵', '👦', '👧',
  '🧔', '👱', '👸', '🤴', '🧑‍💼', '👨‍💼', '👩‍💼', '🧑‍🎓',
];

// 顾客类型权重 (基于声望调整)
const customerTypeWeights: Record<CustomerType, { baseWeight: number; reputationBonus: number }> = {
  regular: { baseWeight: 70, reputationBonus: 0 },
  vip: { baseWeight: 15, reputationBonus: 0.2 },
  critic: { baseWeight: 10, reputationBonus: 0.1 },
  group: { baseWeight: 5, reputationBonus: 0.15 },
};

// 顾客类型对应的耐心值范围
const customerPatienceRange: Record<CustomerType, { min: number; max: number }> = {
  regular: { min: 70, max: 120 },
  vip: { min: 50, max: 90 },      // VIP更挑剔，耐心较低
  critic: { min: 40, max: 80 },   // 评论家最挑剔
  group: { min: 80, max: 120 },   // 团体顾客耐心较好
};

/**
 * 根据权重随机选择顾客类型
 * Requirements: 3.2
 */
function selectCustomerType(reputation: number): CustomerType {
  const types: CustomerType[] = ['regular', 'vip', 'critic', 'group'];
  
  // 计算每种类型的实际权重
  const weights = types.map(type => {
    const config = customerTypeWeights[type];
    // 声望越高，特殊顾客出现概率越高
    return config.baseWeight + (reputation / 100) * config.reputationBonus * 100;
  });
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < types.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return types[i];
    }
  }
  
  return 'regular';
}

/**
 * 生成顾客
 * Requirements: 3.1, 3.2
 * @param reputation 咖啡厅声望 (0-100)
 * @param season 当前季节 (用于未来季节性顾客行为扩展)
 */
export function generateCustomer(reputation: number, season: Season): Customer {
  const type = selectCustomerType(reputation);
  const patienceRange = customerPatienceRange[type];
  
  const firstName = randomChoice(customerFirstNames);
  const lastName = randomChoice(customerLastNames);
  
  // 季节可能影响顾客类型概率（未来扩展）
  // 目前仅用于记录，确保参数被使用
  const seasonalModifier = season ? 1 : 1;
  
  const customer: Customer = {
    id: generateId(),
    type,
    name: `${lastName}${firstName}`,
    avatar: randomChoice(customerAvatars),
    order: {
      items: [],
      totalPrice: 0,
      preparedItems: [],
    },
    patience: randomInt(patienceRange.min, patienceRange.max) * seasonalModifier,
    satisfaction: 50, // 初始满意度为中等
    status: 'waiting_seat',
    arrivalTime: Date.now(),
    seatId: '',
  };
  
  return customer;
}

/**
 * 获取当前季节可用的菜单项
 * Requirements: 4.7
 */
function getAvailableMenuItems(menuItems: MenuItem[], season: Season): MenuItem[] {
  return menuItems.filter(item => {
    // 必须已解锁
    if (!item.unlocked) return false;
    // 全年可用或当前季节可用
    return item.season === null || item.season === season;
  });
}

/**
 * 根据顾客类型获取订单数量范围
 */
function getOrderQuantityRange(customerType: CustomerType): { min: number; max: number } {
  switch (customerType) {
    case 'vip':
      return { min: 2, max: 4 };
    case 'group':
      return { min: 3, max: 6 };
    case 'critic':
      return { min: 1, max: 3 };
    case 'regular':
    default:
      return { min: 1, max: 3 };
  }
}

/**
 * 生成顾客订单
 * Requirements: 3.3
 * @param customer 顾客
 * @param menuItems 所有菜单项
 * @param season 当前季节
 */
export function generateOrder(customer: Customer, menuItems: MenuItem[], season: Season): Order {
  const availableItems = getAvailableMenuItems(menuItems, season);
  
  if (availableItems.length === 0) {
    return {
      items: [],
      totalPrice: 0,
      preparedItems: [],
    };
  }
  
  const quantityRange = getOrderQuantityRange(customer.type);
  const orderCount = randomInt(quantityRange.min, Math.min(quantityRange.max, availableItems.length));
  
  // 根据人气值加权选择菜单项
  const weightedItems = availableItems.map(item => ({
    item,
    weight: 10 + item.popularity, // 基础权重10 + 人气值
  }));
  
  const totalWeight = weightedItems.reduce((sum, wi) => sum + wi.weight, 0);
  const selectedItems: OrderItem[] = [];
  const selectedIds = new Set<string>();
  
  for (let i = 0; i < orderCount; i++) {
    let random = Math.random() * totalWeight;
    
    for (const wi of weightedItems) {
      random -= wi.weight;
      if (random <= 0 && !selectedIds.has(wi.item.id)) {
        selectedIds.add(wi.item.id);
        selectedItems.push({
          menuItemId: wi.item.id,
          quantity: customer.type === 'group' ? randomInt(1, 3) : 1,
          prepared: false,
        });
        break;
      }
    }
  }
  
  // 计算总价
  const totalPrice = selectedItems.reduce((sum, orderItem) => {
    const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
    return sum + (menuItem ? menuItem.currentPrice * orderItem.quantity : 0);
  }, 0);
  
  return {
    items: selectedItems,
    totalPrice,
    preparedItems: [],
  };
}


/**
 * 计算顾客满意度
 * Requirements: 3.4
 * @param maid 服务的女仆
 * @param customer 顾客
 * @param waitTime 等待时间（分钟）
 */
export function calculateSatisfaction(maid: Maid, customer: Customer, waitTime: number): number {
  // 基础满意度 50
  let satisfaction = 50;
  
  // 女仆魅力加成 (0-25分)
  const charmBonus = (maid.stats.charm / 100) * 25;
  satisfaction += charmBonus;
  
  // 女仆技能加成 (0-25分)
  const skillBonus = (maid.stats.skill / 100) * 25;
  satisfaction += skillBonus;
  
  // 等待时间惩罚
  // 每等待5分钟扣1分，最多扣30分
  const waitPenalty = Math.min(Math.floor(waitTime / 5), 30);
  satisfaction -= waitPenalty;
  
  // 顾客类型调整
  switch (customer.type) {
    case 'vip':
      // VIP对服务质量要求更高，满意度波动更大
      satisfaction = satisfaction * 1.2 - 10;
      break;
    case 'critic':
      // 评论家更挑剔，满意度整体降低
      satisfaction = satisfaction * 0.9;
      break;
    case 'group':
      // 团体顾客更宽容
      satisfaction = satisfaction * 1.1;
      break;
    case 'regular':
    default:
      // 普通顾客无调整
      break;
  }
  
  // 女仆体力影响
  // 体力低于50%时，满意度略微降低
  if (maid.stamina < 50) {
    const staminaPenalty = ((50 - maid.stamina) / 50) * 10;
    satisfaction -= staminaPenalty;
  }
  
  // 女仆心情影响
  // 心情低于50%时，满意度略微降低
  if (maid.mood < 50) {
    const moodPenalty = ((50 - maid.mood) / 50) * 10;
    satisfaction -= moodPenalty;
  }
  
  return clamp(Math.round(satisfaction), 0, 100);
}

/**
 * 计算小费
 * Requirements: 3.7
 * @param satisfaction 顾客满意度 (0-100)
 * @param maidCharm 女仆魅力值 (1-100)
 */
export function calculateTip(satisfaction: number, maidCharm: number): number {
  // 满意度低于50不给小费
  if (satisfaction < 50) {
    return 0;
  }
  
  // 基础小费 = (满意度 - 50) * 0.5
  // 满意度50时小费0，满意度100时基础小费25
  const baseTip = (satisfaction - 50) * 0.5;
  
  // 魅力加成 (0-50%)
  const charmMultiplier = 1 + (maidCharm / 100) * 0.5;
  
  // 最终小费
  const tip = Math.round(baseTip * charmMultiplier);
  
  return Math.max(0, tip);
}

/**
 * 更新顾客耐心值
 * Requirements: 3.5
 * @param customer 顾客
 * @param deltaMinutes 经过的时间（分钟）
 */
export function updatePatience(customer: Customer, deltaMinutes: number): Customer {
  // 不同状态下耐心消耗速度不同
  let patienceDecay = 0;
  
  switch (customer.status) {
    case 'waiting_seat':
      // 等待座位时耐心消耗最快
      patienceDecay = deltaMinutes * 2;
      break;
    case 'waiting_order':
      // 等待订单时耐心消耗较快(已优化,降低消耗速度)
      patienceDecay = deltaMinutes * 0.8;
      break;
    case 'ordering':
    case 'seated':
      // 点餐和刚入座时耐心消耗较慢
      patienceDecay = deltaMinutes * 0.5;
      break;
    case 'eating':
      // 用餐时耐心不消耗
      patienceDecay = 0;
      break;
    case 'paying':
    case 'leaving':
      // 付款和离开时耐心不消耗
      patienceDecay = 0;
      break;
    default:
      patienceDecay = deltaMinutes;
  }
  
  // 顾客类型影响耐心消耗速度
  switch (customer.type) {
    case 'vip':
      patienceDecay *= 1.3; // VIP耐心消耗更快
      break;
    case 'critic':
      patienceDecay *= 1.5; // 评论家耐心消耗最快
      break;
    case 'group':
      patienceDecay *= 0.8; // 团体顾客耐心消耗较慢
      break;
    case 'regular':
    default:
      // 普通顾客无调整
      break;
  }
  
  const newPatience = clamp(customer.patience - patienceDecay, 0, 100);
  
  return {
    ...customer,
    patience: newPatience,
  };
}

/**
 * 获取顾客生成间隔（毫秒）
 * Requirements: 3.1
 * @param reputation 咖啡厅声望 (0-100)
 * @param cafeLevel 咖啡厅等级 (1-10)
 */
export function getSpawnInterval(reputation: number, cafeLevel: number): number {
  // 基础间隔 30秒 (30000毫秒)
  const baseInterval = 30000;
  
  // 声望降低间隔 (声望100时减少50%)
  const reputationModifier = 1 - (reputation / 100) * 0.5;
  
  // 咖啡厅等级降低间隔 (等级10时减少30%)
  const levelModifier = 1 - ((cafeLevel - 1) / 9) * 0.3;
  
  // 最终间隔，最低10秒
  const interval = Math.max(baseInterval * reputationModifier * levelModifier, 10000);
  
  return Math.round(interval);
}

/**
 * 检查顾客是否应该离开（耐心耗尽）
 * Requirements: 3.5
 */
export function shouldCustomerLeave(customer: Customer): boolean {
  return customer.patience <= 0 && customer.status !== 'leaving' && customer.status !== 'paying';
}

/**
 * 处理顾客耐心耗尽
 * Requirements: 3.5
 * @param customer 顾客
 * @returns 更新后的顾客和声望惩罚
 */
export function handlePatienceTimeout(customer: Customer): { customer: Customer; reputationPenalty: number } {
  // 根据顾客类型计算声望惩罚
  let reputationPenalty = 0;
  
  switch (customer.type) {
    case 'vip':
      reputationPenalty = 5; // VIP离开惩罚更重
      break;
    case 'critic':
      reputationPenalty = 8; // 评论家离开惩罚最重
      break;
    case 'group':
      reputationPenalty = 4; // 团体离开惩罚较重
      break;
    case 'regular':
    default:
      reputationPenalty = 2;
      break;
  }
  
  return {
    customer: {
      ...customer,
      satisfaction: 0,
      status: 'leaving',
    },
    reputationPenalty,
  };
}

/**
 * 计算顾客完成服务后的奖励
 * Requirements: 3.6, 3.7, 3.8
 * @param customer 顾客
 * @param maid 服务的女仆
 */
export function calculateRewards(customer: Customer, maid: Maid): {
  gold: number;
  tip: number;
  reputation: number;
  maidExperience: number;
} {
  const { satisfaction, order, type } = customer;
  
  // 基础金币 = 订单总价
  let gold = order.totalPrice;
  
  // 计算小费
  const tip = calculateTip(satisfaction, maid.stats.charm);
  
  // 计算声望变化
  let reputation = 0;
  if (satisfaction >= 80) {
    reputation = type === 'vip' ? 3 : type === 'critic' ? 5 : 1;
  } else if (satisfaction >= 60) {
    reputation = type === 'critic' ? 2 : 0;
  } else if (satisfaction < 40) {
    reputation = type === 'critic' ? -5 : type === 'vip' ? -3 : -1;
  }
  
  // VIP顾客额外奖励
  if (type === 'vip' && satisfaction >= 70) {
    gold = Math.round(gold * 1.2); // 20%额外消费
  }
  
  // 计算女仆经验
  const maidExperience = Math.round(5 + (satisfaction / 100) * 20);
  
  return {
    gold,
    tip,
    reputation,
    maidExperience,
  };
}

/**
 * 更新顾客状态
 */
export function updateCustomerStatus(customer: Customer, newStatus: CustomerStatus): Customer {
  return {
    ...customer,
    status: newStatus,
  };
}

/**
 * 为顾客分配座位
 */
export function assignSeat(customer: Customer, seatId: string): Customer {
  return {
    ...customer,
    seatId,
    status: 'seated',
  };
}

/**
 * 开始服务
 */
export function startCustomerService(customer: Customer, maidId: string): Customer {
  return {
    ...customer,
    status: 'waiting_order',
    serviceProgress: 0,
    serviceStartTime: Date.now(),
    servingMaidId: maidId,
  };
}

/**
 * 更新服务进度
 */
export function updateCustomerServiceProgress(customer: Customer, progress: number): Customer {
  return {
    ...customer,
    serviceProgress: progress,
  };
}

/**
 * 完成服务
 * 顾客进入用餐状态
 */
export function completeService(customer: Customer): Customer {
  return {
    ...customer,
    status: 'eating',
    serviceProgress: 100,
  };
}
