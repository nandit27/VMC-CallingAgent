import React, { useState, useEffect } from 'react';
import { Phone, AlertCircle, CheckCircle, Loader2, BarChart3, Activity, ListTodo } from 'lucide-react';
import { BentoGrid } from '../components/ui/bento-grid';
import ActivityChart from '../components/dashboard/ActivityChart';
import ComplaintProgress from '../components/dashboard/ComplaintProgress';
import PriorityStats from '../components/dashboard/PriorityStats';
import ComplaintCard from '../components/dashboard/ComplaintCard';
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
        byZone: null,
        activityTrend: []
    });
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [chartPeriod, setChartPeriod] = useState('weekly'); // 'weekly' or 'monthly'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData(selectedCategory, chartPeriod);
    }, [selectedCategory, chartPeriod]);

    const fetchDashboardData = async (category = null, period = 'weekly') => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (category) queryParams.append('category', category);
            if (period) queryParams.append('period', period);

            const response = await fetch(`/api/admin/dashboard?${queryParams.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch data');

            const data = await response.json();
            // ... (rest of transformation logic)
            // ...

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
                pending: data.stats?.by_status?.Pending || 0,
                resolved: data.stats?.by_status?.Resolved || 0,
                highPriority: data.stats?.high_priority || 0,
                priorityBreakdown: data.stats?.priority_breakdown || { critical: 0, high: 0, medium: 0, low: 0 },
                byCategory: Array.isArray(data.stats?.by_category) ? data.stats.by_category : [],
                byZone: data.stats?.by_zone || null,
                activityTrend: data.stats?.activity_trend || []
            });

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ... (rest of methods)


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

    // Prepare Bento Items
    const bentoItems = [
        {
            title: "Total Complaints",
            description: "All registered complaints",
            icon: <Phone className="w-5 h-5 text-blue-500" />,
            iconWrapperClass: "bg-blue-500/10",
            status: stats.total,
            statusClass: "bg-blue-500/10 text-blue-600",
            tags: ["Overview"],
            hasPersistentHover: true,
        },
        {
            title: "Pending Actions",
            description: "Complaints requiring attention",
            icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
            iconWrapperClass: "bg-orange-500/10",
            status: stats.pending,
            statusClass: "bg-orange-500/10 text-orange-600",
            tags: ["Action Required"],
        },
        {
            title: "Resolved Issues",
            description: "Successfully handled complaints",
            icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
            iconWrapperClass: "bg-emerald-500/10",
            status: stats.resolved,
            statusClass: "bg-emerald-500/10 text-emerald-600",
            tags: ["Completed"],
        },
        {
            title: "Activity & Trends",
            description: "Complaint volume over time",
            icon: <Activity className="w-5 h-5 text-purple-500" />,
            iconWrapperClass: "bg-purple-500/10",
            colSpan: 2,
            content: (
                <div className="h-64 mt-4 w-full">
                    <ActivityChart
                        data={stats.activityTrend || []}
                        period={chartPeriod}
                        onPeriodChange={setChartPeriod}
                    />
                </div>
            ),
        },
        {
            title: "Complaint Progress",
            description: "Resolution metrics",
            icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
            iconWrapperClass: "bg-indigo-500/10",
            colSpan: 1,
            content: (
                <div className="h-64 mt-4 w-full">
                    <ComplaintProgress
                        total={stats.total}
                        resolved={stats.resolved}
                        pending={stats.pending}
                        highPriority={stats.highPriority}
                    />
                </div>
            ),
        },
        {
            title: "Priority Overview",
            description: "Current breakdown by urgency",
            colSpan: 3,
            content: (
                <div className="mt-2 w-full">
                    <PriorityStats stats={stats.priorityBreakdown} />
                </div>
            )
        },
        {
            title: selectedCategory ? `${getCategoryName(selectedCategory)} Complaints` : 'Recent Complaints',
            description: "Latest issues reported by citizens",
            icon: <ListTodo className="w-5 h-5 text-rose-500" />,
            iconWrapperClass: "bg-rose-500/10",
            colSpan: 3,
            content: (
                <div className="mt-4">
                    <div className="flex justify-end mb-4">
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="text-xs bg-white/10 hover:bg-white/20 text-gray-300 px-3 py-1 rounded-full font-medium transition-colors mr-2"
                            >
                                Clear Filter ✕
                            </button>
                        )}
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
                        <div className="text-center py-12 text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10">
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
            )
        }
    ];

    return (
        <div className="flex flex-col gap-8 pb-8 pt-4">
            <BentoGrid items={bentoItems} className="max-w-7xl mx-auto w-full" />
        </div>
    );
};

export default Dashboard;
