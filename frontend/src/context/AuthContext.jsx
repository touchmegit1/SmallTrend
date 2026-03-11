import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import authService from '../services/authService';
import { shiftService } from '../services/shiftService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);
const ATTENDANCE_HEARTBEAT_MS = 60 * 1000;

const toHm = (value) => {
    if (!value) return '';
    return String(value).slice(0, 5);
};

const hmToMinutes = (hm) => {
    if (!hm || !/^\d{2}:\d{2}$/.test(hm)) return null;
    const [hours, minutes] = hm.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
};

const minutesToHm = (minutes) => {
    const normalized = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    const hh = String(Math.floor(normalized / 60)).padStart(2, '0');
    const mm = String(normalized % 60).padStart(2, '0');
    return `${hh}:${mm}`;
};

const getNowDateAndHm = () => {
    const now = new Date();
    return {
        date: now.toISOString().slice(0, 10),
        hm: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const attendanceTimerRef = useRef(null);
    const attendanceStateRef = useRef({ userId: null, date: null, timeIn: null, allowedClockInAt: null });

    const clearAttendanceTimer = () => {
        if (attendanceTimerRef.current) {
            clearInterval(attendanceTimerRef.current);
            attendanceTimerRef.current = null;
        }
    };

    const resolveAllowedClockInTime = async (userId, date) => {
        try {
            const assignments = await shiftService.getAssignments({
                userId,
                startDate: date,
                endDate: date,
            });

            if (!Array.isArray(assignments) || assignments.length === 0) {
                return null;
            }

            const firstAssignment = assignments[0];
            const shiftId = firstAssignment?.shift?.id;
            if (!shiftId) {
                return null;
            }

            const shift = await shiftService.getShift(shiftId);
            const shiftStartHm = toHm(shift?.startTime);
            if (!shiftStartHm) {
                return null;
            }

            const startMinutes = hmToMinutes(shiftStartHm);
            if (startMinutes === null) {
                return null;
            }

            const allowEarlyClockIn = Boolean(shift?.allowEarlyClockIn);
            const earlyMinutes = Number(shift?.earlyClockInMinutes || 0);
            if (!allowEarlyClockIn) {
                return shiftStartHm;
            }

            return minutesToHm(startMinutes - (Number.isNaN(earlyMinutes) ? 0 : earlyMinutes));
        } catch (error) {
            return null;
        }
    };

    const ensureAttendanceState = async (userId, date) => {
        const current = attendanceStateRef.current;
        if (current.userId === userId && current.date === date) {
            return current;
        }

        let existingTimeIn = null;
        try {
            const rows = await shiftService.getAttendance({ userId, startDate: date, endDate: date });
            const todayRow = Array.isArray(rows) ? rows.find((item) => item?.date === date) : null;
            existingTimeIn = toHm(todayRow?.timeIn);
        } catch (error) {
            existingTimeIn = null;
        }

        const allowedClockInAt = await resolveAllowedClockInTime(userId, date);
        const nextState = {
            userId,
            date,
            timeIn: existingTimeIn || null,
            allowedClockInAt,
        };
        attendanceStateRef.current = nextState;
        return nextState;
    };

    const syncAttendanceSession = async (userData, mode) => {
        const userId = userData?.id || userData?.userId;
        if (!userId) {
            return;
        }

        const { date, hm } = getNowDateAndHm();
        const state = await ensureAttendanceState(userId, date);

        const nowMinutes = hmToMinutes(hm);
        const allowedMinutes = hmToMinutes(state.allowedClockInAt);

        if (!state.timeIn) {
            if (allowedMinutes !== null && nowMinutes !== null && nowMinutes < allowedMinutes) {
                if (mode === 'LOGOUT') {
                    return;
                }
                return;
            }

            if (allowedMinutes !== null && nowMinutes !== null && nowMinutes >= allowedMinutes) {
                state.timeIn = minutesToHm(allowedMinutes);
            } else {
                state.timeIn = hm;
            }
            attendanceStateRef.current = state;
        }

        const payload = {
            userId,
            date,
            timeIn: state.timeIn,
            timeOut: mode === 'LOGIN' ? null : hm,
            status: 'PRESENT',
        };

        await shiftService.upsertAttendance(payload);
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = authService.getToken();
                const currentUser = authService.getCurrentUser();

                if (token && currentUser) {
                    const isValid = await authService.validateToken();
                    if (isValid) {
                        const meData = await authService.getMe().catch(() => ({}));
                        const profileData = await userService.getMyProfile().catch(() => ({}));
                        const latestUser = { ...currentUser, ...meData, ...profileData };
                        const mergedUser = authService.updateStoredUser(latestUser);
                        setUser(mergedUser);
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
            const meData = await authService.getMe().catch(() => ({}));
            const profileData = await userService.getMyProfile().catch(() => ({}));
            const merged = authService.updateStoredUser({ ...data, ...meData, ...profileData });
            setUser(merged);
            setIsAuthenticated(true);

            clearAttendanceTimer();

            // Auto attendance on login (start/re-open session)
            try {
                await syncAttendanceSession(data, 'LOGIN');
            } catch (clockinError) {
                console.warn('Failed to start attendance session:', clockinError?.message || clockinError);
            }

            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            const currentUser = user || authService.getCurrentUser();
            if (currentUser) {
                try {
                    await syncAttendanceSession(currentUser, 'LOGOUT');
                } catch (error) {
                    console.warn('Failed to finalize attendance on logout:', error?.message || error);
                }
            }

            await authService.logout();
        } finally {
            clearAttendanceTimer();
            attendanceStateRef.current = { userId: null, date: null, timeIn: null, allowedClockInAt: null };
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || !user) {
            clearAttendanceTimer();
            return;
        }

        (async () => {
            try {
                await syncAttendanceSession(user, 'LOGIN');
            } catch (error) {
                console.warn('Failed to initialize attendance session:', error?.message || error);
            }
        })();

        clearAttendanceTimer();
        attendanceTimerRef.current = setInterval(async () => {
            try {
                await syncAttendanceSession(user, 'HEARTBEAT');
            } catch (error) {
                console.warn('Attendance heartbeat failed:', error?.message || error);
            }
        }, ATTENDANCE_HEARTBEAT_MS);

        return () => clearAttendanceTimer();
    }, [isAuthenticated, user]);

    const updateAuthUser = (updates) => {
        const nextUser = authService.updateStoredUser(updates);
        setUser(nextUser);
        return nextUser;
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateAuthUser,
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

