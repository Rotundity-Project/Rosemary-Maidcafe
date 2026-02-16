import { GameEvent, Season } from '@/types';

// 合并新增事件
const additionalPositiveEvents: GameEvent[] = [
  { id: 'food-blogger', type: 'positive', name: '美食博主推荐', description: '一位美食博主推荐了咖啡厅的菜品！', effects: [{ target: 'customers', modifier: 1.4, isMultiplier: true }, { target: 'reputation', modifier: 6, isMultiplier: false }], duration: 420, icon: '📸' },
  { id: 'social-media-viral', type: 'positive', name: '网红打卡', description: '咖啡厅成为网红打卡地点！', effects: [{ target: 'customers', modifier: 1.8, isMultiplier: true }, { target: 'reputation', modifier: 12, isMultiplier: false }], duration: 540, icon: '🔥' },
  { id: 'award-winning', type: 'positive', name: '获奖认证', description: '咖啡厅获得了年度最佳咖啡厅奖！', effects: [{ target: 'reputation', modifier: 20, isMultiplier: false }, { target: 'customers', modifier: 1.6, isMultiplier: true }], duration: 720, icon: '🏆' },
  // 新增更多正面事件
  { id: 'famous-chef-visit', type: 'positive', name: '名厨来访', description: '一位著名厨师来访并称赞了咖啡厅的料理！', effects: [{ target: 'reputation', modifier: 15, isMultiplier: false }, { target: 'satisfaction', modifier: 1.2, isMultiplier: true }], duration: 480, icon: '👨‍🍳' },
  { id: 'pet-cafe-trend', type: 'positive', name: '宠物咖啡热潮', description: '咖啡厅允许宠物进入，吸引了大量爱宠人士！', effects: [{ target: 'customers', modifier: 1.5, isMultiplier: true }, { target: 'revenue', modifier: 1.25, isMultiplier: true }], duration: 600, icon: '🐱' },
  { id: 'local-hero', type: 'positive', name: '本地英雄', description: '一位本地知名人士大力推荐咖啡厅！', effects: [{ target: 'reputation', modifier: 12, isMultiplier: false }, { target: 'customers', modifier: 1.4, isMultiplier: true }], duration: 420, icon: '🦸' },
  { id: 'business-partnership', type: 'positive', name: '商业合作', description: '与附近公司签订团餐合作协议！', effects: [{ target: 'revenue', modifier: 1.35, isMultiplier: true }, { target: 'reputation', modifier: 8, isMultiplier: false }], duration: 720, icon: '🤝' },
  { id: 'cooking-show', type: 'positive', name: '料理秀', description: '女仆们在店内表演料理秀，吸引众多观众！', effects: [{ target: 'customers', modifier: 1.6, isMultiplier: true }, { target: 'satisfaction', modifier: 1.15, isMultiplier: true }], duration: 360, icon: '🍳' },
  { id: 'anniversary', type: 'positive', name: '周年庆典', description: '咖啡厅周年庆典，全场8折！', effects: [{ target: 'customers', modifier: 2.0, isMultiplier: true }, { target: 'revenue', modifier: 1.5, isMultiplier: true }], duration: 480, icon: '🎉' },
  { id: 'guerrilla-marketing', type: 'positive', name: '创意营销', description: '有趣的营销活动在社交媒体上病毒式传播！', effects: [{ target: 'customers', modifier: 1.7, isMultiplier: true }, { target: 'reputation', modifier: 10, isMultiplier: false }], duration: 540, icon: '📣' },
];

