import { createWorker } from 'tesseract.js';
import { DAYS, MEALS } from './data.js';

// ========== GEMINI VISION API (PRIMARY - RECOMMENDED) ==========

const GEMINI_KEY_LS = 'gymforge_gemini_key';

export function getStoredGeminiKey() {
  try { return localStorage.getItem(GEMINI_KEY_LS) || ''; } catch { return ''; }
}

export function storeGeminiKey(key) {
  try { localStorage.setItem(GEMINI_KEY_LS, key); } catch {}
}

/**
 * Use Google Gemini Vision API to extract meal data from an image.
 * This is FAR more accurate than Tesseract for table/schedule photos.
 */
export async function extractMenuWithGemini(file, apiKey) {
  const base64 = await readFileAsBase64(file);
  const mimeType = file.type || 'image/jpeg';

  const prompt = `You are looking at a photograph of a hostel mess food menu / meal schedule.

TASK: Extract ALL meal/food information exactly as written in the image. Read every single word carefully.

Return a JSON object with this EXACT structure:
{
  "Monday": { "Breakfast": "...", "Lunch": "...", "Evening Snacks": "...", "Dinner": "..." },
  "Tuesday": { "Breakfast": "...", "Lunch": "...", "Evening Snacks": "...", "Dinner": "..." },
  "Wednesday": { "Breakfast": "...", "Lunch": "...", "Evening Snacks": "...", "Dinner": "..." },
  "Thursday": { "Breakfast": "...", "Lunch": "...", "Evening Snacks": "...", "Dinner": "..." },
  "Friday": { "Breakfast": "...", "Lunch": "...", "Evening Snacks": "...", "Dinner": "..." },
  "Saturday": { "Breakfast": "...", "Lunch": "...", "Evening Snacks": "...", "Dinner": "..." },
  "Sunday": { "Breakfast": "...", "Lunch": "...", "Evening Snacks": "...", "Dinner": "..." }
}

RULES:
- Copy the food items EXACTLY as written in the image, preserving the original text.
- If a meal says "Snacks" or "Tea Time" or "Tiffin" or "Evening" treat it as "Evening Snacks".
- If a meal says "B/F" or "BF" treat it as "Breakfast".
- If a day is not visible or not present, use empty strings "".
- Separate multiple food items with commas.
- Do NOT add any food items that are not in the image.
- Do NOT translate or modify the food names.
- Return ONLY the JSON object, no markdown, no explanation, no code fences.`;

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: mimeType,
            data: base64,
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
    }
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.error('[Gemini API Error]', res.status, errBody);
    if (res.status === 400) throw new Error('Invalid API key or bad request. Check your Gemini API key.');
    if (res.status === 403) throw new Error('API key unauthorized. Get a free key from aistudio.google.com');
    if (res.status === 429) throw new Error('Rate limit exceeded. Wait a moment and try again.');
    throw new Error(`Gemini API error (${res.status})`);
  }

  const data = await res.json();
  const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textResponse) {
    throw new Error('Gemini returned no text. Try a clearer photo.');
  }

  console.log('[Gemini] Raw response:\n', textResponse);

  // Parse JSON from response (handle markdown code fences if present)
  const parsedMenu = parseGeminiResponse(textResponse);
  return { rawText: textResponse, parsedMenu };
}

/**
 * Parse Gemini's JSON response, handling edge cases.
 */
