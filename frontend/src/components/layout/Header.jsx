import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Building2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
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

    return (
        <header className="flex justify-between items-center py-6 px-8 border-b border-gray-200 mb-6 bg-white/80 backdrop-blur-md sticky top-0 z-50">

            {/* Brand / Title */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <Building2 size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vadodara Municipal Corporation</h1>
                    <p className="text-xs text-muted">Citizen Complaint Dashboard</p>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                <button className="relative p-2 text-muted hover:text-gray-900 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-2 w-2 h-2 bg-primary rounded-full"></span>
                </button>

                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-3 pl-6 border-l border-gray-200 hover:bg-gray-50 transition-colors p-2 rounded-lg"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-blue-200">
                            {initials}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-bold text-gray-900 capitalize">{user.username}</p>
                            <p className="text-xs text-muted font-medium capitalize">{user.role || 'Zone Officer'}</p>
                        </div>
                        <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                <p className="text-sm font-bold text-gray-900">Signed in as</p>
                                <p className="text-xs text-gray-500 truncate font-medium">{user.username}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                            >
                                <LogOut size={16} />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
