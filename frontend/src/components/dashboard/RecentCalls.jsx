import React from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, MoreHorizontal } from 'lucide-react';

const calls = [
    { id: 1, name: 'Esther Howard', type: 'incoming', date: 'Today, 10:24 AM', duration: '05:21', status: 'Completed' },
    { id: 2, name: 'Floyd Miles', type: 'outgoing', date: 'Today, 09:12 AM', duration: '03:45', status: 'Completed' },
    { id: 3, name: 'Annette Black', type: 'missed', date: 'Today, 08:30 AM', duration: '00:00', status: 'Missed' },
    { id: 4, name: 'Ralph Edwards', type: 'incoming', date: 'Yesterday, 04:50 PM', duration: '12:05', status: 'Completed' },
    { id: 5, name: 'Jerome Bell', type: 'outgoing', date: 'Yesterday, 02:15 PM', duration: '04:12', status: 'Completed' },
];

const RecentCalls = () => {
    return (
        <div className="bg-surface p-6 rounded-3xl border border-gray-800 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Recent Calls</h2>
                <button className="text-muted hover:text-white transition-colors">See All</button>
            </div>

            <div className="flex flex-col gap-4">
                {calls.map((call) => (
                    <div key={call.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-2xl transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${call.type === 'incoming' ? 'bg-primary/20 text-primary' :
                                    call.type === 'outgoing' ? 'bg-accent/20 text-accent' : 'bg-red-500/20 text-red-500'
                                }`}>
                                {call.type === 'incoming' && <PhoneIncoming size={18} />}
                                {call.type === 'outgoing' && <PhoneOutgoing size={18} />}
                                {call.type === 'missed' && <PhoneMissed size={18} />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-white">{call.name}</h4>
                                <p className="text-xs text-muted">{call.date}</p>
                            </div>
                        </div>

                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white">{call.duration}</p>
                            <p className={`text-xs ${call.status === 'Missed' ? 'text-red-500' : 'text-green-500'}`}>{call.status}</p>
                        </div>

                        <button className="text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentCalls;
