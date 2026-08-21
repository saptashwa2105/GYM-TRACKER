// ========== INDIAN HOSTEL MESS NUTRITION ESTIMATOR ENGINE ==========

const NUTRITION_DB = [
  // Non-Veg Items
  { keywords: ['boiled egg', 'egg bhurji', 'omelette', 'egg curry', 'eggs', 'egg'], calories: 150, protein: 13, carbs: 2, fats: 10, isNonVeg: true },
  { keywords: ['chicken curry', 'butter chicken', 'chicken tikka', 'chicken biryani', 'chicken fry', 'kadai chicken', 'chicken keema', 'chicken momos', 'chicken leg', 'chicken'], calories: 280, protein: 26, carbs: 8, fats: 16, isNonVeg: true },
  { keywords: ['fish curry', 'fish fry', 'fish'], calories: 220, protein: 22, carbs: 5, fats: 12, isNonVeg: true },
  { keywords: ['mutton curry', 'mutton biryani', 'mutton'], calories: 310, protein: 24, carbs: 6, fats: 20, isNonVeg: true },

  // High Protein Veg / Soya & Paneer Dishes
  { keywords: ['soya chunks', 'soya bean', 'soya curry', 'soya mattai', 'soya'], calories: 220, protein: 22, carbs: 15, fats: 8, isNonVeg: false },
  { keywords: ['paneer butter masala', 'matar paneer', 'palak paneer', 'shahi paneer', 'paneer tikka', 'kadai paneer', 'paneer'], calories: 240, protein: 14, carbs: 8, fats: 17, isNonVeg: false },
  { keywords: ['malai kofta'], calories: 270, protein: 8, carbs: 22, fats: 18, isNonVeg: false },

  // Legumes & Pulses
  { keywords: ['chole', 'rajma', 'chana dal', 'boiled chana', 'chana'], calories: 190, protein: 9, carbs: 30, fats: 4, isNonVeg: false },
  { keywords: ['dal tadka', 'dal fry', 'yellow dal', 'moong dal', 'dal palak', 'dal makhani', 'mix dal', 'arhar dal', 'kadhi pakoda', 'sambar', 'dal'], calories: 140, protein: 7, carbs: 22, fats: 4, isNonVeg: false },

  // Breakfast & Staples
  { keywords: ['chole bhature'], calories: 450, protein: 12, carbs: 62, fats: 18, isNonVeg: false },
  { keywords: ['puri bhaji', 'puri'], calories: 320, protein: 6, carbs: 46, fats: 14, isNonVeg: false },
  { keywords: ['paratha', 'aloo paratha', 'gobhi paratha', 'paneer paratha'], calories: 260, protein: 5, carbs: 40, fats: 10, isNonVeg: false },
  { keywords: ['poha'], calories: 210, protein: 4, carbs: 40, fats: 5, isNonVeg: false },
  { keywords: ['idli'], calories: 140, protein: 4, carbs: 30, fats: 1, isNonVeg: false },
  { keywords: ['dosa', 'masala dosa'], calories: 200, protein: 4, carbs: 36, fats: 6, isNonVeg: false },
  { keywords: ['upma'], calories: 190, protein: 5, carbs: 34, fats: 5, isNonVeg: false },

  // Grains & Breads
  { keywords: ['roti', 'chapati', 'phulka'], calories: 140, protein: 4, carbs: 28, fats: 1, isNonVeg: false },
  { keywords: ['rice', 'jeera rice', 'veg biryani', 'pulao', 'biryani'], calories: 180, protein: 4, carbs: 38, fats: 1, isNonVeg: false },

  // Sabzi & Vegetables
  { keywords: ['aloo gobi', 'aloo matar', 'cabbage sabzi', 'tinda sabzi', 'bhindi fry', 'mix veg', 'aloo', 'gobi', 'bhindi', 'sabzi'], calories: 120, protein: 3, carbs: 18, fats: 5, isNonVeg: false },

  // Snacks & Fast Food
  { keywords: ['samosa'], calories: 240, protein: 4, carbs: 30, fats: 12, isNonVeg: false },
  { keywords: ['bread pakora', 'vada pav', 'vada'], calories: 250, protein: 5, carbs: 34, fats: 11, isNonVeg: false },
  { keywords: ['pav bhaji'], calories: 350, protein: 8, carbs: 52, fats: 13, isNonVeg: false },
  { keywords: ['momos', 'veg momos'], calories: 210, protein: 5, carbs: 32, fats: 6, isNonVeg: false },
  { keywords: ['maggi', 'noodles'], calories: 310, protein: 7, carbs: 46, fats: 12, isNonVeg: false },
  { keywords: ['halwa', 'sweet', 'ice cream', 'kheer'], calories: 180, protein: 2, carbs: 32, fats: 6, isNonVeg: false },

  // Dairy & Beverages
  { keywords: ['curd', 'raita', 'lassi', 'buttermilk', 'dahi'], calories: 90, protein: 4, carbs: 8, fats: 4, isNonVeg: false },
  { keywords: ['tea', 'chai', 'coffee'], calories: 70, protein: 2, carbs: 8, fats: 3, isNonVeg: false },
  { keywords: ['banana', 'fruit', 'juice'], calories: 90, protein: 1, carbs: 22, fats: 0, isNonVeg: false },
];

// Fallback baseline for unspecified/custom items
const BASELINE_ITEM_MACROS = { calories: 120, protein: 3, carbs: 20, fats: 3, isNonVeg: false };

/**
 * Estimate macros for a meal string (e.g. "Rice, Dal Tadka, Paneer Butter Masala, Roti").
 * Returns { calories, protein, carbs, fats, isVeg, dietType: 'VEG' | 'NON-VEG' }
 */
