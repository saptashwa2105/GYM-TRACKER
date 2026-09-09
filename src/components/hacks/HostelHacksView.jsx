import React from 'react';
import { ChefHat, Salad, Flame, Zap, Sparkles, Check, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { estimateDayMacros, calculateProteinGap, getGoalTargets } from '../../nutrition.js';
import { generateRecipes } from '../../data.js';
import RecipeCard from './RecipeCard.jsx';

export default function HostelHacksView() {
  const { state, update } = useApp();
  const fitnessGoal = state.fitnessGoal || 'LEAN';
  const isLean = fitnessGoal === 'LEAN';

  const goalInfo = getGoalTargets(fitnessGoal);
  const targetProtein = state.targetProtein || goalInfo.targetProtein;
  const activeDayMenu = state.messMenu[state.activeDay] || {};
  const messMacros = estimateDayMacros(activeDayMenu);
  const messProtein = messMacros.protein;
  const proteinGap = calculateProteinGap(messProtein, targetProtein, fitnessGoal);
  const percentCovered = Math.min(100, Math.round((messProtein / targetProtein) * 100));

  const customItemsList = state.customItems
    ? state.customItems.split(',').map(i => i.trim()).filter(Boolean)
    : [];

  const { preWorkout, postWorkout, hostelHacks } = generateRecipes(
    state.roomItems,
    customItemsList,
    proteinGap,
    fitnessGoal
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Goal Pill Toggle */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <ChefHat size={18} className="text-[#22c55e]" />
          <h3 className="text-sm font-black uppercase tracking-wider text-[#22c55e]" style={{ fontFamily: 'var(--font-display)' }}>
            Hostel Hacks & Zero-Cook Recipes
          </h3>
        </div>

        {/* Goal Toggle */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => update({ fitnessGoal: 'LEAN' })}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 ${
              isLean ? 'bg-[#22c55e] text-zinc-950 shadow-md shadow-[#22c55e]/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Salad size={13} /> LEAN
          </button>
          <button
            onClick={() => update({ fitnessGoal: 'BULK' })}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 ${
              !isLean ? 'bg-[#22d3ee] text-zinc-950 shadow-md shadow-[#22d3ee]/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame size={13} /> BULK
          </button>
        </div>
      </div>

      {/* Goal Strategy & Deficit Tracker */}
      <div className="glass-card p-4 rounded-3xl border border-[#22c55e]/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#22c55e]" />
            <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              {goalInfo.label}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            proteinGap > 0 ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-green-500/20 text-green-300'
          }`}>
            {proteinGap > 0 ? `${proteinGap}g DEFICIT` : 'GOAL MET ✓'}
          </span>
        </div>

        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Mess Provided: <strong className="text-[#22c55e]">{messProtein}g</strong> / {targetProtein}g Target</span>
            <span className="text-[#22c55e] font-bold">{percentCovered}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#22c55e] to-[#22d3ee] h-full transition-all duration-500"
              style={{ width: `${percentCovered}%` }}
            />
          </div>
        </div>

        {/* Goal Specific Tips */}
        <div className="pt-2 border-t border-zinc-800/80">
          <p className="text-[10px] uppercase tracking-widest text-[#22c55e] font-bold mb-1.5 flex items-center gap-1">
            <Sparkles size={11} /> {goalInfo.adviceHeader}
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[11px] text-zinc-300">
            {goalInfo.hacks.map((hackTip, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <Check size={12} className="text-[#22c55e] shrink-0 mt-0.5" />
                <span>{hackTip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Student Hostel Hacks */}
      {hostelHacks.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className={isLean ? 'text-[#22c55e]' : 'text-[#22d3ee]'} />
              <span className="text-xs font-black uppercase tracking-wider text-zinc-200" style={{ fontFamily: 'var(--font-display)' }}>
                Hostel Hacks ({isLean ? '🔥 Lean Cut' : '🏋️ Mass Bulk'})
              </span>
            </div>
            <span className="text-[9px] bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full font-bold">
              ZERO COOK
            </span>
          </div>
          <div className="space-y-2.5">
            {hostelHacks.map((hack, idx) => (
              <RecipeCard key={`hack-${idx}`} recipe={hack} idx={idx} accentColor={isLean ? '#22c55e' : '#22d3ee'} />
            ))}
          </div>
        </div>
      )}

      {/* Pre-workout Fuel */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Zap size={14} className="text-yellow-400" />
          <span className="text-xs font-black uppercase tracking-wider text-yellow-400" style={{ fontFamily: 'var(--font-display)' }}>
            Pre-Workout Energy Fuel
          </span>
        </div>
        <div className="space-y-2.5">
          {preWorkout.map((recipe, idx) => (
            <RecipeCard key={idx} recipe={recipe} idx={idx} accentColor="#facc15" />
          ))}
        </div>
      </div>

      {/* Post-workout Recovery */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Heart size={14} className="text-[#22d3ee]" />
          <span className="text-xs font-black uppercase tracking-wider text-[#22d3ee]" style={{ fontFamily: 'var(--font-display)' }}>
            Post-Workout Recovery & Deficit Fillers
          </span>
        </div>
        <div className="space-y-2.5">
          {postWorkout.map((recipe, idx) => (
            <RecipeCard key={idx} recipe={recipe} idx={idx} accentColor="#22d3ee" />
          ))}
        </div>
      </div>
    </div>
  );
}
