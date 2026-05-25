import React, { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { isDemoMode } from '../utils/demo';

// Tip Tanımlamaları
export type ThemeMode = 'light' | 'dark';
export type ThemeRadius = 'sharp' | 'soft' | 'round' | 'ultra';

export interface ThemeState {
    mode: ThemeMode;
    accent: string;
    radius: ThemeRadius;
}

export interface ThemeContextType {
    theme: ThemeState;
    setTheme: React.Dispatch<React.SetStateAction<ThemeState>>;
    toggleMode: () => void;
}

// Context'in kendisi (Dosya dışından erişilmesine gerek yok, o yüzden export etmiyoruz)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Kolay tüketim için Hook
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme, ThemeProvider içinde kullanılmalıdır!');
    }
    return context;
};

const THEME_STORAGE_KEY = 'app_theme';

// Record<ThemeRadius, string> ile haritanın sadece belirlediğimiz radius tiplerini almasını zorunlu kıldık
const RADIUS_MAP: Record<ThemeRadius, string> = { 
    sharp: '0px', 
    soft: '8px', 
    round: '16px', 
    ultra: '24px' 
};

const DEFAULT_THEME: ThemeState = { 
    mode: 'dark', 
    accent: '#50e091', 
    radius: 'soft' 
};

const themeStorage = () => isDemoMode() ? sessionStorage : localStorage;

const loadPersistedTheme = (): ThemeState => {
    try {
        const stored = (isDemoMode() ? sessionStorage : localStorage).getItem(THEME_STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_THEME, ...JSON.parse(stored) };
        }
    } catch {
        // Bozuk veri varsa varsayılanı kullan
    }
    return DEFAULT_THEME;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [theme, setTheme] = useState<ThemeState>(loadPersistedTheme);

    useEffect(() => {
        const root = document.documentElement;

        // data-theme — variables.css [data-theme="light/dark"] bloklarını tetikler
        root.setAttribute('data-theme', theme.mode);

        // color-scheme — tarayıcının native scroll, input, select renklerini ayarlar
        root.style.colorScheme = theme.mode;

        // Accent ve radius — ThemeContext'in JS tarafı
        root.style.setProperty('--accent-color', theme.accent);
        root.style.setProperty('--main-radius', RADIUS_MAP[theme.radius] ?? '8px');

        try {
            themeStorage().setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
        } catch {
            // Storage dolu veya erişim engeli varsa sessizce başarısız olsun
        }
    }, [theme]);

    // Sadece mode'u tersine çevir
    const toggleMode = () =>
        setTheme(prev => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' }));

    const value = useMemo(() => ({ theme, setTheme, toggleMode }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};