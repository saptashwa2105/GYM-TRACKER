import React, { useState } from 'react';
import { Package, Plus, Trash2, Check, Sparkles, ChefHat } from 'lucide-react';
import { ROOM_ITEMS } from '../../data.js';
import { useApp } from '../../context/AppContext.jsx';

export default function RoomInventoryView() {
  const { state, update, showToast } = useApp();
  const [newItem, setNewItem] = useState('');

  const handleTogglePreset = (item) => {
    let newItems;
    if (state.roomItems.includes(item)) {
      newItems = state.roomItems.filter(i => i !== item);
      showToast(`Removed ${item} from room supplies`, 'info');
    } else {
      newItems = [...state.roomItems, item];
      showToast(`Added ${item} to room supplies!`, 'success');
    }
    update({ roomItems: newItems });
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (state.roomItems.includes(trimmed)) {
      showToast(`${trimmed} is already in inventory!`, 'info');
      return;
    }
    const newItems = [...state.roomItems, trimmed];
    update({ roomItems: newItems });
    setNewItem('');
    showToast(`Added custom item: ${trimmed}`, 'success');
  };

  const handleRemoveItem = (item) => {
    const newItems = state.roomItems.filter(i => i !== item);
    update({ roomItems: newItems });
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-yellow-400" style={{ fontFamily: 'var(--font-display)' }}>
            Room Supplies & Inventory Checklist
          </h3>
          <p className="text-xs text-zinc-400">
            Keep track of hostel snacks, powders, and essentials in your room.
          </p>
        </div>

        <button
          onClick={() => update({ activeCategory: 'hacks' })}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#22d3ee] text-zinc-950 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#22c55e]/15"
        >
          <ChefHat size={13} />
          <span>Recipe Hacks →</span>
        </button>
      </div>

      {/* Add Custom Item Form */}
      <form onSubmit={handleAddCustom} className="flex gap-2">
        <input
          type="text"
          placeholder="Add custom supply (e.g. Greek Yogurt, Chia Seeds)..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-yellow-400 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-all shadow-md shadow-yellow-400/20"
        >
          <Plus size={15} />
          <span>Add</span>
        </button>
      </form>

      {/* Standard Essential Preset Toggles */}
      <div className="glass-card p-4 rounded-3xl border border-zinc-800/80 bg-[#0e0e13]/70">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles size={13} className="text-yellow-400" />
          <span>Quick Preset Toggle</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ROOM_ITEMS.map((item) => {
            const inStock = state.roomItems.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleTogglePreset(item)}
                className={`p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between border transition-all ${
                  inStock
                    ? 'bg-yellow-400/15 border-yellow-400 text-yellow-300 shadow-sm shadow-yellow-400/10'
                    : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span>{item}</span>
                <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] ${
                  inStock ? 'bg-yellow-400 text-zinc-950 font-bold' : 'border border-zinc-700 text-transparent'
                }`}>
                  <Check size={10} strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Room Supplies List */}
      <div className="glass-card p-4 rounded-3xl border border-zinc-800/80 bg-[#0e0e13]/70">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-yellow-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              In-Stock Supplies ({state.roomItems.length})
            </h4>
          </div>
          <span className="text-[10px] text-zinc-500 font-semibold">Ready for recipes</span>
        </div>

        {state.roomItems.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">
            No supplies checked. Tap presets above or add custom supplies.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {state.roomItems.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800/90 text-xs text-zinc-200"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="font-semibold">{item}</span>
                </div>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                  title="Remove from inventory"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
