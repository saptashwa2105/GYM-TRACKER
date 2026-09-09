import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AppProvider, useApp } from './context/AppContext.jsx';

// Component Imports
import PasscodeGate from './components/gate/PasscodeGate.jsx';
import OnboardingWizard from './components/onboarding/OnboardingWizard.jsx';
import CompletionSplash from './components/onboarding/CompletionSplash.jsx';
import Header from './components/layout/Header.jsx';
import DaySelector from './components/layout/DaySelector.jsx';
import CategoryNav from './components/layout/CategoryNav.jsx';

// Feature Views
import DashboardOverview from './components/overview/DashboardOverview.jsx';
import WorkoutView from './components/workout/WorkoutView.jsx';
import MessMealsView from './components/meals/MessMealsView.jsx';
import RoomInventoryView from './components/inventory/RoomInventoryView.jsx';
import HostelHacksView from './components/hacks/HostelHacksView.jsx';

// Modals & Feedback
import AuthModal from './components/auth/AuthModal.jsx';
import SyncPromptModal from './components/auth/SyncPromptModal.jsx';
import InstallGuideModal from './components/pwa/InstallGuideModal.jsx';
import Toast from './components/common/Toast.jsx';
import { LS_KEY } from './lib/cloudSync.js';

function MainAppContent() {
  const { isAuthModalOpen, closeAuthModal, isSyncModalOpen, closeSyncModal } = useAuth();
  const { state, update, initWorkouts, toast, showToast } = useApp();
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // 1. Passcode Gate Entry
  if (!state.gateUnlocked) {
    return <PasscodeGate onUnlock={() => update({ gateUnlocked: true })} />;
  }

  // 2. First-Time User Onboarding Wizard
  if (!state.onboardingComplete) {
    if (state.onboardingStep === 4) {
      return (
        <CompletionSplash
          onEnter={() => {
            const workouts = initWorkouts();
            update({ onboardingComplete: true, onboardingStep: 5, workouts });
            showToast('Setup complete! Welcome to GymForge.', 'success');
          }}
        />
      );
    }
    return (
      <OnboardingWizard
        state={state}
        update={update}
        onComplete={() => update({ onboardingStep: 4 })}
      />
    );
  }

  const handleReset = () => {
    if (window.confirm('Reset all routines and mess schedules to start fresh?')) {
      localStorage.removeItem(LS_KEY);
      localStorage.removeItem('gymforge_migrated_to_cloud');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col max-w-lg mx-auto border-x border-zinc-900 shadow-2xl relative">
      {/* Top Header */}
      <Header
        onOpenInstallGuide={() => setShowInstallGuide(true)}
        onResetSetup={handleReset}
        onLockGate={() => update({ gateUnlocked: false })}
      />

      {/* Global Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <SyncPromptModal isOpen={isSyncModalOpen} onClose={closeSyncModal} />
      <InstallGuideModal isOpen={showInstallGuide} onClose={() => setShowInstallGuide(false)} />

      {/* 7-Day Selector */}
      <DaySelector />

      {/* Category Navigation Bar */}
      <CategoryNav />

      {/* Primary Feature Content */}
      <main className="flex-1 px-5 pt-2">
        {state.activeCategory === 'overview' && <DashboardOverview />}
        {state.activeCategory === 'workout' && <WorkoutView />}
        {state.activeCategory === 'meals' && <MessMealsView />}
        {state.activeCategory === 'inventory' && <RoomInventoryView />}
        {state.activeCategory === 'hacks' && <HostelHacksView />}
      </main>

      {/* Toast Notification Alert */}
      <Toast toast={toast} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
