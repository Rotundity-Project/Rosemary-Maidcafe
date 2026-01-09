import { GameState, Maid } from '@/types';
import { initialGameState, GAME_CONSTANTS } from '@/data/initialState';
import { getRandomMaidImage, maidImagePool } from '@/data/maidImages';

// 存储数据结构
export interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  checksum: string;
}

// 存储结果类型
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 生成校验和 - 使用简单的字符串哈希算法
 * @param state 游戏状态
 * @returns 校验和字符串
 */
export function generateChecksum(state: GameState): string {
  const stateString = JSON.stringify(state);
  let hash = 0;
  for (let i = 0; i < stateString.length; i++) {
    const char = stateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * 验证存档数据的完整性和有效性
 * @param data 待验证的数据
 * @returns 验证结果
 */
export function validateSaveData(data: unknown): StorageResult<SaveData> {
  // 检查基本结构
  if (!data || typeof data !== 'object') {
    return { success: false, error: '存档数据格式无效' };
  }

  const saveData = data as Record<string, unknown>;

  // 检查必要字段
  if (!saveData.version || typeof saveData.version !== 'string') {
    return { success: false, error: '存档版本信息缺失' };
  }

  if (!saveData.timestamp || typeof saveData.timestamp !== 'number') {
    return { success: false, error: '存档时间戳缺失' };
  }

  if (!saveData.gameState || typeof saveData.gameState !== 'object') {
    return { success: false, error: '游戏状态数据缺失' };
  }

  if (!saveData.checksum || typeof saveData.checksum !== 'string') {
    return { success: false, error: '校验和缺失' };
  }

  // 验证校验和
  const gameState = saveData.gameState as GameState;
  const expectedChecksum = generateChecksum(gameState);
  if (saveData.checksum !== expectedChecksum) {
    return { success: false, error: '存档数据已损坏（校验和不匹配）' };
  }

  // 验证游戏状态的关键字段
  if (!validateGameState(gameState)) {
    return { success: false, error: '游戏状态数据不完整' };
  }

  return { 
    success: true, 
    data: saveData as unknown as SaveData 
  };
}


/**
 * 验证游戏状态的关键字段是否存在
 * @param state 游戏状态
 * @returns 是否有效
 */
function validateGameState(state: GameState): boolean {
  // 检查必要的顶级字段
  const requiredFields: (keyof GameState)[] = [
    'day', 'time', 'season', 'isPaused', 'isBusinessHours',
    'maids', 'customers', 'menuItems', 'facility', 'finance',
    'activeEvents', 'eventHistory', 'achievements', 'statistics',
    'reputation', 'activePanel', 'notifications'
  ];

  for (const field of requiredFields) {
    if (state[field] === undefined) {
      return false;
    }
  }

  // 检查数值字段的有效性
  if (typeof state.day !== 'number' || state.day < 1) return false;
  if (typeof state.time !== 'number' || state.time < 0) return false;
  if (typeof state.reputation !== 'number') return false;

  // 检查数组字段
  if (!Array.isArray(state.maids)) return false;
  if (!Array.isArray(state.customers)) return false;
  if (!Array.isArray(state.menuItems)) return false;
  if (!Array.isArray(state.achievements)) return false;
  if (!Array.isArray(state.notifications)) return false;

  // 检查对象字段
  if (!state.facility || typeof state.facility !== 'object') return false;
  if (!state.finance || typeof state.finance !== 'object') return false;
  if (!state.statistics || typeof state.statistics !== 'object') return false;

  return true;
}

/**
 * 保存游戏到 localStorage
 * @param state 游戏状态
 * @returns 保存结果
 */
export function saveGame(state: GameState): StorageResult<void> {
  try {
    // 检查 localStorage 是否可用
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, error: 'localStorage 不可用' };
    }

    const saveData: SaveData = {
      version: GAME_CONSTANTS.SAVE_VERSION,
      timestamp: Date.now(),
      gameState: state,
      checksum: generateChecksum(state),
    };

    const jsonString = JSON.stringify(saveData);
    localStorage.setItem(GAME_CONSTANTS.SAVE_KEY, jsonString);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, error: `保存失败: ${errorMessage}` };
  }
}

/**
 * 从 localStorage 加载游戏
 * @returns 加载结果，包含游戏状态或错误信息
 */
