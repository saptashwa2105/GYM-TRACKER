import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronRight, ChevronLeft, Salad, Beef, Flame, Check } from 'lucide-react';
import { DAYS, MUSCLE_GROUPS, ROOM_ITEMS } from '../../data.js';

export default function OnboardingWizard({ state, update, onComplete }) {
  const [step, setStep] = useState(state.onboardingStep || 0);
  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < 3) {
      const nextStep = step + 1;
      setStep(nextStep);
      update({ onboardingStep: nextStep });
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      update({ onboardingStep: prevStep });
    }
  };

  const handleSplitChange = (day, slotIdx, val) => {
    const newSplit = { ...state.split };
    newSplit[day] = [...(newSplit[day] || ['NIL', 'NIL', 'NIL', 'NIL'])];
    newSplit[day][slotIdx] = val;
    update({ split: newSplit });
  };

  const handleToggleRoomItem = (item) => {
    const exists = state.roomItems.includes(item);
    const newItems = exists
      ? state.roomItems.filter(i => i !== item)
      : [...state.roomItems, item];
    update({ roomItems: newItems });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col justify-between p-5 max-w-lg mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#22c55e] to-[#22d3ee] flex items-center justify-center shadow-lg shadow-[#22c55e]/20">
            <Dumbbell size={20} className="text-zinc-950 font-bold" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              GymForge Setup
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Personalized Routine & Diet</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between text-[11px] mb-1.5 font-bold">
            <span className="text-zinc-500 uppercase tracking-wider">Step {step + 1} of {totalSteps}</span>
            <span className="text-[#22c55e]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-[#22c55e] to-[#22d3ee] h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Step Contents */}
      <div className="my-auto py-2">
        <AnimatePresence mode="wait">
          {/* STEP 0: Goal & Diet */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  Your Fitness & Diet Goal
                </h2>
                <p className="text-xs text-zinc-400">
                  Select your primary fitness objective and mess food preference.
                </p>
              </div>

              {/* Fitness Goal */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => update({ fitnessGoal: 'LEAN', targetProtein: 140 })}
                  className={`p-4 rounded-3xl border text-left transition-all ${
                    (state.fitnessGoal || 'LEAN') === 'LEAN'
                      ? 'bg-[#22c55e]/10 border-[#22c55e] shadow-lg shadow-[#22c55e]/10'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <Salad size={22} className="text-[#22c55e] mb-2" />
                  <p className="text-sm font-bold text-white mb-0.5">🥗 Lean Cut</p>
                  <p className="text-[11px] text-zinc-400">Burn fat, define muscles, high protein.</p>
                </button>

                <button
                  type="button"
                  onClick={() => update({ fitnessGoal: 'BULK', targetProtein: 160 })}
                  className={`p-4 rounded-3xl border text-left transition-all ${
                    state.fitnessGoal === 'BULK'
                      ? 'bg-[#22d3ee]/10 border-[#22d3ee] shadow-lg shadow-[#22d3ee]/10'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <Flame size={22} className="text-[#22d3ee] mb-2" />
                  <p className="text-sm font-bold text-white mb-0.5">🏋️ Mass Bulk</p>
                  <p className="text-[11px] text-zinc-400">Build muscle mass, calorie surplus.</p>
                </button>
              </div>

              {/* Diet Preference */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Mess Diet Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {['VEG', 'NON-VEG'].map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => update({ dietPref: pref })}
                      className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        state.dietPref === pref
                          ? 'bg-zinc-900 border-[#22c55e] text-[#22c55e]'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {pref === 'VEG' ? <Salad size={16} /> : <Beef size={16} />}
                      <span>{pref} Diet</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Split Editor */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3 max-h-[60vh] overflow-y-auto pr-1"
            >
              <div>
                <h2 className="text-xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  7-Day Workout Split
                </h2>
                <p className="text-xs text-zinc-400">
                  Pre-configured with Push/Pull/Legs. Adjust any day to your liking.
                </p>
              </div>

              {DAYS.map((day) => (
                <div key={day} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs font-bold text-[#22c55e] uppercase tracking-wider block mb-1.5">{day}</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[0, 1].map((slot) => (
                      <select
                        key={slot}
                        value={state.split[day]?.[slot] || 'NIL'}
                        onChange={(e) => handleSplitChange(day, slot, e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 text-xs text-white"
                      >
                        {MUSCLE_GROUPS.map(mg => (
                          <option key={mg} value={mg}>{mg === 'NIL' ? '-- None --' : mg}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* STEP 2: Room Inventory */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <div>
                <h2 className="text-xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  Room Supplies Checklist
                </h2>
                <p className="text-xs text-zinc-400">
                  Check the snacks & supplements you keep in your hostel room for recipe hacks.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ROOM_ITEMS.map((item) => {
                  const inStock = state.roomItems.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleToggleRoomItem(item)}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        inStock
                          ? 'bg-[#22c55e]/15 border-[#22c55e] text-[#22c55e]'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      <span>{item}</span>
                      {inStock && <Check size={14} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <h2 className="text-xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  Review & Lock In
                </h2>
                <p className="text-xs text-zinc-400">
                  Ready to launch your gym & mess diet tracking engine.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-zinc-900">
                  <span className="text-zinc-500 font-bold uppercase">Fitness Goal</span>
                  <span className="text-white font-bold">{state.fitnessGoal} ({state.dietPref})</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-zinc-900">
                  <span className="text-zinc-500 font-bold uppercase">Target Protein</span>
                  <span className="text-[#22c55e] font-bold">{state.targetProtein || 140}g / day</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-zinc-900">
                  <span className="text-zinc-500 font-bold uppercase">Room Supplies</span>
                  <span className="text-white font-bold">{state.roomItems.length} items checked</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 border-t border-zinc-900 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-3 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-zinc-950 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#22c55e]/20"
        >
          <span>{step === 3 ? 'Complete Setup' : 'Continue'}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
