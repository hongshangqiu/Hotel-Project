import { create } from 'zustand';
import { IHotelSearchParams } from '../types';

interface HotelState {
  searchParams: IHotelSearchParams;
  calendarVisible: boolean;
  calendarMode: 'start' | 'end'; // 新增：记录是从“入住”还是“离店”点进来的
  setSearchParams: (params: Partial<IHotelSearchParams>) => void;
  // 更新：允许传入第二个参数 mode
  setCalendarVisible: (visible: boolean, mode?: 'start' | 'end') => void;
}

export const useHotelStore = create<HotelState>((set) => ({
  searchParams: {
    city: '上海',
    startDate: '2026-02-04',
    endDate: '2026-02-05',
    keyword: ''
  },
  calendarVisible: false,
  calendarMode: 'start', // 默认模式
  setSearchParams: (params) => set((state) => ({
    searchParams: { ...state.searchParams, ...params }
  })),
  // 更新方法逻辑
  setCalendarVisible: (visible, mode = 'start') => set({ 
    calendarVisible: visible, 
    calendarMode: mode 
  }),
}));