import React, { useState, useEffect } from 'react';
import DepartmentCard from '../components/dashboard/DepartmentCard';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Departments = () => {
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDept, setSelectedDept] = useState(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                // Reuse dashboard endpoint as it calculates counts
                const response = await fetch('/api/admin/dashboard');
                if (!response.ok) throw new Error('Failed to fetch data');
                const data = await response.json();

                setDepartments(data.stats.by_category || []);
            } catch (err) {
                console.error("Error fetching departments:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-red-500">
                <AlertCircle className="mr-2" />
                <span>Error loading departments: {error}</span>
            </div>
        );
    }

    return (
        <div className="pb-8 relative">
            <h1 className="text-3xl font-bold text-white mb-8 text-center">All Departments</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {departments.map((dept) => (
                    <DepartmentCard
                        key={dept.code || Math.random()}
                        name={dept.name || 'Unknown'}
                        code={dept.code}
                        count={dept.count || 0}
                        isActive={selectedDept?.code === dept.code}
                        onClick={() => setSelectedDept(dept)}
                    />
                ))}
            </div>

            {/* Sub-Category Modal */}
            {selectedDept && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 border border-white/10">
                        <button
                            onClick={() => setSelectedDept(null)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white">{selectedDept.name}</h2>
                            <p className="text-gray-400">{selectedDept.count} Total Complaints</p>
                        </div>

                        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                            {(() => {
                                const categories = selectedDept.categories || [];

                                if (categories.length === 0) {
                                    return (
                                        <div className="text-center py-8 text-gray-400 bg-white/5 rounded-xl border border-dashed border-white/10">
                                            No categories found for this department.
                                        </div>
                                    );
                                }

                                return categories.map((cat, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => navigate(`/complaints?category=${encodeURIComponent(cat.tag)}`)}
                                        className="w-full text-left p-4 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 transition-all flex justify-between items-center group"
                                    >
                                        <span className="font-medium text-gray-300 group-hover:text-blue-400">{cat.name}</span>
                                        <span className="text-gray-500 group-hover:text-blue-400">→</span>
                                    </button>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