const additionalNegativeEvents: GameEvent[] = [
  { id: 'competitor-opening', type: 'negative', name: '竞争对手开业', description: '附近开了一家新的咖啡厅，分流了部分顾客。', effects: [{ target: 'customers', modifier: 0.7, isMultiplier: true }, { target: 'revenue', modifier: 0.8, isMultiplier: true }], duration: 540, icon: '🏪' },
  { id: 'staff-absence', type: 'negative', name: '员工请假', description: '一名女仆突然请假，人手不足！', effects: [{ target: 'satisfaction', modifier: 0.75, isMultiplier: true }, { target: 'customers', modifier: 0.8, isMultiplier: true }], duration: 420, icon: '😴' },
  // 新增更多负面事件
  { id: 'online-bullying', type: 'negative', name: '网络暴力', description: '咖啡厅在社交媒体上遭到恶意攻击！', effects: [{ target: 'reputation', modifier: -15, isMultiplier: false }, { target: 'customers', modifier: 0.7, isMultiplier: true }], duration: 480, icon: '💔' },
  { id: 'food-poisoning', type: 'negative', name: '食物中毒', description: '有顾客反映食物质量问题，需要全面检查！', effects: [{ target: 'satisfaction', modifier: 0.6, isMultiplier: true }, { target: 'reputation', modifier: -12, isMultiplier: false }], duration: 360, icon: '🤢' },
  { id: 'renovation-neighbor', type: 'negative', name: '邻居装修', description: '隔壁店铺开始装修，噪音很大！', effects: [{ target: 'customers', modifier: 0.75, isMultiplier: true }, { target: 'satisfaction', modifier: 0.8, isMultiplier: true }], duration: 420, icon: '🔨' },
  { id: 'price-hike', type: 'negative', name: '原料涨价', description: '原材料价格上涨，成本增加！', effects: [{ target: 'revenue', modifier: 0.75, isMultiplier: true }], duration: 600, icon: '📈' },
  { id: 'staff-steal', type: 'negative', name: '员工偷窃', description: '发现员工有偷窃行为！', effects: [{ target: 'reputation', modifier: -10, isMultiplier: false }, { target: 'revenue', modifier: 0.7, isMultiplier: true }], duration: 240, icon: '🚨' },
  { id: 'fire-alarm', type: 'negative', name: '火警误报', description: '店内火警误响，顾客惊慌离开！', effects: [{ target: 'customers', modifier: 0.65, isMultiplier: true }, { target: 'satisfaction', modifier: 0.7, isMultiplier: true }], duration: 180, icon: '🚒' },
  { id: 'water-leak', type: 'negative', name: '水管漏水', description: '厨房水管破裂，需要暂停营业维修！', effects: [{ target: 'revenue', modifier: 0.5, isMultiplier: true }, { target: 'satisfaction', modifier: 0.8, isMultiplier: true }], duration: 300, icon: '💧' },
  { id: 'complaint-letter', type: 'negative', name: '投诉信', description: '收到一封匿名投诉信！', effects: [{ target: 'reputation', modifier: -5, isMultiplier: false }, { target: 'satisfaction', modifier: 0.9, isMultiplier: true }], duration: 180, icon: '✉️' },
];

