import { create } from 'zustand';
import { IUser } from '../types';

interface AppState {
  user: IUser | null;
  isPC: boolean; // 标识当前是否为 PC 端
  login: (user: IUser) => void;
  logout: () => void;
  setDevice: (isPC: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isPC: false, // 默认为移动端，后续可通过 Taro.getSystemInfoSync 更新
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
  setDevice: (isPC) => set({ isPC }),
}));
