import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Lock, User, Sparkles, Shield, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AuthModal({ isOpen, onClose }) {
  const { isConfigured, signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      const res = await signUpWithEmail(email, password, username);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error.message || 'Signup failed. Please try again.');
      } else {
        setSuccessMsg('Account created successfully! Signed in.');
        setTimeout(() => onClose(), 1200);
      }
    } else {
      const res = await signInWithEmail(email, password);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error.message || 'Invalid email or password.');
      } else {
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => onClose(), 1000);
      }
    }
  };

  const handleOAuth = async (provider) => {
    setErrorMsg('');
    setLoading(true);
    const res = await signInWithOAuth(provider);
    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error.message || `OAuth sign in with ${provider} failed.`);
    } else {
      onClose();
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    await signInWithEmail('demo@gymforge.dev', 'demopassword123');
    setLoading(false);
    setSuccessMsg('Signed in with Demo Guest Account!');
    setTimeout(() => onClose(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-[#0e0e13] border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#22c55e] via-[#22d3ee] to-[#22c55e]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield size={18} className="text-[#22c55e]" />
            <h3 className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {mode === 'signin' ? 'Sign In to GymForge' : 'Create Your Account'}
            </h3>
          </div>
          <p className="text-xs text-zinc-400">
            {isConfigured
              ? 'Synced securely with your Supabase PostgreSQL cloud database.'
              : '⚡ Running in Instant Demo/Local Auth Mode (No Supabase keys detected).'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 mb-5">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-[#22c55e] text-zinc-950 shadow-md shadow-[#22c55e]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#22c55e] text-zinc-950 shadow-md shadow-[#22c55e]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="e.g. IronWarrior"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-950/90 border border-zinc-800 focus:border-[#22c55e] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                placeholder="athlete@gymforge.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-950/90 border border-zinc-800 focus:border-[#22c55e] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1 block">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950/90 border border-zinc-800 focus:border-[#22c55e] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-zinc-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#22c55e]/20 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="animate-spin text-sm">↻</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#0e0e13] px-2 text-zinc-500 font-bold">Or continue with</span>
          </div>
        </div>

        {/* OAuth / Guest Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-dashed border-[#22c55e]/40 hover:border-[#22c55e] text-xs font-bold text-[#22c55e] transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>Instant Guest Demo Login</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
