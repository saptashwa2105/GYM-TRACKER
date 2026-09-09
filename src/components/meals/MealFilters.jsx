import React from 'react';

export default function MealFilters({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All Meals' },
    { id: 'veg', label: '🌱 Show Only Veg' },
    { id: 'protein', label: '💪 Show High Protein First' },
    { id: 'nonveg', label: '🍗 Highlight Non-Veg Days' },
  ];

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold px-1">
        Meal Preferences Filter
      </p>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap ${
              activeFilter === f.id
                ? 'bg-[#22d3ee] text-zinc-950 shadow-md shadow-[#22d3ee]/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
