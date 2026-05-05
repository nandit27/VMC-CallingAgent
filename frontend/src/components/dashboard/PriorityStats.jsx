
import React from 'react';
import { AlertTriangle, Zap, CheckCircle, Info } from 'lucide-react';

const PriorityStats = ({ stats }) => {
    // Stats: { critical: 0, high: 0, medium: 0, low: 0 }

    if (!stats) return null;

    const items = [
        {
            label: "Critical",
            count: stats.critical || 0,
            color: "text-red-400",
            bg: "bg-red-500/10",
            border: "border-red-500/20",
            icon: AlertTriangle
        },
        {
            label: "High",
            count: stats.high || 0,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
            icon: Zap
        },
        {
            label: "Medium",
            count: stats.medium || 0,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            icon: Info
        },
        {
            label: "Low",
            count: stats.low || 0,
            color: "text-gray-400",
            bg: "bg-white/5",
            border: "border-white/10",
            icon: CheckCircle
        }
    ];

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" />
                Priority Breakdown
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${item.bg} ${item.border} transition-transform hover:scale-[1.02]`}
                    >
                        <div className={`p-2 rounded-full bg-white/10 mb-2 shadow-sm ${item.color}`}>
                            <item.icon size={20} />
                        </div>
                        <span className={`text-2xl font-bold ${item.color}`}>
                            {item.count}
                        </span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PriorityStats;
