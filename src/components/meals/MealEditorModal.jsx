import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Sparkles, Coffee, Utensils, Cookie, Moon } from 'lucide-react';
import { MEALS, SAMPLE_VEG_MENU, SAMPLE_NONVEG_MENU } from '../../data.js';
import { useApp } from '../../context/AppContext.jsx';

export default function MealEditorModal({ isOpen, onClose, day }) {
  const { state, update, showToast } = useApp();
  const [dayMeals, setDayMeals] = useState(() => ({
    Breakfast: state.messMenu[day]?.Breakfast || '',
    Lunch: state.messMenu[day]?.Lunch || '',
    'Evening Snacks': state.messMenu[day]?.['Evening Snacks'] || '',
    Dinner: state.messMenu[day]?.Dinner || '',
  }));

  if (!isOpen) return null;

  const handleChange = (mealKey, val) => {
    setDayMeals(prev => ({ ...prev, [mealKey]: val }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newMessMenu = { ...state.messMenu };
    newMessMenu[day] = { ...dayMeals };
    update({ messMenu: newMessMenu });
    showToast(`Updated mess meals for ${day}!`, 'success');
    onClose();
  };

  const loadPreset = (type) => {
    const template = type === 'VEG' ? SAMPLE_VEG_MENU[day] : SAMPLE_NONVEG_MENU[day];
    if (template) {
      setDayMeals({ ...template });
      showToast(`Loaded ${type} sample meals for ${day}`, 'info');
    }
  };

  const mealIcons = {
    Breakfast: Coffee,
    Lunch: Utensils,
    'Evening Snacks': Cookie,
    Dinner: Moon,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#0e0e13] border border-zinc-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        <div className="mb-4">
          <h3 className="text-base font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Edit {day}'s Mess Menu
          </h3>
          <p className="text-xs text-zinc-400">
            Type what the mess serves or apply sample Indian hostel templates.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => loadPreset('VEG')}
            className="flex-1 py-1.5 rounded-xl bg-green-950/40 hover:bg-green-900/40 text-green-400 border border-green-800/40 text-[11px] font-bold transition-all"
          >
            🌱 Apply Veg Preset
          </button>
          <button
            type="button"
            onClick={() => loadPreset('NON-VEG')}
            className="flex-1 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-800/40 text-[11px] font-bold transition-all"
          >
            🍗 Apply Non-Veg Preset
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          {MEALS.map((mealKey) => {
            const Icon = mealIcons[mealKey] || Utensils;
            return (
              <div key={mealKey}>
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Icon size={14} className="text-[#22d3ee]" />
                  <span>{mealKey}</span>
                </label>
                <textarea
                  rows={2}
                  placeholder={`Dishes served in ${mealKey.toLowerCase()}...`}
                  value={dayMeals[mealKey] || ''}
                  onChange={(e) => handleChange(mealKey, e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#22d3ee] rounded-xl p-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors resize-none"
                />
              </div>
            );
          })}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#22d3ee] hover:bg-[#06b6d4] text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#22d3ee]/20"
            >
              <Save size={14} />
              <span>Save Menu</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
