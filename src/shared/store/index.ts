import { create } from 'zustand';
import { IUser } from '../types';
import { LocalStorage, STORAGE_KEYS } from '../utils/LocalStorage';

interface AppState {
  user: IUser | null;
  isPC: boolean;
  isLogin: boolean;
  login: (user: IUser) => void;
  logout: () => void;
  setDevice: (isPC: boolean) => void;
}

// 初始化状态时尝试从 LocalStorage 恢复
const getInitialUser = (): IUser | null => {
  return LocalStorage.get<IUser>(STORAGE_KEYS.USER, null);
};

export const useStore = create<AppState>((set) => ({
  user: getInitialUser(),
  isPC: false,
  isLogin: !!getInitialUser(),
  login: (user) => {
    LocalStorage.set(STORAGE_KEYS.USER, user);
    set({ user, isLogin: true });
  },
  logout: () => {
    LocalStorage.remove(STORAGE_KEYS.USER);
    set({ user: null, isLogin: false });
  },
  setDevice: (isPC) => set({ isPC }),
}));
