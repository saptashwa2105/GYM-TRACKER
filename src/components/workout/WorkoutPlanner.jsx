import React from 'react';
import { motion } from 'framer-motion';
import { DAYS, MUSCLE_GROUPS, DEFAULT_SPLIT, EXERCISE_DB } from '../../data.js';
import { useApp } from '../../context/AppContext.jsx';
import { RotateCcw, Check, Sparkles, Dumbbell } from 'lucide-react';

export default function WorkoutPlanner() {
  const { state, update, initWorkouts, showToast } = useApp();

  const handleSlotChange = (day, slotIdx, value) => {
    const newSplit = { ...state.split };
    newSplit[day] = [...(newSplit[day] || ['NIL', 'NIL', 'NIL', 'NIL'])];
    newSplit[day][slotIdx] = value;

    // Update workouts for this day
    const newWorkouts = { ...state.workouts };
    const muscles = newSplit[day].filter(m => m !== 'NIL');
    newWorkouts[day] = {};
    muscles.forEach(muscle => {
      newWorkouts[day][muscle] = EXERCISE_DB[muscle]
        ? EXERCISE_DB[muscle].map(ex => ({ ...ex, completed: false, weight: 0 }))
        : [];
    });

    update({ split: newSplit, workouts: newWorkouts });
  };

  const applyPresetPPL = () => {
    const defaultSplit = { ...DEFAULT_SPLIT };
    const workouts = initWorkouts(defaultSplit);
    update({ split: defaultSplit, workouts });
    showToast('Applied Push / Pull / Legs 6-Day Split', 'success');
  };

  const applyBroSplit = () => {
    const broSplit = {
      Monday: ['Chest', 'NIL', 'NIL', 'NIL'],
      Tuesday: ['Back', 'NIL', 'NIL', 'NIL'],
      Wednesday: ['Shoulders', 'NIL', 'NIL', 'NIL'],
      Thursday: ['Legs', 'NIL', 'NIL', 'NIL'],
      Friday: ['Biceps', 'Triceps', 'NIL', 'NIL'],
      Saturday: ['Abs', 'Forearms', 'NIL', 'NIL'],
      Sunday: ['NIL', 'NIL', 'NIL', 'NIL'],
    };
    const workouts = initWorkouts(broSplit);
    update({ split: broSplit, workouts });
    showToast('Applied Bro-Split (1 Group/Day)', 'success');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div>
          <h3 className="text-base font-bold text-white mb-0.5" style={{ fontFamily: 'var(--font-display)' }}>
            7-Day Split Configuration
          </h3>
          <p className="text-xs text-zinc-400">
            Customize target muscle groups for each day of the week.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={applyPresetPPL}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[#22c55e] border border-zinc-800 text-[11px] font-bold transition-colors"
          >
            PPL Preset
          </button>
          <button
            onClick={applyBroSplit}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[#22d3ee] border border-zinc-800 text-[11px] font-bold transition-colors"
          >
            Bro Split
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {DAYS.map((day) => {
          const muscles = state.split[day] || ['NIL', 'NIL', 'NIL', 'NIL'];
          const isRest = muscles.every(m => m === 'NIL');

          return (
            <div
              key={day}
              className={`glass-card p-4 rounded-2xl border transition-all ${
                state.activeDay === day
                  ? 'border-[#22c55e]/50 bg-zinc-950/80 shadow-md shadow-[#22c55e]/5'
                  : 'border-zinc-800/80 bg-[#0e0e13]/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-display)' }}>
                    {day}
                  </span>
                  {state.activeDay === day && (
                    <span className="text-[9px] bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-full font-bold">
                      ACTIVE DAY
                    </span>
                  )}
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isRest ? 'bg-zinc-800 text-zinc-500' : 'bg-[#22c55e]/15 text-[#22c55e]'
                }`}>
                  {isRest ? 'REST DAY' : 'WORKOUT DAY'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((slotIdx) => (
                  <select
                    key={slotIdx}
                    value={muscles[slotIdx] || 'NIL'}
                    onChange={(e) => handleSlotChange(day, slotIdx, e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl p-2 text-xs text-white outline-none focus:border-[#22c55e]"
                  >
                    {MUSCLE_GROUPS.map((mg) => (
                      <option key={mg} value={mg}>
                        {mg === 'NIL' ? '-- None --' : mg}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
