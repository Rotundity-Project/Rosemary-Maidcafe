import { GameEvent, Season } from '@/types';

// 合并新增事件
const additionalPositiveEvents: GameEvent[] = [
  { id: 'food-blogger', type: 'positive', name: '美食博主推荐', description: '一位美食博主推荐了咖啡厅的菜品！', effects: [{ target: 'customers', modifier: 1.4, isMultiplier: true }, { target: 'reputation', modifier: 6, isMultiplier: false }], duration: 420, icon: '📸' },
  { id: 'social-media-viral', type: 'positive', name: '网红打卡', description: '咖啡厅成为网红打卡地点！', effects: [{ target: 'customers', modifier: 1.8, isMultiplier: true }, { target: 'reputation', modifier: 12, isMultiplier: false }], duration: 540, icon: '🔥' },
  { id: 'award-winning', type: 'positive', name: '获奖认证', description: '咖啡厅获得了年度最佳咖啡厅奖！', effects: [{ target: 'reputation', modifier: 20, isMultiplier: false }, { target: 'customers', modifier: 1.6, isMultiplier: true }], duration: 720, icon: '🏆' },
];

const additionalNegativeEvents: GameEvent[] = [
  { id: 'competitor-opening', type: 'negative', name: '竞争对手开业', description: '附近开了一家新的咖啡厅，分流了部分顾客。', effects: [{ target: 'customers', modifier: 0.7, isMultiplier: true }, { target: 'revenue', modifier: 0.8, isMultiplier: true }], duration: 540, icon: '🏪' },
  { id: 'staff-absence', type: 'negative', name: '员工请假', description: '一名女仆突然请假，人手不足！', effects: [{ target: 'satisfaction', modifier: 0.75, isMultiplier: true }, { target: 'customers', modifier: 0.8, isMultiplier: true }], duration: 420, icon: '😴' },
];

const additionalSeasonalEvents: Record<Season, GameEvent[]> = {
  spring: [{ id: 'white-day', type: 'seasonal', name: '白色情人节', description: '白色情人节，单身顾客也会来消费！', effects: [{ target: 'customers', modifier: 1.5, isMultiplier: true }, { target: 'revenue', modifier: 1.25, isMultiplier: true }], duration: 480, icon: '🤍' }],
  summer: [{ id: 'firework-display', type: 'seasonal', name: '烟花大会', description: '烟花大会期间，顾客络绎不绝！', effects: [{ target: 'customers', modifier: 1.7, isMultiplier: true }, { target: 'revenue', modifier: 1.4, isMultiplier: true }], duration: 480, icon: '🎇' }],
  autumn: [{ id: 'halloween', type: 'seasonal', name: '万圣节', description: '万圣节到了，变装派对！', effects: [{ target: 'customers', modifier: 1.5, isMultiplier: true }, { target: 'revenue', modifier: 1.3, isMultiplier: true }], duration: 480, icon: '🎃' }],
  winter: [{ id: 'snow-festival', type: 'seasonal', name: '冰雪节', description: '冰雪节到了，咖啡厅推出热饮特惠！', effects: [{ target: 'customers', modifier: 1.3, isMultiplier: true }, { target: 'satisfaction', modifier: 1.15, isMultiplier: true }], duration: 540, icon: '❄️' }],
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
