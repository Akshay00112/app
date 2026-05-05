import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pdfHistory, setPdfHistory] = useState([]);

    // Load token from storage on mount
    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                } else {
                    setLoading(false);
                }
            } catch (e) {
                console.warn('Failed to load token:', e);
                setLoading(false);
            }
        };
        loadToken();
    }, []);

    const logout = useCallback(async () => {
        setToken(null);
        setUser(null);
        setPdfHistory([]);
        await AsyncStorage.removeItem('token');
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            const response = await api.get('/api/history');
            if (response.data.success) {
                setPdfHistory(response.data.history || []);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    }, []);

    // Verify token and get user when token changes
    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                try {
                    await AsyncStorage.setItem('token', token);
                    const response = await api.get('/api/auth/me');
                    if (response.data.success) {
                        setUser(response.data.user);
                        await fetchHistory();
                    } else {
                        await logout();
                    }
                } catch (error) {
                    console.error('Token verification failed:', error);
                    await logout();
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, [token, fetchHistory, logout]);

    const login = useCallback(async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            if (response.data.success) {
                setToken(response.data.access_token);
                setUser(response.data.user);
                return { success: true, user: response.data.user };
            }
            return { success: false, error: response.data.error };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed',
            };
        }
    }, []);

    const register = useCallback(async (name, email, password) => {
        try {
            const response = await api.post('/api/auth/register', { name, email, password });
            if (response.data.success) {
                setToken(response.data.access_token);
                setUser(response.data.user);
                return { success: true, user: response.data.user };
            }
            return { success: false, error: response.data.error };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed',
            };
        }
    }, []);

    const addToHistory = useCallback(async (pdfData) => {
        try {
            const response = await api.post('/api/history', pdfData);
            if (response.data.success) {
                await fetchHistory();
                return response.data.history_id;
            }
        } catch (error) {
            console.error('Failed to add to history:', error);
        }
        return null;
    }, [fetchHistory]);

    const deleteFromHistory = useCallback(async (historyId) => {
        try {
            const response = await api.delete(`/api/history/${historyId}`);
            if (response.data.success) {
                setPdfHistory((prev) => prev.filter((item) => item.id !== historyId));
                return true;
            }
        } catch (error) {
            console.error('Failed to delete from history:', error);
        }
        return false;
    }, []);

    const cleanupDuplicates = useCallback(async () => {
        try {
            const response = await api.post('/api/history/cleanup/duplicates');
            if (response.data.success) {
                await fetchHistory();
                return response.data.deleted_count;
            }
        } catch (error) {
            console.error('Failed to cleanup duplicates:', error);
        }
        return 0;
    }, [fetchHistory]);

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        pdfHistory,
        fetchHistory,
        addToHistory,
        deleteFromHistory,
        cleanupDuplicates,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
