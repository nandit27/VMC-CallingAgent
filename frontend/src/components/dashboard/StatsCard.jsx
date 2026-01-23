import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatsCard = ({ title, value, change, trend, icon: Icon, color }) => {
    const isPositive = trend === 'up';

    return (
        <div className="bg-surface p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-opacity-10 ${color === 'primary' ? 'bg-primary text-primary' : color === 'secondary' ? 'bg-secondary text-secondary' : 'bg-accent text-accent'}`}>
                    <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    <span>{Math.abs(change)}%</span>
                </div>
            </div>

            <h3 className="text-muted text-sm font-medium mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors">{value}</p>
        </div>
    );
};

export default StatsCard;
