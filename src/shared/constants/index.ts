/**
 * 统一管理应用的常量配置
 * 包含 API 配置、预设账号等信息
 */

// ==================== API 配置 ====================

// 腾讯地图 API Key
export const QQ_MAP_KEY = 'AWBBZ-HTZKV-NGKPK-5U2CL-EK6WH-P6FIT';

// 基础 API URL（小程序环境固定）
export const API_BASE_URL = 'https://api.example.com';

// ==================== 预设管理员账号 ====================
export interface AdminAccount {
  username: string;
  password: string;
}

export const ADMIN_ACCOUNTS: AdminAccount[] = [
  { username: 'admin', password: '123456' },
  { username: 'manager', password: '666666' },
];

// 检查是否为管理员账号
export const isAdminAccount = (username: string): boolean => {
  return ADMIN_ACCOUNTS.some(
    admin => admin.username.toLowerCase() === username.toLowerCase()
  );
};

// ==================== 预设商户账号 ====================
export interface MerchantAccount {
  id: string;
  username: string;
  password: string;
  role: 'MERCHANT';
}

export const PRESET_MERCHANTS: MerchantAccount[] = [
  { id: '1', username: 'hotel01', password: '123456', role: 'MERCHANT' },
  { id: '2', username: 'hotel02', password: '123456', role: 'MERCHANT' },
];

// ==================== 标签配置 ====================
export const TAG_OPTIONS = [
  '亲子',
  '豪华',
  '免费停车场',
  '近地铁',
  '商务',
  '江景',
  '健身房',
  '泳池',
  '含早餐',
  '精品',
] as const;

export type TagOption = typeof TAG_OPTIONS[number];

// ==================== 筛选选项配置 ====================
export const STAR_OPTIONS = [5, 4, 3, 2, 1] as const;

export const PRICE_OPTIONS = [
  { label: '¥0–500', value: [0, 500] as [number, number] },
  { label: '¥500–800', value: [500, 800] as [number, number] },
  { label: '¥800+', value: [800, 9999] as [number, number] },
] as const;
