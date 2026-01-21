import React from 'react';
import { TrendingUp, Users, DollarSign, ShoppingBag } from 'lucide-react';

const Dashboard = () => {
    const stats = [
        { label: 'Total Sales', value: '$12,345', trend: '+12%', icon: DollarSign, color: 'bg-green-500' },
        { label: 'Total Orders', value: '1,234', trend: '+5%', icon: ShoppingBag, color: 'bg-blue-500' },
        { label: 'New Customers', value: '321', trend: '+18%', icon: Users, color: 'bg-purple-500' },
        { label: 'Revenue', value: '$45,678', trend: '+8%', icon: TrendingUp, color: 'bg-orange-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-sm font-medium">
                    Download Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-800 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-black/10`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-green-500 font-medium bg-green-50 px-2 py-0.5 rounded-full">{stat.trend}</span>
                            <span className="text-slate-400 ml-2">from last month</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Sales Overview</h3>
                    <div className="flex-1 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50/50">
                        Chart Area
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Invoices</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs">UD</div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">User Demo {i}</p>
                                        <p className="text-xs text-slate-400">2 mins ago</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-700">+$120.00</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
