import React from 'react';
import { Zap } from 'lucide-react';

export default function DailyNutritionBar({ dayMacros, day, isHighlightNonVeg }) {
  const isNonVegDay = dayMacros.isNonVegDay;

  return (
    <div className={`glass-card p-4 rounded-3xl border transition-all ${
      isHighlightNonVeg && isNonVegDay
        ? 'border-red-500/60 bg-gradient-to-r from-red-950/30 via-zinc-900 to-zinc-950 shadow-lg shadow-red-500/10'
        : 'border-zinc-800/80 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950'
    }`}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[#22c55e]" />
          <span className="text-xs font-black uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-display)' }}>
            {day}'s Nutrition Breakdown
          </span>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
          isNonVegDay
            ? 'bg-red-500/15 text-red-400 border-red-500/30'
            : 'bg-green-500/15 text-green-400 border-green-500/30'
        }`}>
          {isNonVegDay ? '🍗 NON-VEG SCHEDULE' : '🌱 VEG SCHEDULE'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-zinc-950/90 p-2.5 rounded-2xl border border-yellow-500/20">
          <p className="text-[9px] text-yellow-400 uppercase tracking-wider font-semibold">Calories</p>
          <p className="text-sm font-black text-yellow-300 mt-0.5">{dayMacros.calories} <span className="text-[9px] font-normal text-yellow-400/70">kcal</span></p>
        </div>
        <div className="bg-zinc-950/90 p-2.5 rounded-2xl border border-[#22c55e]/40 bg-[#22c55e]/5">
          <p className="text-[9px] text-[#22c55e] uppercase tracking-wider font-semibold">Protein</p>
          <p className="text-sm font-black text-[#22c55e] mt-0.5">{dayMacros.protein} <span className="text-[9px] font-normal text-[#22c55e]/70">g</span></p>
        </div>
        <div className="bg-zinc-950/90 p-2.5 rounded-2xl border border-[#22d3ee]/20">
          <p className="text-[9px] text-[#22d3ee] uppercase tracking-wider font-semibold">Carbs</p>
          <p className="text-sm font-black text-[#22d3ee] mt-0.5">{dayMacros.carbs} <span className="text-[9px] font-normal text-[#22d3ee]/70">g</span></p>
        </div>
        <div className="bg-zinc-950/90 p-2.5 rounded-2xl border border-orange-500/20">
          <p className="text-[9px] text-orange-400 uppercase tracking-wider font-semibold">Fats</p>
          <p className="text-sm font-black text-orange-300 mt-0.5">{dayMacros.fats} <span className="text-[9px] font-normal text-orange-400/70">g</span></p>
        </div>
      </div>
    </div>
  );
}