const additionalSeasonalEvents: Record<Season, GameEvent[]> = {
  spring: [
    { id: 'white-day', type: 'seasonal', name: '白色情人节', description: '白色情人节，单身顾客也会来消费！', effects: [{ target: 'customers', modifier: 1.5, isMultiplier: true }, { target: 'revenue', modifier: 1.25, isMultiplier: true }], duration: 480, icon: '🤍' },
    // 新增春季事件
    { id: 'flower-viewing', type: 'seasonal', name: '赏樱活动', description: '咖啡厅推出赏樱特供套餐！', effects: [{ target: 'customers', modifier: 1.4, isMultiplier: true }, { target: 'revenue', modifier: 1.2, isMultiplier: true }], duration: 540, icon: '🌸' },
    { id: 'spring-rain', type: 'seasonal', name: '春雨绵绵', description: '连绵春雨让顾客更愿意待在咖啡厅里！', effects: [{ target: 'customers', modifier: 1.3, isMultiplier: true }, { target: 'satisfaction', modifier: 1.1, isMultiplier: true }], duration: 480, icon: '🌧️' },
    { id: 'new-year-spring', type: 'seasonal', name: '春节', description: '春节期间客流量的高峰！', effects: [{ target: 'customers', modifier: 1.6, isMultiplier: true }, { target: 'revenue', modifier: 1.35, isMultiplier: true }], duration: 720, icon: '🧧' },
  ],
  summer: [
    { id: 'firework-display', type: 'seasonal', name: '烟花大会', description: '烟花大会期间，顾客络绎不绝！', effects: [{ target: 'customers', modifier: 1.7, isMultiplier: true }, { target: 'revenue', modifier: 1.4, isMultiplier: true }], duration: 480, icon: '🎇' },
    // 新增夏季事件
    { id: 'cold-noodle-season', type: 'seasonal', name: '冷面季节', description: '夏季冷面热销中！', effects: [{ target: 'revenue', modifier: 1.3, isMultiplier: true }, { target: 'satisfaction', modifier: 1.15, isMultiplier: true }], duration: 600, icon: '🍜' },
    { id: 'beach-season', type: 'seasonal', name: '海滨度假', description: '海滨度假季，游客增多！', effects: [{ target: 'customers', modifier: 1.5, isMultiplier: true }, { target: 'reputation', modifier: 8, isMultiplier: false }], duration: 540, icon: '🏖️' },
    { id: 'tanabata', type: 'seasonal', name: '七夕节', description: '七夕情人节，情侣套餐大受欢迎！', effects: [{ target: 'customers', modifier: 1.5, isMultiplier: true }, { target: 'revenue', modifier: 1.4, isMultiplier: true }], duration: 480, icon: '🎋' },
    { id: 'tsunami-warning', type: 'seasonal', name: '台风警报', description: '台风警报，人们减少外出！', effects: [{ target: 'customers', modifier: 0.6, isMultiplier: true }, { target: 'satisfaction', modifier: 0.85, isMultiplier: true }], duration: 360, icon: '🌀' },
  ],
  autumn: [
    { id: 'halloween', type: 'seasonal', name: '万圣节', description: '万圣节到了，变装派对！', effects: [{ target: 'customers', modifier: 1.5, isMultiplier: true }, { target: 'revenue', modifier: 1.3, isMultiplier: true }], duration: 480, icon: '🎃' },
    // 新增秋季事件
    { id: 'tsukimi', type: 'seasonal', name: '赏月', description: '中秋赏月，咖啡厅推出月见套餐！', effects: [{ target: 'customers', modifier: 1.35, isMultiplier: true }, { target: 'revenue', modifier: 1.25, isMultiplier: true }], duration: 480, icon: '🥮' },
    { id: 'maple-season', type: 'seasonal', name: '红叶季', description: '红叶时节，浪漫咖啡厅！', effects: [{ target: 'satisfaction', modifier: 1.2, isMultiplier: true }, { target: 'reputation', modifier: 5, isMultiplier: false }], duration: 540, icon: '🍁' },
    { id: 'mid-autumn', type: 'seasonal', name: '中秋节', description: '中秋佳节，团圆时刻！', effects: [{ target: 'customers', modifier: 1.4, isMultiplier: true }, { target: 'revenue', modifier: 1.3, isMultiplier: true }], duration: 480, icon: '🌕' },
    { id: 'typhoon-season', type: 'seasonal', name: '台风季节', description: '台风季节来临！', effects: [{ target: 'customers', modifier: 0.7, isMultiplier: true }, { target: 'revenue', modifier: 0.8, isMultiplier: true }], duration: 420, icon: '🌬️' },
  ],
  winter: [
    { id: 'snow-festival', type: 'seasonal', name: '冰雪节', description: '冰雪节到了，咖啡厅推出热饮特惠！', effects: [{ target: 'customers', modifier: 1.3, isMultiplier: true }, { target: 'satisfaction', modifier: 1.15, isMultiplier: true }], duration: 540, icon: '❄️' },
    // 新增冬季事件
    { id: 'christmas-eve', type: 'seasonal', name: '平安夜', description: '平安夜，圣诞老人来啦！', effects: [{ target: 'customers', modifier: 1.6, isMultiplier: true }, { target: 'revenue', modifier: 1.5, isMultiplier: true }], duration: 480, icon: '🎅' },
    { id: 'new-year-eve', type: 'seasonal', name: '跨年夜', description: '跨年夜，咖啡厅大排长龙！', effects: [{ target: 'customers', modifier: 1.8, isMultiplier: true }, { target: 'revenue', modifier: 1.6, isMultiplier: true }], duration: 360, icon: '🎆' },
    { id: 'hot-pot-season', type: 'seasonal', name: '火锅季节', description: '冬季火锅套餐上线！', effects: [{ target: 'revenue', modifier: 1.35, isMultiplier: true }, { target: 'satisfaction', modifier: 1.2, isMultiplier: true }], duration: 600, icon: '🍲' },
    { id: 'blizzard', type: 'seasonal', name: '暴雪天气', description: '暴雪红色预警！', effects: [{ target: 'customers', modifier: 0.5, isMultiplier: true }, { target: 'satisfaction', modifier: 0.9, isMultiplier: true }], duration: 300, icon: '🌨️' },
    { id: 'lunar-new-year', type: 'seasonal', name: '农历新年', description: '农历新年到，福气满满！', effects: [{ target: 'customers', modifier: 1.5, isMultiplier: true }, { target: 'revenue', modifier: 1.4, isMultiplier: true }, { target: 'reputation', modifier: 8, isMultiplier: false }], duration: 720, icon: '🐉' },
  ],
};

