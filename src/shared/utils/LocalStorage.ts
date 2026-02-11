import Taro from '@tarojs/taro';

// LocalStorage 键名前缀
const STORAGE_PREFIX = 'HOTEL_APP_';

/**
 * LocalStorage 工具类
 * 提供同步的本地存储操作，支持 Taro 环境和小程序环境
 */
export class LocalStorage {
  private static isInitialized = false;

  /**
   * 检查是否是小程序环境
   */
  private static isMiniApp(): boolean {
    return typeof Taro.getEnv === 'function';
  }

  /**
   * 保存数据到本地存储
   */
  static set<T>(key: string, value: T): boolean {
    try {
      const fullKey = `${STORAGE_PREFIX}${key}`;
      const serializedValue = JSON.stringify(value);

      if (this.isMiniApp()) {
        // 小程序环境
        Taro.setStorageSync(fullKey, serializedValue);
      } else {
        // Web 环境
        localStorage.setItem(fullKey, serializedValue);
      }
      return true;
    } catch (error) {
      console.error('LocalStorage set error:', error);
      return false;
    }
  }

  /**
   * 从本地存储获取数据
   */
  static get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const fullKey = `${STORAGE_PREFIX}${key}`;

      let serializedValue: string | null = null;

      if (this.isMiniApp()) {
        // 小程序环境
        serializedValue = Taro.getStorageSync(fullKey);
      } else {
        // Web 环境
        serializedValue = localStorage.getItem(fullKey);
      }

      if (serializedValue === null || serializedValue === undefined || serializedValue === '') {
        return defaultValue;
      }

      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return defaultValue;
    }
  }

  /**
   * 删除指定键的数据
   */
  static remove(key: string): boolean {
    try {
      const fullKey = `${STORAGE_PREFIX}${key}`;

      if (this.isMiniApp()) {
        Taro.removeStorageSync(fullKey);
      } else {
        localStorage.removeItem(fullKey);
      }
      return true;
    } catch (error) {
      console.error('LocalStorage remove error:', error);
      return false;
    }
  }

  /**
   * 清空所有应用相关的数据
   */
  static clearAll(): boolean {
    try {
      if (this.isMiniApp()) {
        Taro.clearStorageSync();
      } else {
        // 只清除我们应用的数据
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
      return true;
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      return false;
    }
  }

  /**
   * 检查键是否存在
   */
  static has(key: string): boolean {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    if (this.isMiniApp()) {
      try {
        Taro.getStorageSync(fullKey);
        return true;
      } catch {
        return false;
      }
    }
    return localStorage.getItem(fullKey) !== null;
  }

  /**
   * 获取所有键
   */
  static keys(): string[] {
    const keys: string[] = [];

    if (this.isMiniApp()) {
      try {
        const info = Taro.getStorageInfoSync();
        return info.keys.filter(k => k.startsWith(STORAGE_PREFIX));
      } catch {
        return [];
      }
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
    return keys;
  }
}

// 存储键名常量
export const STORAGE_KEYS = {
  HOTELS: 'hotels',
  HOTEL_MAP: 'hotel_map',
  SEARCH_PARAMS: 'search_params',
  USER: 'user',
  FAVORITES: 'favorites',
  HISTORY: 'search_history',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
