import React, { useMemo, useState } from 'react';
import { Users, Wallet, Clock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import EmployeeList from './EmployeeList';
import PayrollManagement from './PayrollManagement';
import AttendanceManagement from './AttendanceManagement';
import WorkforceDashboardSummary from './WorkforceDashboardSummary';
import { useAuth } from '../../context/AuthContext';

const WorkforceManagement = ({ defaultTab = 'employees' }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const roleName = String(user?.role?.name || user?.role || '').toUpperCase();
    const canViewPayroll = roleName === 'ADMIN' || roleName === 'ROLE_ADMIN' || roleName === 'MANAGER' || roleName === 'ROLE_MANAGER';

    const tabs = useMemo(() => {
        if (!canViewPayroll) {
            return [];
        }
        return [
            { key: 'employees', label: 'Danh sách nhân viên', icon: Users },
            { key: 'attendance', label: 'Chấm công nhân sự', icon: Clock },
            { key: 'payroll', label: 'Tính lương nhân sự', icon: Wallet },
        ];
    }, [canViewPayroll]);

    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const tabFromQuery = searchParams.get('tab');
    const initialTab = tabs.some((tab) => tab.key === tabFromQuery)
        ? tabFromQuery
        : (tabs.some((tab) => tab.key === defaultTab) ? defaultTab : 'employees');
    const [activeTab, setActiveTab] = useState(initialTab);
    const [payrollRefreshToken, setPayrollRefreshToken] = useState(0);
    const [dashboardFilters, setDashboardFilters] = useState(() => {
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const defaultDueDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);
        return {
            date: now.toISOString().slice(0, 10),
            fromMonth: searchParams.get('fromMonth') || currentMonth,
            toMonth: searchParams.get('toMonth') || currentMonth,
            paymentDueDate: defaultDueDate.toISOString().slice(0, 10),
        };
    });

    const attendanceInitialFilters = useMemo(() => {
        const userId = searchParams.get('userId') || '';
        const month = searchParams.get('fromMonth') || dashboardFilters.fromMonth;
        if (!userId) {
            return null;
        }

        return {
            scope: 'MONTH',
            month,
            userId,
            status: 'ALL',
        };
    }, [searchParams, dashboardFilters.fromMonth]);

    const handleChangeTab = (nextTab) => {
        setActiveTab(nextTab);
        const nextParams = new URLSearchParams(location.search);
        nextParams.set('tab', nextTab);
        navigate({ search: nextParams.toString() }, { replace: true });
    };

    if (!canViewPayroll) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div
                className="z-20 pb-2"
                style={{ top: 'calc(var(--app-header-height, 4rem) + 1rem)' }}
            >
                <WorkforceDashboardSummary
                    filters={dashboardFilters}
                    onFiltersChange={setDashboardFilters}
                    onPayrollPaid={() => setPayrollRefreshToken((prev) => prev + 1)}
                />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleChangeTab(tab.key)}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${isActive
                                ? 'bg-slate-900 text-white'
                                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'}`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'employees' && <EmployeeList />}
            {activeTab === 'attendance' && <AttendanceManagement viewMode="detail" initialFilters={attendanceInitialFilters} />}
            {activeTab === 'payroll' && (
                <PayrollManagement
                    embedded
                    sharedRange={dashboardFilters}
                    reloadToken={payrollRefreshToken}
                />
            )}
        </div>
    );
};

export default WorkforceManagement;