function parseGeminiResponse(text) {
  // Strip markdown code fences if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  cleaned = cleaned.trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // Try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        throw new Error('Could not parse Gemini response as JSON. Try a clearer photo.');
      }
    } else {
      throw new Error('Gemini response did not contain valid JSON.');
    }
  }

  // Normalize into our expected structure
  const menu = {};
  DAYS.forEach(day => {
    menu[day] = {};
    MEALS.forEach(meal => {
      menu[day][meal] = '';
    });
  });

  // Map parsed data to our structure (handle case variations)
  const dayAliases = {
    'mon': 'Monday', 'monday': 'Monday',
    'tue': 'Tuesday', 'tues': 'Tuesday', 'tuesday': 'Tuesday',
    'wed': 'Wednesday', 'wednesday': 'Wednesday',
    'thu': 'Thursday', 'thur': 'Thursday', 'thurs': 'Thursday', 'thursday': 'Thursday',
    'fri': 'Friday', 'friday': 'Friday',
    'sat': 'Saturday', 'saturday': 'Saturday',
    'sun': 'Sunday', 'sunday': 'Sunday',
  };

  const mealAliases = {
    'breakfast': 'Breakfast', 'bf': 'Breakfast', 'b/f': 'Breakfast', 'morning': 'Breakfast',
    'lunch': 'Lunch', 'afternoon': 'Lunch',
    'evening snacks': 'Evening Snacks', 'snacks': 'Evening Snacks', 'evening': 'Evening Snacks',
    'tea time': 'Evening Snacks', 'tiffin': 'Evening Snacks', 'teatime': 'Evening Snacks',
    'dinner': 'Dinner', 'supper': 'Dinner', 'night': 'Dinner',
  };

  for (const [rawDay, meals] of Object.entries(parsed)) {
    const normalizedDay = dayAliases[rawDay.toLowerCase().trim()] || rawDay;
    if (!menu[normalizedDay]) continue;

    if (typeof meals === 'object' && meals !== null) {
      for (const [rawMeal, items] of Object.entries(meals)) {
        const normalizedMeal = mealAliases[rawMeal.toLowerCase().trim()] || rawMeal;
        if (menu[normalizedDay][normalizedMeal] !== undefined) {
          menu[normalizedDay][normalizedMeal] = typeof items === 'string' ? items : String(items || '');
        }
      }
    }
  }

  return menu;
}


// ========== TESSERACT OCR (FALLBACK) ==========

/**
 * Perform Tesseract OCR with heavy image preprocessing.
 */
export async function extractMenuWithTesseract(file, onProgress) {
  // 1. Preprocess the image for better OCR
  const preprocessedBlob = await preprocessImage(file);

  // 2. Create a Tesseract worker (v7 API)
  const worker = await createWorker('eng', 1, {
    logger: (info) => {
      if (info.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(info.progress * 100));
      }
    },
  });

  // 3. Run recognition
  const { data } = await worker.recognize(preprocessedBlob);
  const rawText = data.text;
  console.log('[Tesseract] Raw OCR text:\n', rawText);

  // 4. Terminate worker to free resources
  await worker.terminate();

  // 5. Parse the raw text into structured menu
  const parsedMenu = parseMenuText(rawText);

  return { rawText, parsedMenu };
}

/**
 * Preprocess image using Canvas API for dramatically better OCR results.
 * - Upscale small images
 * - Convert to grayscale
 * - Boost contrast aggressively
 * - Apply binarization threshold
 */
async function preprocessImage(file) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Scale up small images (OCR needs at least ~300 DPI equivalent)
  const MIN_WIDTH = 2000;
  const scale = img.width < MIN_WIDTH ? MIN_WIDTH / img.width : 1;
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  // Draw with smoothing for upscale
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Step 1: Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  // Step 2: Compute histogram for adaptive thresholding
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    histogram[data[i]]++;
  }

  // Step 3: Otsu's method for optimal threshold
  const totalPixels = data.length / 4;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0, wB = 0, wF = 0, maxVariance = 0, threshold = 128;
  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = totalPixels - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }

  // Step 4: Apply contrast stretch then binarize
  // Find actual min/max in image
  let minVal = 255, maxVal = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] < minVal) minVal = data[i];
    if (data[i] > maxVal) maxVal = data[i];
  }
  const range = maxVal - minVal || 1;

  for (let i = 0; i < data.length; i += 4) {
    // Stretch contrast
    let v = ((data[i] - minVal) / range) * 255;
    // Binarize with slight bias toward keeping text (lower threshold)
    v = v < threshold * 0.85 ? 0 : 255;
    data[i] = data[i + 1] = data[i + 2] = v;
  }

  ctx.putImageData(imageData, 0, 0);

  // Convert canvas to blob
  return new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}


// ========== TEXT PARSING (for Tesseract output) ==========

