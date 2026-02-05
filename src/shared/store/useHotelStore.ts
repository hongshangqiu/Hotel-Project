import { create } from 'zustand';
import { IHotelSearchParams } from '../types';

interface HotelState {
  searchParams: IHotelSearchParams;
  calendarVisible: boolean;
  setSearchParams: (params: Partial<IHotelSearchParams>) => void;
  setCalendarVisible: (visible: boolean) => void;
}

export const useHotelStore = create<HotelState>((set) => ({
  searchParams: {
    city: '上海',
    startDate: '2026-02-04',
    endDate: '2026-02-05',
    keyword: ''
  },
  calendarVisible: false,
  setSearchParams: (params) => set((state) => ({
    searchParams: { ...state.searchParams, ...params }
  })),
  setCalendarVisible: (visible) => set({ calendarVisible: visible }),
}));