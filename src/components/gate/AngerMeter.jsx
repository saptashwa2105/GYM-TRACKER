import React from 'react';
import { Flame, Zap, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AngerMeter({ level = 0 }) {
  // level is 0 to 100
  const clampedLevel = Math.min(100, Math.max(0, level));

  const getMeterColor = () => {
    if (clampedLevel > 75) return { bar: 'from-orange-500 to-red-500', text: 'text-red-400', glow: 'rgba(239, 68, 68, 0.4)', label: '🔥 MAXIMUM RAGE' };
    if (clampedLevel > 45) return { bar: 'from-yellow-400 to-orange-500', text: 'text-orange-400', glow: 'rgba(249, 115, 22, 0.3)', label: '⚡ BEAST MODE' };
    if (clampedLevel > 20) return { bar: 'from-[#22c55e] to-yellow-400', text: 'text-yellow-400', glow: 'rgba(234, 179, 8, 0.25)', label: '💪 FOCUSED' };
    return { bar: 'from-[#22c55e] to-[#22d3ee]', text: 'text-[#22c55e]', glow: 'rgba(34, 197, 94, 0.2)', label: '🟢 CALM FOCUS' };
  };

  const info = getMeterColor();

  return (
    <div className="w-full bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-3.5 backdrop-blur-md shadow-lg shadow-black/40">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              rotate: clampedLevel > 50 ? [-4, 4, -4] : 0,
              scale: clampedLevel > 75 ? [1, 1.2, 1] : 1,
            }}
            transition={{ repeat: Infinity, duration: 0.3 }}
          >
            {clampedLevel > 75 ? (
              <Flame size={16} className="text-red-500 animate-pulse" />
            ) : clampedLevel > 45 ? (
              <Zap size={16} className="text-orange-400" />
            ) : (
              <ShieldAlert size={16} className="text-[#22c55e]" />
            )}
          </motion.div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400" style={{ fontFamily: 'var(--font-display)' }}>
            Intensity / Anger Meter
          </span>
        </div>

        <span className={`text-[10px] font-black tracking-wider ${info.text}`} style={{ fontFamily: 'var(--font-display)' }}>
          {info.label} ({Math.round(clampedLevel)}%)
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden p-[1px] border border-zinc-800">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${info.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedLevel}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          style={{
            boxShadow: `0 0 12px ${info.glow}`,
          }}
        />
      </div>

      {/* Helper text */}
      <p className="text-[9px] text-zinc-500 mt-2 text-center tracking-wide">
        {clampedLevel > 70
          ? '⚠️ RAGE OVERLOAD! Channel that energy into your workout!'
          : 'Tap the keypad fast or type your code to ignite the intensity.'}
      </p>
    </div>
  );
}
