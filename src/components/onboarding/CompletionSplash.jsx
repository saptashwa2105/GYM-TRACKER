import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';

export default function CompletionSplash({ onEnter }) {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute w-72 h-72 rounded-full bg-[#22c55e]/15 blur-3xl pointer-events-none" />

      {/* Trophy / Fire Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#22c55e] to-[#22d3ee] flex items-center justify-center mb-6 shadow-2xl shadow-[#22c55e]/30 relative z-10"
      >
        <Trophy size={48} className="text-zinc-950" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-3xl font-black text-[#22c55e] tracking-tight mb-2 relative z-10"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        YOUR GYM PLAN IS READY! 🔥
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-xs text-zinc-400 max-w-xs mb-8 leading-relaxed relative z-10"
      >
        Personalized workout split, mess menu macro analyzer, and hostel hacks are locked in.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEnter}
        className="px-8 py-4 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-zinc-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-[#22c55e]/30 flex items-center gap-2 relative z-10"
      >
        <span>Enter Dashboard</span>
        <Zap size={18} />
      </motion.button>
    </div>
  );
}
