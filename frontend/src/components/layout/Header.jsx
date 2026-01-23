import React from 'react';
import { Search, Bell, ChevronDown, Building2 } from 'lucide-react';

const Header = () => {
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

                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                        JD
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900">John Doe</p>
                        <p className="text-xs text-muted">Zone Officer</p>
                    </div>
                    <ChevronDown size={16} className="text-muted" />
                </div>
            </div>
        </header>
    );
};

export default Header;
