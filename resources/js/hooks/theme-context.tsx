import React, { createContext, useContext } from 'react';
import { useAppearance } from './use-appearance';

type ThemeContextType = {
    theme: 'light' | 'dark';
    isDark: boolean;
    isLight: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { resolvedAppearance } = useAppearance();

    return (
        <ThemeContext.Provider value={{
            theme: resolvedAppearance,
            isDark: resolvedAppearance === 'dark',
            isLight: resolvedAppearance === 'light'
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
