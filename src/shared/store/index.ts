import { create } from 'zustand';
import { IUser, UserRole } from '../types';

interface AppState {
  user: IUser | null;
  isPC: boolean;
  isLogin: boolean;
  login: (user: IUser) => void;
  logout: () => void;
  setDevice: (isPC: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isPC: false,
  isLogin: false,
  login: (user) => set({ user, isLogin: true }),
  logout: () => set({ user: null, isLogin: false }),
  setDevice: (isPC) => set({ isPC }),
}));
