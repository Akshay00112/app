import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark'); // default dark to match web

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const stored = await AsyncStorage.getItem('theme');
                if (stored) setTheme(stored);
            } catch (e) {
                // ignore
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        const saveTheme = async () => {
            try {
                await AsyncStorage.setItem('theme', theme);
            } catch (e) {
                // ignore
            }
        };
        saveTheme();
    }, [theme]);

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
