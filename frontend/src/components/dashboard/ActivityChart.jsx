import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ActivityChart = ({ data, period, onPeriodChange }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white">Activity Trend</h3>
                    <p className="text-sm text-gray-400">Complaint volume over time</p>
                </div>
                {/* Period Toggle */}
                <div className="bg-white/5 p-1 rounded-xl flex border border-white/10">
                    <button
                        onClick={() => onPeriodChange('weekly')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === 'weekly' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => onPeriodChange('monthly')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === 'monthly' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#18181b',
                                border: '1px solid #3f3f46',
                                borderRadius: '8px',
                                color: '#fff',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6, fill: '#2563eb' }}
                            name="Complaints"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityChart;
