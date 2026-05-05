import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatsCard = ({ title, value, change, trend, icon: Icon, color }) => {
    const isPositive = trend === 'up';

    // Modern Professional Color Mapping
    const getColors = () => {
        switch (color) {
            case 'secondary': // Pending (Orange)
                return {
                    border: 'border-orange-500',
                    iconBg: 'bg-orange-500/10',
                    iconText: 'text-orange-400',
                    trendColor: 'text-orange-400'
                };
            case 'accent': // High Priority (Red)
                return {
                    border: 'border-red-500',
                    iconBg: 'bg-red-500/10',
                    iconText: 'text-red-400',
                    trendColor: 'text-red-400'
                };
            case 'success': // Resolved (Green)
                return {
                    border: 'border-green-500',
                    iconBg: 'bg-green-500/10',
                    iconText: 'text-green-400',
                    trendColor: 'text-green-400'
                };
            case 'primary': // Total (Blue)
            default:
                if (title === 'Resolved') { // Fallback
                    return {
                        border: 'border-green-500',
                        iconBg: 'bg-green-500/10',
                        iconText: 'text-green-400',
                        trendColor: 'text-green-400'
                    };
                }
                return {
                    border: 'border-blue-500',
                    iconBg: 'bg-blue-500/10',
                    iconText: 'text-blue-400',
                    trendColor: 'text-blue-400'
                };
        }
    };

    const colors = getColors();

    return (
        <div className={`group bg-surface rounded-xl shadow-sm border border-white/10 p-6 border-l-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${colors.border}`}>
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">
                        {title}
                    </p>
                    <h3 className="text-3xl font-extrabold text-white tracking-tight">
                        {value}
                    </h3>

                    {/* Trend / Change Indicator (Optional) */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-400' : colors.trendColor}`}>
                            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            <span>{Math.abs(change)}%</span>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">from last month</span>
                    </div>
                </div>

                {/* Icon Container */}
                <div className={`p-3 rounded-xl transition-colors duration-300 group-hover:bg-opacity-100 ${colors.iconBg} ${colors.iconText}`}>
                    <Icon size={24} strokeWidth={2} />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
