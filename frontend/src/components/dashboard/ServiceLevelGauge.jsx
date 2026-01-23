import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Completed', value: 90.5 },
    { name: 'Remaining', value: 9.5 },
];

const COLORS = ['#A4FF23', '#333333'];

const ServiceLevelGauge = () => {
    return (
        <div className="bg-surface p-6 rounded-3xl border border-gray-800 flex flex-col items-center justify-center h-full relative overflow-hidden">
            <h3 className="text-white font-bold text-lg absolute top-6 left-6">Service Level</h3>

            <div className="w-full h-[180px] mt-8">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={180}
                            endAngle={0}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[10%] text-center mt-4">
                <p className="text-3xl font-bold text-white">90.5%</p>
                <p className="text-xs text-muted">Target met</p>
            </div>

            <div className="flex justify-between w-full mt-auto px-4">
                <div className="text-center">
                    <p className="text-xs text-muted">Expected</p>
                    <p className="font-bold text-white">95%</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-muted">Current</p>
                    <p className="font-bold text-primary">90.5%</p>
                </div>
            </div>
        </div>
    );
};

export default ServiceLevelGauge;