export function estimateMealMacros(dishText) {
  if (!dishText || !dishText.trim() || dishText === 'Standard Mess Meal') {
    return { calories: 380, protein: 12, carbs: 55, fats: 10, isVeg: true, dietType: 'VEG' };
  }

  const normalized = dishText.toLowerCase();
  const parts = normalized.split(/[,/+\n&]+/);

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let hasNonVeg = false;
  let itemsMatched = 0;

  parts.forEach(part => {
    const trimmed = part.trim();
    if (!trimmed || trimmed.length < 2) return;

    let matched = false;
    for (const item of NUTRITION_DB) {
      if (item.keywords.some(kw => trimmed.includes(kw))) {
        totalCalories += item.calories;
        totalProtein += item.protein;
        totalCarbs += item.carbs;
        totalFats += item.fats;
        if (item.isNonVeg) hasNonVeg = true;
        matched = true;
        itemsMatched++;
        break;
      }
    }

    if (!matched) {
      // Add baseline for unmatched custom dish names
      totalCalories += BASELINE_ITEM_MACROS.calories;
      totalProtein += BASELINE_ITEM_MACROS.protein;
      totalCarbs += BASELINE_ITEM_MACROS.carbs;
      totalFats += BASELINE_ITEM_MACROS.fats;
      itemsMatched++;
    }
  });

  if (itemsMatched === 0) {
    return { calories: 380, protein: 12, carbs: 55, fats: 10, isVeg: !hasNonVeg, dietType: hasNonVeg ? 'NON-VEG' : 'VEG' };
  }

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fats: Math.round(totalFats),
    isVeg: !hasNonVeg,
    dietType: hasNonVeg ? 'NON-VEG' : 'VEG',
  };
}

/**
 * Estimate full daily macros across 4 meals for a given day menu.
 */
export function estimateDayMacros(dayMenu) {
  let dayCalories = 0;
  let dayProtein = 0;
  let dayCarbs = 0;
  let dayFats = 0;
  let nonVegCount = 0;

  const mealMacrosMap = {};

  ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'].forEach(mealKey => {
    const dishText = dayMenu?.[mealKey] || 'Standard Mess Meal';
    const macros = estimateMealMacros(dishText);

    mealMacrosMap[mealKey] = macros;
    dayCalories += macros.calories;
    dayProtein += macros.protein;
    dayCarbs += macros.carbs;
    dayFats += macros.fats;

    if (!macros.isVeg) nonVegCount++;
  });

  return {
    calories: Math.round(dayCalories),
    protein: Math.round(dayProtein),
    carbs: Math.round(dayCarbs),
    fats: Math.round(dayFats),
    isNonVegDay: nonVegCount > 0,
    dietType: nonVegCount > 0 ? 'NON-VEG' : 'VEG',
    mealMacrosMap,
  };
}

/**
 * Extract full weekly nutrition report for a 7-day mess menu object.
 */
export function processMenuNutrition(messMenu) {
  const dayReports = {};
  let totalWeekCalories = 0;
  let totalWeekProtein = 0;
  let totalWeekCarbs = 0;
  let totalWeekFats = 0;

  Object.keys(messMenu || {}).forEach(day => {
    const report = estimateDayMacros(messMenu[day]);
    dayReports[day] = report;
    totalWeekCalories += report.calories;
    totalWeekProtein += report.protein;
    totalWeekCarbs += report.carbs;
    totalWeekFats += report.fats;
  });

  return {
    dayReports,
    weeklyTotal: {
      calories: totalWeekCalories,
      protein: totalWeekProtein,
      carbs: totalWeekCarbs,
      fats: totalWeekFats,
    },
  };
}

/**
 * Get daily calorie and protein targets tailored for LEAN or BULK goal.
 */
export function getGoalTargets(fitnessGoal = 'LEAN') {
  if (fitnessGoal === 'LEAN') {
    return {
      targetProtein: 130, // grams
      targetCalories: 1900, // kcal (maintenance/deficit)
      label: 'LEAN SHRED (Fat Loss & Lean Muscle)',
      calorieGoalText: 'Deficit / Maintenance Target (~1900 kcal)',
      adviceHeader: '🔥 Lean Cutting Strategy:',
      hacks: [
        'Prioritize maximum dal & boiled chana in the mess.',
        'Choose Roti over Rice without extra ghee/butter.',
        'Stir soaked soya chunks into mess dal for zero-fat protein.',
        'Avoid oily deep-fried evening snacks (samosas/pakoras).'
      ]
    };
  } else {
    return {
      targetProtein: 140, // grams
      targetCalories: 2600, // kcal (surplus)
      label: 'BULK MASS (Clean Surplus & Muscle Gain)',
      calorieGoalText: 'Caloric Surplus Target (~2600 kcal)',
      adviceHeader: '🏋️ Clean Bulking Strategy:',
      hacks: [
        'Stack rotis with peanut butter & raw paneer for instant surplus calories.',
        'Add 2 tbsp sattu + whole milk or dahi to your post-workout routine.',
        'Consume whole eggs instead of just egg whites for healthy fats.',
        'Drink a high-calorie PB + Oats Kettle Mash shake daily.'
      ]
    };
  }
}

/**
 * Calculate remaining daily protein gap given mess protein & target.
 */
export function calculateProteinGap(messProtein, targetProtein = 110, fitnessGoal = 'LEAN') {
  const defaultTarget = fitnessGoal === 'LEAN' ? 130 : 140;
  const target = targetProtein || defaultTarget;
  const gap = target - messProtein;
  return Math.max(0, Math.round(gap));
}


