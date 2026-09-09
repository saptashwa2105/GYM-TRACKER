import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Coffee, Cookie, Moon, Clock, Edit3, Camera, Flame, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { estimateDayMacros, estimateMealMacros } from '../../nutrition.js';
import DailyNutritionBar from './DailyNutritionBar.jsx';
import MealFilters from './MealFilters.jsx';
import MealEditorModal from './MealEditorModal.jsx';
import OcrMenuScanner from './OcrMenuScanner.jsx';

export default function MessMealsView() {
  const { state } = useApp();
  const day = state.activeDay;
  const menu = state.messMenu[day] || {};

  const [filter, setFilter] = useState('all'); // 'all' | 'veg' | 'protein' | 'nonveg'
  const [showEditor, setShowEditor] = useState(false);
  const [showOcr, setShowOcr] = useState(false);

  const mealMeta = [
    { key: 'Breakfast', icon: Coffee, time: '7:30 – 9:00 AM', color: '#facc15' },
    { key: 'Lunch', icon: Utensils, time: '12:30 – 2:00 PM', color: '#22d3ee' },
    { key: 'Evening Snacks', icon: Cookie, time: '4:30 – 5:30 PM', color: '#f97316' },
    { key: 'Dinner', icon: Moon, time: '7:30 – 9:30 PM', color: '#a78bfa' },
  ];

  const dayMacros = estimateDayMacros(menu);

  let processedMeals = mealMeta.map(m => {
    const dishText = menu[m.key] || 'Standard Mess Meal';
    const macros = estimateMealMacros(dishText);
    return { ...m, dishText, macros };
  });

  if (filter === 'veg') {
    processedMeals = processedMeals.filter(m => m.macros.isVeg);
  } else if (filter === 'protein') {
    processedMeals = [...processedMeals].sort((a, b) => b.macros.protein - a.macros.protein);
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Modals */}
      <MealEditorModal isOpen={showEditor} onClose={() => setShowEditor(false)} day={day} />
      <OcrMenuScanner isOpen={showOcr} onClose={() => setShowOcr(false)} />

      {/* Top Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Utensils size={18} className="text-[#22d3ee]" />
          <h3 className="text-sm font-black uppercase tracking-wider text-[#22d3ee]" style={{ fontFamily: 'var(--font-display)' }}>
            {day}'s Mess Menu
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOcr(true)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[#22d3ee] border border-zinc-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
          >
            <Camera size={13} />
            <span>Scan OCR</span>
          </button>
          <button
            onClick={() => setShowEditor(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-[#22c55e] border border-[#22c55e]/30 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
          >
            <Edit3 size={13} />
            <span>Edit Meals</span>
          </button>
        </div>
      </div>

      {/* Daily Nutrition Summary Bar */}
      <DailyNutritionBar dayMacros={dayMacros} day={day} isHighlightNonVeg={filter === 'nonveg'} />

      {/* Filters Bar */}
      <MealFilters activeFilter={filter} onFilterChange={setFilter} />

      {/* Meal Cards */}
      <div className="space-y-3">
        {processedMeals.map((meal) => {
          const isNonVegMeal = !meal.macros.isVeg;
          const isHighlight = filter === 'nonveg' && isNonVegMeal;

          return (
            <div
              key={meal.key}
              className={`glass-card p-4 rounded-3xl border transition-all ${
                isHighlight
                  ? 'border-red-500/80 bg-red-950/20 shadow-lg shadow-red-500/15'
                  : 'border-zinc-800/80 bg-[#0e0e13]/70'
              }`}
              style={{ borderLeftWidth: '4px', borderLeftColor: meal.color }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <meal.icon size={16} style={{ color: meal.color }} />
                  <span className="text-xs font-black uppercase tracking-wider" style={{ color: meal.color, fontFamily: 'var(--font-display)' }}>
                    {meal.key}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Clock size={11} /> {meal.time}
                </span>
              </div>

              <p className="text-xs text-zinc-200 leading-relaxed font-medium mb-3">
                {meal.dishText}
              </p>

              {/* Macro Badges */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-900 items-center">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 flex items-center gap-1">
                  <Flame size={10} className="text-yellow-400" /> {meal.macros.calories} kcal
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 flex items-center gap-1">
                  <Zap size={10} className="text-[#22c55e]" /> {meal.macros.protein}g Protein
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  🌾 {meal.macros.carbs}g Carbs
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-300 border border-orange-500/20">
                  🥑 {meal.macros.fats}g Fats
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ml-auto ${
                  meal.macros.isVeg
                    ? 'bg-green-900/30 text-green-400 border border-green-800/40'
                    : 'bg-red-900/30 text-red-400 border border-red-800/40'
                }`}>
                  {meal.macros.isVeg ? '🌱 VEG' : '🍗 NON-VEG'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
