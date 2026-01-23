import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatsCard = ({ title, value, change, trend, icon: Icon, color }) => {
    const isPositive = trend === 'up';

    // Map color prop to specific visual styles
    const getTheme = () => {
        switch (color) {
            case 'secondary': // Pending
                return {
                    bg: 'bg-gradient-to-br from-orange-50 to-amber-100/50',
                    border: 'border-orange-100',
                    iconBg: 'bg-orange-500',
                    text: 'text-orange-900',
                    value: 'text-orange-950',
                    glow: 'shadow-orange-500/20'
                };
            case 'accent': // High Priority
                return {
                    bg: 'bg-gradient-to-br from-red-50 to-rose-100/50',
                    border: 'border-red-100',
                    iconBg: 'bg-red-500',
                    text: 'text-red-900',
                    value: 'text-red-950',
                    glow: 'shadow-red-500/20'
                };
            case 'success': // Resolved (Future proofing)
                return {
                    bg: 'bg-gradient-to-br from-emerald-50 to-green-100/50',
                    border: 'border-green-100',
                    iconBg: 'bg-emerald-500',
                    text: 'text-emerald-900',
                    value: 'text-emerald-950',
                    glow: 'shadow-emerald-500/20'
                };
            case 'primary': // Total
            default:
                if (title === 'Resolved') { // Hack for current dashboard passing 'primary' for resolved
                    return {
                        bg: 'bg-gradient-to-br from-emerald-50 to-green-100/50',
                        border: 'border-green-100',
                        iconBg: 'bg-emerald-500',
                        text: 'text-emerald-900',
                        value: 'text-emerald-950',
                        glow: 'shadow-emerald-500/20'
                    };
                }
                return {
                    bg: 'bg-gradient-to-br from-blue-50 to-indigo-100/50',
                    border: 'border-blue-100',
                    iconBg: 'bg-blue-600',
                    text: 'text-blue-900',
                    value: 'text-blue-950',
                    glow: 'shadow-blue-500/20'
                };
        }
    };

    const theme = getTheme();

    return (
        <div className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group ${theme.bg} ${theme.border} ${theme.glow} shadow-sm`}>
            {/* Decorative Background Element */}
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-xl ${theme.iconBg}`} />

            <div className="relative z-10 flex justify-between items-start mb-4">
                <div className={`p-3.5 rounded-2xl text-white shadow-lg ${theme.iconBg} ${theme.glow}`}>
                    <Icon size={22} className="stroke-[2.5]" />
                </div>

                {/* Trend Badge */}
                <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm text-gray-600">
                    {isPositive ? <ArrowUp size={10} className="text-green-600" /> : <ArrowDown size={10} className="text-red-500" />}
                    <span>{Math.abs(change)}%</span>
                </div>
            </div>

            <div className="relative z-10">
                <h3 className={`text-sm font-bold uppercase tracking-wide opacity-70 mb-1 ${theme.text}`}>{title}</h3>
                <p className={`text-4xl font-extrabold tracking-tight ${theme.value}`}>
                    {value}
                </p>
            </div>
        </div>
    );
};

export default StatsCard;
