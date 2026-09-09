import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DAYS, DEFAULT_SPLIT, EXERCISE_DB } from '../data.js';
import { LS_KEY, pushUserData, fetchUserData } from '../lib/cloudSync.js';
import { useAuth } from './AuthContext.jsx';

const AppContext = createContext(null);

function createInitialState() {
  const currentDayIndex = new Date().getDay();
  const dayName = DAYS[currentDayIndex === 0 ? 6 : currentDayIndex - 1];

  return {
    gateUnlocked: false,
    onboardingComplete: false,
    onboardingStep: 0,
    fitnessGoal: 'LEAN',
    split: { ...DEFAULT_SPLIT },
    messMenu: DAYS.reduce((acc, day) => {
      acc[day] = { Breakfast: '', Lunch: '', 'Evening Snacks': '', Dinner: '' };
      return acc;
    }, {}),
    dietPref: 'VEG',
    roomItems: ['Oats', 'Bananas', 'Peanut Butter', 'Whey Protein'],
    customItems: '',
    workouts: {},
    activeDay: dayName,
    activeCategory: 'overview', // 'overview' | 'workout' | 'meals' | 'inventory' | 'hacks'
    targetProtein: 140,
  };
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const initial = createInitialState();
    return {
      ...initial,
      ...parsed,
      fitnessGoal: parsed?.fitnessGoal || 'LEAN',
      split: { ...initial.split, ...(parsed?.split || {}) },
      messMenu: DAYS.reduce((acc, day) => {
        acc[day] = { ...initial.messMenu[day], ...(parsed?.messMenu?.[day] || {}) };
        return acc;
      }, {}),
      roomItems: Array.isArray(parsed?.roomItems) && parsed.roomItems.length > 0 ? parsed.roomItems : initial.roomItems,
      workouts: parsed?.workouts || {},
      gateUnlocked: false, // Always require gate unlock on fresh session
    };
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const { user, isConfigured } = useAuth();
  const [state, setState] = useState(() => loadSavedState() || createInitialState());
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(prev => (prev?.id === Date.now() ? null : prev));
    }, duration);
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('[AppContext] Failed to save state to localStorage:', err);
    }
  }, [state]);

  const update = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  // Generate workout entries from split and exercise DB
  const initWorkouts = useCallback((customSplit = null) => {
    const splitToUse = customSplit || state.split;
    const workouts = {};
    DAYS.forEach(day => {
      const muscles = (splitToUse[day] || []).filter(m => m !== 'NIL');
      workouts[day] = {};
      muscles.forEach(muscle => {
        workouts[day][muscle] = EXERCISE_DB[muscle]
          ? EXERCISE_DB[muscle].map(ex => ({ ...ex, completed: false, weight: 0 }))
          : [];
      });
    });
    return workouts;
  }, [state.split]);

  // Sync state to Supabase when user is logged in
  const syncToCloud = useCallback(async () => {
    if (!user || !isConfigured) return;
    setSyncStatus('syncing');
    try {
      const res = await pushUserData(user.id, state);
      if (res.success) {
        setSyncStatus('synced');
        showToast('All data securely synced to cloud', 'success');
        setTimeout(() => setSyncStatus('idle'), 4000);
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('[AppContext] Sync error:', err);
      setSyncStatus('error');
    }
  }, [user, isConfigured, state, showToast]);

  // Pull cloud data on login if available
  useEffect(() => {
    let active = true;
    if (user && isConfigured) {
      fetchUserData(user.id).then(cloudData => {
        if (!active || !cloudData) return;
        if (cloudData.profile || cloudData.splits.length > 0) {
          // Merge cloud data into state
          const newSplit = { ...state.split };
          cloudData.splits.forEach(s => {
            if (s.day_of_week && Array.isArray(s.target_muscles)) {
              newSplit[s.day_of_week] = s.target_muscles;
            }
          });

          const newMessMenu = { ...state.messMenu };
          cloudData.meals.forEach(m => {
            if (m.day_of_week && m.meal_type && newMessMenu[m.day_of_week]) {
              newMessMenu[m.day_of_week][m.meal_type] = m.food_items;
            }
          });

          update({
            fitnessGoal: cloudData.profile?.fitness_goal || state.fitnessGoal,
            dietPref: cloudData.profile?.diet_pref || state.dietPref,
            targetProtein: cloudData.profile?.target_protein || state.targetProtein,
            split: newSplit,
            messMenu: newMessMenu,
          });
          showToast('Loaded profile from cloud', 'success');
        }
      });
    }
    return () => {
      active = false;
    };
  }, [user, isConfigured]);

  const value = {
    state,
    update,
    initWorkouts,
    syncStatus,
    syncToCloud,
    toast,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