export function loadGame(): StorageResult<GameState> {
  try {
    // 检查 localStorage 是否可用
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, error: 'localStorage 不可用' };
    }

    const jsonString = localStorage.getItem(GAME_CONSTANTS.SAVE_KEY);
    
    if (!jsonString) {
      return { success: false, error: '没有找到存档' };
    }

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(jsonString);
    } catch {
      return { success: false, error: '存档数据解析失败' };
    }

    const validationResult = validateSaveData(parsedData);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error };
    }

    // 迁移旧存档中的女仆头像
    const migratedState = migrateMaidAvatars(validationResult.data!.gameState);

    return { 
      success: true, 
      data: migratedState 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, error: `加载失败: ${errorMessage}` };
  }
}


/**
 * 导出存档为可下载的 JSON 文件
 * @param state 游戏状态
 * @returns 导出结果
 */
export function exportSave(state: GameState): StorageResult<Blob> {
  try {
    const saveData: SaveData = {
      version: GAME_CONSTANTS.SAVE_VERSION,
      timestamp: Date.now(),
      gameState: state,
      checksum: generateChecksum(state),
    };

    const jsonString = JSON.stringify(saveData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    return { success: true, data: blob };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, error: `导出失败: ${errorMessage}` };
  }
}

/**
 * 触发文件下载
 * @param blob 文件数据
 * @param filename 文件名
 */
export function downloadSave(blob: Blob, filename?: string): void {
  const defaultFilename = `rosemary-cafe-save-${new Date().toISOString().slice(0, 10)}.json`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 从文件导入存档
 * @param file 存档文件
 * @returns Promise，解析为游戏状态或错误
 */
export async function importSave(file: File): Promise<StorageResult<GameState>> {
  return new Promise((resolve) => {
    // 检查文件类型
    if (!file.name.endsWith('.json')) {
      resolve({ success: false, error: '请选择 JSON 格式的存档文件' });
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') {
          resolve({ success: false, error: '文件读取失败' });
          return;
        }

        let parsedData: unknown;
        try {
          parsedData = JSON.parse(content);
        } catch {
          resolve({ success: false, error: '存档文件格式无效' });
          return;
        }

        const validationResult = validateSaveData(parsedData);
        if (!validationResult.success) {
          resolve({ success: false, error: validationResult.error });
          return;
        }

        // 迁移旧存档中的女仆头像
        const migratedState = migrateMaidAvatars(validationResult.data!.gameState);

        resolve({ 
          success: true, 
          data: migratedState 
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        resolve({ success: false, error: `导入失败: ${errorMessage}` });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: '文件读取错误' });
    };

    reader.readAsText(file);
  });
}

/**
 * 删除存档
 * @returns 删除结果
 */
export function deleteSave(): StorageResult<void> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, error: 'localStorage 不可用' };
    }

    localStorage.removeItem(GAME_CONSTANTS.SAVE_KEY);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, error: `删除失败: ${errorMessage}` };
  }
}

/**
 * 检查是否存在存档
 * @returns 是否存在存档
 */
export function hasSave(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    return localStorage.getItem(GAME_CONSTANTS.SAVE_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * 获取存档信息（不加载完整状态）
 * @returns 存档基本信息
 */
export function getSaveInfo(): StorageResult<{ version: string; timestamp: number; day: number }> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { success: false, error: 'localStorage 不可用' };
    }

    const jsonString = localStorage.getItem(GAME_CONSTANTS.SAVE_KEY);
    if (!jsonString) {
      return { success: false, error: '没有找到存档' };
    }

    const parsedData = JSON.parse(jsonString) as SaveData;
    return {
      success: true,
      data: {
        version: parsedData.version,
        timestamp: parsedData.timestamp,
        day: parsedData.gameState.day,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return { success: false, error: `获取存档信息失败: ${errorMessage}` };
  }
}

/**
 * 获取新游戏的初始状态
 * @returns 初始游戏状态
 */
export function getInitialState(): GameState {
  return { ...initialGameState };
}

/**
 * 迁移旧存档中的女仆头像
 * 将 emoji 头像替换为真实图片路径
 * @param state 游戏状态
 * @returns 迁移后的游戏状态
 */
export function migrateMaidAvatars(state: GameState): GameState {
  const usedImages: string[] = [];
  
  const migratedMaids: Maid[] = state.maids.map((maid) => {
    // 检查是否已经是有效的图片路径
    if (maid.avatar && maid.avatar.startsWith('/maid-image/') && maidImagePool.includes(maid.avatar)) {
      usedImages.push(maid.avatar);
      return maid;
    }
    
    // 分配新的图片
    const newAvatar = getRandomMaidImage(usedImages);
    usedImages.push(newAvatar);
    
    return {
      ...maid,
      avatar: newAvatar,
    };
  });
  
  return {
    ...state,
    maids: migratedMaids,
  };
}
