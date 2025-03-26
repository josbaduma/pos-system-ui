// src/store/authStore.ts
import { create } from 'zustand';

type AuthState = {
  token: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('jwtToken'),
  isAuthenticated: !!localStorage.getItem('jwtToken'),
  setToken: (token: string) => {
    localStorage.setItem('jwtToken', token);
    set({ token, isAuthenticated: true });
  },
  clearToken: () => {
    localStorage.removeItem('jwtToken');
    set({ token: null, isAuthenticated: false });
  },
}));
