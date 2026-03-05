import React, { useMemo, useState } from 'react';
import { Users, Wallet, Clock } from 'lucide-react';
import EmployeeList from './EmployeeList';
import PayrollManagement from './PayrollManagement';
import AttendanceManagement from './AttendanceManagement';
import { useAuth } from '../../context/AuthContext';

const WorkforceManagement = ({ defaultTab = 'employees' }) => {
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

    const initialTab = tabs.some((tab) => tab.key === defaultTab) ? defaultTab : 'employees';
    const [activeTab, setActiveTab] = useState(initialTab);

    if (!canViewPayroll) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="sticky top-20 z-20 bg-slate-50/95 backdrop-blur-sm pb-2">
                <AttendanceManagement viewMode="summary" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
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
            {activeTab === 'attendance' && <AttendanceManagement viewMode="detail" />}
            {activeTab === 'payroll' && <PayrollManagement />}
        </div>
    );
};

export default WorkforceManagement;
