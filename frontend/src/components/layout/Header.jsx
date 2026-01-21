import React from 'react';
import { Bell, Search } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-64 z-40 px-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 max-w-md focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                <Search size={18} className="text-slate-400 mr-3" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
                />
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-slate-500 hover:text-indigo-600 transition-colors">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        AD
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-slate-700 leading-none">Admin User</p>
                        <p className="text-xs text-slate-500 mt-1">Manager</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
