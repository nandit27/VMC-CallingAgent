import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatsCard = ({ title, value, change, trend, icon: Icon, color }) => {
    const isPositive = trend === 'up';

    // Map color prop to specific visual styles matching the requested design
    const getTheme = () => {
        switch (color) {
            case 'secondary': // Pending Actions (Orange)
                return {
                    bg: 'bg-[#FFF9F0]', // Light orange/cream
                    iconBg: 'bg-[#FD7E14]', // Orange
                    iconColor: 'text-white',
                    titleColor: 'text-[#8C5E3C]', // Brownish
                    valueColor: 'text-[#3E2C22]', // Dark Orange/Brown
                    trendBg: 'bg-white',
                    trendText: 'text-gray-600'
                };
            case 'accent': // High Priority (Red)
                return {
                    bg: 'bg-[#FFF0F0]', // Light pink/red
                    iconBg: 'bg-[#FA5252]', // Red
                    iconColor: 'text-white',
                    titleColor: 'text-[#8B3E3E]', // Reddish brown
                    valueColor: 'text-[#2D0F0F]', // Dark Red
                    trendBg: 'bg-white',
                    trendText: 'text-gray-600'
                };
            case 'success': // Resolved (Green)
                return {
                    bg: 'bg-[#F0FFF4]', // Light mint
                    iconBg: 'bg-[#10B981]', // Green
                    iconColor: 'text-white',
                    titleColor: 'text-[#2D6A4F]', // Greenish
                    valueColor: 'text-[#062C1E]', // Dark Green
                    trendBg: 'bg-white',
                    trendText: 'text-gray-600'
                };
            case 'primary': // Total Complaints (Blue)
            default:
                if (title === 'Resolved') {
                    // Fallback if 'Resolved' is passed with 'primary' color
                    return {
                        bg: 'bg-[#F0FFF4]',
                        iconBg: 'bg-[#10B981]',
                        iconColor: 'text-white',
                        titleColor: 'text-[#2D6A4F]',
                        valueColor: 'text-[#062C1E]',
                        trendBg: 'bg-white',
                        trendText: 'text-gray-600'
                    };
                }
                return {
                    bg: 'bg-[#EFF6FF]', // Light Blue
                    iconBg: 'bg-[#2563EB]', // Blue
                    iconColor: 'text-white',
                    titleColor: 'text-[#3B5B8E]', // Blueish gray
                    valueColor: 'text-[#0F172A]', // Dark blue/black
                    trendBg: 'bg-white',
                    trendText: 'text-gray-600'
                };
        }
    };

    const theme = getTheme();

    return (
        <div className={`relative p-6 rounded-[2rem] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${theme.bg}`}>
            <div className="flex justify-between items-start mb-4">
                {/* Icon Circle */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${theme.iconBg} ${theme.iconColor}`}>
                    <Icon size={20} className="stroke-[2.5]" />
                </div>

                {/* Trend Badge */}
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${theme.trendBg} ${theme.trendText}`}>
                    {isPositive ? <ArrowUp size={10} className="text-green-500" /> : <ArrowDown size={10} className="text-red-500" />}
                    <span>{Math.abs(change)}%</span>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <h3 className={`text-[11px] font-bold uppercase tracking-wider ${theme.titleColor}`}>
                    {title}
                </h3>
                <p className={`text-4xl font-extrabold tracking-tight ${theme.valueColor}`}>
                    {value}
                </p>
            </div>
        </div>
    );
};

export default StatsCard;


