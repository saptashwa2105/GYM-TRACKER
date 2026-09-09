import React, { useState } from 'react';
import { Dumbbell, Calendar, Flame } from 'lucide-react';
import WorkoutLogger from './WorkoutLogger.jsx';
import WorkoutPlanner from './WorkoutPlanner.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function WorkoutView() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('logger'); // 'logger' | 'planner'

  return (
    <div className="space-y-4 pb-12">
      {/* Sub-navigation Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-900">
        <button
          onClick={() => setActiveTab('logger')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'logger'
              ? 'bg-[#22c55e] text-zinc-950 shadow-md shadow-[#22c55e]/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame size={14} />
          <span>Log {state.activeDay}'s Exercises</span>
        </button>

        <button
          onClick={() => setActiveTab('planner')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'planner'
              ? 'bg-[#22c55e] text-zinc-950 shadow-md shadow-[#22c55e]/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar size={14} />
          <span>7-Day Split Planner</span>
        </button>
      </div>

      {activeTab === 'logger' ? (
        <WorkoutLogger day={state.activeDay} />
      ) : (
        <WorkoutPlanner />
      )}
    </div>
  );
}
