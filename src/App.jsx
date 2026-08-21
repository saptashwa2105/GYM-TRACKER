import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dumbbell, ChevronRight, ChevronLeft, Utensils,
  Flame, Zap, Clock, Check, Plus, RotateCcw, Download,
  ChefHat, Coffee, Moon, Cookie,
  Heart, AlertCircle, Package,
  Beef, Salad, Timer, BookOpen, Sparkles, Trophy,
  Edit3, Save, RefreshCw, FileText, Smartphone, Laptop, X, Share2
} from 'lucide-react';
import {
  DAYS, DAY_ABBREV, MUSCLE_GROUPS, MEALS, ROOM_ITEMS,
  EXERCISE_DB, DEFAULT_SPLIT, SAMPLE_VEG_MENU, SAMPLE_NONVEG_MENU,
  generateRecipes
} from './data.js';
import { extractMenuWithTesseract } from './ocr.js';
import { estimateDayMacros, estimateMealMacros, calculateProteinGap, processMenuNutrition, getGoalTargets } from './nutrition.js';

// ========== LOCALSTORAGE HELPERS ==========
const LS_KEY = 'gymforge_data';

function loadState() {
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
      workouts: parsed?.workouts || {},
    };
  } catch { return null; }
}

function saveState(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) { console.error('Save failed', e); }
}

// ========== INITIAL STATE FACTORY ==========
function createInitialState() {
  return {
    onboardingComplete: false,
    onboardingStep: 0,
    fitnessGoal: 'LEAN',
    split: { ...DEFAULT_SPLIT },
    messMenu: DAYS.reduce((acc, day) => {
      acc[day] = { Breakfast: '', Lunch: '', 'Evening Snacks': '', Dinner: '' };
      return acc;
    }, {}),
    dietPref: 'VEG',
    roomItems: [],
    customItems: '',
    workouts: {},
    activeDay: DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
    activeView: null,
  };
}

// ========== MAIN APP ==========
export default function App() {
  const [state, setState] = useState(() => {
    const saved = loadState();
    if (saved) return saved;
    return createInitialState();
  });

  // Persist to localStorage on every state change
  useEffect(() => {
    saveState(state);
  }, [state]);

  const update = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  // Initialize workouts from split + exercise DB
  const initWorkouts = useCallback(() => {
    const workouts = {};
    DAYS.forEach(day => {
      const muscles = state.split[day].filter(m => m !== 'NIL');
      workouts[day] = {};
      muscles.forEach(muscle => {
        workouts[day][muscle] = EXERCISE_DB[muscle]
          ? EXERCISE_DB[muscle].map(ex => ({ ...ex }))
          : [];
      });
    });
    return workouts;
  }, [state.split]);

  if (!state.onboardingComplete) {
    if (state.onboardingStep === 4) {
      return <CompletionSplash onEnter={() => {
        const workouts = initWorkouts();
        update({ onboardingComplete: true, onboardingStep: 5, workouts });
      }} />;
    }
    return (
      <OnboardingWizard
        state={state}
        update={update}
      />
    );
  }

  return <Dashboard state={state} update={update} />;
}


