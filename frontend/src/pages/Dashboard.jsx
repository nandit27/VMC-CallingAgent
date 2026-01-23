import React, { useState, useEffect } from 'react';
import { Phone, PhoneIncoming, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ComplaintCard from '../components/dashboard/ComplaintCard';

// Mock Data removed - using API


const Dashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        highPriority: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/admin/dashboard');
            if (!response.ok) throw new Error('Failed to fetch data');

            const data = await response.json();

            // Transform complaints
            const mappedComplaints = (data.recent_complaints || []).map(c => {
                const urgencyLevel = c.urgency?.level || 'medium';
                return {
                    id: c.complaintId || c._id,
                    citizenName: c.phoneNumber || 'Citizen',
                    issueType: c.categoryInfo?.name || c.category || 'General',
                    description: c.translatedText || c.originalText || 'No description provided',
                    location: c.location?.wardName ? `${c.location.wardName}, Ward ${c.location.wardNumber}` : (c.location?.address || 'Unknown Location'),
                    status: c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'Pending',
                    severity: urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1),
                    timestamp: c.createdAt ? new Date(c.createdAt).toLocaleString() : (c.timestamp ? new Date(c.timestamp).toLocaleString() : 'Just now')
                };
            });

            setComplaints(mappedComplaints);

            // Calculate stats
            // Note: failing gracefully if stats are missing
            setStats({
                total: data.stats?.total || 0,
                pending: (data.stats?.by_status?.Pending || 0) + (data.stats?.by_status?.Open || 0),
                resolved: data.stats?.by_status?.Resolved || 0,
                highPriority: mappedComplaints.filter(c => c.severity === 'High').length
            });

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = (id) => {
        // Optimistic update
        setComplaints(prev => prev.map(c =>
            c.id === id ? { ...c, status: 'Resolved' } : c
        ));
        // TODO: Call backend API to resolve
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-red-500">
                <AlertCircle className="mr-2" />
                <span>Error loading dashboard: {error}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 pb-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Complaints"
                    value={stats.total}
                    change={0}
                    trend="neutral"
                    icon={Phone}
                    color="primary"
                />
                <StatsCard
                    title="Pending Actions"
                    value={stats.pending}
                    change={0}
                    trend="neutral"
                    icon={AlertCircle}
                    color="secondary"
                />
                <StatsCard
                    title="Resolved"
                    value={stats.resolved}
                    change={0}
                    trend="up"
                    icon={CheckCircle}
                    color="primary"
                />
                <StatsCard
                    title="High Priority"
                    value={stats.highPriority}
                    change={0}
                    trend="neutral"
                    icon={AlertCircle}
                    color="accent"
                />
            </div>

            {/* Complaints Grid */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Complaints</h2>
                    <button
                        onClick={fetchDashboardData}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Refresh Data
                    </button>
                </div>

                {complaints.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No complaints found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {complaints.map(complaint => (
                            <ComplaintCard
                                key={complaint.id}
                                complaint={complaint}
                                onResolve={handleResolve}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
