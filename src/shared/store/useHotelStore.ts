import { create } from 'zustand';
import { IHotelSearchParams } from '../types';
import { LocalStorage, STORAGE_KEYS } from '../utils/LocalStorage';

// 将数字补齐为两位字符串
const pad2 = (n: number) => String(n).padStart(2, '0');

// 将 Date 对象格式化为 "YYYY-MM-DD" 字符串
const formatDate = (d: Date) => {
  const y = d.getFullYear();              // 年：如 2026
  const m = pad2(d.getMonth() + 1);       // 月：getMonth() 返回 0~11，所以要 +1；再补齐两位
  const day = pad2(d.getDate());          // 日：1~31，补齐两位
  return `${y}-${m}-${day}`;              // 拼成标准日期格式
};

// 在 base 日期基础上增加 days 天，返回一个新的 Date
const addDays = (base: Date, days: number) => {
  const d = new Date(base);               // 复制一份，避免修改 base 引用
  d.setDate(d.getDate() + days);          // 设置为 base 的日 + days（跨月/跨年会自动处理）
  return d;
};

// 生成默认搜索参数：入住=明天，退房=后天
const getDefaultSearchParams = (): IHotelSearchParams => {
  const today = new Date();               // 当前日期（本地时区）

  const start = addDays(today, 1);        // 明天（默认入住）
  const end = addDays(today, 2);          // 后天（默认退房）

  return {
    city: '上海',                          // 默认城市
    startDate: formatDate(start),          // 入住日期：YYYY-MM-DD
    endDate: formatDate(end),              // 退房日期：YYYY-MM-DD
    keyword: '',                           // 默认关键字为空
  };
};

/**
 * 获取初始化的搜索参数
 * 如果本地存储中有保存的搜索参数，则使用保存的值
 * 否则使用默认值
 */
const getInitialSearchParams = (): IHotelSearchParams => {
  const savedParams = LocalStorage.get<IHotelSearchParams>(STORAGE_KEYS.SEARCH_PARAMS);
  if (savedParams) return savedParams;
  return getDefaultSearchParams();
};

interface HotelState {
  searchParams: IHotelSearchParams;
  calendarVisible: boolean;
  calendarMode: 'start' | 'end';
  setSearchParams: (params: Partial<IHotelSearchParams>) => void;
  setCalendarVisible: (visible: boolean, mode?: 'start' | 'end') => void;
  resetSearchParams: () => void;
}

export const useHotelStore = create<HotelState>((set) => ({
  searchParams: getInitialSearchParams(),
  calendarVisible: false,
  calendarMode: 'start',

  setSearchParams: (params) =>
    set((state) => {
      const newParams = {
        ...state.searchParams,
        ...params,
      };
      LocalStorage.set(STORAGE_KEYS.SEARCH_PARAMS, newParams);
      return { searchParams: newParams };
    }),

  setCalendarVisible: (visible, mode = 'start') =>
    set({
      calendarVisible: visible,
      calendarMode: mode,
    }),

  resetSearchParams: () => {
    const defaultParams = getDefaultSearchParams();
    LocalStorage.set(STORAGE_KEYS.SEARCH_PARAMS, defaultParams);
    set({ searchParams: defaultParams });
  },
}));