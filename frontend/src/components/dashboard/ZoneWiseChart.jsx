import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ZoneWiseChart = ({ data }) => {
    // If no data provided, use placeholder data
    const chartData = data && data.length > 0 ? data : [
        { name: 'Zone East', complaints: 12 },
        { name: 'Zone West', complaints: 19 },
        { name: 'Zone North', complaints: 8 },
        { name: 'Zone South', complaints: 15 },
    ];

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-800 text-lg font-bold">Zone-wise Complaints</h3>
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                        barSize={40}
                    >
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f9fafb' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-gray-900 text-white text-sm py-2 px-3 rounded-lg shadow-xl">
                                            <p className="font-medium mb-1">{label}</p>
                                            <p className="font-bold text-indigo-300">
                                                {payload[0].value} Complaints
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="complaints"
                            radius={[6, 6, 0, 0]}
                            fill="url(#barGradient)"
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ZoneWiseChart;
