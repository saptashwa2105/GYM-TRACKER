import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dumbbell, ChevronRight, ChevronLeft, Camera, Utensils,
  Flame, Zap, Clock, Check, Plus, RotateCcw, Download,
  ChefHat, Coffee, Moon, Cookie,
  Heart, AlertCircle, Package,
  Beef, Salad, Timer, BookOpen, Sparkles, Trophy
} from 'lucide-react';
import {
  DAYS, DAY_ABBREV, MUSCLE_GROUPS, MEALS, ROOM_ITEMS,
  EXERCISE_DB, DEFAULT_SPLIT, SAMPLE_VEG_MENU, SAMPLE_NONVEG_MENU,
  generateRecipes
} from './data.js';
import { extractMenuWithGemini, extractMenuWithTesseract, getStoredGeminiKey, storeGeminiKey } from './ocr.js';

// ========== LOCALSTORAGE HELPERS ==========
const LS_KEY = 'gymforge_data';

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
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
        initWorkouts={initWorkouts}
      />
    );
  }

  return <Dashboard state={state} update={update} />;
}


// ========== ONBOARDING WIZARD ==========
function OnboardingWizard({ state, update, initWorkouts }) {
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


// ========== STEP 2: MESS MENU ==========
function StepMess({ state, update }) {
  const [mode, setMode] = useState('manual'); // 'manual' | 'upload'
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState(null);
  const [ocrRawText, setOcrRawText] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractMethod, setExtractMethod] = useState('gemini'); // 'gemini' | 'tesseract'
  const [geminiKey, setGeminiKey] = useState(() => getStoredGeminiKey());
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [expandedDay, setExpandedDay] = useState('Monday');
  const [pendingFile, setPendingFile] = useState(null);
  const fileRef = useRef(null);

  const handleMenuChange = (day, meal, value) => {
    const newMenu = { ...state.messMenu };
    newMenu[day] = { ...newMenu[day], [meal]: value };
    update({ messMenu: newMenu });
  };

  const handleDietPref = (pref) => {
    update({ dietPref: pref });
  };

  const runExtraction = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setOcrError('Please upload a valid image file (JPG, PNG, etc.)');
      return;
    }

    // If Gemini is selected but no key, prompt for key first
    if (extractMethod === 'gemini' && !geminiKey.trim()) {
      setPendingFile(file);
      setShowKeyInput(true);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return;
    }

    setUploading(true);
    setUploadDone(false);
    setOcrError(null);
    setOcrProgress(0);
    setOcrRawText(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      let result;
      if (extractMethod === 'gemini') {
        setOcrProgress(30); // Show some progress while API is working
        result = await extractMenuWithGemini(file, geminiKey.trim());
        setOcrProgress(100);
      } else {
        result = await extractMenuWithTesseract(file, (progress) => {
          setOcrProgress(progress);
        });
      }
      setOcrRawText(result.rawText);
      update({ messMenu: result.parsedMenu });
      setUploadDone(true);
    } catch (err) {
      console.error('[Extraction Error]', err);
      setOcrError(err.message || 'Extraction failed');
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  const handleGeminiKeySubmit = () => {
    if (geminiKey.trim()) {
      storeGeminiKey(geminiKey.trim());
      setShowKeyInput(false);
      if (pendingFile) {
        runExtraction(pendingFile);
      }
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
    setPendingFile(null);
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="text-[#22d3ee]">Mess</span> Menu
        </h2>
        <p className="text-sm text-zinc-400">
          Enter your 7-day hostel mess diet.
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

      {/* Toggle Mode */}
      <div className="glass-card p-4 mb-4 animate-fadeIn delay-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-200">Input Method</p>
            <p className="text-[11px] text-zinc-500">
              {mode === 'manual' ? 'Type meals manually' : 'Upload mess schedule image'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-medium ${mode === 'manual' ? 'text-[#39FF14]' : 'text-zinc-500'}`}>Manual</span>
            <div
              className={`toggle-track ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode(mode === 'manual' ? 'upload' : 'manual')}
            >
              <div className="toggle-thumb" />
            </div>
            <span className={`text-[11px] font-medium ${mode === 'upload' ? 'text-[#39FF14]' : 'text-zinc-500'}`}>Upload</span>
          </div>
        </div>
      </div>

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div className="animate-fadeIn mb-4 space-y-3">
          {/* Extraction Method Selector */}
          <div className="glass-card p-4">
            <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-3 font-semibold">
              Extraction Engine
            </p>
            <div className="flex gap-2">
              <button
                className={`flex-1 p-3 rounded-xl border text-left transition-all duration-200 ${
                  extractMethod === 'gemini'
                    ? 'border-[#39FF14] bg-[rgba(57,255,20,0.05)]'
                    : 'border-[var(--color-border-subtle)] hover:border-zinc-600'
                }`}
                onClick={() => setExtractMethod('gemini')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className={extractMethod === 'gemini' ? 'text-[#39FF14]' : 'text-zinc-500'} />
                  <span className="text-[12px] font-bold text-zinc-200">Gemini AI</span>
                  <span className="text-[9px] bg-[#39FF14]/20 text-[#39FF14] px-1.5 py-0.5 rounded-full font-bold">BEST</span>
                </div>
                <p className="text-[10px] text-zinc-500">Google AI reads tables perfectly. Free API key required.</p>
              </button>
              <button
                className={`flex-1 p-3 rounded-xl border text-left transition-all duration-200 ${
                  extractMethod === 'tesseract'
                    ? 'border-[#22d3ee] bg-[rgba(34,211,238,0.05)]'
                    : 'border-[var(--color-border-subtle)] hover:border-zinc-600'
                }`}
                onClick={() => setExtractMethod('tesseract')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Camera size={14} className={extractMethod === 'tesseract' ? 'text-[#22d3ee]' : 'text-zinc-500'} />
                  <span className="text-[12px] font-bold text-zinc-200">Basic OCR</span>
                </div>
                <p className="text-[10px] text-zinc-500">Offline Tesseract.js. Works for clear text images.</p>
              </button>
            </div>

            {/* Gemini API Key Section */}
            {extractMethod === 'gemini' && (
              <div className="mt-3 animate-fadeIn">
                {geminiKey.trim() && !showKeyInput ? (
                  <div className="flex items-center justify-between bg-zinc-900/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Check size={12} className="text-[#39FF14]" />
                      <span className="text-[11px] text-zinc-400">API key configured</span>
                      <span className="text-[10px] text-zinc-600 font-mono">...{geminiKey.slice(-6)}</span>
                    </div>
                    <button
                      className="text-[10px] text-[#22d3ee] hover:underline"
                      onClick={() => setShowKeyInput(true)}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="password"
                        className="input-dark text-[12px] flex-1"
                        placeholder="Paste your Gemini API key..."
                        value={geminiKey}
                        onChange={e => setGeminiKey(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGeminiKeySubmit()}
                      />
                      <button
                        className="btn-neon text-[12px] px-4 py-2"
                        onClick={handleGeminiKeySubmit}
                        disabled={!geminiKey.trim()}
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-600">
                      Get a free key at{' '}
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#22d3ee] hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        aistudio.google.com/apikey
                      </a>
                      {' '}→ Create API Key → copy & paste here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drop Zone */}
          <div
            className="drop-zone p-8 flex flex-col items-center gap-4 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && !showKeyInput && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {showKeyInput && !geminiKey.trim() ? (
              <>
                {previewUrl && (
                  <img src={previewUrl} alt="Uploaded schedule" className="w-full max-h-32 object-contain rounded-lg mb-2 opacity-40" />
                )}
                <AlertCircle size={24} className="text-yellow-400" />
                <p className="text-sm text-yellow-400 font-medium">Enter your Gemini API key above first</p>
                <p className="text-[11px] text-zinc-600">Then your image will be processed automatically</p>
              </>
            ) : uploading ? (
              <>
                {previewUrl && (
                  <img src={previewUrl} alt="Uploaded schedule" className="w-full max-h-40 object-contain rounded-lg mb-3 opacity-60" />
                )}
                <div className="spinner" />
                <p className="text-sm text-zinc-400">
                  {extractMethod === 'gemini' ? 'Gemini AI is reading your menu...' : 'Tesseract processing image...'}
                </p>
                <div className="w-full max-w-[200px] mt-2">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${ocrProgress}%` }} />
                  </div>
                  <p className="text-[11px] text-[#39FF14] mt-1 font-mono">{ocrProgress}%</p>
                </div>
              </>
            ) : ocrError ? (
              <>
                <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center">
                  <AlertCircle size={24} className="text-red-400" />
                </div>
                <p className="text-sm text-red-400 font-semibold">{ocrError}</p>
                <button
                  className="text-[12px] text-[#39FF14] underline mt-1"
                  onClick={resetUpload}
                >
                  Try again
                </button>
              </>
            ) : uploadDone ? (
              <>
                {previewUrl && (
                  <img src={previewUrl} alt="Uploaded schedule" className="w-full max-h-32 object-contain rounded-lg mb-3 border border-[rgba(57,255,20,0.2)]" />
                )}
                <div className="w-12 h-12 rounded-full bg-[rgba(57,255,20,0.15)] flex items-center justify-center animate-checkPop">
                  <Check size={24} className="text-[#39FF14]" />
                </div>
                <p className="text-sm text-[#39FF14] font-semibold">
                  Menu extracted & auto-populated! ✓
                </p>
                <p className="text-[11px] text-zinc-500">
                  Extracted via {extractMethod === 'gemini' ? 'Gemini AI' : 'Tesseract OCR'} — review and edit below
                </p>
                {ocrRawText && (
                  <details className="mt-3 w-full text-left">
                    <summary className="text-[11px] text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors">
                      View raw extracted text
                    </summary>
                    <pre className="mt-2 text-[10px] text-zinc-500 bg-zinc-900/50 p-3 rounded-lg overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-words">{ocrRawText}</pre>
                  </details>
                )}
                <button
                  className="text-[12px] text-[#22d3ee] underline mt-2"
                  onClick={resetUpload}
                >
                  Upload a different image
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] flex items-center justify-center">
                  {extractMethod === 'gemini' ? <Sparkles size={28} className="text-[#39FF14]" /> : <Camera size={28} className="text-zinc-500" />}
                </div>
                <div>
                  <p className="text-sm text-zinc-300 font-medium mb-1">
                    Drop your mess schedule photo here
                  </p>
                  <p className="text-[11px] text-zinc-600">or click to browse • JPG, PNG supported</p>
                  <p className="text-[10px] text-zinc-700 mt-1">
                    {extractMethod === 'gemini' ? '⚡ Powered by Google Gemini AI — reads tables accurately' : 'Uses Tesseract.js offline OCR'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Manual Mode / Editable fields */}
      <div className="space-y-2">
        {DAYS.map((day) => (
          <div key={day} className="glass-card overflow-hidden animate-fadeIn">
            <button
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[var(--color-surface-hover)] transition-colors"
              onClick={() => setExpandedDay(expandedDay === day ? null : day)}
            >
              <span className="text-sm font-bold uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)', color: expandedDay === day ? '#22d3ee' : '#a1a1aa' }}>
                {day}
              </span>
              <ChevronRight
                size={16}
                className={`text-zinc-500 transition-transform duration-200 ${expandedDay === day ? 'rotate-90' : ''}`}
              />
            </button>
            {expandedDay === day && (
              <div className="px-4 pb-4 space-y-3 animate-fadeIn">
                {MEALS.map(meal => (
                  <div key={meal}>
                    <label className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium mb-1 flex items-center gap-1.5">
                      {meal === 'Breakfast' && <Coffee size={11} />}
                      {meal === 'Lunch' && <Utensils size={11} />}
                      {meal === 'Evening Snacks' && <Cookie size={11} />}
                      {meal === 'Dinner' && <Moon size={11} />}
                      {meal}
                    </label>
                    <input
                      type="text"
                      className="input-dark text-[13px]"
                      placeholder={`Enter ${meal.toLowerCase()} items...`}
                      value={state.messMenu[day][meal]}
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
    return count + state.split[day].filter(m => m !== 'NIL').length;
  }, 0);

  const filledMeals = DAYS.reduce((count, day) => {
    return count + MEALS.filter(m => state.messMenu[day][m].trim()).length;
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

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  const handleReset = () => {
    if (window.confirm('Reset all data and go through setup again?')) {
      localStorage.removeItem(LS_KEY);
      window.location.reload();
    }
  };

  return (
    <div className="app-container bg-[var(--color-surface)] min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#39FF14] to-[#22d3ee] flex items-center justify-center">
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
          {installPrompt && !isInstalled && (
            <button
              className="h-8 px-3 rounded-lg bg-gradient-to-r from-[#39FF14]/20 to-[#22d3ee]/20 border border-[#39FF14]/40 hover:border-[#39FF14] flex items-center gap-1.5 transition-all duration-300 group"
              onClick={handleInstall}
              title="Install GymForge App"
            >
              <Download size={13} className="text-[#39FF14] group-hover:animate-bounce" />
              <span className="text-[10px] font-bold text-[#39FF14] uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>Install</span>
            </button>
          )}
          {isInstalled && (
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
            <MealsView state={state} day={activeDay} />
          </div>
        )}
        {activeView === 'hacks' && (
          <div className="animate-fadeIn" key="hacks">
            <HacksView state={state} />
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
function MealsView({ state, day }) {
  const menu = state.messMenu[day] || {};

  const mealMeta = [
    { key: 'Breakfast', icon: Coffee, time: '7:30 – 9:00 AM', color: '#facc15' },
    { key: 'Lunch', icon: Utensils, time: '12:30 – 2:00 PM', color: '#22d3ee' },
    { key: 'Evening Snacks', icon: Cookie, time: '4:30 – 5:30 PM', color: '#f97316' },
    { key: 'Dinner', icon: Moon, time: '7:30 – 9:30 PM', color: '#a78bfa' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Utensils size={18} className="text-[#22d3ee]" />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: '#22d3ee' }}>
            {day}'s Meals
          </h3>
        </div>
        <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
          state.dietPref === 'VEG'
            ? 'bg-green-900/40 text-green-400 border border-green-800/50'
            : 'bg-red-900/40 text-red-400 border border-red-800/50'
        }`}>
          {state.dietPref === 'VEG' ? '🟢' : '🔴'} {state.dietPref}
        </span>
      </div>

      <div className="space-y-3">
        {mealMeta.map((meal, idx) => (
          <div
            key={meal.key}
            className="meal-card animate-fadeIn"
            style={{ animationDelay: `${idx * 0.1}s`, borderLeftWidth: '3px', borderLeftColor: meal.color }}
          >
            <div className="flex items-center gap-2 mb-2">
              <meal.icon size={16} style={{ color: meal.color }} />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: meal.color, fontFamily: 'var(--font-display)' }}>
                {meal.key}
              </span>
              <span className="text-[10px] text-zinc-600 ml-auto flex items-center gap-1">
                <Clock size={10} /> {meal.time}
              </span>
            </div>
            <p className="text-[13px] text-zinc-300 leading-relaxed">
              {menu[meal.key] || <span className="text-zinc-600 italic">Not specified</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}


// ========== VIEW 3: HOSTEL HACKS ==========
function HacksView({ state }) {
  const customItemsList = state.customItems
    ? state.customItems.split(',').map(i => i.trim()).filter(Boolean)
    : [];
  const { preWorkout, postWorkout } = generateRecipes(state.roomItems, customItemsList);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <ChefHat size={18} className="text-[#39FF14]" />
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)', color: '#39FF14' }}>
          Hostel Hacks
        </h3>
      </div>

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
            Post-Workout Recovery
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
      <div className="flex items-start justify-between mb-2">
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

      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mb-2">
        <span className="flex items-center gap-1">
          <Timer size={11} /> {recipe.timing}
        </span>
        <span className="flex items-center gap-1">
          <Flame size={11} /> {recipe.calories}
        </span>
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
