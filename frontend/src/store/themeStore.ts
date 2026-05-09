import { create } from 'zustand';

interface ThemeStore {
  isDark: boolean;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: localStorage.getItem('theme') === 'dark',
  toggle: () => set((state) => {
    const next = !state.isDark;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    return { isDark: next };
  }),
}));