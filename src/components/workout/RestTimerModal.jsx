import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Timer } from 'lucide-react';

export default function RestTimerModal({ isOpen, onClose, defaultSeconds = 60 }) {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds);

  useEffect(() => {
    setSecondsLeft(defaultSeconds);
    setTotalSeconds(defaultSeconds);
    setIsRunning(true);
  }, [defaultSeconds, isOpen]);

  useEffect(() => {
    let timer = null;
    if (isRunning && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft]);

  if (!isOpen) return null;

  const setPreset = (sec) => {
    setTotalSeconds(sec);
    setSecondsLeft(sec);
    setIsRunning(true);
  };

  const progress = Math.max(0, Math.min(100, ((totalSeconds - secondsLeft) / totalSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-xs bg-[#0e0e13] border border-[#22c55e]/40 rounded-3xl p-6 shadow-2xl relative text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex items-center justify-center gap-2 mb-4 text-[#22c55e]">
          <Timer size={20} />
          <h3 className="text-sm font-black uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Rest Interval
          </h3>
        </div>

        {/* Circular Countdown Progress */}
        <div className="relative w-36 h-36 mx-auto mb-5 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#27272a"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="#22c55e"
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progress) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {secondsLeft}s
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              {secondsLeft === 0 ? 'REST OVER! 🔥' : isRunning ? 'RESTING...' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-4 gap-1.5 mb-5">
          {[30, 60, 90, 120].map(sec => (
            <button
              key={sec}
              onClick={() => setPreset(sec)}
              className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                totalSeconds === sec
                  ? 'bg-[#22c55e] text-zinc-950 shadow-md shadow-[#22c55e]/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors"
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>{isRunning ? 'Pause' : 'Resume'}</span>
          </button>
          <button
            onClick={() => { setSecondsLeft(totalSeconds); setIsRunning(true); }}
            className="w-10 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
