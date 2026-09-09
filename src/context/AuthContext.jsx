import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { hasLegacyLocalData } from '../lib/cloudSync.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const isConfigured = isSupabaseConfigured();

  // Initialize auth session
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data?.session || null);
          setUser(data?.session?.user || null);
          setLoading(false);

          // Check if legacy data exists and user is signed in
          if (data?.session?.user && hasLegacyLocalData() && !localStorage.getItem('gymforge_migrated_to_cloud')) {
            setIsSyncModalOpen(true);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Auth init warning:', err);
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);

      if (event === 'SIGNED_IN' && newSession?.user && hasLegacyLocalData() && !localStorage.getItem('gymforge_migrated_to_cloud')) {
        setIsSyncModalOpen(true);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      setUser(data.user);
      setSession(data.session);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  const signUpWithEmail = useCallback(async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username?.trim() || email.split('@')[0],
          },
        },
      });
      if (error) throw error;
      setUser(data.user);
      setSession(data.session);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  const signInWithOAuth = useCallback(async (provider = 'google') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
    }
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openSyncModal = () => setIsSyncModalOpen(true);
  const closeSyncModal = () => setIsSyncModalOpen(false);

  const value = {
    user,
    session,
    loading,
    isConfigured,
    isAuthModalOpen,
    isSyncModalOpen,
    openAuthModal,
    closeAuthModal,
    openSyncModal,
    closeSyncModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
