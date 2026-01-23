import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', calls: 3000 },
    { name: 'Tue', calls: 3500 },
    { name: 'Wed', calls: 2800 },
    { name: 'Thu', calls: 4200 },
    { name: 'Fri', calls: 3800 },
    { name: 'Sat', calls: 2500 },
    { name: 'Sun', calls: 3200 },
];

const CallVolumeChart = () => {
    return (
        <div className="bg-surface p-6 rounded-3xl border border-gray-800 h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Overall Call Volume</h2>
                <div className="flex gap-2">
                    <span className="text-xs font-medium text-black bg-primary px-3 py-1 rounded-full">Weekly</span>
                    <span className="text-xs font-medium text-muted hover:text-white px-3 py-1 rounded-full cursor-pointer transition-colors">Monthly</span>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#A4FF23" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#A4FF23" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#A0A0A0', fontSize: 12 }}
                            exclude viewBox={{ x: 0, y: 0, width: 0, height: 0 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#A0A0A0', fontSize: 12 }}

                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', borderRadius: '12px' }}
                            itemStyle={{ color: '#A4FF23' }}
                            cursor={{ stroke: '#A4FF23', strokeWidth: 1, strokeDasharray: '5 5' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="calls"
                            stroke="#A4FF23"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCalls)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CallVolumeChart;
