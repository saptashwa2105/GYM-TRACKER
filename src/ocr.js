import { createWorker } from 'tesseract.js';
import { DAYS, MEALS } from './data.js';

/**
 * Preprocess image for maximum OCR accuracy:
 * - Resizes image for clear text definition if needed
 * - Converts image to high-contrast grayscale & binarized threshold
 */
export async function preprocessImageForOCR(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Scale up low-resolution images for higher OCR detail
        let width = img.width;
        let height = img.height;
        const targetMinDimension = 1400;
        const minDim = Math.min(width, height);

        if (minDim < targetMinDimension) {
          const scale = targetMinDimension / minDim;
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image scaled onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Fetch image pixels for binarization & contrast enhancement
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Pass 1: Find min/max luminance for auto contrast stretching
        let minLuma = 255;
        let maxLuma = 0;
        for (let i = 0; i < data.length; i += 4) {
          const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          if (luma < minLuma) minLuma = luma;
          if (luma > maxLuma) maxLuma = luma;
        }

        const range = Math.max(maxLuma - minLuma, 1);

        // Pass 2: Grayscale conversion + contrast stretch + binarization threshold
        const threshold = 140; // Standard threshold for high contrast black-on-white text
        for (let i = 0; i < data.length; i += 4) {
          const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          // Auto contrast stretch
          const contrastLuma = ((luma - minLuma) / range) * 255;
          // Apply binarization (sharp black text on white background)
          const val = contrastLuma < threshold ? 0 : 255;

          data[i] = val;     // R
          data[i + 1] = val; // G
          data[i + 2] = val; // B
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('[Preprocess Warning] Fallback to raw file image:', err);
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Perform keyless, browser-native OCR extraction using Tesseract.js.
 * @param {File} file - Uploaded photo file
 * @param {Function} onProgress - Progress callback receiving integer (0 to 100)
 */
export async function extractMenuWithTesseract(file, onProgress) {
  let worker = null;
  try {
    console.log('[Tesseract OCR] Preprocessing menu photo...');
    if (onProgress) onProgress(5);

    const processedImageData = await preprocessImageForOCR(file);
    if (onProgress) onProgress(15);

    console.log('[Tesseract OCR] Initializing Tesseract WASM worker...');
    worker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text' && onProgress) {
          const prog = Math.round(20 + (m.progress || 0) * 75);
          onProgress(prog);
        }
      }
    });

    console.log('[Tesseract OCR] Executing recognition...');
    const result = await worker.recognize(processedImageData);
    const rawText = result?.data?.text || '';

    console.log('[Tesseract OCR] Extracted Raw Text:\n', rawText);

    if (!rawText.trim()) {
      throw new Error('No readable text detected. Please upload a clearer photo of your mess menu schedule.');
    }

    if (onProgress) onProgress(98);

    const parsedMenu = parseMenuText(rawText);

    if (onProgress) onProgress(100);

    return { rawText, parsedMenu };
  } catch (err) {
    console.error('[Tesseract OCR Error]', err);
    throw new Error(err.message || 'Could not extract text from photograph. Please try a clearer photo or use Manual Input.');
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

/**
 * Intelligent text parser: Maps raw OCR lines into Mon-Sun x Breakfast/Lunch/Snacks/Dinner matrix.
 */
export function parseMenuText(text) {
  // Initialize default menu matrix
  const menu = {};
  DAYS.forEach(day => {
    menu[day] = {};
    MEALS.forEach(meal => {
      menu[day][meal] = 'Standard Mess Meal';
    });
  });

  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const dayRegexes = [
    { day: 'Monday', regex: /\b(?:mon|monday)\b/i },
    { day: 'Tuesday', regex: /\b(?:tue|tues|tuesday)\b/i },
    { day: 'Wednesday', regex: /\b(?:wed|wednesday)\b/i },
    { day: 'Thursday', regex: /\b(?:thu|thur|thurs|thursday)\b/i },
    { day: 'Friday', regex: /\b(?:fri|friday)\b/i },
    { day: 'Saturday', regex: /\b(?:sat|saturday)\b/i },
    { day: 'Sunday', regex: /\b(?:sun|sunday)\b/i },
  ];

  const mealRegexes = [
    { meal: 'Breakfast', regex: /\b(?:breakfast|bf|b\/f|morning)\b/i },
    { meal: 'Lunch', regex: /\b(?:lunch|afternoon)\b/i },
    { meal: 'Evening Snacks', regex: /\b(?:snacks|evening|tea|tiffin)\b/i },
    { meal: 'Dinner', regex: /\b(?:dinner|supper|night)\b/i },
  ];

  let currentDay = null;

  // Approach 1: Parse lines sequentially tracking active Day & Meal
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line contains a day header
    const matchedDay = dayRegexes.find(d => d.regex.test(line));
    if (matchedDay) {
      currentDay = matchedDay.day;
    }

    if (currentDay) {
      // Check for inline day + meal entries or dish lines
      for (const m of mealRegexes) {
        if (m.regex.test(line)) {
          // Extract content after meal header if present on same line
          const parts = line.split(m.regex);
          const afterText = parts[parts.length - 1]?.replace(/^[:\-\s]+/, '').trim();
          if (afterText && afterText.length > 2 && !dayRegexes.some(d => d.regex.test(afterText))) {
            menu[currentDay][m.meal] = sanitizeDishText(afterText);
          } else if (i + 1 < lines.length) {
            // Check next line for dish content
            const nextLine = lines[i + 1];
            if (!dayRegexes.some(d => d.regex.test(nextLine)) && !mealRegexes.some(mr => mr.regex.test(nextLine))) {
              menu[currentDay][m.meal] = sanitizeDishText(nextLine);
            }
          }
        }
      }
    }
  }

  // Approach 2: Global scan fallback if any days are left missing
  DAYS.forEach((day) => {
    const dayEntry = dayRegexes.find(d => d.day === day);
    const dayLineIdx = lines.findIndex(l => dayEntry.regex.test(l));

    if (dayLineIdx !== -1) {
      // Collect lines following this day header until the next day header
      const dayBlockLines = [];
      for (let k = dayLineIdx + 1; k < lines.length; k++) {
        if (dayRegexes.some(d => d.regex.test(lines[k]))) break;
        dayBlockLines.push(lines[k]);
      }

      if (dayBlockLines.length > 0) {
        MEALS.forEach((meal, mealIdx) => {
          if (menu[day][meal] === 'Standard Mess Meal') {
            // Assign lines from day block iteratively if available
            const candidateLine = dayBlockLines[mealIdx] || dayBlockLines[0];
            if (candidateLine && candidateLine.length > 2) {
              const cleaned = sanitizeDishText(candidateLine);
              if (cleaned) menu[day][meal] = cleaned;
            }
          }
        });
      }
    }
  });

  // Final verification fallback check
  DAYS.forEach(day => {
    MEALS.forEach(meal => {
      if (!menu[day][meal] || !menu[day][meal].trim()) {
        menu[day][meal] = 'Standard Mess Meal';
      }
    });
  });

  return menu;
}

/**
 * Clean up OCR artifacts and special noise characters from recognized text.
 */
function sanitizeDishText(str) {
  if (!str) return '';
  let cleaned = str
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/[|\\/_~`^*+#=<>]/g, ' ') // Remove OCR noise symbols
    .replace(/\b([A-Za-z]+)0([A-Za-z]+)\b/g, '$1o$2') // Fix 0 -> o inside words (e.g. P0ha -> Poha)
    .replace(/\b([A-Za-z]+)1([A-Za-z]+)\b/g, '$1i$2') // Fix 1 -> i inside words (e.g. Idl1 -> Idli)
    .replace(/\s+/g, ' ')             // Collapse whitespace
    .trim();

  // If text is overly short or just numbers, keep default
  if (cleaned.length < 2) return '';
  return cleaned;
}
