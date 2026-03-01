import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import { shiftService } from '../services/shiftService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = authService.getToken();
                const currentUser = authService.getCurrentUser();

                if (token && currentUser) {
                    const isValid = await authService.validateToken();
                    if (isValid) {
                        setUser(currentUser);
                        setIsAuthenticated(true);
                    } else {
                        authService.clearAuthData();
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                authService.clearAuthData();
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const data = await authService.login(username, password);
            setUser(data);
            setIsAuthenticated(true);
            
            // Auto clock in when user logs in
            try {
                await shiftService.clockIn({
                    userId: data.id,
                    clockInTime: new Date().toISOString(),
                    location: 'Office' // You can add GPS location here
                });
            } catch (clockinError) {
                console.warn('Failed to auto clock-in:', clockinError.message);
                // Don't throw error - login should still succeed even if clockin fails
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
    };

    if (isLoading) {
        return (
            <AuthContext.Provider value={value}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AuthContext.Provider>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

