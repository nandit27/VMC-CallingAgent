import React, { useState, useEffect } from 'react';
import { Phone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ComplaintCard from '../components/dashboard/ComplaintCard';
import DepartmentCard from '../components/dashboard/DepartmentCard';
import ActivityChart from '../components/dashboard/ActivityChart';

// Map category codes to display names - Fallback only
// The API now returns the name dynamically
const CATEGORY_NAMES_FALLBACK = {
    "WATER_SUPPLY": "Water Department",
};

const Dashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        highPriority: 0,
        byCategory: [],
        activityTrend: []
    });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData(selectedCategory);
    }, [selectedCategory]);

    const fetchDashboardData = async (category = null) => {
        setLoading(true);
        try {
            const query = category ? `?category=${category}` : '';
            const response = await fetch(`/api/admin/dashboard${query}`);
            if (!response.ok) throw new Error('Failed to fetch data');

            const data = await response.json();

            // Transform complaints
            const mappedComplaints = (data.recent_complaints || []).map(c => {
                const urgencyLevel = c.urgency?.level || 'medium';
                // Safe string handling
                const urgencyStr = String(urgencyLevel);

                return {
                    id: c.complaintId || c._id || 'unknown',
                    citizenName: c.phoneNumber || 'Citizen',
                    issueType: c.categoryInfo?.name || c.category || 'General',
                    description: c.translatedText || c.originalText || 'No description provided',
                    location: c.location?.wardNumber ? `Zone ${c.location.zone || 'Unknown'}, Ward ${c.location.wardNumber}` : (c.location?.address || 'Unknown Location'),
                    status: c.status ? String(c.status).charAt(0).toUpperCase() + String(c.status).slice(1) : 'Pending',
                    severity: urgencyStr.charAt(0).toUpperCase() + urgencyStr.slice(1),
                    timestamp: c.createdAt ? new Date(c.createdAt).toLocaleString() : (c.timestamp ? new Date(c.timestamp).toLocaleString() : 'Just now')
                };
            });

            setComplaints(mappedComplaints);

            // Calculate stats
            setStats({
                total: data.stats?.total || 0,
                pending: (data.stats?.by_status?.Pending || 0) + (data.stats?.by_status?.Open || 0),
                resolved: data.stats?.by_status?.Resolved || 0,
                highPriority: mappedComplaints.filter(c => String(c.severity).toLowerCase() === 'high').length,
                byCategory: Array.isArray(data.stats?.by_category) ? data.stats.by_category : [],
                activityTrend: data.stats?.activity_trend || []
            });

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        try {
            const response = await fetch(`/api/admin/complaint/${id}/resolve`, {
                method: 'PUT'
            });

            if (!response.ok) throw new Error('Failed to resolve complaint');

            // Optimistic update
            setComplaints(prev => prev.map(c =>
                c.id === id ? { ...c, status: 'Resolved' } : c
            ));

            // Update stats
            setStats(prev => ({
                ...prev,
                pending: prev.pending > 0 ? prev.pending - 1 : 0,
                resolved: prev.resolved + 1
            }));

        } catch (err) {
            console.error("Error resolving complaint:", err);
            // Optionally show error toast
        }
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-red-500">
                <AlertCircle className="mr-2" />
                <span>Error loading dashboard: {error}</span>
            </div>
        );
    }

    // Helper to safely get category name
    const getCategoryName = (code) => {
        if (!stats.byCategory) return code;
        const cat = stats.byCategory.find(d => d.code === code);
        return cat ? cat.name : code;
    };

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
                    color="success"
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

            {/* Charts & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-80">
                    <ActivityChart data={stats.activityTrend || []} />
                </div>
                <div className="lg:col-span-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white flex flex-col justify-center relative overflow-hidden h-80">
                    {/* Simplified Banner / Summary Card */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Automated AI Agent</h3>
                        <p className="text-blue-100 mb-6 text-sm">Handling citizen calls 24/7 with real-time classification and routing.</p>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">Active</div>
                            <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">v1.2.0</div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Complaints Grid */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {selectedCategory ? `${getCategoryName(selectedCategory)} Complaints` : 'Recent Complaints'}
                        </h2>
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-medium transition-colors"
                            >
                                Clear Filter ✕
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => fetchDashboardData(selectedCategory)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                        {loading && <Loader2 className="animate-spin" size={14} />}
                        Refresh Data
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="font-medium">No complaints found</p>
                        <p className="text-sm mt-1">{selectedCategory ? 'Try clearing the filter' : 'Waiting for new complaints'}</p>
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