export const positiveEvents: GameEvent[] = [
  {
    id: 'celebrity-visit',
    type: 'positive',
    name: '名人来访',
    description: '一位知名博主来到了咖啡厅，并在社交媒体上发布了好评！',
    effects: [
      { target: 'reputation', modifier: 10, isMultiplier: false },
      { target: 'customers', modifier: 1.5, isMultiplier: true },
    ],
    duration: 360,
    icon: '⭐',
  },
  {
    id: 'good-review',
    type: 'positive',
    name: '好评如潮',
    description: '咖啡厅收到了大量好评，声望提升！',
    effects: [
      { target: 'reputation', modifier: 5, isMultiplier: false },
    ],
    duration: 180,
    icon: '👍',
  },
  {
    id: 'lucky-day',
    type: 'positive',
    name: '幸运日',
    description: '今天是个好日子，顾客们都很慷慨！',
    effects: [
      { target: 'revenue', modifier: 1.3, isMultiplier: true },
    ],
    duration: 720,
    icon: '🍀',
  },
  {
    id: 'media-coverage',
    type: 'positive',
    name: '媒体报道',
    description: '当地媒体报道了咖啡厅，吸引了更多顾客！',
    effects: [
      { target: 'customers', modifier: 2, isMultiplier: true },
      { target: 'reputation', modifier: 8, isMultiplier: false },
    ],
    duration: 480,
    icon: '📺',
  },
  {
    id: 'perfect-weather',
    type: 'positive',
    name: '完美天气',
    description: '今天天气非常好，顾客心情愉悦！',
    effects: [
      { target: 'satisfaction', modifier: 1.2, isMultiplier: true },
    ],
    duration: 720,
    icon: '☀️',
  },
];


export const negativeEvents: GameEvent[] = [
  {
    id: 'equipment-breakdown',
    type: 'negative',
    name: '设备故障',
    description: '咖啡机出了故障，需要维修！服务速度下降。',
    effects: [
      { target: 'satisfaction', modifier: 0.8, isMultiplier: true },
    ],
    duration: 360,
    icon: '🔧',
  },
  {
    id: 'bad-weather',
    type: 'negative',
    name: '恶劣天气',
    description: '外面下着大雨，顾客减少了。',
    effects: [
      { target: 'customers', modifier: 0.5, isMultiplier: true },
    ],
    duration: 480,
    icon: '🌧️',
  },
  {
    id: 'health-inspection',
    type: 'negative',
    name: '卫生检查',
    description: '卫生部门来检查了，需要额外注意服务质量。',
    effects: [
      { target: 'satisfaction', modifier: 0.9, isMultiplier: true },
      { target: 'reputation', modifier: -3, isMultiplier: false },
    ],
    duration: 240,
    icon: '🔍',
  },
  {
    id: 'supply-shortage',
    type: 'negative',
    name: '原料短缺',
    description: '部分原料供应不足，菜单选择受限。',
    effects: [
      { target: 'revenue', modifier: 0.85, isMultiplier: true },
    ],
    duration: 360,
    icon: '📦',
  },
  {
    id: 'bad-review',
    type: 'negative',
    name: '差评',
    description: '有顾客在网上发布了差评，声望下降。',
    effects: [
      { target: 'reputation', modifier: -5, isMultiplier: false },
    ],
    duration: 180,
    icon: '👎',
  },
];

