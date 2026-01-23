import React, { useState } from 'react';
import { Phone, PhoneIncoming, AlertCircle, CheckCircle } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ComplaintCard from '../components/dashboard/ComplaintCard';

// Mock Data
const initialComplaints = [
    {
        id: 'VMC-2023-001',
        citizenName: 'Ramesh Patel',
        issueType: 'Water Leakage',
        description: 'Severe water leakage in the main pipeline near Sayaji Garden. Water is being wasted for 2 days.',
        location: 'Sayaji Gunj, Ward 4',
        status: 'Pending',
        severity: 'High',
        timestamp: 'Today, 09:30 AM'
    },
    {
        id: 'VMC-2023-002',
        citizenName: 'Sita Sharma',
        issueType: 'Street Light Not Working',
        description: 'Street lights on RP Road have not been working for a week. It is dangerous at night.',
        location: 'Akota, Ward 11',
        status: 'Pending',
        severity: 'Medium',
        timestamp: 'Yesterday, 06:15 PM'
    },
    {
        id: 'VMC-2023-003',
        citizenName: 'Mohammed Ali',
        issueType: 'Garbage Collection',
        description: 'Garbage van did not come to our society for the last 3 days.',
        location: 'Tandalja, Ward 8',
        status: 'Resolved',
        severity: 'Low',
        timestamp: 'Yesterday, 10:00 AM'
    },
    {
        id: 'VMC-2023-004',
        citizenName: 'Priya Desai',
        issueType: 'Pot Holes',
        description: 'Large pothole near the school entrance causing traffic jams.',
        location: 'Manjalpur, Ward 12',
        status: 'Pending',
        severity: 'High',
        timestamp: '22 Jan, 04:45 PM'
    },
    {
        id: 'VMC-2023-005',
        citizenName: 'Vikram Singh',
        issueType: 'Drainage Overflow',
        description: 'Drainage water overflowing on the street presenting health hazards.',
        location: 'Karelibaug, Ward 2',
        status: 'Pending',
        severity: 'High',
        timestamp: '22 Jan, 02:20 PM'
    },
];

const Dashboard = () => {
    const [complaints, setComplaints] = useState(initialComplaints);

    const handleResolve = (id) => {
        setComplaints(prev => prev.map(c =>
            c.id === id ? { ...c, status: 'Resolved' } : c
        ));
    };

    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
    const pendingComplaints = totalComplaints - resolvedComplaints;
    const highPriority = complaints.filter(c => c.severity === 'High').length;

    return (
        <div className="flex flex-col gap-8 pb-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Complaints"
                    value={totalComplaints}
                    change={5.2}
                    trend="up"
                    icon={Phone}
                    color="primary"
                />
                <StatsCard
                    title="Pending Actions"
                    value={pendingComplaints}
                    change={2.1}
                    trend="up"
                    icon={AlertCircle}
                    color="secondary"
                />
                <StatsCard
                    title="Resolved"
                    value={resolvedComplaints}
                    change={12.5}
                    trend="up"
                    icon={CheckCircle}
                    color="primary"
                />
                <StatsCard
                    title="High Priority"
                    value={highPriority}
                    change={0.5}
                    trend="down"
                    icon={AlertCircle}
                    color="accent"
                />
            </div>

            {/* Complaints Grid */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Citizen Complaints</h2>
                    <div className="flex gap-2">
                        <select className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400 shadow-sm">
                            <option>All Wards</option>
                            <option>Ward 1</option>
                            <option>Ward 2</option>
                        </select>
                        <select className="bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400 shadow-sm">
                            <option>All Status</option>
                            <option>Pending</option>
                            <option>Resolved</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {complaints.map(complaint => (
                        <ComplaintCard
                            key={complaint.id}
                            complaint={complaint}
                            onResolve={handleResolve}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
