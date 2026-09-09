import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none px-4 w-full max-w-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className={`p-3.5 rounded-2xl backdrop-blur-md shadow-2xl border flex items-center gap-2.5 text-xs font-bold text-white ${
          isSuccess
            ? 'bg-zinc-950/90 border-[#22c55e]/50 text-[#22c55e] shadow-[#22c55e]/15'
            : isError
            ? 'bg-zinc-950/90 border-red-500/50 text-red-400 shadow-red-500/15'
            : 'bg-zinc-950/90 border-cyan-500/50 text-cyan-300 shadow-cyan-500/15'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 size={16} className="text-[#22c55e] shrink-0" />
        ) : isError ? (
          <AlertCircle size={16} className="text-red-400 shrink-0" />
        ) : (
          <Sparkles size={16} className="text-cyan-400 shrink-0" />
        )}
        <span>{toast.message}</span>
      </motion.div>
    </div>
  );
}
