import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Flame, Zap, BookOpen, ChevronDown, Sparkles } from 'lucide-react';

export default function RecipeCard({ recipe, accentColor = '#22c55e' }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="glass-card p-4 rounded-3xl border border-zinc-800/80 hover:border-zinc-700 bg-[#0e0e13]/80 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-1.5">
        <h4 className="text-xs font-bold text-zinc-100 leading-snug pr-2">
          {recipe.name}
        </h4>
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 border"
          style={{
            background: `${accentColor}15`,
            color: accentColor,
            borderColor: `${accentColor}30`,
          }}
        >
          {recipe.tag}
        </span>
      </div>

      {recipe.gapFillBadge && (
        <div className="mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 inline-flex items-center gap-1">
            <Sparkles size={11} /> {recipe.gapFillBadge}
          </span>
        </div>
      )}

      {/* Quick Metrics */}
      <div className="flex items-center gap-3 text-[11px] text-zinc-400 mb-1">
        <span className="flex items-center gap-1">
          <Timer size={11} className="text-zinc-500" /> {recipe.timing}
        </span>
        <span className="flex items-center gap-1">
          <Flame size={11} className="text-yellow-400" /> {recipe.calories}
        </span>
        {recipe.proteinGrams > 0 && (
          <span className="flex items-center gap-1 text-[#22c55e] font-bold">
            <Zap size={11} /> +{recipe.proteinGrams}g Protein
          </span>
        )}
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 mt-2.5 border-t border-zinc-900 space-y-2.5 overflow-hidden"
          >
            {recipe.ingredients?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Ingredients</p>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.ingredients.map((ing, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded-lg border border-zinc-800">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 flex items-center gap-1">
                <BookOpen size={10} className="text-zinc-400" /> Preparation
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">{recipe.instructions}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-zinc-600 font-medium">
        <span>{expanded ? 'Tap to collapse' : 'Tap for ingredients & steps'}</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </div>
    </div>
  );
}
