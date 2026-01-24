
import React from 'react';
import { AlertTriangle, Zap, CheckCircle, Info } from 'lucide-react';

const PriorityStats = ({ stats }) => {
    // Stats: { critical: 0, high: 0, medium: 0, low: 0 }

    if (!stats) return null;

    const items = [
        {
            label: "Critical",
            count: stats.critical || 0,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200",
            icon: AlertTriangle
        },
        {
            label: "High",
            count: stats.high || 0,
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-200",
            icon: Zap
        },
        {
            label: "Medium",
            count: stats.medium || 0,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200",
            icon: Info
        },
        {
            label: "Low",
            count: stats.low || 0,
            color: "text-gray-600",
            bg: "bg-gray-50",
            border: "border-gray-200",
            icon: CheckCircle
        }
    ];

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-500" />
                Priority Breakdown
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${item.bg} ${item.border} transition-transform hover:scale-[1.02]`}
                    >
                        <div className={`p-2 rounded-full bg-white mb-2 shadow-sm ${item.color}`}>
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
