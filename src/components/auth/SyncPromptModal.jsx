import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CloudUpload, Check, X, Database, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { migrateLegacyDataToSupabase } from '../../lib/cloudSync.js';
import { useApp } from '../../context/AppContext.jsx';

export default function SyncPromptModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { showToast } = useApp();
  const [syncing, setSyncing] = useState(false);

  if (!isOpen || !user) return null;

  const handleSync = async () => {
    setSyncing(true);
    const result = await migrateLegacyDataToSupabase(user.id);
    setSyncing(false);
    if (result.success) {
      showToast('Local routines and meals synced to Supabase!', 'success');
      onClose();
    } else {
      showToast('Sync failed: ' + (result.error || result.message), 'error');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('gymforge_migrated_to_cloud', 'dismissed');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#0e0e13] border border-[#22c55e]/30 rounded-3xl p-6 shadow-2xl relative"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center mb-4 text-[#22c55e]">
          <CloudUpload size={24} />
        </div>

        <h3 className="text-base font-bold text-white mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
          Sync Local Logs to Supabase Cloud?
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          We found workout routines, mess menu history, and inventory logs in your browser cache.
          Would you like to sync them into your permanent Supabase cloud account?
        </p>

        <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl mb-5 space-y-1.5 text-[11px] text-zinc-300">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-[#22c55e]" />
            <span>7-Day Workout Split & Exercise logs</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-[#22c55e]" />
            <span>Mess Meal Schedules & Macro data</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-[#22c55e]" />
            <span>Room Inventory supplies</span>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleDismiss}
            disabled={syncing}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Keep Local
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex-1 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-[#22c55e]/20"
          >
            {syncing ? (
              <span className="animate-spin text-sm">↻</span>
            ) : (
              <>
                <Database size={14} />
                <span>Sync to Cloud</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
