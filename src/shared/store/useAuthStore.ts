import { create } from 'zustand';
import { IUser, UserRole } from '../types/user';

interface AuthState {
  user: IUser | null;
  isLoggedIn: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  // 模拟登录，直接根据角色设置用户
  login: (role) => set({ 
    isLoggedIn: true, 
    user: { id: '1', username: '测试用户', role } 
  }),
  logout: () => set({ user: null, isLoggedIn: false }),
}));