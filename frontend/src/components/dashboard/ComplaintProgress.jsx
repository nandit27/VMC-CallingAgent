import React from 'react';

const ProgressBar = ({ label, percentage, count, color, barColor }) => {
    // Determine bar color classes based on the prop
    let bgColorClass = 'bg-white/10';
    let fillClass = 'bg-blue-600';

    if (barColor === 'green') {
        fillClass = 'bg-emerald-500';
    } else if (barColor === 'orange') {
        fillClass = 'bg-orange-500';
    } else if (barColor === 'red') {
        fillClass = 'bg-red-500';
    }

    return (
        <div className="mb-6 last:mb-0">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">{label}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-white">{count}</span>
                    <span className="text-xs text-gray-400">({percentage}%)</span>
                </div>
            </div>
            <div className={`w-full rounded-full h-3 ${bgColorClass}`}>
                <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out ${fillClass}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const ComplaintProgress = ({ total, resolved, pending, highPriority }) => {
    // Safe calculation to avoid division by zero
    const calculatePercent = (val) => {
        if (!total || total === 0) return 0;
        return Math.round((val / total) * 100);
    };

    const resolvedPct = calculatePercent(resolved);
    const pendingPct = calculatePercent(pending);
    // High Priority is a subset, not necessarily adding up to 100% with others
    const hpPct = calculatePercent(highPriority);

    return (
        <div className="h-full flex flex-col justify-center">
            <h3 className="text-lg font-bold text-white mb-6">Complaint Status</h3>

            <ProgressBar
                label="Resolved Complaints"
                percentage={resolvedPct}
                count={resolved}
                barColor="green"
            />

            <ProgressBar
                label="Pending Complaints"
                percentage={pendingPct}
                count={pending}
                barColor="orange"
            />

            <ProgressBar
                label="High Priority"
                percentage={hpPct}
                count={highPriority}
                barColor="red"
            />
        </div>
    );
};

export default ComplaintProgress;