// ========== ONBOARDING WIZARD ==========
function OnboardingWizard({ state, update }) {
  const step = state.onboardingStep;
  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const canNext = () => {
    if (step === 1) return state.dietPref !== '';
    return true;
  };

  const handleNext = () => {
    if (step < 3) {
      update({ onboardingStep: step + 1 });
    } else {
      update({ onboardingStep: 4 });
    }
  };

  const handleBack = () => {
    if (step > 0) update({ onboardingStep: step - 1 });
  };

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#39FF14] to-[#22d3ee] flex items-center justify-center">
            <Dumbbell size={22} className="text-zinc-950" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-[var(--font-display)] tracking-tight text-zinc-100"
                style={{ fontFamily: 'var(--font-display)' }}>
              GymForge
            </h1>
            <p className="text-[11px] text-zinc-500 tracking-wider uppercase">Setup Wizard</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">
              Step {step + 1} of {totalSteps}
            </span>
            <span className="text-[11px] text-[#39FF14] font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4" key={step}>
        <div className="animate-fadeIn">
          {step === 0 && <StepSplit state={state} update={update} />}
          {step === 1 && <StepMess state={state} update={update} />}
          {step === 2 && <StepInventory state={state} update={update} />}
          {step === 3 && <StepReview state={state} />}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-5 pb-6 pt-3 border-t border-[var(--color-border-subtle)]">
        <div className="flex gap-3">
          {step > 0 && (
            <button className="btn-ghost flex-1 flex items-center justify-center gap-2" onClick={handleBack}>
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <button
            className="btn-neon flex-1 flex items-center justify-center gap-2"
            onClick={handleNext}
            disabled={!canNext()}
          >
            {step === 3 ? 'Complete Setup' : 'Continue'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}


// ========== STEP 1: WORKOUT SPLIT ==========
function StepSplit({ state, update }) {
  const handleChange = (day, slotIdx, value) => {
    const newSplit = { ...state.split };
    newSplit[day] = [...newSplit[day]];
    newSplit[day][slotIdx] = value;
    update({ split: newSplit });
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="text-[#39FF14]">7-Day</span> Workout Split
        </h2>
        <p className="text-sm text-zinc-400">
          Choose up to 4 muscle groups per day. Default: Push/Pull/Legs.
        </p>
      </div>

      <div className="space-y-3">
        {DAYS.map((day, dayIdx) => (
          <div key={day} className={`glass-card p-4 animate-fadeIn`} style={{ animationDelay: `${dayIdx * 0.05}s` }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#39FF14]"
                    style={{ fontFamily: 'var(--font-display)' }}>
                {day}
              </span>
              {state.split[day].every(m => m === 'NIL') && (
                <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">REST</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3].map(slotIdx => (
                <select
                  key={slotIdx}
                  className="select-dark text-[12px]"
                  value={state.split[day][slotIdx]}
                  onChange={e => handleChange(day, slotIdx, e.target.value)}
                >
                  {MUSCLE_GROUPS.map(mg => (
                    <option key={mg} value={mg}>{mg}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ========== EDITABLE REVIEW TABLE COMPONENT ==========
function EditableReviewTable({ initialMenu, onSave, onReupload, rawText }) {
  const [tableData, setTableData] = useState(() => {
    const menu = {};
    DAYS.forEach(day => {
      menu[day] = {};
      MEALS.forEach(meal => {
        menu[day][meal] = initialMenu?.[day]?.[meal] || 'Standard Mess Meal';
      });
    });
    return menu;
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialMenu) {
      const menu = {};
      DAYS.forEach(day => {
        menu[day] = {};
        MEALS.forEach(meal => {
          menu[day][meal] = initialMenu?.[day]?.[meal] || 'Standard Mess Meal';
        });
      });
      setTableData(menu);
    }
  }, [initialMenu]);

  const handleCellChange = (day, meal, newValue) => {
    setTableData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: newValue
      }
    }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    onSave(tableData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="glass-card p-4 space-y-4 animate-fadeIn border border-[#39FF14]/30">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#39FF14]" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              Editable Review Table
            </h3>
            <span className="text-[9px] bg-[#39FF14]/20 text-[#39FF14] px-2 py-0.5 rounded-full font-bold">
              KEYLESS OCR
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Review extracted meal structure below. Edit any cell to quickly correct typos before saving.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onReupload && (
            <button
              onClick={onReupload}
              className="text-[11px] px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={12} />
              <span>Scan Photo</span>
            </button>
          )}
          <button
            onClick={handleSave}
            className="text-[12px] px-4 py-1.5 rounded-lg bg-[#39FF14] hover:bg-[#32e012] text-zinc-950 font-bold flex items-center gap-1.5 shadow-lg shadow-[#39FF14]/20 transition-all"
          >
            {savedSuccess ? <Check size={14} /> : <Save size={14} />}
            <span>{savedSuccess ? 'Saved ✓' : 'Save Menu'}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-[var(--color-border-subtle)] bg-zinc-950/60">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-zinc-900/80 text-[11px] text-zinc-400 uppercase tracking-wider border-b border-[var(--color-border-subtle)]">
              <th className="py-2.5 px-3 font-semibold text-zinc-300 w-24">Day</th>
              <th className="py-2.5 px-3 font-semibold text-yellow-400/90">Breakfast</th>
              <th className="py-2.5 px-3 font-semibold text-cyan-400/90">Lunch</th>
              <th className="py-2.5 px-3 font-semibold text-orange-400/90">Snacks</th>
              <th className="py-2.5 px-3 font-semibold text-purple-400/90">Dinner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)] text-[12px]">
            {DAYS.map((day, dayIdx) => {
              const abbrev = DAY_ABBREV[dayIdx];
              return (
                <tr key={day} className="hover:bg-zinc-900/40 transition-colors">
                  {/* Day Badge */}
                  <td className="py-2 px-3 font-bold text-zinc-200 align-top">
                    <span className="inline-block px-2 py-1 rounded-md bg-zinc-800 text-[10px] text-[#39FF14] font-mono font-bold tracking-wider">
                      {abbrev}
                    </span>
                    <span className="block text-[10px] text-zinc-500 font-normal mt-0.5">{day}</span>
                  </td>

                  {/* Meals */}
                  {MEALS.map(meal => {
                    const val = tableData[day]?.[meal] || '';
                    const isFallback = val === 'Standard Mess Meal';
                    return (
                      <td key={meal} className="py-2 px-2 align-top">
                        <textarea
                          rows={2}
                          value={val}
                          onChange={e => handleCellChange(day, meal, e.target.value)}
                          className={`w-full text-[11px] p-2 rounded-lg bg-zinc-900/70 border transition-all duration-200 resize-none focus:outline-none focus:ring-1 focus:ring-[#39FF14] ${
                            isFallback
                              ? 'border-yellow-500/30 text-yellow-200/80 bg-yellow-500/5'
                              : 'border-zinc-800 text-zinc-200 focus:border-[#39FF14]'
                          }`}
                          placeholder="Standard Mess Meal"
                        />
                        {isFallback && (
                          <span className="text-[9px] text-yellow-500/70 font-medium block mt-0.5">
                            * Fallback
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rawText && (
        <details className="w-full text-left">
          <summary className="text-[11px] text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors flex items-center gap-1">
            <FileText size={12} /> View raw OCR output
          </summary>
          <pre className="mt-2 text-[10px] text-zinc-400 bg-zinc-950 p-3 rounded-lg overflow-x-auto max-h-36 overflow-y-auto whitespace-pre-wrap break-words border border-zinc-800 font-mono">
            {rawText}
          </pre>
        </details>
      )}
    </div>
  );
}
// ========== STEP 2: MESS MENU ==========
function StepMess({ state, update }) {
  const [inputMode, setInputMode] = useState('scanner'); // 'scanner' | 'manual' | 'presets'
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState(null);
  const [ocrRawText, setOcrRawText] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedMenu, setExtractedMenu] = useState(null);
  const [expandedDay, setExpandedDay] = useState('Monday');
  const fileRef = useRef(null);

  const handleDietPref = (pref) => {
    update({ dietPref: pref });
  };

  const handleMenuChange = (day, meal, value) => {
    const newMenu = { ...state.messMenu };
    newMenu[day] = { ...(newMenu[day] || {}), [meal]: value };
    update({ messMenu: newMenu });
  };

  const loadPreset = (presetType) => {
    const menuToLoad = presetType === 'veg' ? SAMPLE_VEG_MENU : SAMPLE_NONVEG_MENU;
    update({ messMenu: menuToLoad, dietPref: presetType === 'veg' ? 'VEG' : 'NON-VEG' });
    setExtractedMenu(menuToLoad);
    setOcrError(null);
    setInputMode('scanner');
  };

  const fillDefaultMeals = () => {
    const defaultMenu = {};
    DAYS.forEach(day => {
      defaultMenu[day] = {};
      MEALS.forEach(meal => {
        defaultMenu[day][meal] = 'Standard Mess Meal';
      });
    });
    update({ messMenu: defaultMenu });
    setExtractedMenu(defaultMenu);
  };

  const clearAllMeals = () => {
    const emptyMenu = {};
    DAYS.forEach(day => {
      emptyMenu[day] = {};
      MEALS.forEach(meal => {
        emptyMenu[day][meal] = '';
      });
    });
    update({ messMenu: emptyMenu });
    setExtractedMenu(emptyMenu);
  };

  const runExtraction = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setOcrError('Please upload a valid image file (JPG, PNG, etc.)');
      return;
    }

    setUploading(true);
    setUploadDone(false);
    setOcrError(null);
    setOcrRawText(null);
    setOcrProgress(5);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const result = await extractMenuWithTesseract(file, (prog) => {
        setOcrProgress(prog);
      });
      const nutritionReport = processMenuNutrition(result.parsedMenu);
      console.log('[Tesseract OCR] Extracted Nutrition Report:', nutritionReport);
      setOcrRawText(result.rawText);
      setExtractedMenu(result.parsedMenu);
      update({ messMenu: result.parsedMenu });
      setUploadDone(true);
    } catch (err) {
      console.error('[Tesseract OCR Error]', err);
      setOcrError(err.message || 'The photograph is not clear. Please upload a clearer photo or use Manual Input.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) runExtraction(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const file = e.dataTransfer.files?.[0];
    if (file) runExtraction(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('dragover');
  };

  const resetUpload = (e) => {
    if (e) e.stopPropagation();
    setUploadDone(false);
    setPreviewUrl(null);
    setOcrRawText(null);
    setOcrError(null);
    setExtractedMenu(null);
    setOcrProgress(0);
  };

  const handleSaveEditedMenu = (savedMenu) => {
    const nutritionReport = processMenuNutrition(savedMenu);
    console.log('[Nutrition Engine] Updated Nutrition Report:', nutritionReport);
    update({ messMenu: savedMenu });
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="text-[#22d3ee]">Mess</span> Menu
        </h2>
        <p className="text-sm text-zinc-400">
          Upload a mess schedule photo, type meals manually, or select a preset template.
        </p>
      </div>

      {/* Diet Preference */}
      <div className="glass-card p-4 mb-4 animate-fadeIn">
        <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-3 font-semibold">
          Diet Preference *
        </p>
        <div className="flex gap-3">
          {['VEG', 'NON-VEG'].map(pref => (
            <label
              key={pref}
              className={`flex items-center gap-3 flex-1 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                state.dietPref === pref
                  ? 'border-[#39FF14] bg-[rgba(57,255,20,0.05)]'
                  : 'border-[var(--color-border-subtle)] hover:border-zinc-600'
              }`}
            >
              <input
                type="radio"
                name="diet"
                className="radio-neon"
                checked={state.dietPref === pref}
                onChange={() => handleDietPref(pref)}
              />
              <div className="flex items-center gap-2">
                {pref === 'VEG' ? <Salad size={16} className="text-green-400" /> : <Beef size={16} className="text-red-400" />}
                <span className="text-sm font-semibold">{pref}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Fitness Goal Selection (LEAN vs BULK) */}
      <div className="glass-card p-4 mb-4 animate-fadeIn border border-[#39FF14]/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-1.5">
            <Flame size={14} className="text-[#39FF14]" /> Fitness Goal *
          </p>
          <span className="text-[10px] bg-[#39FF14]/20 text-[#39FF14] px-2.5 py-0.5 rounded-full font-bold">
            TAILORS HOSTEL HACKS
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex flex-col p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
              (state.fitnessGoal || 'LEAN') === 'LEAN'
                ? 'border-[#39FF14] bg-[rgba(57,255,20,0.08)] shadow-lg shadow-[#39FF14]/10'
                : 'border-[var(--color-border-subtle)] hover:border-zinc-600 bg-zinc-950/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-zinc-100 flex items-center gap-1" style={{ fontFamily: 'var(--font-display)' }}>
                🥗 LEAN (Cut)
              </span>
              <input
                type="radio"
                name="fitnessGoal"
                className="radio-neon"
                checked={(state.fitnessGoal || 'LEAN') === 'LEAN'}
                onChange={() => update({ fitnessGoal: 'LEAN' })}
              />
            </div>
            <p className="text-[10px] text-zinc-400 leading-snug">
              Fat loss & lean muscle. High protein, low calorie density, satiety hacks.
            </p>
          </label>

          <label
            className={`flex flex-col p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
              state.fitnessGoal === 'BULK'
                ? 'border-[#22d3ee] bg-[rgba(34,211,238,0.08)] shadow-lg shadow-[#22d3ee]/10'
                : 'border-[var(--color-border-subtle)] hover:border-zinc-600 bg-zinc-950/40'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-zinc-100 flex items-center gap-1" style={{ fontFamily: 'var(--font-display)' }}>
                🏋️ BULK (Mass)
              </span>
              <input
                type="radio"
                name="fitnessGoal"
                className="radio-neon"
                checked={state.fitnessGoal === 'BULK'}
                onChange={() => update({ fitnessGoal: 'BULK' })}
              />
            </div>
            <p className="text-[10px] text-zinc-400 leading-snug">
              Muscle & mass gain. Calorie surplus, dense hostel stacks & healthy fats.
            </p>
          </label>
        </div>
      </div>

      {/* 3-Way Mode Navigation Bar */}
      <div className="glass-card p-2 mb-4 animate-fadeIn">
        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            className={`py-2 px-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              inputMode === 'scanner'
                ? 'bg-[#39FF14] text-zinc-950 shadow-md shadow-[#39FF14]/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setInputMode('scanner')}
          >
            <Sparkles size={13} />
            <span>OCR Scanner</span>
          </button>
          <button
            className={`py-2 px-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              inputMode === 'manual'
                ? 'bg-[#22d3ee] text-zinc-950 shadow-md shadow-[#22d3ee]/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setInputMode('manual')}
          >
            <Edit3 size={13} />
            <span>Manual Input</span>
          </button>
          <button
            className={`py-2 px-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              inputMode === 'presets'
                ? 'bg-purple-500 text-zinc-950 shadow-md shadow-purple-500/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setInputMode('presets')}
          >
            <Utensils size={13} />
            <span>Sample Presets</span>
          </button>
        </div>
      </div>

      {/* MODE 1: SMART KEYLESS OCR SCANNER */}
      {inputMode === 'scanner' && (
        <div className="glass-card p-4 mb-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#39FF14]" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-200" style={{ fontFamily: 'var(--font-display)' }}>
                Smart OCR Photo Upload
              </span>
            </div>
            <span className="text-[10px] bg-[#39FF14]/20 text-[#39FF14] px-2 py-0.5 rounded-full font-bold">
              100% FREE & KEYLESS
            </span>
          </div>

          <div
            className="drop-zone p-6 flex flex-col items-center gap-3 text-center cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {uploading ? (
              <div className="w-full space-y-3">
                {previewUrl && (
                  <img src={previewUrl} alt="Uploaded menu schedule" className="w-full max-h-36 object-contain rounded-lg mb-2 opacity-60 mx-auto" />
                )}
                <div className="spinner mx-auto" />
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div
                    className="bg-[#39FF14] h-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
                <p className="text-xs text-[#39FF14] font-medium animate-pulse">
                  Enhancing contrast & reading text... {ocrProgress}%
                </p>
              </div>
            ) : ocrError ? (
              <div className="space-y-3 w-full" onClick={e => e.stopPropagation()}>
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
                  <AlertCircle size={22} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-yellow-300 font-bold mb-1">
                    Photo Unclear or Unreadable
                  </p>
                  <p className="text-[11px] text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    {ocrError}
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap gap-2 justify-center">
                  <button
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#39FF14] font-semibold flex items-center gap-1"
                    onClick={() => setInputMode('manual')}
                  >
                    <Edit3 size={12} /> Type Manually Instead
                  </button>
                  <button
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#22d3ee] font-semibold flex items-center gap-1"
                    onClick={() => loadPreset('veg')}
                  >
                    <Salad size={12} /> Load Veg Menu
                  </button>
                  <button
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-red-400 font-semibold flex items-center gap-1"
                    onClick={() => loadPreset('nonveg')}
                  >
                    <Beef size={12} /> Load Non-Veg Menu
                  </button>
                </div>
              </div>
            ) : (
              <>
                {previewUrl && uploadDone ? (
                  <div className="flex items-center gap-3 w-full bg-zinc-900/40 p-2 rounded-lg border border-zinc-800">
                    <img src={previewUrl} alt="Uploaded menu photo" className="w-16 h-16 object-cover rounded-md" />
                    <div className="text-left flex-1">
                      <p className="text-xs font-bold text-[#39FF14] flex items-center gap-1">
                        <Check size={14} /> Table Structure Extracted!
                      </p>
                      <p className="text-[10px] text-zinc-500">Review & edit items in the table below.</p>
                    </div>
                    <button
                      onClick={resetUpload}
                      className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                      title="Upload another photo"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] flex items-center justify-center">
                      <Sparkles size={24} className="text-[#39FF14]" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-300 font-medium">
                        Drop mess menu photo here or click to browse
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        ⚡ Keyless browser OCR reads MON-SUN table structure accurately
                      </p>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: MANUAL INPUT EDITOR */}
      {inputMode === 'manual' && (
        <div className="glass-card p-4 mb-4 animate-fadeIn space-y-4 border border-[#22d3ee]/30">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200" style={{ fontFamily: 'var(--font-display)' }}>
                Manual Mess Menu Entry
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Type your 7-day meals manually. Any blank meal will be saved as "Standard Mess Meal".
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fillDefaultMeals}
                className="text-[10px] px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[#22d3ee] font-medium"
              >
                Fill Defaults
              </button>
              <button
                onClick={clearAllMeals}
                className="text-[10px] px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Day-by-Day Manual Inputs */}
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day} className="glass-card overflow-hidden bg-zinc-950/60 border border-zinc-800">
                <button
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-zinc-900/50 transition-colors"
                  onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                >
                  <span className="text-xs font-bold uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-display)', color: expandedDay === day ? '#22d3ee' : '#e4e4e7' }}>
                    {day}
                  </span>
                  <ChevronRight
                    size={14}
                    className={`text-zinc-500 transition-transform duration-200 ${expandedDay === day ? 'rotate-90' : ''}`}
                  />
                </button>
                {expandedDay === day && (
                  <div className="px-4 pb-4 space-y-3 pt-2 animate-fadeIn border-t border-zinc-900">
                    {MEALS.map(meal => (
                      <div key={meal}>
                        <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                          {meal === 'Breakfast' && <Coffee size={11} className="text-yellow-400" />}
                          {meal === 'Lunch' && <Utensils size={11} className="text-cyan-400" />}
                          {meal === 'Evening Snacks' && <Cookie size={11} className="text-orange-400" />}
                          {meal === 'Dinner' && <Moon size={11} className="text-purple-400" />}
                          {meal}
                        </label>
                        <input
                          type="text"
                          className="input-dark text-[12px] py-1.5"
                          placeholder="Standard Mess Meal"
                          value={state.messMenu[day]?.[meal] || ''}
                          onChange={e => handleMenuChange(day, meal, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3: PRESET TEMPLATES */}
      {inputMode === 'presets' && (
        <div className="glass-card p-4 mb-4 animate-fadeIn space-y-3 border border-purple-500/30">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300" style={{ fontFamily: 'var(--font-display)' }}>
              1-Click Sample Mess Menus
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Select a pre-configured Indian hostel mess menu template to auto-fill your schedule instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => loadPreset('veg')}
              className="p-4 rounded-xl border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 text-left transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Salad size={18} className="text-green-400" />
                <span className="text-xs font-bold text-green-300">Veg Mess Menu</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Poha, Idli, Dal Tadka, Paneer Butter Masala, Rajma, Samosa & Chole.
              </p>
            </button>

            <button
              onClick={() => loadPreset('nonveg')}
              className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-left transition-all group"
            >
              <div className="flex items-center gap-2 mb-1">
                <Beef size={18} className="text-red-400" />
                <span className="text-xs font-bold text-red-300">Non-Veg Mess Menu</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Eggs, Chicken Curry, Fish Curry, Chicken Biryani & Mutton.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Always Display Editable Review Table Below */}
      <EditableReviewTable
        initialMenu={extractedMenu || state.messMenu}
        onSave={handleSaveEditedMenu}
        onReupload={resetUpload}
        rawText={ocrRawText}
      />
    </div>
  );
}


// ========== STEP 3: ROOM INVENTORY ==========
function StepInventory({ state, update }) {
  const toggleItem = (item) => {
    const items = state.roomItems.includes(item)
      ? state.roomItems.filter(i => i !== item)
      : [...state.roomItems, item];
    update({ roomItems: items });
  };

  const itemIcons = {
    'Bananas': '🍌', 'Peanut Butter': '🥜', 'Oats': '🥣',
    'Milk Powder': '🥛', 'Honey': '🍯', 'Almonds': '🌰',
    'Eggs': '🥚', 'Whey Protein': '💪',
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="text-[#39FF14]">Room</span> Inventory
        </h2>
        <p className="text-sm text-zinc-400">
          Check items you have in your hostel room for recipe recommendations.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {ROOM_ITEMS.map((item, idx) => (
          <label
            key={item}
            className={`glass-card p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 animate-fadeIn ${
              state.roomItems.includes(item)
                ? '!border-[#39FF14] bg-[rgba(57,255,20,0.04)]'
                : ''
            }`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <input
              type="checkbox"
              className="checkbox-neon"
              checked={state.roomItems.includes(item)}
              onChange={() => toggleItem(item)}
            />
            <div>
              <span className="text-lg mr-1">{itemIcons[item]}</span>
              <span className="text-sm font-medium text-zinc-200">{item}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="glass-card p-4 animate-fadeIn delay-300">
        <label className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold mb-2 flex items-center gap-1.5">
          <Plus size={11} /> Additional Items
        </label>
        <textarea
          className="textarea-dark text-[13px]"
          placeholder="E.g., Dates, Chia Seeds, Protein Bars, Green Tea..."
          value={state.customItems}
          onChange={e => update({ customItems: e.target.value })}
        />
        <p className="text-[11px] text-zinc-600 mt-1">Separate items with commas</p>
      </div>
    </div>
  );
}


// ========== STEP 4: REVIEW ==========
function StepReview({ state }) {
  const activeMuscles = DAYS.reduce((count, day) => {
    const daySplit = state.split?.[day] || [];
    return count + daySplit.filter(m => m !== 'NIL').length;
  }, 0);

  const filledMeals = DAYS.reduce((count, day) => {
    const dayMenu = state.messMenu?.[day] || {};
    return count + MEALS.filter(m => dayMenu[m] && String(dayMenu[m]).trim()).length;
  }, 0);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="text-[#22d3ee]">Review</span> Setup
        </h2>
        <p className="text-sm text-zinc-400">
          Confirm everything looks good before entering your dashboard.
        </p>
      </div>

      <div className="space-y-3">
        <div className="glass-card p-4 animate-fadeIn">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell size={18} className="text-[#39FF14]" />
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>Workout Split</span>
          </div>
          <p className="text-[13px] text-zinc-400">{activeMuscles} muscle group slots configured across 7 days</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {DAYS.map(day => {
              const muscles = state.split[day].filter(m => m !== 'NIL');
              return (
                <div key={day} className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400">
                  <span className="text-[#39FF14] font-bold">{day.slice(0, 3)}:</span>{' '}
                  {muscles.length > 0 ? muscles.join(', ') : 'Rest'}
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-4 animate-fadeIn delay-100">
          <div className="flex items-center gap-3 mb-2">
            <Utensils size={18} className="text-[#22d3ee]" />
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>Mess Menu</span>
          </div>
          <p className="text-[13px] text-zinc-400">{filledMeals}/28 meal slots filled</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              state.dietPref === 'VEG' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
            }`}>
              {state.dietPref === 'VEG' ? '🟢' : '🔴'} {state.dietPref}
            </span>
          </div>
        </div>

        <div className="glass-card p-4 animate-fadeIn delay-200">
          <div className="flex items-center gap-3 mb-2">
            <Package size={18} className="text-[#39FF14]" />
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-display)' }}>Room Inventory</span>
          </div>
          <p className="text-[13px] text-zinc-400">
            {state.roomItems.length} items checked
            {state.customItems.trim() ? ` + custom items` : ''}
          </p>
          {state.roomItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {state.roomItems.map(item => (
                <span key={item} className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300">
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ========== COMPLETION SPLASH ==========
function CompletionSplash({ onEnter }) {
  return (
    <div className="app-container bg-[var(--color-surface)] min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="animate-fireBurst mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#39FF14] to-[#22d3ee] flex items-center justify-center mx-auto gradient-shift">
          <Trophy size={48} className="text-zinc-950" />
        </div>
      </div>

      <h1
        className="text-3xl font-black mb-3 animate-pulseNeonText"
        style={{ fontFamily: 'var(--font-display)', color: '#39FF14' }}
      >
        YOUR GYM PLAN IS READY! 🔥
      </h1>

      <p className="text-zinc-400 text-sm mb-2 animate-fadeInUp delay-200 max-w-xs">
        Your personalized workout, diet, and hostel hack plan is locked and loaded.
      </p>
      <p className="text-zinc-600 text-[12px] mb-8 animate-fadeInUp delay-300">
        Time to crush it. No excuses. 💪
      </p>

      <button
        className="btn-neon text-lg px-10 py-4 animate-fadeInUp delay-400 animate-pulseNeon"
        onClick={onEnter}
      >
        <span className="flex items-center gap-2">
          Enter Dashboard <Zap size={20} />
        </span>
      </button>

      {/* Decorative particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-floatUpDown"
            style={{
              background: i % 2 === 0 ? '#39FF14' : '#22d3ee',
              opacity: 0.3,
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}


// ========== MAIN DASHBOARD ==========
function Dashboard({ state, update }) {
  const activeDay = state.activeDay;
  const activeView = state.activeView;
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
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
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all data and go through setup again?')) {
      localStorage.removeItem(LS_KEY);
      window.location.reload();
    }
  };

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-screen flex flex-col relative">
      {/* Top Bar */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#39FF14] to-[#22d3ee] flex items-center justify-center shadow-lg shadow-[#39FF14]/10">
            <Dumbbell size={18} className="text-zinc-950" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-100" style={{ fontFamily: 'var(--font-display)' }}>
              GymForge
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isInstalled ? (
            <button
              className="h-8 px-3 rounded-lg bg-gradient-to-r from-[#39FF14]/20 to-[#22d3ee]/20 border border-[#39FF14]/40 hover:border-[#39FF14] flex items-center gap-1.5 transition-all duration-300 group shadow-md shadow-[#39FF14]/10"
              onClick={handleInstallClick}
              title="Install GymForge App"
            >
              <Download size={13} className="text-[#39FF14] group-hover:animate-bounce" />
              <span className="text-[10px] font-bold text-[#39FF14] uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                Install App
              </span>
            </button>
          ) : (
            <span className="h-8 px-3 rounded-lg bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center gap-1.5">
              <Check size={12} className="text-[#39FF14]" />
              <span className="text-[10px] font-medium text-[#39FF14]/70">Installed</span>
            </span>
          )}
          <button
            className="w-8 h-8 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 flex items-center justify-center transition-colors"
            onClick={handleReset}
            title="Reset Setup"
          >
            <RotateCcw size={14} className="text-zinc-500" />
          </button>
        </div>
      </div>

      {/* PWA Installation Guide Modal */}
      {showInstallGuide && (
        <InstallGuideModal
          onClose={() => setShowInstallGuide(false)}
          onTriggerInstall={installPrompt ? handleInstallClick : null}
        />
      )}

      {/* Day Selector */}
      <div className="px-5 pb-3">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {DAYS.map((day, idx) => (
            <button
              key={day}
              className={`day-tab ${activeDay === day ? 'active' : ''}`}
              onClick={() => update({ activeDay: day, activeView: null })}
            >
              {DAY_ABBREV[idx]}
            </button>
          ))}
        </div>
      </div>

      {/* Category Cards */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'workout', icon: Dumbbell, label: 'Daily\nRoutine', color: '#39FF14' },
            { id: 'meals', icon: Utensils, label: 'Mess\nMeals', color: '#22d3ee' },
            { id: 'hacks', icon: ChefHat, label: 'Hostel\nHacks', color: '#39FF14' },
          ].map(cat => (
            <button
              key={cat.id}
              className={`category-card ${activeView === cat.id ? 'active' : ''}`}
              onClick={() => update({ activeView: activeView === cat.id ? null : cat.id })}
            >
              <cat.icon
                size={24}
                className="mx-auto mb-2 transition-colors"
                style={{ color: activeView === cat.id ? cat.color : '#71717a' }}
              />
              <span
                className="text-[11px] font-bold uppercase tracking-wider leading-tight block whitespace-pre-line"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: activeView === cat.id ? '#e4e4e7' : '#71717a'
                }}
              >
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {activeView === 'workout' && (
          <div className="animate-fadeIn" key={`workout-${activeDay}`}>
            <WorkoutView state={state} update={update} day={activeDay} />
          </div>
        )}
        {activeView === 'meals' && (
          <div className="animate-fadeIn" key={`meals-${activeDay}`}>
            <MealsView state={state} update={update} day={activeDay} />
          </div>
        )}
        {activeView === 'hacks' && (
          <div className="animate-fadeIn" key="hacks">
            <HacksView state={state} update={update} />
          </div>
        )}
        {!activeView && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500 font-medium mb-1">
              Select a category above
            </p>
            <p className="text-[12px] text-zinc-600">
              {activeDay}'s plan is ready to view
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


// ========== VIEW 1: WORKOUT ==========
function WorkoutView({ state, update, day }) {
  const dayWorkouts = state.workouts[day] || {};
  const muscles = Object.keys(dayWorkouts).filter(m => m !== 'NIL' && dayWorkouts[m]?.length > 0);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const editRef = useRef(null);

  useEffect(() => {
    if (editRef.current) editRef.current.focus();
  }, [editingCell]);

  if (muscles.length === 0) {
    return (
      <div className="text-center py-12">
        <Moon size={40} className="mx-auto text-zinc-700 mb-3" />
        <p className="text-zinc-500 font-medium" style={{ fontFamily: 'var(--font-display)' }}>Rest Day</p>
        <p className="text-[12px] text-zinc-600 mt-1">No workouts scheduled for {day}</p>
      </div>
    );
  }

  const startEdit = (muscle, exIdx, field, currentValue) => {
    setEditingCell({ muscle, exIdx, field });
    setEditValue(String(currentValue));
  };

  const saveEdit = () => {
    if (!editingCell) return;
    const { muscle, exIdx, field } = editingCell;
    const newWorkouts = JSON.parse(JSON.stringify(state.workouts));
    if (field === 'name') {
      newWorkouts[day][muscle][exIdx].name = editValue;
    } else if (field === 'sets') {
      newWorkouts[day][muscle][exIdx].sets = parseInt(editValue) || 0;
    } else if (field === 'reps') {
      newWorkouts[day][muscle][exIdx].reps = editValue;
    }
    update({ workouts: newWorkouts });
    setEditingCell(null);
  };

  const cancelEdit = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Flame size={18} className="text-[#39FF14]" />
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: '#39FF14' }}>
          {day}'s Workout
        </h3>
      </div>

      <div className="space-y-4">
        {muscles.map((muscle, mIdx) => (
          <div key={muscle} className="neon-card p-4 animate-fadeIn" style={{ animationDelay: `${mIdx * 0.1}s` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#39FF14]" />
              <h4 className="text-sm font-bold text-zinc-200 uppercase tracking-wider"
                  style={{ fontFamily: 'var(--font-display)' }}>
                {muscle}
              </h4>
              <span className="text-[10px] text-zinc-600 ml-auto">
                {dayWorkouts[muscle].length} exercises
              </span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_50px_60px] gap-1 mb-1 px-2">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Exercise</span>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold text-center">Sets</span>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold text-center">Reps</span>
            </div>

            {/* Exercise rows */}
            {dayWorkouts[muscle].map((ex, exIdx) => (
              <div
                key={exIdx}
                className="grid grid-cols-[1fr_50px_60px] gap-1 items-center border-t border-zinc-800/50"
              >
                {/* Name */}
                {editingCell?.muscle === muscle && editingCell?.exIdx === exIdx && editingCell?.field === 'name' ? (
                  <div className="p-1">
                    <input
                      ref={editRef}
                      className="input-dark text-[12px] py-1 px-2"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                    />
                  </div>
                ) : (
                  <div
                    className="editable-cell text-[13px] text-zinc-300"
                    onDoubleClick={() => startEdit(muscle, exIdx, 'name', ex.name)}
                    title="Double-click to edit"
                  >
                    {ex.name}
                  </div>
                )}

                {/* Sets */}
                {editingCell?.muscle === muscle && editingCell?.exIdx === exIdx && editingCell?.field === 'sets' ? (
                  <div className="p-1">
                    <input
                      ref={editRef}
                      className="input-dark text-[12px] py-1 px-2 text-center"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      type="number"
                    />
                  </div>
                ) : (
                  <div
                    className="editable-cell text-[13px] text-[#22d3ee] font-semibold text-center"
                    onDoubleClick={() => startEdit(muscle, exIdx, 'sets', ex.sets)}
                    title="Double-click to edit"
                  >
                    {ex.sets}
                  </div>
                )}

                {/* Reps */}
                {editingCell?.muscle === muscle && editingCell?.exIdx === exIdx && editingCell?.field === 'reps' ? (
                  <div className="p-1">
                    <input
                      ref={editRef}
                      className="input-dark text-[12px] py-1 px-2 text-center"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                    />
                  </div>
                ) : (
                  <div
                    className="editable-cell text-[13px] text-zinc-400 text-center"
                    onDoubleClick={() => startEdit(muscle, exIdx, 'reps', ex.reps)}
                    title="Double-click to edit"
                  >
                    {ex.reps}
                  </div>
                )}
              </div>
            ))}

            <p className="text-[10px] text-zinc-700 mt-2 italic">Double-click any cell to edit</p>
          </div>
        ))}
      </div>
    </div>
  );
}


// ========== VIEW 2: MESS MEALS ==========
function MealsView({ state, update, day }) {
  const menu = state.messMenu[day] || {};
  const [showEditor, setShowEditor] = useState(false);
  const [mealFilter, setMealFilter] = useState('all'); // 'all' | 'veg' | 'protein' | 'nonveg'

  const mealMeta = [
    { key: 'Breakfast', icon: Coffee, time: '7:30 – 9:00 AM', color: '#facc15' },
    { key: 'Lunch', icon: Utensils, time: '12:30 – 2:00 PM', color: '#22d3ee' },
    { key: 'Evening Snacks', icon: Cookie, time: '4:30 – 5:30 PM', color: '#f97316' },
    { key: 'Dinner', icon: Moon, time: '7:30 – 9:30 PM', color: '#a78bfa' },
  ];

  const dayMacros = estimateDayMacros(menu);

  let processedMeals = mealMeta.map(m => {
    const dishText = menu[m.key] || 'Standard Mess Meal';
    const macros = estimateMealMacros(dishText);
    return { ...m, dishText, macros };
  });

  if (mealFilter === 'veg') {
    processedMeals = processedMeals.filter(m => m.macros.isVeg);
  } else if (mealFilter === 'protein') {
    processedMeals = [...processedMeals].sort((a, b) => b.macros.protein - a.macros.protein);
  }

  const isNonVegDay = dayMacros.isNonVegDay;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Utensils size={18} className="text-[#22d3ee]" />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: '#22d3ee' }}>
            {day}'s Mess Menu
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
            state.dietPref === 'VEG'
              ? 'bg-green-900/40 text-green-400 border border-green-800/50'
              : 'bg-red-900/40 text-red-400 border border-red-800/50'
          }`}>
            {state.dietPref === 'VEG' ? '🟢' : '🔴'} {state.dietPref}
          </span>
          {update && (
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#39FF14] flex items-center gap-1.5 transition-colors border border-zinc-700"
            >
              {showEditor ? <Check size={12} /> : <Edit3 size={12} />}
              <span>{showEditor ? 'Done Editing' : 'Upload / Edit'}</span>
            </button>
          )}
        </div>
      </div>

      {showEditor && update && (
        <div className="mb-4 animate-fadeIn">
          <StepMess state={state} update={update} />
        </div>
      )}

      {/* DAILY NUTRITION SUMMARY BAR */}
      <div className={`glass-card p-4 rounded-2xl animate-fadeIn transition-all border ${
        mealFilter === 'nonveg' && isNonVegDay
          ? 'border-red-500/60 bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 shadow-lg shadow-red-500/10'
          : 'border-[#39FF14]/30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950'
      }`}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#39FF14]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#39FF14]" style={{ fontFamily: 'var(--font-display)' }}>
              {day}'s Daily Nutrition Summary
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            isNonVegDay
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-green-500/20 text-green-300 border border-green-500/40'
          }`}>
            {isNonVegDay ? '🔴 NON-VEG DAY' : '🟢 VEG DAY'}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-yellow-500/20">
            <p className="text-[9px] text-yellow-400 uppercase tracking-wider font-semibold">Calories</p>
            <p className="text-sm font-black text-yellow-300 mt-0.5">{dayMacros.calories} <span className="text-[9px] font-normal text-yellow-400/80">kcal</span></p>
          </div>
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-[#39FF14]/40 bg-[#39FF14]/5">
            <p className="text-[9px] text-[#39FF14] uppercase tracking-wider font-semibold">Protein</p>
            <p className="text-sm font-black text-[#39FF14] mt-0.5">{dayMacros.protein} <span className="text-[9px] font-normal text-[#39FF14]/80">g</span></p>
          </div>
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-cyan-500/20">
            <p className="text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">Carbs</p>
            <p className="text-sm font-black text-cyan-300 mt-0.5">{dayMacros.carbs} <span className="text-[9px] font-normal text-cyan-400/80">g</span></p>
          </div>
          <div className="bg-zinc-900/90 p-2.5 rounded-xl border border-orange-500/20">
            <p className="text-[9px] text-orange-400 uppercase tracking-wider font-semibold">Fats</p>
            <p className="text-sm font-black text-orange-300 mt-0.5">{dayMacros.fats} <span className="text-[9px] font-normal text-orange-400/80">g</span></p>
          </div>
        </div>
      </div>

      {/* USER PREFERENCE FILTER TOGGLES */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold px-1">
          Meal Preferences Filter
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Meals' },
            { id: 'veg', label: '🌱 Show Only Veg' },
            { id: 'protein', label: '💪 Show High Protein First' },
            { id: 'nonveg', label: '🔴 Highlight Non-Veg Days' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setMealFilter(f.id)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap ${
                mealFilter === f.id
                  ? 'bg-[#39FF14] text-zinc-950 shadow-md shadow-[#39FF14]/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* MEAL CARDS WITH MACRO BADGES */}
      <div className="space-y-3">
        {processedMeals.length === 0 ? (
          <div className="text-center py-8 glass-card">
            <Salad size={32} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-xs text-zinc-400 font-medium">No meals match your active filter.</p>
            <button
              onClick={() => setMealFilter('all')}
              className="mt-2 text-[11px] text-[#39FF14] hover:underline font-bold"
            >
              Reset to All Meals
            </button>
          </div>
        ) : (
          processedMeals.map((meal, idx) => {
            const isNonVegMeal = !meal.macros.isVeg;
            const isHighlightNonVeg = mealFilter === 'nonveg' && isNonVegMeal;
            return (
              <div
                key={meal.key}
                className={`meal-card animate-fadeIn transition-all ${
                  isHighlightNonVeg ? '!border-red-500/90 bg-red-950/20 shadow-lg shadow-red-500/20 ring-1 ring-red-500/40' : ''
                }`}
                style={{ animationDelay: `${idx * 0.08}s`, borderLeftWidth: '3px', borderLeftColor: meal.color }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <meal.icon size={16} style={{ color: meal.color }} />
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: meal.color, fontFamily: 'var(--font-display)' }}>
                    {meal.key}
                  </span>
                  <span className="text-[10px] text-zinc-500 ml-auto flex items-center gap-1">
                    <Clock size={10} /> {meal.time}
                  </span>
                </div>

                <p className="text-[13px] text-zinc-200 leading-relaxed font-medium">
                  {meal.dishText}
                </p>

                {/* COLOR-CODED MACRO BADGES */}
                <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-zinc-800/60 items-center">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 flex items-center gap-1">
                    <Flame size={10} className="text-yellow-400" /> {meal.macros.calories} kcal
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 flex items-center gap-1">
                    <Zap size={10} className="text-[#39FF14]" /> {meal.macros.protein}g Protein
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    🌾 {meal.macros.carbs}g Carbs
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20">
                    🥑 {meal.macros.fats}g Fats
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ml-auto ${
                    meal.macros.isVeg
                      ? 'bg-green-900/30 text-green-400 border border-green-800/40'
                      : 'bg-red-900/30 text-red-400 border border-red-800/40'
                  }`}>
                    {meal.macros.isVeg ? '🟢 VEG' : '🔴 NON-VEG'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


// ========== VIEW 3: HOSTEL HACKS ==========
function HacksView({ state, update }) {
  const fitnessGoal = state.fitnessGoal || 'LEAN';
  const isLean = fitnessGoal === 'LEAN';

  const customItemsList = state.customItems
    ? state.customItems.split(',').map(i => i.trim()).filter(Boolean)
    : [];

  const goalInfo = getGoalTargets(fitnessGoal);
  const targetProtein = state.targetProtein || goalInfo.targetProtein;
  const activeDayMenu = state.messMenu[state.activeDay] || {};
  const messMacros = estimateDayMacros(activeDayMenu);
  const messProtein = messMacros.protein;
  const proteinGap = calculateProteinGap(messProtein, targetProtein, fitnessGoal);
  const percentCovered = Math.min(100, Math.round((messProtein / targetProtein) * 100));

  const { preWorkout, postWorkout, hostelHacks } = generateRecipes(state.roomItems, customItemsList, proteinGap, fitnessGoal);

  return (
    <div>
      {/* Header & Fitness Goal Pill Toggle */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <ChefHat size={18} className="text-[#39FF14]" />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: '#39FF14' }}>
            Hostel Hacks & Recipes
          </h3>
        </div>

        {/* Goal Selector Pill */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => update({ fitnessGoal: 'LEAN' })}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
              isLean ? 'bg-[#39FF14] text-zinc-950 shadow-md shadow-[#39FF14]/20' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Salad size={12} /> LEAN
          </button>
          <button
            onClick={() => update({ fitnessGoal: 'BULK' })}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
              !isLean ? 'bg-[#22d3ee] text-zinc-950 shadow-md shadow-[#22d3ee]/20' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame size={12} /> BULK
          </button>
        </div>
      </div>

      {/* GOAL STRATEGY & DEFICIT TRACKER */}
      <div className="glass-card p-4 mb-5 border border-[#39FF14]/40 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 animate-fadeIn">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#39FF14]" />
            <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              {goalInfo.label}
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            proteinGap > 0 ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-green-500/20 text-green-300'
          }`}>
            {proteinGap > 0 ? `${proteinGap}g DEFICIT` : 'GOAL MET ✓'}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Mess Provided: <strong className="text-[#39FF14]">{messProtein}g</strong> / {targetProtein}g Target</span>
            <span className="text-[#39FF14] font-bold">{percentCovered}%</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#39FF14] to-[#22d3ee] h-full transition-all duration-500"
              style={{ width: `${percentCovered}%` }}
            />
          </div>
        </div>

        {/* Goal Specific Tips */}
        <div className="pt-2 border-t border-zinc-800/80">
          <p className="text-[10px] uppercase tracking-widest text-[#39FF14] font-bold mb-1.5 flex items-center gap-1">
            <Sparkles size={11} /> {goalInfo.adviceHeader}
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[11px] text-zinc-300">
            {goalInfo.hacks.map((hackTip, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <Check size={12} className="text-[#39FF14] shrink-0 mt-0.5" />
                <span>{hackTip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* INTERNET STUDENT HOSTEL HACKS */}
      {hostelHacks.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className={isLean ? 'text-[#39FF14]' : 'text-[#22d3ee]'} />
              <span className="text-[12px] font-bold uppercase tracking-widest text-zinc-200" style={{ fontFamily: 'var(--font-display)' }}>
                Internet Hostel Hacks ({isLean ? '🔥 Lean Cutting' : '🏋️ Mass Bulking'})
              </span>
            </div>
            <span className="text-[9px] bg-[#39FF14]/20 text-[#39FF14] px-2 py-0.5 rounded-full font-bold">
              ZERO COOK
            </span>
          </div>
          <div className="space-y-3">
            {hostelHacks.map((hack, idx) => (
              <RecipeCard key={`hack-${idx}`} recipe={hack} idx={idx} accentColor={isLean ? '#39FF14' : '#22d3ee'} />
            ))}
          </div>
        </div>
      )}

      {/* Pre-workout */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-yellow-400" />
          <span className="text-[12px] font-bold uppercase tracking-widest text-yellow-400" style={{ fontFamily: 'var(--font-display)' }}>
            Pre-Workout Fuel
          </span>
        </div>
        <div className="space-y-3">
          {preWorkout.map((recipe, idx) => (
            <RecipeCard key={idx} recipe={recipe} idx={idx} accentColor="#facc15" />
          ))}
        </div>
      </div>

      {/* Post-workout */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Heart size={14} className="text-[#22d3ee]" />
          <span className="text-[12px] font-bold uppercase tracking-widest text-[#22d3ee]" style={{ fontFamily: 'var(--font-display)' }}>
            Post-Workout Recovery & Deficit Fillers
          </span>
        </div>
        <div className="space-y-3">
          {postWorkout.map((recipe, idx) => (
            <RecipeCard key={idx} recipe={recipe} idx={idx} accentColor="#22d3ee" />
          ))}
        </div>
      </div>
    </div>
  );
}


// ========== RECIPE CARD ==========
function RecipeCard({ recipe, idx, accentColor }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="recipe-card animate-fadeIn cursor-pointer"
      style={{ animationDelay: `${idx * 0.08}s` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-1.5">
        <h4 className="text-[14px] font-bold text-zinc-200 leading-snug pr-2">
          {recipe.name}
        </h4>
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          {recipe.tag}
        </span>
      </div>

      {recipe.gapFillBadge && (
        <div className="mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 inline-flex items-center gap-1">
            <Sparkles size={11} /> {recipe.gapFillBadge}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mb-1">
        <span className="flex items-center gap-1">
          <Timer size={11} /> {recipe.timing}
        </span>
        <span className="flex items-center gap-1">
          <Flame size={11} /> {recipe.calories}
        </span>
        {recipe.proteinGrams > 0 && (
          <span className="flex items-center gap-1 text-[#39FF14] font-semibold">
            <Zap size={11} /> +{recipe.proteinGrams}g Protein
          </span>
        )}
      </div>

      {expanded && (
        <div className="animate-fadeIn mt-3 pt-3 border-t border-zinc-800/50">
          {recipe.ingredients.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold mb-1.5">Ingredients</p>
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <span key={i} className="text-[11px] bg-zinc-800/80 text-zinc-300 px-2 py-0.5 rounded-md">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-semibold mb-1.5 flex items-center gap-1">
              <BookOpen size={10} /> Instructions
            </p>
            <p className="text-[12px] text-zinc-400 leading-relaxed">{recipe.instructions}</p>
          </div>
        </div>
      )}

      <p className="text-[10px] text-zinc-700 mt-1">{expanded ? 'Tap to collapse' : 'Tap for details'}</p>
    </div>
  );
}


// ========== PWA INSTALLATION GUIDE MODAL ==========
function InstallGuideModal({ onClose, onTriggerInstall }) {
  const [activeTab, setActiveTab] = useState('android');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#39FF14] to-[#22d3ee] flex items-center justify-center">
              <Download size={16} className="text-zinc-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100" style={{ fontFamily: 'var(--font-display)' }}>
                Install GymForge
              </h3>
              <p className="text-[10px] text-zinc-400">Install as a Web App on your phone or desktop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 1-Click Prompt Button if ready */}
        {onTriggerInstall && (
          <div className="p-3 bg-gradient-to-r from-[#39FF14]/15 to-[#22d3ee]/15 border border-[#39FF14]/40 rounded-xl">
            <p className="text-xs text-zinc-200 mb-2 font-medium">Your browser is ready for 1-click installation:</p>
            <button
              onClick={() => { onTriggerInstall(); onClose(); }}
              className="btn-neon w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#39FF14]/20"
            >
              <Download size={15} /> Install Application Now
            </button>
          </div>
        )}

        {/* Platform Selector */}
        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            className={`py-1.5 px-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'android' ? 'bg-[#39FF14] text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('android')}
          >
            <Smartphone size={12} /> Android
          </button>
          <button
            className={`py-1.5 px-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'ios' ? 'bg-[#22d3ee] text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('ios')}
          >
            <Smartphone size={12} /> iPhone/iOS
          </button>
          <button
            className={`py-1.5 px-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'desktop' ? 'bg-purple-400 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            onClick={() => setActiveTab('desktop')}
          >
            <Laptop size={12} /> PC / Mac
          </button>
        </div>

        {/* Steps Content */}
        <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 space-y-3">
          {activeTab === 'android' && (
            <ol className="space-y-2.5 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Open <strong>Chrome</strong> or <strong>Edge</strong> on your Android phone.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Tap the <strong>3 dots menu (⋮)</strong> in the top right corner.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#39FF14]/20 text-[#39FF14] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</span>
              </li>
            </ol>
          )}

          {activeTab === 'ios' && (
            <ol className="space-y-2.5 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#22d3ee]/20 text-[#22d3ee] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Open this page in <strong>Safari</strong> on your iPhone or iPad.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#22d3ee]/20 text-[#22d3ee] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span className="flex items-center gap-1 flex-wrap">
                  Tap the <strong>Share</strong> button <Share2 size={13} className="text-[#22d3ee] inline" /> at the bottom toolbar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#22d3ee]/20 text-[#22d3ee] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Scroll down and select <strong>"Add to Home Screen" (+)</strong>.</span>
              </li>
            </ol>
          )}

          {activeTab === 'desktop' && (
            <ol className="space-y-2.5 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-400/20 text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Open <strong>Chrome</strong> or <strong>Edge</strong> on your desktop.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-400/20 text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Look at the right side of your browser <strong>Address Bar</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-400/20 text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Click the <strong>Install GymForge (⊕)</strong> icon or menu item.</span>
              </li>
            </ol>
          )}
        </div>

        {/* Benefits list */}
        <div className="pt-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Why install?</p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-[#39FF14]" /> Offline Access
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-[#39FF14]" /> Fullscreen App View
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-[#39FF14]" /> Fast Home Icon Launch
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-[#39FF14]" /> Zero Storage Impact
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-ghost w-full py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100"
        >
          Close Guide
        </button>
      </div>
    </div>
  );
}