export const seasonalEvents: Record<Season, GameEvent[]> = {
  spring: [
    {
      id: 'cherry-blossom',
      type: 'seasonal',
      name: '樱花季',
      description: '樱花盛开的季节，咖啡厅迎来赏花客人！',
      effects: [
        { target: 'customers', modifier: 1.4, isMultiplier: true },
        { target: 'satisfaction', modifier: 1.1, isMultiplier: true },
      ],
      duration: 720,
      icon: '🌸',
    },
    {
      id: 'valentines-day',
      type: 'seasonal',
      name: '情人节',
      description: '情人节到了，情侣们纷纷来到咖啡厅！',
      effects: [
        { target: 'customers', modifier: 1.6, isMultiplier: true },
        { target: 'revenue', modifier: 1.3, isMultiplier: true },
      ],
      duration: 720,
      icon: '💕',
    },
  ],
  summer: [
    {
      id: 'summer-festival',
      type: 'seasonal',
      name: '夏日祭',
      description: '夏日祭典开始了，街上热闹非凡！',
      effects: [
        { target: 'customers', modifier: 1.5, isMultiplier: true },
        { target: 'satisfaction', modifier: 1.15, isMultiplier: true },
      ],
      duration: 720,
      icon: '🎆',
    },
    {
      id: 'heat-wave',
      type: 'seasonal',
      name: '酷暑',
      description: '天气炎热，顾客们都想来喝冷饮！',
      effects: [
        { target: 'customers', modifier: 1.3, isMultiplier: true },
      ],
      duration: 720,
      icon: '🌡️',
    },
  ],
  autumn: [
    {
      id: 'moon-festival',
      type: 'seasonal',
      name: '中秋节',
      description: '中秋佳节，家人朋友相聚！',
      effects: [
        { target: 'customers', modifier: 1.4, isMultiplier: true },
        { target: 'revenue', modifier: 1.2, isMultiplier: true },
      ],
      duration: 720,
      icon: '🥮',
    },
    {
      id: 'autumn-leaves',
      type: 'seasonal',
      name: '红叶季',
      description: '秋叶飘落，咖啡厅充满浪漫气息。',
      effects: [
        { target: 'satisfaction', modifier: 1.15, isMultiplier: true },
      ],
      duration: 720,
      icon: '🍂',
    },
  ],
  winter: [
    {
      id: 'christmas',
      type: 'seasonal',
      name: '圣诞节',
      description: '圣诞节到了，咖啡厅装饰一新！',
      effects: [
        { target: 'customers', modifier: 1.8, isMultiplier: true },
        { target: 'revenue', modifier: 1.4, isMultiplier: true },
        { target: 'satisfaction', modifier: 1.2, isMultiplier: true },
      ],
      duration: 720,
      icon: '🎄',
    },
    {
      id: 'new-year',
      type: 'seasonal',
      name: '新年',
      description: '新年新气象，祝大家新年快乐！',
      effects: [
        { target: 'customers', modifier: 1.5, isMultiplier: true },
        { target: 'reputation', modifier: 5, isMultiplier: false },
      ],
      duration: 720,
      icon: '🎊',
    },
  ],
};

// 合并额外事件到主数组
export const mergedPositiveEvents: GameEvent[] = [...positiveEvents, ...additionalPositiveEvents];
export const mergedNegativeEvents: GameEvent[] = [...negativeEvents, ...additionalNegativeEvents];

export const allEvents = [...mergedPositiveEvents, ...mergedNegativeEvents];

// 合并季节事件
export const mergedSeasonalEvents: Record<Season, GameEvent[]> = {
  spring: [...(seasonalEvents.spring || []), ...(additionalSeasonalEvents.spring || [])],
  summer: [...(seasonalEvents.summer || []), ...(additionalSeasonalEvents.summer || [])],
  autumn: [...(seasonalEvents.autumn || []), ...(additionalSeasonalEvents.autumn || [])],
  winter: [...(seasonalEvents.winter || []), ...(additionalSeasonalEvents.winter || [])],
};
