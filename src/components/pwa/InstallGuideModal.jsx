import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Smartphone, Laptop, Download, Check, Share2 } from 'lucide-react';

export default function InstallGuideModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('android'); // 'android' | 'ios' | 'desktop'

  if (!isOpen) return null;

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

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-[#22c55e]/15 text-[#22c55e] flex items-center justify-center">
            <Download size={16} />
          </div>
          <div>
            <h3 className="text-base font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Install GymForge PWA
            </h3>
            <p className="text-[10px] text-zinc-400">Install directly onto your home screen</p>
          </div>
        </div>

        {/* Platform Selector */}
        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 mb-4">
          <button
            onClick={() => setTab('android')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              tab === 'android' ? 'bg-[#22c55e] text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone size={12} /> Android
          </button>
          <button
            onClick={() => setTab('ios')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              tab === 'ios' ? 'bg-[#22d3ee] text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone size={12} /> iPhone/iOS
          </button>
          <button
            onClick={() => setTab('desktop')}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${
              tab === 'desktop' ? 'bg-purple-400 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Laptop size={12} /> PC / Mac
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 mb-4 text-xs text-zinc-300 space-y-2.5">
          {tab === 'android' && (
            <>
              <p>1. Open this page in <strong>Chrome</strong> on your Android phone.</p>
              <p>2. Tap the <strong>3 dots menu (⋮)</strong> at top right.</p>
              <p>3. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
            </>
          )}

          {tab === 'ios' && (
            <>
              <p>1. Open this page in <strong>Safari</strong> on your iPhone or iPad.</p>
              <p>2. Tap the <strong>Share</strong> button <Share2 size={12} className="inline text-[#22d3ee]" /> in bottom toolbar.</p>
              <p>3. Scroll down and tap <strong>"Add to Home Screen" (+)</strong>.</p>
            </>
          )}

          {tab === 'desktop' && (
            <>
              <p>1. Open this page in <strong>Chrome</strong> or <strong>Edge</strong> on your PC/Mac.</p>
              <p>2. Look for the <strong>Install GymForge icon (⊕)</strong> on the right side of the URL address bar.</p>
              <p>3. Click <strong>Install</strong> to add GymForge to your desktop apps.</p>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
        >
          Close Guide
        </button>
      </motion.div>
    </div>
  );
}