const DAY_PATTERNS = {
  Monday:    /\b(monday|mon\.?)\b/i,
  Tuesday:   /\b(tuesday|tue\.?|tues\.?)\b/i,
  Wednesday: /\b(wednesday|wed\.?)\b/i,
  Thursday:  /\b(thursday|thu\.?|thur\.?|thurs\.?)\b/i,
  Friday:    /\b(friday|fri\.?)\b/i,
  Saturday:  /\b(saturday|sat\.?)\b/i,
  Sunday:    /\b(sunday|sun\.?)\b/i,
};

const MEAL_PATTERNS = {
  'Breakfast':      /\b(breakfast|b[\.\-]?fast|morning\s*meal|brkfst)\b/i,
  'Lunch':          /\b(lunch|afternoon\s*meal|mid[\-\s]?day)\b/i,
  'Evening Snacks': /\b(evening\s*snack|snack|tea\s*time|eve\.?\s*snack|tiffin|hi[\-\s]?tea)\b/i,
  'Dinner':         /\b(dinner|supper|night\s*meal)\b/i,
};

function parseMenuText(rawText) {
  const menu = {};
  DAYS.forEach(day => {
    menu[day] = {};
    MEALS.forEach(meal => { menu[day][meal] = ''; });
  });

  const cleanedText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\t+/g, ' | ')
    .replace(/ {3,}/g, ' | ');

  const lines = cleanedText.split('\n').map(l => l.trim()).filter(Boolean);

  // Try strategies
  const tableResult = tryTableRowParsing(lines, deepCopy(menu));
  if (tableResult.matchedDays >= 3) return tableResult.menu;

  const sectionResult = trySectionParsing(lines, deepCopy(menu));
  if (sectionResult.matchedDays >= 2) return sectionResult.menu;

  const mealHeaderResult = tryMealHeaderParsing(lines, deepCopy(menu));
  if (mealHeaderResult.matchedMeals >= 2) return mealHeaderResult.menu;

  return rawDumpStrategy(lines, deepCopy(menu));
}

function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }

function tryTableRowParsing(lines, menu) {
  let matchedDays = 0;
  const resultMenu = deepCopy(menu);
  let mealOrder = [...MEALS];

  const headerLine = lines.find(line => {
    let mealCount = 0;
    MEALS.forEach(meal => { if (MEAL_PATTERNS[meal].test(line)) mealCount++; });
    return mealCount >= 2;
  });

  if (headerLine) {
    const detectedOrder = [];
    const segments = splitSegments(headerLine);
    for (const seg of segments) {
      for (const [meal, pattern] of Object.entries(MEAL_PATTERNS)) {
        if (pattern.test(seg) && !detectedOrder.includes(meal)) detectedOrder.push(meal);
      }
    }
    if (detectedOrder.length >= 2) {
      mealOrder = detectedOrder;
      MEALS.forEach(m => { if (!mealOrder.includes(m)) mealOrder.push(m); });
    }
  }

  for (const line of lines) {
    if (headerLine && line === headerLine) continue;
    const day = detectDay(line);
    if (!day) continue;
    let remaining = line;
    for (const [, pattern] of Object.entries(DAY_PATTERNS)) remaining = remaining.replace(pattern, '');
    const segments = splitSegments(remaining);
    if (segments.length === 0) continue;
    matchedDays++;
    for (let i = 0; i < Math.min(segments.length, mealOrder.length); i++) {
      const cleaned = cleanFood(segments[i]);
      if (cleaned) resultMenu[day][mealOrder[i]] = cleaned;
    }
  }
  return { menu: resultMenu, matchedDays };
}

