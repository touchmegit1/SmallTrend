import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar
                collapsed={isSidebarCollapsed}
                onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
            />
            <Header
                sidebarCollapsed={isSidebarCollapsed}
            />
            <main className={`${isSidebarCollapsed ? 'pl-20' : 'pl-64'} pt-16 min-h-screen transition-all duration-300`}>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
