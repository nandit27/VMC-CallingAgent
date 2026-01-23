import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ActivityChart = ({ data, period, onPeriodChange }) => {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Activity Trend</h3>
                    <p className="text-sm text-gray-500">Complaint volume over time</p>
                </div>
                {/* Period Toggle */}
                <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button
                        onClick={() => onPeriodChange('weekly')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Weekly
                    </button>
                    <button
                        onClick={() => onPeriodChange('monthly')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
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
                            cursor={{ fill: '#f9fafb' }}
                            contentStyle={{
                                backgroundColor: '#1f2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Bar
                            dataKey="count"
                            fill="#3b82f6"
                            radius={[6, 6, 0, 0]}
                            barSize={32}
                            name="Complaints"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityChart;
