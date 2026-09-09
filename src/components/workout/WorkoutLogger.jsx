import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, Moon, Timer, Trash2, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import RestTimerModal from './RestTimerModal.jsx';

export default function WorkoutLogger({ day }) {
  const { state, update, showToast } = useApp();
  const dayWorkouts = state.workouts[day] || {};
  const muscles = Object.keys(dayWorkouts).filter(m => m !== 'NIL' && dayWorkouts[m]?.length > 0);

  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMuscleForAdd, setSelectedMuscleForAdd] = useState(muscles[0] || '');
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState('12');

  const editRef = useRef(null);

  useEffect(() => {
    if (editRef.current) editRef.current.focus();
  }, [editingCell]);

  if (muscles.length === 0) {
    return (
      <div className="text-center py-16 glass-card rounded-3xl p-6 border border-zinc-900 bg-zinc-950/60">
        <Moon size={44} className="mx-auto text-zinc-700 mb-3" />
        <h3 className="text-base font-bold text-zinc-300 mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Rest & Recovery Day
        </h3>
        <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-4">
          No workout split configured for {day}. Rest is where muscles grow!
        </p>
      </div>
    );
  }

  const startEdit = (muscle, exIdx, field, currentValue) => {
    setEditingCell({ muscle, exIdx, field });
    setEditValue(String(currentValue ?? ''));
  };

  const saveEdit = () => {
    if (!editingCell) return;
    const { muscle, exIdx, field } = editingCell;
    const newWorkouts = JSON.parse(JSON.stringify(state.workouts));
    if (!newWorkouts[day]?.[muscle]?.[exIdx]) return;

    if (field === 'name') {
      newWorkouts[day][muscle][exIdx].name = editValue.trim() || 'Exercise';
    } else if (field === 'sets') {
      newWorkouts[day][muscle][exIdx].sets = parseInt(editValue) || 1;
    } else if (field === 'reps') {
      newWorkouts[day][muscle][exIdx].reps = editValue.trim() || '12';
    } else if (field === 'weight') {
      newWorkouts[day][muscle][exIdx].weight = parseFloat(editValue) || 0;
    }
    update({ workouts: newWorkouts });
    setEditingCell(null);
  };

  const toggleCompleted = (muscle, exIdx) => {
    const newWorkouts = JSON.parse(JSON.stringify(state.workouts));
    const isNowCompleted = !newWorkouts[day][muscle][exIdx].completed;
    newWorkouts[day][muscle][exIdx].completed = isNowCompleted;
    update({ workouts: newWorkouts });

    if (isNowCompleted) {
      showToast(`Set logged! Time for a rest interval.`, 'success');
      setShowRestTimer(true);
    }
  };

  const deleteExercise = (muscle, exIdx) => {
    const newWorkouts = JSON.parse(JSON.stringify(state.workouts));
    newWorkouts[day][muscle].splice(exIdx, 1);
    update({ workouts: newWorkouts });
    showToast('Exercise removed', 'info');
  };

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!newExName.trim() || !selectedMuscleForAdd) return;

    const newWorkouts = JSON.parse(JSON.stringify(state.workouts));
    if (!newWorkouts[day]) newWorkouts[day] = {};
    if (!newWorkouts[day][selectedMuscleForAdd]) newWorkouts[day][selectedMuscleForAdd] = [];

    newWorkouts[day][selectedMuscleForAdd].push({
      name: newExName.trim(),
      sets: parseInt(newExSets) || 3,
      reps: String(newExReps).trim() || '12',
      weight: 0,
      completed: false,
    });

    update({ workouts: newWorkouts });
    setNewExName('');
    setShowAddModal(false);
    showToast(`Added ${newExName} to ${selectedMuscleForAdd}!`, 'success');
  };

  return (
    <div className="space-y-4">
      {/* Rest Timer Modal */}
      <RestTimerModal isOpen={showRestTimer} onClose={() => setShowRestTimer(false)} defaultSeconds={60} />

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0e0e13] border border-zinc-800 rounded-3xl p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Add Exercise to {day}
            </h3>
            <form onSubmit={handleAddExercise} className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Muscle Group
                </label>
                <select
                  value={selectedMuscleForAdd}
                  onChange={(e) => setSelectedMuscleForAdd(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#22c55e]"
                >
                  {muscles.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Exercise Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Incline DB Flyes"
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    value={newExSets}
                    onChange={(e) => setNewExSets(e.target.value)}
                    min="1"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Reps
                  </label>
                  <input
                    type="text"
                    value={newExReps}
                    onChange={(e) => setNewExReps(e.target.value)}
                    placeholder="12 or Failure"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#22c55e] text-zinc-950 text-xs font-bold uppercase tracking-wider shadow-md shadow-[#22c55e]/20"
                >
                  Save Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Bar with Rest Timer Shortcut and Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-[#22c55e]" />
          <h3 className="text-sm font-black uppercase tracking-wider text-[#22c55e]" style={{ fontFamily: 'var(--font-display)' }}>
            {day}'s Workout Routine
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRestTimer(true)}
            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[#22d3ee] border border-zinc-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            <Timer size={13} />
            <span>Rest Timer</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-[#22c55e] border border-[#22c55e]/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Muscle Group Tables */}
      <div className="space-y-4">
        {muscles.map((muscle) => {
          const exercises = dayWorkouts[muscle] || [];

          return (
            <div key={muscle} className="glass-card p-4 rounded-3xl border border-zinc-800/90 bg-[#0e0e13]/80">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                    {muscle}
                  </h4>
                </div>
                <span className="text-[10px] text-zinc-500 font-semibold">
                  {exercises.filter(e => e.completed).length}/{exercises.length} Completed
                </span>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[28px_1fr_45px_55px_45px_24px] gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 px-1">
                <span className="text-center">Done</span>
                <span>Exercise</span>
                <span className="text-center">Sets</span>
                <span className="text-center">Reps</span>
                <span className="text-center">Kg</span>
                <span></span>
              </div>

              {/* Exercise Rows */}
              <div className="space-y-1.5">
                {exercises.map((ex, exIdx) => {
                  const isDone = Boolean(ex.completed);

                  return (
                    <div
                      key={exIdx}
                      className={`grid grid-cols-[28px_1fr_45px_55px_45px_24px] gap-1 items-center p-1.5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-[#22c55e]/5 border-[#22c55e]/30 text-zinc-400'
                          : 'bg-zinc-950/60 border-zinc-900 text-zinc-200 hover:border-zinc-800'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleCompleted(muscle, exIdx)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#22c55e] text-zinc-950 font-bold shadow-md shadow-[#22c55e]/20'
                            : 'bg-zinc-900 border border-zinc-700 text-transparent hover:border-[#22c55e]'
                        }`}
                      >
                        <Check size={13} strokeWidth={3} />
                      </button>

                      {/* Exercise Name */}
                      {editingCell?.muscle === muscle && editingCell?.exIdx === exIdx && editingCell?.field === 'name' ? (
                        <input
                          ref={editRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full bg-zinc-900 border border-[#22c55e] rounded-lg px-2 py-0.5 text-xs text-white outline-none"
                        />
                      ) : (
                        <div
                          onDoubleClick={() => startEdit(muscle, exIdx, 'name', ex.name)}
                          className={`text-xs font-semibold truncate cursor-pointer ${
                            isDone ? 'line-through text-zinc-500' : 'text-zinc-200'
                          }`}
                          title="Double-click to edit name"
                        >
                          {ex.name}
                        </div>
                      )}

                      {/* Sets */}
                      {editingCell?.muscle === muscle && editingCell?.exIdx === exIdx && editingCell?.field === 'sets' ? (
                        <input
                          ref={editRef}
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full bg-zinc-900 border border-[#22c55e] rounded-lg px-1 py-0.5 text-xs text-center text-white outline-none"
                        />
                      ) : (
                        <div
                          onDoubleClick={() => startEdit(muscle, exIdx, 'sets', ex.sets)}
                          className="text-xs font-bold text-center text-[#22d3ee] cursor-pointer"
                          title="Double-click to edit sets"
                        >
                          {ex.sets}
                        </div>
                      )}

                      {/* Reps */}
                      {editingCell?.muscle === muscle && editingCell?.exIdx === exIdx && editingCell?.field === 'reps' ? (
                        <input
                          ref={editRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full bg-zinc-900 border border-[#22c55e] rounded-lg px-1 py-0.5 text-xs text-center text-white outline-none"
                        />
                      ) : (
                        <div
                          onDoubleClick={() => startEdit(muscle, exIdx, 'reps', ex.reps)}
                          className="text-xs font-semibold text-center text-zinc-400 cursor-pointer"
                          title="Double-click to edit reps"
                        >
                          {ex.reps}
                        </div>
                      )}

                      {/* Weight (kg) */}
                      {editingCell?.muscle === muscle && editingCell?.exIdx === exIdx && editingCell?.field === 'weight' ? (
                        <input
                          ref={editRef}
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full bg-zinc-900 border border-[#22c55e] rounded-lg px-1 py-0.5 text-xs text-center text-white outline-none"
                        />
                      ) : (
                        <div
                          onDoubleClick={() => startEdit(muscle, exIdx, 'weight', ex.weight || 0)}
                          className="text-xs font-semibold text-center text-yellow-400 cursor-pointer"
                          title="Double-click to edit weight kg"
                        >
                          {ex.weight ? `${ex.weight}` : '-'}
                        </div>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => deleteExercise(muscle, exIdx)}
                        className="text-zinc-600 hover:text-red-400 p-0.5 transition-colors"
                        title="Delete exercise"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
