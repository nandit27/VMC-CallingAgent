import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Building2, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);

    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { username: 'Admin', role: 'Administrator' };

    const initials = user.username ? user.username.substring(0, 2).toUpperCase() : 'AD';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Departments', path: '/departments' },
        { name: 'Complaints', path: '/complaints' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/20 border-b border-white/10 mb-6">
            <div className="flex justify-between items-center py-4 px-6 md:px-8 max-w-7xl mx-auto">
                {/* Brand / Title */}
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/5 transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white tracking-tight">VMC Admin</h1>
                        <p className="text-xs text-gray-300 font-medium">Command Center</p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-2 bg-white/10 border border-white/10 p-1.5 rounded-full">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300",
                                    isActive
                                        ? "bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                                        : "text-gray-300 hover:text-white hover:bg-white/10"
                                )}
                            >
                                {item.name}
                            </button>
                        );
                    })}
                </nav>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <button className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300">
                        <Bell size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 hover:bg-white/5 transition-colors p-1.5 pr-3 rounded-full border border-transparent hover:border-white/10"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/30">
                                {initials}
                            </div>
                            <div className="hidden md:block text-left mr-1">
                                <p className="text-sm font-semibold text-white capitalize leading-none">{user.username}</p>
                            </div>
                            <ChevronDown size={14} className={cn("text-gray-300 transition-transform duration-300", showDropdown && "rotate-180")} />
                        </button>

                        {/* Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                                    <p className="text-xs font-medium text-gray-300">Signed in as</p>
                                    <p className="text-sm text-white truncate font-semibold mt-0.5">{user.username}</p>
                                </div>
                                <div className="p-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl flex items-center gap-2 transition-all font-medium"
                                    >
                                        <LogOut size={16} />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
