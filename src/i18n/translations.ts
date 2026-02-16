/**
 * 国际化翻译文件
 * 支持中文 (zh) 和英文 (en)
 */

// 游戏UI文本
export const translations = {
  zh: {
    // 通用
    loading: '加载中...',
    loadingGame: '正在加载游戏...',
    loadFailed: '加载失败',
    refresh: '刷新页面',
    retry: '重试',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
    save: '保存',
    load: '读取',
    delete: '删除',
    start: '开始',
    unlock: '解锁',
    locked: '已锁定',
    
    // 游戏标题
    gameTitle: '迷迭香咖啡厅',
    gameSubtitle: '咖啡厅经营模拟游戏',
    
    // 资源
    gold: '金币',
    goldInsufficient: '金币不足',
    day: '天',
    time: '时间',
    
    // 顾客
    customer: '顾客',
    customers: '顾客数量',
    customerCount: '累计服务顾客',
    customerTypes: {
      normal: '普通顾客',
      vip: 'VIP顾客',
      family: '家庭顾客',
      business: '商务顾客',
    },
    
    // 女仆
    maid: '女仆',
    maids: '女仆',
    maidCount: '女仆数',
    hireMaid: '雇佣新女仆',
    hire: '雇佣',
    dismiss: '解雇',
    working: '工作中',
    resting: '休息中',
    maidTypes: {
      standard: '标准女仆',
      gentle: '温柔女仆',
      playful: '俏皮女仆',
    },
    
    // 菜单
    menu: '菜单',
    menuManagement: '菜单管理',
    unlockedMenu: '已解锁菜单',
    unlockableMenu: '可解锁菜单',
    unlockMenu: '解锁菜单',
    menuItems: {
      coffee: '咖啡',
      tea: '茶',
      latte: '拿铁',
      cappuccino: '卡布奇诺',
      matcha: '抹茶',
      cola: '可乐',
      bubbleTea: '珍珠奶茶',
    },
    
    // 设施
    facility: '设施',
    facilityManagement: '设施管理',
    cafeLevel: '咖啡厅等级',
    upgrade: '升级咖啡厅',
    upgradeCafe: '升级咖啡厅',
    facilities: {
      main: '咖啡厅的主要营业区域',
      outdoor: '户外露天座位，天气好时顾客满意度+10%',
      vip_room: 'VIP专属包间，可接待VIP顾客',
    },
    
    // 任务
    task: '任务',
    tasks: '任务',
    taskProgress: '任务进度',
    dailyTasks: '每日任务',
    growthTasks: '成长任务',
    claim: '领取',
    claimed: '已领取',
    
    // 成就
    achievement: '成就',
    achievements: '成就',
    
    // 存档
    saveLoad: '存档管理',
    newGame: '新游戏',
    continueGame: '继续游戏',
    exportSave: '导出存档',
    importSave: '导入存档',
    newGameWarning: '开始新游戏将删除所有当前进度，包括女仆、金币、成就等。此操作无法撤销！',
    newGameTip: '从头开始，体验全新的咖啡厅经营之旅。建议先导出当前存档作为备份。',
    
    // 事件
    event: '事件',
    randomEvent: '随机事件',
    
    // 统计
    statistics: '统计',
    todayStats: '今日统计',
    revenue: '收入',
    expenses: '支出',
    profit: '利润',
    
    // 设置
    settings: '设置',
    sound: '音效',
    music: '音乐',
    language: '语言',
    
    // 状态信息
    noMatchingItems: '没有符合条件的菜单项',
    customerEnter: '新顾客光临',
    customerLeave: '顾客离开',
  },
  
  en: {
    // 通用
    loading: 'Loading...',
    loadingGame: 'Loading game...',
    loadFailed: 'Load Failed',
    refresh: 'Refresh Page',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    save: 'Save',
    load: 'Load',
    delete: 'Delete',
    start: 'Start',
    unlock: 'Unlock',
    locked: 'Locked',
    
    // 游戏标题
    gameTitle: 'Rosemary Cafe',
    gameSubtitle: 'Cafe Management Simulation',
    
    // 资源
    gold: 'Gold',
    goldInsufficient: 'Insufficient Gold',
    day: 'Day',
    time: 'Time',
    
    // 顾客
    customer: 'Customer',
    customers: 'Customers',
    customerCount: 'Total Served',
    customerTypes: {
      normal: 'Regular',
      vip: 'VIP',
      family: 'Family',
      business: 'Business',
    },
    
    // 女仆
    maid: 'Maid',
    maids: 'Maids',
    maidCount: 'Maid Count',
    hireMaid: 'Hire New Maid',
    hire: 'Hire',
    dismiss: 'Dismiss',
    working: 'Working',
    resting: 'Resting',
    maidTypes: {
      standard: 'Standard',
      gentle: 'Gentle',
      playful: 'Playful',
    },
    
    // 菜单
    menu: 'Menu',
    menuManagement: 'Menu Management',
    unlockedMenu: 'Unlocked',
    unlockableMenu: 'Unlockable',
    unlockMenu: 'Unlock Menu',
    menuItems: {
      coffee: 'Coffee',
      tea: 'Tea',
      latte: 'Latte',
      cappuccino: 'Cappuccino',
      matcha: 'Matcha',
      cola: 'Cola',
      bubbleTea: 'Bubble Tea',
    },
    
    // 设施
    facility: 'Facility',
    facilityManagement: 'Facility Management',
    cafeLevel: 'Cafe Level',
    upgrade: 'Upgrade',
    upgradeCafe: 'Upgrade Cafe',
    facilities: {
      main: 'Main dining area',
      outdoor: 'Outdoor seating, +10% satisfaction in good weather',
      vip_room: 'VIP room for VIP customers',
    },
    
    // 任务
    task: 'Task',
    tasks: 'Tasks',
    taskProgress: 'Progress',
    dailyTasks: 'Daily Tasks',
    growthTasks: 'Growth Tasks',
    claim: 'Claim',
    claimed: 'Claimed',
    
    // 成就
    achievement: 'Achievement',
    achievements: 'Achievements',
    
    // 存档
    saveLoad: 'Save/Load',
    newGame: 'New Game',
    continueGame: 'Continue',
    exportSave: 'Export',
    importSave: 'Import',
    newGameWarning: 'Starting a new game will delete all progress including maids, gold, achievements, etc. This cannot be undone!',
    newGameTip: 'Start fresh. Recommended to export your current save first.',
    
    // 事件
    event: 'Event',
    randomEvent: 'Random Event',
    
    // 统计
    statistics: 'Statistics',
    todayStats: "Today's Stats",
    revenue: 'Revenue',
    expenses: 'Expenses',
    profit: 'Profit',
    
    // 设置
    settings: 'Settings',
    sound: 'Sound',
    music: 'Music',
    language: 'Language',
    
    // 状态信息
    noMatchingItems: 'No matching items',
    customerEnter: 'New customer arrived',
    customerLeave: 'Customer left',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.zh;
