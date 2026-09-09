import React from 'react';
import { Dumbbell, Utensils, Zap, Package, ChefHat, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { estimateDayMacros, calculateProteinGap, getGoalTargets } from '../../nutrition.js';

export default function DashboardOverview() {
  const { state, update } = useApp();
  const day = state.activeDay;

  const targetMuscles = (state.split[day] || []).filter(m => m !== 'NIL');
  const isRestDay = targetMuscles.length === 0;

  const dayMenu = state.messMenu[day] || {};
  const dayMacros = estimateDayMacros(dayMenu);

  const goalInfo = getGoalTargets(state.fitnessGoal || 'LEAN');
  const targetProtein = state.targetProtein || goalInfo.targetProtein;
  const proteinGap = calculateProteinGap(dayMacros.protein, targetProtein, state.fitnessGoal);
  const percentProtein = Math.min(100, Math.round((dayMacros.protein / targetProtein) * 100));

  const dayWorkouts = state.workouts[day] || {};
  let totalExercises = 0;
  let completedExercises = 0;
  Object.values(dayWorkouts).forEach(list => {
    if (Array.isArray(list)) {
      totalExercises += list.length;
      completedExercises += list.filter(e => e.completed).length;
    }
  });

  return (
    <div className="space-y-4 pb-8">
      {/* Hero Status Banner */}
      <div className="glass-card p-5 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-2.5 py-1 rounded-full">
            {day}'s Schedule
          </span>
          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
            Goal: {state.fitnessGoal === 'LEAN' ? '🥗 Lean Cut' : '🏋️ Mass Bulk'}
          </span>
        </div>

        <h2 className="text-xl font-black text-white tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          {isRestDay ? 'Active Recovery Day 🛌' : `${targetMuscles.join(' + ')} Day 💪`}
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          {isRestDay
            ? 'Rest and replenish glycogen stores. Focus on meeting your daily protein targets!'
            : `${totalExercises} target exercises planned. ${completedExercises} completed so far.`}
        </p>

        {/* Quick Macro Bar */}
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-zinc-800/80 text-center">
          <div className="p-2 rounded-xl bg-zinc-950/70 border border-yellow-500/20">
            <p className="text-[9px] text-yellow-400 font-semibold uppercase">Calories</p>
            <p className="text-sm font-black text-yellow-200 mt-0.5">{dayMacros.calories} <span className="text-[9px] font-normal text-zinc-500">kcal</span></p>
          </div>
          <div className="p-2 rounded-xl bg-zinc-950/70 border border-[#22c55e]/30">
            <p className="text-[9px] text-[#22c55e] font-semibold uppercase">Protein</p>
            <p className="text-sm font-black text-[#22c55e] mt-0.5">{dayMacros.protein}g</p>
          </div>
          <div className="p-2 rounded-xl bg-zinc-950/70 border border-[#22d3ee]/20">
            <p className="text-[9px] text-[#22d3ee] font-semibold uppercase">Carbs</p>
            <p className="text-sm font-black text-[#22d3ee] mt-0.5">{dayMacros.carbs}g</p>
          </div>
          <div className="p-2 rounded-xl bg-zinc-950/70 border border-orange-500/20">
            <p className="text-[9px] text-orange-400 font-semibold uppercase">Fats</p>
            <p className="text-sm font-black text-orange-200 mt-0.5">{dayMacros.fats}g</p>
          </div>
        </div>
      </div>

      {/* 2-Column Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Workout Card */}
        <div
          onClick={() => update({ activeCategory: 'workout' })}
          className="glass-card p-4 rounded-2xl border border-zinc-800 hover:border-[#22c55e]/50 cursor-pointer transition-all duration-200 group bg-zinc-950/60"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center">
                <Dumbbell size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  Today's Workout
                </h3>
                <p className="text-[10px] text-zinc-400">{day}'s Split</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-zinc-500 group-hover:text-[#22c55e] group-hover:translate-x-1 transition-all" />
          </div>

          <div className="space-y-1.5 mb-3">
            {isRestDay ? (
              <p className="text-xs text-zinc-500 italic py-2">No muscle groups scheduled today.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {targetMuscles.map(m => (
                  <span key={m} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-bold text-zinc-200">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-900">
            <span>Progress: {completedExercises}/{totalExercises} exercises</span>
            <span className="text-[#22c55e] font-bold">Open Logger →</span>
          </div>
        </div>

        {/* Mess Meal Summary */}
        <div
          onClick={() => update({ activeCategory: 'meals' })}
          className="glass-card p-4 rounded-2xl border border-zinc-800 hover:border-[#22d3ee]/50 cursor-pointer transition-all duration-200 group bg-zinc-950/60"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#22d3ee]/15 text-[#22d3ee] flex items-center justify-center">
                <Utensils size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  Mess Meals
                </h3>
                <p className="text-[10px] text-zinc-400">{day}'s Menu</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-zinc-500 group-hover:text-[#22d3ee] group-hover:translate-x-1 transition-all" />
          </div>

          <div className="space-y-1.5 text-[11px] text-zinc-300 mb-3">
            <p className="truncate"><strong className="text-yellow-400">Breakfast:</strong> {dayMenu.Breakfast || 'Not logged'}</p>
            <p className="truncate"><strong className="text-[#22d3ee]">Lunch:</strong> {dayMenu.Lunch || 'Not logged'}</p>
            <p className="truncate"><strong className="text-[#a78bfa]">Dinner:</strong> {dayMenu.Dinner || 'Not logged'}</p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-900">
            <span>Diet: {state.dietPref}</span>
            <span className="text-[#22d3ee] font-bold">View Menu & OCR →</span>
          </div>
        </div>
      </div>

      {/* Protein Deficit Progress Card */}
      <div className="glass-card p-4 rounded-2xl border border-zinc-800 bg-zinc-950/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#22c55e]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              Daily Protein Target Tracker
            </h3>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            proteinGap > 0 ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'bg-green-500/20 text-green-300'
          }`}>
            {proteinGap > 0 ? `${proteinGap}g Gap to fill` : 'Target Met ✓'}
          </span>
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>Mess Provided: <strong className="text-[#22c55e]">{dayMacros.protein}g</strong> / {targetProtein}g Target</span>
            <span className="text-[#22c55e] font-bold">{percentProtein}%</span>
          </div>
          <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden p-[1px] border border-zinc-800">
            <div
              className="bg-gradient-to-r from-[#22c55e] to-[#22d3ee] h-full rounded-full transition-all duration-500"
              style={{ width: `${percentProtein}%` }}
            />
          </div>
        </div>

        {proteinGap > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
            <span className="text-zinc-400 text-[11px]">Fill the deficit with your room snacks</span>
            <button
              onClick={() => update({ activeCategory: 'hacks' })}
              className="text-[11px] font-bold text-[#22c55e] hover:underline flex items-center gap-1"
            >
              <ChefHat size={12} />
              <span>See Hostel Hacks →</span>
            </button>
          </div>
        )}
      </div>

      {/* Room Supplies Quick Status */}
      <div className="glass-card p-4 rounded-2xl border border-zinc-800 bg-zinc-950/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-yellow-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              Room Supplies in Stock
            </h3>
          </div>
          <button
            onClick={() => update({ activeCategory: 'inventory' })}
            className="text-[10px] font-bold text-yellow-400 hover:underline"
          >
            Manage Supplies ({state.roomItems.length})
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {state.roomItems.map(item => (
            <span key={item} className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 text-[11px] border border-zinc-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
