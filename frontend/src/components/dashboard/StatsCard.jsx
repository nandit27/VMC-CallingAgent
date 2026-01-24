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
                    iconBg: 'bg-orange-50',
                    iconText: 'text-orange-600',
                    trendColor: 'text-orange-600'
                };
            case 'accent': // High Priority (Red)
                return {
                    border: 'border-red-500',
                    iconBg: 'bg-red-50',
                    iconText: 'text-red-600',
                    trendColor: 'text-red-600'
                };
            case 'success': // Resolved (Green)
                return {
                    border: 'border-green-500',
                    iconBg: 'bg-green-50',
                    iconText: 'text-green-600',
                    trendColor: 'text-green-600'
                };
            case 'primary': // Total (Blue)
            default:
                if (title === 'Resolved') { // Fallback
                    return {
                        border: 'border-green-500',
                        iconBg: 'bg-green-50',
                        iconText: 'text-green-600',
                        trendColor: 'text-green-600'
                    };
                }
                return {
                    border: 'border-blue-500',
                    iconBg: 'bg-blue-50',
                    iconText: 'text-blue-600',
                    trendColor: 'text-blue-600'
                };
        }
    };

    const colors = getColors();

    return (
        <div className={`group bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${colors.border}`}>
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {title}
                    </p>
                    <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {value}
                    </h3>

                    {/* Trend / Change Indicator (Optional) */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-green-600' : colors.trendColor}`}>
                            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                            <span>{Math.abs(change)}%</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">from last month</span>
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