function trySectionParsing(lines, menu) {
  let matchedDays = 0;
  const resultMenu = deepCopy(menu);
  let currentDay = null;

  for (const line of lines) {
    const day = detectDay(line);
    if (day) {
      const rest = line.replace(DAY_PATTERNS[day], '').trim();
      if (rest.length < 20 || !rest.includes(',')) {
        currentDay = day;
        matchedDays++;
        const meal = detectMeal(rest);
        if (meal && currentDay) {
          const content = rest.replace(MEAL_PATTERNS[meal], '').replace(/^[\s:\-|]+/, '').trim();
          if (content) resultMenu[currentDay][meal] = cleanFood(content);
        }
        continue;
      }
    }
    if (!currentDay) continue;
    const meal = detectMeal(line);
    if (meal) {
      let content = line.replace(MEAL_PATTERNS[meal], '').replace(/^[\s:\-|]+/, '').trim();
      if (content) resultMenu[currentDay][meal] = cleanFood(content);
    } else {
      const emptyMeal = MEALS.find(m => !resultMenu[currentDay][m]);
      if (emptyMeal) resultMenu[currentDay][emptyMeal] = cleanFood(line);
    }
  }
  return { menu: resultMenu, matchedDays };
}

function tryMealHeaderParsing(lines, menu) {
  let matchedMeals = 0;
  const resultMenu = deepCopy(menu);
  let currentMeal = null;

  for (const line of lines) {
    const meal = detectMeal(line);
    if (meal) {
      const rest = line.replace(MEAL_PATTERNS[meal], '').trim();
      if (rest.length < 15) { currentMeal = meal; matchedMeals++; continue; }
    }
    if (!currentMeal) continue;
    const day = detectDay(line);
    if (day) {
      let content = line;
      for (const [, pattern] of Object.entries(DAY_PATTERNS)) content = content.replace(pattern, '');
      content = content.replace(/^[\s:\-|]+/, '').trim();
      if (content) resultMenu[day][currentMeal] = cleanFood(content);
    }
  }
  return { menu: resultMenu, matchedMeals };
}

function rawDumpStrategy(lines, menu) {
  const resultMenu = deepCopy(menu);
  const meaningful = lines.filter(l => l.length > 3 && /[a-zA-Z]/.test(l));
  if (meaningful.length === 0) return resultMenu;

  let currentDay = 'Monday';
  let mealIdx = 0;

  for (const line of meaningful) {
    const day = detectDay(line);
    if (day) {
      currentDay = day;
      mealIdx = 0;
      let remaining = line;
      for (const [, p] of Object.entries(DAY_PATTERNS)) remaining = remaining.replace(p, '');
      remaining = remaining.replace(/^[\s:\-|]+/, '').trim();
      if (remaining && mealIdx < MEALS.length) {
        resultMenu[currentDay][MEALS[mealIdx]] = cleanFood(remaining);
        mealIdx++;
      }
      continue;
    }
    if (mealIdx < MEALS.length) {
      const existing = resultMenu[currentDay][MEALS[mealIdx]];
      resultMenu[currentDay][MEALS[mealIdx]] = existing
        ? existing + ', ' + cleanFood(line)
        : cleanFood(line);
      mealIdx++;
    }
  }
  return resultMenu;
}

function detectDay(line) {
  for (const [day, pattern] of Object.entries(DAY_PATTERNS)) {
    if (pattern.test(line)) return day;
  }
  return null;
}

function detectMeal(line) {
  for (const [meal, pattern] of Object.entries(MEAL_PATTERNS)) {
    if (pattern.test(line)) return meal;
  }
  return null;
}

function splitSegments(line) {
  if (line.includes('|')) return line.split('|').map(s => s.trim()).filter(Boolean);
  if (line.includes('\t')) return line.split('\t').map(s => s.trim()).filter(Boolean);
  if (/\s{3,}/.test(line)) return line.split(/\s{3,}/).map(s => s.trim()).filter(Boolean);
  if (line.includes(';')) return line.split(';').map(s => s.trim()).filter(Boolean);
  return [line.trim()].filter(Boolean);
}

function cleanFood(text) {
  return text
    .replace(/^[\s:\-|•·*#>]+/, '')
    .replace(/[\s:\-|]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[_~`]+/g, '')
    .replace(/\|/g, ',')
    .replace(/,\s*,/g, ',')
    .replace(/^,\s*/, '')
    .replace(/,\s*$/, '')
    .trim();
}


// ========== UTILITIES ==========

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Extract base64 from data URL (remove "data:image/...;base64," prefix)
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
