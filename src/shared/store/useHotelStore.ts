import { create } from 'zustand';
import { IHotelSearchParams } from '../types';
import { LocalStorage, STORAGE_KEYS } from '../utils/LocalStorage';

/**
 * 获取初始化的搜索参数
 * 如果本地存储中有保存的搜索参数，则使用保存的值
 * 否则使用默认值
 */
const getInitialSearchParams = (): IHotelSearchParams => {
  const savedParams = LocalStorage.get<IHotelSearchParams>(STORAGE_KEYS.SEARCH_PARAMS);
  if (savedParams) {
    return savedParams;
  }
  return {
    city: '上海',
    startDate: '2026-02-04',
    endDate: '2026-02-05',
    keyword: '',
    stars: [],
    priceRange: undefined,
    tags: []
  };
};

interface HotelState {
  searchParams: IHotelSearchParams;
  calendarVisible: boolean;
  calendarMode: 'start' | 'end';
  setSearchParams: (params: Partial<IHotelSearchParams>) => void;
  setCalendarVisible: (visible: boolean, mode?: 'start' | 'end') => void;
  // 重置搜索参数到默认值
  resetSearchParams: () => void;
}

export const useHotelStore = create<HotelState>((set, get) => ({
  searchParams: getInitialSearchParams(),
  calendarVisible: false,
  calendarMode: 'start',

  setSearchParams: (params) => set((state) => {
    const newParams = {
      ...state.searchParams,
      ...params
    };
    // 保存到本地存储
    LocalStorage.set(STORAGE_KEYS.SEARCH_PARAMS, newParams);
    return { searchParams: newParams };
  }),

  setCalendarVisible: (visible, mode = 'start') => set({
    calendarVisible: visible,
    calendarMode: mode
  }),

  resetSearchParams: () => {
    const defaultParams = {
      city: '上海',
      startDate: '2026-02-04',
      endDate: '2026-02-05',
      keyword: '',
      stars: [],
      priceRange: undefined,
      tags: []
    };
    LocalStorage.set(STORAGE_KEYS.SEARCH_PARAMS, defaultParams);
    set({ searchParams: defaultParams });
  }
}));