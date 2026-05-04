import React, { createContext, useState, useEffect, useMemo } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'app_theme';
const RADIUS_MAP = { sharp: '0px', soft: '8px', round: '16px', ultra: '24px' };
const DEFAULT_THEME = { mode: 'dark', accent: '#50e091', radius: 'soft' };

const loadPersistedTheme = () => {
    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored) return { ...DEFAULT_THEME, ...JSON.parse(stored) };
    } catch {
        // Bozuk veri varsa varsayılanı kullan
    }
    return DEFAULT_THEME;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(loadPersistedTheme);

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme.mode);
        root.style.setProperty('--accent-color', theme.accent);
        root.style.setProperty('--main-radius', RADIUS_MAP[theme.radius] ?? '8px');

        try {
            localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
        } catch {
            // Storage dolu veya erişim engeli varsa sessizce başarısız olsun
        }
    }, [theme]);

    const value = useMemo(() => ({ theme, setTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};