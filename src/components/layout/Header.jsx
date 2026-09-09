import React, { useState, useEffect } from 'react';
import { Dumbbell, Download, Check, Cloud, CloudUpload, User, LogOut, Lock, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function Header({ onOpenInstallGuide, onResetSetup, onLockGate }) {
  const { user, isConfigured, openAuthModal, signOut } = useAuth();
  const { syncStatus, syncToCloud } = useApp();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setInstallPrompt(null);
    } else {
      onOpenInstallGuide();
    }
  };

  return (
    <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-zinc-900 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#22d3ee] flex items-center justify-center shadow-lg shadow-[#22c55e]/15">
          <Dumbbell size={18} className="text-zinc-950 font-bold" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
            GymForge
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold">
              {isConfigured ? 'Cloud Connected' : 'Local / Preview Mode'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5">
        {/* Sync Status / Trigger */}
        {user && isConfigured && (
          <button
            onClick={syncToCloud}
            disabled={syncStatus === 'syncing'}
            className="h-8 px-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
            title="Sync latest local edits to Supabase"
          >
            {syncStatus === 'syncing' ? (
              <span className="animate-spin text-xs text-[#22c55e]">↻</span>
            ) : syncStatus === 'synced' ? (
              <Check size={12} className="text-[#22c55e]" />
            ) : (
              <CloudUpload size={12} className="text-zinc-400" />
            )}
            <span className="hidden sm:inline">
              {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? 'Synced' : 'Sync'}
            </span>
          </button>
        )}

        {/* PWA Install Button */}
        {!isInstalled ? (
          <button
            onClick={handleInstallClick}
            className="h-8 px-2.5 rounded-xl bg-[#22c55e]/10 hover:bg-[#22c55e]/20 border border-[#22c55e]/40 hover:border-[#22c55e] text-[#22c55e] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
            title="Install GymForge Progressive Web App"
          >
            <Download size={12} />
            <span className="hidden sm:inline">Install</span>
          </button>
        ) : (
          <span className="h-8 px-2 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-1 text-[10px] text-zinc-500">
            <Check size={11} className="text-[#22c55e]" />
            <span className="hidden sm:inline">Installed</span>
          </span>
        )}

        {/* User Auth Button */}
        {user ? (
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-xl p-0.5">
            <span className="text-[10px] font-bold text-zinc-300 px-2 py-1 truncate max-w-[80px]">
              {user.user_metadata?.username || user.email?.split('@')[0]}
            </span>
            <button
              onClick={signOut}
              className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 flex items-center justify-center transition-colors"
              title="Sign Out"
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="h-8 px-2.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#22d3ee] text-zinc-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm shadow-[#22c55e]/20"
          >
            <User size={12} />
            <span>Sign In</span>
          </button>
        )}

        {/* Lock Gate */}
        <button
          onClick={onLockGate}
          className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          title="Lock Passcode Gate"
        >
          <Lock size={13} />
        </button>

        {/* Reset Setup */}
        <button
          onClick={onResetSetup}
          className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Reset Setup"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </header>
  );
}
