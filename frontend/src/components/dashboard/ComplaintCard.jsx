import React from 'react';
import { MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const ComplaintCard = ({ complaint, onResolve }) => {
    const isResolved = complaint.status === 'Resolved';

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'Medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'Low': return 'text-green-500 bg-green-500/10 border-green-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    return (
        <div className={`bg-surface border ${isResolved ? 'border-green-500/30' : 'border-gray-200'} rounded-2xl p-5 hover:shadow-lg transition-all flex flex-col h-full group shadow-sm`}>
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
                        onClick={() => onResolve(complaint.id)}
                        className="w-full bg-primary text-black py-2 rounded-xl font-bold hover:bg-lime-400 transition-colors shadow-[0_0_15px_rgba(164,255,35,0.2)]"
                    >
                        Mark as Resolve
                    </button>
                )}
            </div>
        </div>
    );
};

export default ComplaintCard;
