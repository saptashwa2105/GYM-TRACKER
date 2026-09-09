import React from 'react';
import { DAYS, DAY_ABBREV } from '../../data.js';
import { useApp } from '../../context/AppContext.jsx';

export default function DaySelector() {
  const { state, update } = useApp();
  const activeDay = state.activeDay;

  const currentDayIndex = new Date().getDay();
  const todayDayName = DAYS[currentDayIndex === 0 ? 6 : currentDayIndex - 1];

  return (
    <div className="px-5 py-3 bg-[#0a0a0c]">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {DAYS.map((day, idx) => {
          const isActive = activeDay === day;
          const isToday = todayDayName === day;
          const isRestDay = (state.split[day] || []).every(m => m === 'NIL');

          return (
            <button
              key={day}
              onClick={() => update({ activeDay: day })}
              className={`flex-1 min-w-[50px] py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 relative border ${
                isActive
                  ? 'bg-zinc-900 border-[#22c55e] text-white shadow-lg shadow-[#22c55e]/10'
                  : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {/* Today indicator dot */}
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#22d3ee] absolute top-1.5 right-1.5" title="Today" />
              )}

              <span
                className={`text-[11px] font-black uppercase tracking-wider ${
                  isActive ? 'text-[#22c55e]' : 'text-zinc-400'
                }`}
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {DAY_ABBREV[idx]}
              </span>

              <span className="text-[9px] text-zinc-600 mt-0.5">
                {isRestDay ? 'REST' : 'GYM'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
