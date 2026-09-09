import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Lock, Unlock, Zap, Shield, KeyRound, Sparkles, Delete, RefreshCcw } from 'lucide-react';
import AngerMeter from './AngerMeter.jsx';

const DEFAULT_PIN = '1234';

export default function PasscodeGate({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [anger, setAnger] = useState(15);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const lastPressTime = useRef(Date.now());
  const angerDecayTimer = useRef(null);

  // Anger meter natural cooling decay
  useEffect(() => {
    angerDecayTimer.current = setInterval(() => {
      setAnger(prev => Math.max(10, prev - 3));
    }, 400);

    return () => clearInterval(angerDecayTimer.current);
  }, []);

  // Handle digit input & anger increase
  const handleDigit = useCallback((digit) => {
    if (pin.length >= 4 || isUnlocked) return;

    // Calculate typing speed velocity
    const now = Date.now();
    const diff = now - lastPressTime.current;
    lastPressTime.current = now;

    // Fast typing increases anger faster
    const angerBoost = diff < 300 ? 25 : 12;
    setAnger(prev => Math.min(100, prev + angerBoost));

    const nextPin = pin + digit;
    setPin(nextPin);
    setError(false);

    if (nextPin.length === 4) {
      const targetPin = localStorage.getItem('gymforge_custom_pin') || DEFAULT_PIN;
      if (nextPin === targetPin) {
        // Unlock success!
        setIsUnlocked(true);
        setAnger(100);
        setTimeout(() => {
          onUnlock();
        }, 800);
      } else {
        // Wrong pin!
        setError(true);
        setAnger(prev => Math.min(100, prev + 35));
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 650);
      }
    }
  }, [pin, isUnlocked, onUnlock]);

  const handleClear = useCallback(() => {
    setPin('');
    setError(false);
  }, []);

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  }, []);

  const handleInstantUnlock = () => {
    setIsUnlocked(true);
    setPin('1234');
    setAnger(100);
    setTimeout(() => {
      onUnlock();
    }, 600);
  };

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      } else if (e.key === 'Enter' && pin.length === 4) {
        // Trigger auto verification handled by handleDigit
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDelete, handleClear, pin]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0c] flex flex-col items-center justify-between p-5 overflow-y-auto min-h-screen select-none">
      {/* Background Neon Grid Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,197,94,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(10,10,12,0.95)_90%)] pointer-events-none" />

      {/* Top Brand Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex items-center justify-between pt-4 relative z-10"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#22d3ee] flex items-center justify-center shadow-lg shadow-[#22c55e]/20">
            <Dumbbell size={20} className="text-zinc-950 font-bold" />
          </div>
          <div>
            <h1 className="text-base font-black text-zinc-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              GYMFORGE
            </h1>
            <p className="text-[10px] text-[#22c55e] uppercase tracking-widest font-bold">Secure Gate</p>
          </div>
        </div>

        <button
          onClick={handleInstantUnlock}
          className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-[#22c55e]/20 text-[#22c55e] border border-zinc-800 hover:border-[#22c55e]/50 text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-sm"
          title="Instant unlock for demo/testing"
        >
          <Sparkles size={12} />
          <span>Demo Bypass</span>
        </button>
      </motion.div>

      {/* Center Lock Core & Keypad */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xs flex flex-col items-center my-auto py-4 relative z-10"
      >
        {/* Lock / Unlock Icon */}
        <motion.div
          animate={
            error
              ? { x: [-10, 10, -8, 8, -4, 4, 0] }
              : isUnlocked
              ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }
              : {}
          }
          transition={{ duration: 0.5 }}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
            isUnlocked
              ? 'bg-[#22c55e] text-zinc-950 shadow-xl shadow-[#22c55e]/40'
              : error
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-xl shadow-red-500/20'
              : 'bg-zinc-900/90 text-[#22c55e] border border-zinc-800 shadow-xl shadow-black/60'
          }`}
        >
          {isUnlocked ? <Unlock size={28} /> : <Lock size={28} />}
        </motion.div>

        <h2 className="text-xl font-bold text-zinc-100 text-center mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          {isUnlocked ? 'ACCESS GRANTED' : 'ENTER PASSCODE'}
        </h2>
        <p className="text-xs text-zinc-400 text-center mb-4">
          Enter 4-digit PIN to access your workout & meal tracker
        </p>

        {/* Anger Meter Visualizer */}
        <div className="w-full mb-5">
          <AngerMeter level={anger} isMaxed={anger >= 90} />
        </div>

        {/* PIN Dots Display */}
        <motion.div
          animate={error ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-4 mb-6"
        >
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isUnlocked
                    ? 'bg-[#22c55e] shadow-lg shadow-[#22c55e]/60 scale-110'
                    : error
                    ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
                    : isFilled
                    ? 'bg-[#22c55e] shadow-md shadow-[#22c55e]/40 scale-105'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              />
            );
          })}
        </motion.div>

        {/* Numeric Touch Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 active:bg-[#22c55e]/20 text-lg font-bold text-zinc-200 hover:text-white border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-center shadow-md shadow-black/40"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {num}
            </motion.button>
          ))}

          {/* Clear Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className="h-14 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 text-xs font-bold text-zinc-500 hover:text-zinc-300 border border-zinc-800/60 transition-all flex items-center justify-center uppercase tracking-wider"
          >
            Clear
          </motion.button>

          {/* Zero Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 active:bg-[#22c55e]/20 text-lg font-bold text-zinc-200 hover:text-white border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-center shadow-md shadow-black/40"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            0
          </motion.button>

          {/* Backspace Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 transition-all flex items-center justify-center"
            title="Backspace"
          >
            <Delete size={20} />
          </motion.button>
        </div>
      </motion.div>

      {/* Footer Hint / Passcode note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xs text-center pb-2 relative z-10"
      >
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5"
        >
          <KeyRound size={12} className="text-[#22c55e]" />
          <span>{showHint ? 'Default PIN is 1234' : 'Need PIN hint? (Tap here)'}</span>
        </button>
      </motion.div>
    </div>
  );
}
