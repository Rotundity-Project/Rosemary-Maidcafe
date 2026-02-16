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

    // 任务面板
    taskPanel: {
      completed: '已完成',
      taskProgress: '任务进度',
      dailyTasks: '每日任务',
      growthTasks: '成长任务',
      claimed: '已领取',
      claimReward: '领取奖励',
      claimable: '可领取',
      incomplete: '未完成',
      noMaidYet: '还没有雇佣女仆',
      hireFirstMaid: '点击上方按钮雇佣第一位女仆吧！',
    },

    // 成就面板
    achievementPanel: {
      achievementSystem: '成就系统',
      unlocked: '已解锁',
      achievementProgress: '成就进度',
      statistics: '统计',
      totalCustomersServed: '服务顾客',
      totalRevenue: '累计收入',
      totalDaysPlayed: '经营天数',
      maidsHired: '雇佣女仆',
      totalTipsEarned: '累计小费',
      perfectServicesCount: '完美服务',
      all: '全部',
      locked: '未解锁',
      noMatchingAchievements: '没有符合条件的成就',
      progress: '进度',
      reward: '奖励',
    },

    // 财务管理面板
    financePanel: {
      financeManagement: '财务管理',
      day: '第 {day} 天',
      currentGold: '当前金币',
      todayRevenue: '今日收入',
      todayExpenses: '今日支出',
      todayProfit: '今日利润',
      revenueExpenseTrend: '7天收支趋势',
      noHistoryData: '还没有历史数据',
      completeFirstDayTip: '完成第一天营业后将显示数据',
      revenue: '收入',
      expenses: '支出',
      totalProfit: '总利润',
      financialDetails: '收支明细',
      todayDetails: '今日明细',
      customerSpending: '顾客消费',
      maidWages: '女仆工资',
      otherExpenses: '其他支出',
      dailyOperatingCosts: '每日固定开支',
      rent: '租金',
      utilities: '水电费',
      businessTip: '经营小贴士',
      todayLossTip: '今日亏损！考虑提高菜品价格或减少开支。',
      lowProfitTip: '利润较低，尝试吸引更多顾客或提升服务质量。',
      goodBusinessTip: '经营状况良好！继续保持！',
      history: '历史记录',
      date: '日期',
      perMaidPerDay: '每人 20 金币/天',
      basedOnLevel: '根据等级变化',
      basedOnEquipment: '根据设备变化',
      maidCount: '{count} 名女仆',
    },

    // 女仆管理面板
    maidPanel: {
      maidManagement: '女仆管理',
      maidCount: '{count} / {max} 名女仆',
      hireNewMaid: '雇佣新女仆',
      maxMaidsReached: '已达到最大女仆数量',
      noMaidsYet: '还没有雇佣女仆',
      hireFirstMaidTip: '点击上方按钮雇佣第一位女仆吧！',
      hiredMaids: '已雇佣女仆',
      details: '详情',
      assignRole: '分配角色',
      endRest: '结束休息',
      arrangeRest: '安排休息',
      dismissMaid: '解雇女仆',
      confirmDismiss: '确认解雇',
      cancel: '取消',
      hireCandidates: '雇佣新女仆',
      hireCost: '雇佣费用',
      currentGold: '当前金币',
      refreshCandidates: '刷新候选人',
      insufficientGold: '金币不足',
      personality: '性格',
      charm: '魅力',
      skill: '技能',
      stamina: '体质',
      speed: '速度',
      rest: '休息中',
      lowStaminaWarning: '体力不足',
    },

    // 设施管理面板
    facilityPanel: {
      facilityManagement: '设施管理',
      gold: '金币',
      cafeLevel: '咖啡厅等级',
      seats: '座位数',
      satisfactionBonus: '满意度加成',
      unlockedAreas: '已解锁区域',
      upgrade: '升级',
      decorations: '装饰',
      equipment: '设备',
      areas: '区域',
      cafeUpgrade: '咖啡厅升级',
      nextLevel: '下一级',
      currentSeats: '当前座位数',
      seatsAfterUpgrade: '升级后座位数',
      upgradeCost: '升级费用',
      upgradeCafe: '升级咖啡厅',
      insufficientGold: '金币不足',
      purchasedDecorations: '已购买装饰',
      noDecorationsYet: '还没有购买任何装饰',
      decorationShop: '装饰商店',
      equipmentUpgrade: '设备升级',
      currentEffect: '当前效果',
      maxLevel: '最高',
      maxLevelReached: '已满级',
      areaUnlock: '区域解锁',
      unlocked: '已解锁',
      unlock: '解锁',
      satisfaction: '满意度',
    },

    // 女仆角色
    maidRoles: {
      greeter: '迎宾',
      server: '服务员',
      barista: '咖啡师',
      entertainer: '表演者',
    },

    // 女仆性格
    maidPersonalities: {
      cheerful: '开朗',
      cool: '冷静',
      shy: '害羞',
      energetic: '活力',
      elegant: '优雅',
      gentle: '温柔',
      playful: '俏皮',
    },

    // 设施区域
    facilityAreas: {
      main: '主厅',
      outdoor: '户外座位',
      vip_room: 'VIP包间',
      stage: '表演舞台',
    },
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

    // 任务面板
    taskPanel: {
      completed: 'Completed',
      taskProgress: 'Progress',
      dailyTasks: 'Daily Tasks',
      growthTasks: 'Growth Tasks',
      claimed: 'Claimed',
      claimReward: 'Claim Reward',
      claimable: 'Claimable',
      incomplete: 'Incomplete',
      noMaidYet: 'No maids hired yet',
      hireFirstMaid: 'Click the button above to hire your first maid!',
    },

    // 成就面板
    achievementPanel: {
      achievementSystem: 'Achievements',
      unlocked: 'Unlocked',
      achievementProgress: 'Progress',
      statistics: 'Statistics',
      totalCustomersServed: 'Customers Served',
      totalRevenue: 'Total Revenue',
      totalDaysPlayed: 'Days Played',
      maidsHired: 'Maids Hired',
      totalTipsEarned: 'Total Tips',
      perfectServicesCount: 'Perfect Services',
      all: 'All',
      locked: 'Locked',
      noMatchingAchievements: 'No matching achievements',
      progress: 'Progress',
      reward: 'Reward',
    },

    // 财务管理面板
    financePanel: {
      financeManagement: 'Finance',
      day: 'Day {day}',
      currentGold: 'Current Gold',
      todayRevenue: "Today's Revenue",
      todayExpenses: "Today's Expenses",
      todayProfit: "Today's Profit",
      revenueExpenseTrend: '7-Day Trend',
      noHistoryData: 'No history data yet',
      completeFirstDayTip: 'Complete first day to see data',
      revenue: 'Revenue',
      expenses: 'Expenses',
      totalProfit: 'Total Profit',
      financialDetails: 'Details',
      todayDetails: "Today's Details",
      customerSpending: 'Customer Spending',
      maidWages: 'Maid Wages',
      otherExpenses: 'Other Expenses',
      dailyOperatingCosts: 'Daily Costs',
      rent: 'Rent',
      utilities: 'Utilities',
      businessTip: 'Business Tip',
      todayLossTip: 'Loss today! Consider raising prices or reducing costs.',
      lowProfitTip: 'Low profit. Try attracting more customers or improving service.',
      goodBusinessTip: 'Great business! Keep it up!',
      history: 'History',
      date: 'Date',
      perMaidPerDay: '20 gold/maid/day',
      basedOnLevel: 'Varies by level',
      basedOnEquipment: 'Varies by equipment',
      maidCount: '{count} maids',
    },

    // 女仆管理面板
    maidPanel: {
      maidManagement: 'Maid Management',
      maidCount: '{count} / {max} Maids',
      hireNewMaid: 'Hire New Maid',
      maxMaidsReached: 'Maximum maids reached',
      noMaidsYet: 'No maids hired yet',
      hireFirstMaidTip: 'Click the button above to hire your first maid!',
      hiredMaids: 'Hired Maids',
      details: 'Details',
      assignRole: 'Assign Role',
      endRest: 'End Rest',
      arrangeRest: 'Rest',
      dismissMaid: 'Dismiss Maid',
      confirmDismiss: 'Confirm',
      cancel: 'Cancel',
      hireCandidates: 'Hire New Maid',
      hireCost: 'Hire Cost',
      currentGold: 'Current Gold',
      refreshCandidates: 'Refresh',
      insufficientGold: 'Insufficient Gold',
      personality: 'Personality',
      charm: 'Charm',
      skill: 'Skill',
      stamina: 'Stamina',
      speed: 'Speed',
      rest: 'Resting',
      lowStaminaWarning: 'Low stamina',
    },

    // 设施管理面板
    facilityPanel: {
      facilityManagement: 'Facilities',
      gold: 'Gold',
      cafeLevel: 'Cafe Level',
      seats: 'Seats',
      satisfactionBonus: 'Satisfaction',
      unlockedAreas: 'Areas',
      upgrade: 'Upgrade',
      decorations: 'Decor',
      equipment: 'Equipment',
      areas: 'Areas',
      cafeUpgrade: 'Cafe Upgrade',
      nextLevel: 'Next Level',
      currentSeats: 'Current Seats',
      seatsAfterUpgrade: 'After Upgrade',
      upgradeCost: 'Upgrade Cost',
      upgradeCafe: 'Upgrade Cafe',
      insufficientGold: 'Insufficient Gold',
      purchasedDecorations: 'Owned',
      noDecorationsYet: 'No decorations purchased yet',
      decorationShop: 'Shop',
      equipmentUpgrade: 'Equipment',
      currentEffect: 'Effect',
      maxLevel: 'Max',
      maxLevelReached: 'MAX',
      areaUnlock: 'Unlock Areas',
      unlocked: 'Unlocked',
      unlock: 'Unlock',
      satisfaction: 'Satisfaction',
    },

    // 女仆角色
    maidRoles: {
      greeter: 'Greeter',
      server: 'Server',
      barista: 'Barista',
      entertainer: 'Entertainer',
    },

    // 女仆性格
    maidPersonalities: {
      cheerful: 'Cheerful',
      cool: 'Cool',
      shy: 'Shy',
      energetic: 'Energetic',
      elegant: 'Elegant',
      gentle: 'Gentle',
      playful: 'Playful',
    },

    // 设施区域
    facilityAreas: {
      main: 'Main Hall',
      outdoor: 'Outdoor',
      vip_room: 'VIP Room',
      stage: 'Stage',
    },
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.zh;
