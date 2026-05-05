import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Filter, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ComplaintCard from '../components/dashboard/ComplaintCard';

const Complaints = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [allComplaints, setAllComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'resolved'

    // Get filter from URL
    const queryParams = new URLSearchParams(location.search);
    const departmentFilter = queryParams.get('department');
    const categoryFilter = queryParams.get('category');

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await fetch('/api/admin/complaints');
                if (!response.ok) throw new Error('Failed to fetch complaints');
                const data = await response.json();

                // Transform data
                const formatCategory = (cat) => {
                    if (!cat) return 'General';
                    // Replicate python's title() method roughly: replace underscores with spaces and capitalize words
                    return String(cat)
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, l => l.toUpperCase());
                };

                const mapped = (data.complaints || []).map(c => {
                    const urgencyLevel = c.urgency?.level || 'medium';
                    const urgencyStr = String(urgencyLevel);
                    return {
                        id: c.complaintId || c._id || 'unknown',
                        citizenName: c.phoneNumber || 'Citizen',
                        issueType: c.categoryInfo?.name || formatCategory(c.category),
                        rawCategory: c.category, // Keep raw category for filtering if needed
                        description: c.translatedText || c.originalText || 'No description provided',
                        location: c.location?.wardNumber ? `Zone ${c.location.zone || 'Unknown'}, Ward ${c.location.wardNumber}` : (c.location?.address || 'Unknown Location'),
                        status: c.status ? String(c.status).charAt(0).toUpperCase() + String(c.status).slice(1) : 'Pending',
                        severity: urgencyStr.charAt(0).toUpperCase() + urgencyStr.slice(1),
                        timestamp: c.createdAt ? new Date(c.createdAt).toLocaleString() : 'Recently'
                    };
                });

                setAllComplaints(mapped);
            } catch (err) {
                console.error("Error fetching complaints:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    const handleResolve = async (id) => {
        try {
            const response = await fetch(`/api/admin/complaint/${id}/resolve`, { method: 'PUT' });
            if (!response.ok) throw new Error('Failed to resolve');

            // Optimistic update
            setAllComplaints(prev => prev.map(c =>
                c.id === id ? { ...c, status: 'Resolved' } : c
            ));
        } catch (err) {
            console.error("Error resolving:", err);
        }
    };

    // Apply Filters
    let filteredData = allComplaints;

    // Filter by Department (works via issueType matching department name usually, based on previous logic)
    if (departmentFilter) {
        filteredData = filteredData.filter(c => c.issueType === departmentFilter);
    }

    // Filter by Category (Specific drill down)
    if (categoryFilter) {
        // Match either the formatted issueType OR the raw category code (case-insensitive)
        filteredData = filteredData.filter(c => {
            const filterLower = categoryFilter.toLowerCase();
            return (c.issueType && c.issueType.toLowerCase() === filterLower) ||
                (c.rawCategory && String(c.rawCategory).toLowerCase() === filterLower);
        });
    }

    const pendingComplaints = filteredData.filter(c => c.status !== 'Resolved');
    const resolvedComplaints = filteredData.filter(c => c.status === 'Resolved');

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;
    if (error) return <div className="text-red-500 text-center p-20">Error: {error}</div>;

    const activeFilter = departmentFilter || categoryFilter;

    return (
        <div className="pb-8">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Complaint List</h1>

            {/* Filter Banner */}
            {activeFilter && (
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-500/20 shadow-sm">
                        <Filter size={16} />
                        <span className="font-medium">Filtering by: <b>{activeFilter}</b></span>
                        <button
                            onClick={() => navigate('/complaints')}
                            className="ml-2 p-1 hover:bg-blue-500/20 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-white/10 p-1 rounded-xl flex gap-1">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white/15 text-blue-400 shadow-sm' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Pending ({pendingComplaints.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('resolved')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'resolved' ? 'bg-white/15 text-green-400 shadow-sm' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Resolved ({resolvedComplaints.length})
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(activeTab === 'pending' ? pendingComplaints : resolvedComplaints).map(complaint => (
                    <ComplaintCard
                        key={complaint.id}
                        complaint={complaint}
                        onResolve={handleResolve}
                    />
                ))}
                {(activeTab === 'pending' ? pendingComplaints : resolvedComplaints).length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        {departmentFilter
                            ? `No ${activeTab} complaints found for ${departmentFilter}.`
                            : `No ${activeTab} complaints found.`
                        }
                    </div>
                )}
            </div>
        </div>
    );
};

export default Complaints;
