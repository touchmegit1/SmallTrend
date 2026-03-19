import { createContext, useState, useEffect, useContext, useRef } from 'react';
import authService from '../services/authService';
import { shiftService } from '../services/shiftService';

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

const toLocalIsoDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getNowDateAndHm = () => {
    const now = new Date();
    return {
        date: toLocalIsoDate(now),
        hm: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    };
};

const isExpectedAttendanceError = (error) => {
    const status = error?.response?.status;
    return status === 400;
};

const getAttendanceErrorMessage = (error) => {
    const data = error?.response?.data;
    if (typeof data === 'string' && data.trim()) return data;
    if (typeof data?.message === 'string' && data.message.trim()) return data.message;
    return error?.message || 'Unknown attendance error';
};

const shouldAutoSyncAttendance = (userData) => {
    const role = String(userData?.role?.name || userData?.role || '').toUpperCase();
    return role !== 'ADMIN' && role !== 'ROLE_ADMIN' && role !== 'MANAGER' && role !== 'ROLE_MANAGER';
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const attendanceTimerRef = useRef(null);
    const attendanceStateRef = useRef({ userId: null, date: null, timeIn: null, allowedClockInAt: null, disabled: false });

    const clearAttendanceTimer = () => {
        if (attendanceTimerRef.current) {
            clearInterval(attendanceTimerRef.current);
            attendanceTimerRef.current = null;
        }
    };

    const disableAttendanceSync = () => {
        attendanceStateRef.current = { userId: null, date: null, timeIn: null, allowedClockInAt: null, disabled: true };
    };

    const resetAttendanceSync = () => {
        attendanceStateRef.current = { userId: null, date: null, timeIn: null, allowedClockInAt: null, disabled: false };
    };

    const isAttendanceSyncEnabled = (userData) => {
        if (attendanceStateRef.current.disabled) {
            return false;
        }
        return shouldAutoSyncAttendance(userData);
    };

    const handleAttendanceSyncError = (error) => {
        if (!isExpectedAttendanceError(error)) {
            return false;
        }

        const message = getAttendanceErrorMessage(error).toLowerCase();
        if (message.includes('not assigned') || message.includes('không được phân công') || message.includes('khong duoc phan cong')) {
            disableAttendanceSync();
            clearAttendanceTimer();
            return true;
        }

        return false;
    };

    const resolveAllowedClockInTime = async (userId, date) => {
        try {
            const assignments = await shiftService.getAssignments({
                userId,
                startDate: date,
                endDate: date,
            });

            if (!Array.isArray(assignments) || assignments.length === 0) {
                return { allowedClockInAt: null, hasAssignment: false };
            }

            const firstAssignment = assignments[0];
            const shiftId = firstAssignment?.shift?.id;
            if (!shiftId) {
                return { allowedClockInAt: null, hasAssignment: true };
            }

            const shift = await shiftService.getShift(shiftId);
            const shiftStartHm = toHm(shift?.startTime);
            if (!shiftStartHm) {
                return { allowedClockInAt: null, hasAssignment: true };
            }

            const startMinutes = hmToMinutes(shiftStartHm);
            if (startMinutes === null) {
                return { allowedClockInAt: null, hasAssignment: true };
            }

            const allowEarlyClockIn = Boolean(shift?.allowEarlyClockIn);
            const earlyMinutes = Number(shift?.earlyClockInMinutes || 0);
            if (!allowEarlyClockIn) {
                return { allowedClockInAt: shiftStartHm, hasAssignment: true };
            }

            return {
                allowedClockInAt: minutesToHm(startMinutes - (Number.isNaN(earlyMinutes) ? 0 : earlyMinutes)),
                hasAssignment: true,
            };
        } catch (error) {
            return { allowedClockInAt: null, hasAssignment: false };
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

        const allowedClockInResult = await resolveAllowedClockInTime(userId, date);
        const nextState = {
            userId,
            date,
            timeIn: existingTimeIn || null,
            allowedClockInAt: allowedClockInResult.allowedClockInAt,
            hasAssignment: allowedClockInResult.hasAssignment,
        };
        attendanceStateRef.current = nextState;
        return nextState;
    };

    const syncAttendanceSession = async (userData, mode) => {
        if (!isAttendanceSyncEnabled(userData)) {
            return;
        }

        const fallbackUser = authService.getCurrentUser();
        const rawUserId = userData?.id || userData?.userId || fallbackUser?.id || fallbackUser?.userId;
        const userId = Number(rawUserId);
        if (!Number.isInteger(userId) || userId <= 0) {
            return;
        }

        const { date, hm } = getNowDateAndHm();
        const state = await ensureAttendanceState(userId, date);

        if (!state.hasAssignment) {
            return;
        }

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
                        const latestUser = await authService.getMe().catch(() => currentUser);
                        authService.updateStoredUser(latestUser);
                        setUser(latestUser);
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

            clearAttendanceTimer();
            resetAttendanceSync();

            // Auto attendance on login (start/re-open session)
            try {
                await syncAttendanceSession(data, 'LOGIN');
            } catch (clockinError) {
                if (!handleAttendanceSyncError(clockinError)) {
                    console.warn('Failed to start attendance session:', clockinError?.message || clockinError);
                }
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
            attendanceStateRef.current = { userId: null, date: null, timeIn: null, allowedClockInAt: null, disabled: false };
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
                if (!handleAttendanceSyncError(error) && !isExpectedAttendanceError(error)) {
                    console.warn('Failed to initialize attendance session:', getAttendanceErrorMessage(error));
                }
            }
        })();

        clearAttendanceTimer();
        attendanceTimerRef.current = setInterval(async () => {
            try {
                await syncAttendanceSession(user, 'HEARTBEAT');
            } catch (error) {
                if (handleAttendanceSyncError(error)) {
                    return;
                }
                if (isExpectedAttendanceError(error)) {
                    clearAttendanceTimer();
                    return;
                }
                console.warn('Attendance heartbeat failed:', getAttendanceErrorMessage(error));
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

