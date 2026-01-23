import React from 'react';
import { MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const ComplaintCard = ({ complaint, onResolve }) => {
    const isResolved = complaint.status === 'Resolved';

    const getSeverityColor = (severity) => {
        const sev = severity.toLowerCase();
        if (sev === 'critical' || sev === 'high') return 'text-red-600 bg-red-50 border-red-200';
        if (sev === 'medium') return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const isHighPriority = complaint.severity.toLowerCase() === 'high' || complaint.severity.toLowerCase() === 'critical';

    return (
        <div className={`bg-white border rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col h-full group shadow-sm ${isResolved ? 'border-green-500/30' : (isHighPriority ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-gray-200')
            }`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(complaint.severity)}`}>
                    {complaint.severity} Priority
                </div>
                <span className="text-xs text-muted font-mono">#{complaint.id}</span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{complaint.issueType}</h3>
            <p className="text-muted text-sm mb-4 line-clamp-2 flex-1">{complaint.description}</p>

            <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <MapPin size={14} />
                <span>{complaint.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted mb-6">
                <Clock size={14} />
                <span>{complaint.timestamp}</span>
            </div>

            <div className="mt-auto">
                {isResolved ? (
                    <div className="w-full bg-green-500/20 text-green-500 py-2 rounded-xl flex items-center justify-center gap-2 font-medium">
                        <CheckCircle size={18} />
                        Resolved
                    </div>
                ) : (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onResolve(complaint.id);
                        }}
                        className="w-full bg-primary text-black py-2 rounded-xl font-bold hover:bg-lime-400 transition-colors shadow-[0_0_15px_rgba(164,255,35,0.2)]"
                    >
                        Mark as Resolved
                    </button>
                )}
            </div>
        </div>
    );
};

export default ComplaintCard;
