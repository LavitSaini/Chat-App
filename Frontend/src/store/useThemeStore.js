import {create} from "zustand";

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem('theme') || 'nord',
    setTheme: (theme) => {
        localStorage.setItem('theme', theme);
        set({theme});
    }
}));