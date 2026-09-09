import React from 'react';
import { LayoutDashboard, Dumbbell, Utensils, Package, ChefHat } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

export default function CategoryNav() {
  const { state, update } = useApp();
  const activeCategory = state.activeCategory || 'overview';

  const categories = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview', color: '#22c55e' },
    { id: 'workout', icon: Dumbbell, label: 'Workouts', color: '#22c55e' },
    { id: 'meals', icon: Utensils, label: 'Mess Meals', color: '#22d3ee' },
    { id: 'inventory', icon: Package, label: 'Room Supplies', color: '#facc15' },
    { id: 'hacks', icon: ChefHat, label: 'Hostel Hacks', color: '#a78bfa' },
  ];

  return (
    <nav className="px-5 pb-3 bg-[#0a0a0c]">
      <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-950/80 border border-zinc-900 rounded-2xl">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => update({ activeCategory: cat.id })}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-md border border-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40'
              }`}
            >
              <Icon
                size={18}
                className="transition-colors mb-1"
                style={{ color: isActive ? cat.color : undefined }}
              />
              <span
                className={`text-[10px] font-bold tracking-tight truncate max-w-full ${
                  isActive ? 'text-zinc-100' : 'text-zinc-500'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
