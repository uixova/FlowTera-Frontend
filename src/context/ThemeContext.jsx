import React, { createContext, useState, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    mode: 'dark',
    accent: '#50e091',
    radius: 'soft'
  });

  useEffect(() => {
    // Altyapı hazır: Şimdilik sadece root'a değişkenleri basıyoruz
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.mode);
    root.style.setProperty('--accent-color', theme.accent);
    
    const radiusMap = { sharp: '0px', soft: '8px', round: '16px', ultra: '24px' };
    root.style.setProperty('--main-radius', radiusMap[theme.radius]);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};