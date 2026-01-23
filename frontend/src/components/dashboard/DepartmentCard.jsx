import React from 'react';
import { Building2 } from 'lucide-react';

const DepartmentCard = ({ name, count, code, isActive, onClick }) => {
    return (
        <button
            onClick={() => onClick(code)}
            className={`w-full text-center p-6 rounded-2xl transition-all duration-200 border group flex flex-col items-center justify-center gap-3 aspect-[4/3] ${isActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200'
                : 'bg-white text-gray-900 border-gray-100 hover:border-blue-200 hover:shadow-lg'
                }`}
        >
            <div className="flex flex-col items-center gap-2 mb-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                    }`}>
                    <Building2 size={24} />
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {count} Complaints
                </div>
            </div>

            <h3 className={`text-base font-bold leading-tight ${isActive ? 'text-white' : 'text-gray-900'}`}>
                {name}
            </h3>

            <div className={`mt-auto text-xs font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-white/80' : 'text-blue-500'
                }`}>
                <span>View Details</span>
            </div>
        </button>
    );
};

export default DepartmentCard;
