// ========== CONSTANTS & DEFAULT DATA ==========

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const DAY_ABBREV = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Triceps', 'Biceps', 'Abs', 'Forearms', 'NIL'];

export const MEALS = ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'];

export const ROOM_ITEMS = ['Bananas', 'Peanut Butter', 'Oats', 'Milk Powder', 'Honey', 'Almonds', 'Eggs', 'Whey Protein'];

// Standard workout database
export const EXERCISE_DB = {
  Chest: [
    { name: 'Bench Press', sets: 3, reps: '15' },
    { name: 'Incline Dumbbell Press', sets: 3, reps: '12' },
    { name: 'Incline Dumbbell Fly', sets: 3, reps: '12' },
    { name: 'Cable Crossovers', sets: 3, reps: '15' },
    { name: 'Push-Ups (Burnout)', sets: 2, reps: 'Failure' },
  ],
  Back: [
    { name: 'Lat Pulldowns', sets: 3, reps: '12' },
    { name: 'Barbell Rows', sets: 3, reps: '12' },
    { name: 'Seated Cable Rows', sets: 3, reps: '12' },
    { name: 'Single-Arm Dumbbell Rows', sets: 3, reps: '10' },
    { name: 'Face Pulls', sets: 3, reps: '15' },
  ],
  Legs: [
    { name: 'Squats', sets: 4, reps: '10' },
    { name: 'Leg Press', sets: 3, reps: '12' },
    { name: 'Leg Extensions', sets: 3, reps: '15' },
    { name: 'Hamstring Curls', sets: 3, reps: '12' },
    { name: 'Calf Raises', sets: 4, reps: '15' },
  ],
  Shoulders: [
    { name: 'Overhead Press', sets: 3, reps: '12' },
    { name: 'Lateral Raises', sets: 3, reps: '15' },
    { name: 'Front Raises', sets: 3, reps: '12' },
    { name: 'Rear Delt Fly', sets: 3, reps: '15' },
    { name: 'Shrugs', sets: 3, reps: '15' },
  ],
  Triceps: [
    { name: 'Overhead Cable Extensions', sets: 3, reps: '15' },
    { name: 'Skull Crushers', sets: 3, reps: '12' },
    { name: 'Tricep Pushdowns', sets: 3, reps: '15' },
    { name: 'Dips', sets: 3, reps: '12' },
  ],
  Biceps: [
    { name: 'Hammer Curls', sets: 3, reps: '12' },
    { name: 'Preacher Curls', sets: 3, reps: '10' },
    { name: 'Barbell Curls', sets: 3, reps: '12' },
    { name: 'Concentration Curls', sets: 3, reps: '10' },
  ],
  Abs: [
    { name: 'Planks', sets: 3, reps: '60s' },
    { name: 'Hanging Leg Raises', sets: 3, reps: '12' },
    { name: 'Cable Crunches', sets: 3, reps: '15' },
    { name: 'Russian Twists', sets: 3, reps: '20' },
  ],
  Forearms: [
    { name: 'Wrist Curls', sets: 3, reps: '15' },
    { name: 'Reverse Wrist Curls', sets: 3, reps: '15' },
    { name: 'Farmer Walks', sets: 3, reps: '30s' },
  ],
};

// Default push/pull/legs split
export const DEFAULT_SPLIT = {
  Monday:    ['Chest', 'Triceps', 'NIL', 'NIL'],
  Tuesday:   ['Back', 'Biceps', 'NIL', 'NIL'],
  Wednesday: ['Shoulders', 'Legs', 'NIL', 'NIL'],
  Thursday:  ['Chest', 'Triceps', 'NIL', 'NIL'],
  Friday:    ['Back', 'Biceps', 'NIL', 'NIL'],
  Saturday:  ['Shoulders', 'Legs', 'NIL', 'NIL'],
  Sunday:    ['NIL', 'NIL', 'NIL', 'NIL'],
};

// Sample mess menu for OCR simulation
export const SAMPLE_VEG_MENU = {
  Monday: {
    Breakfast: 'Poha, Boiled Chana, Tea, Banana',
    Lunch: 'Rice, Dal Tadka, Aloo Gobi, Roti, Salad',
    'Evening Snacks': 'Samosa, Chai',
    Dinner: 'Roti, Paneer Butter Masala, Rice, Dal Fry',
  },
  Tuesday: {
    Breakfast: 'Idli, Sambar, Coconut Chutney, Coffee',
    Lunch: 'Rice, Rajma, Mixed Veg, Roti, Curd',
    'Evening Snacks': 'Bread Pakora, Tea',
    Dinner: 'Roti, Chole, Rice, Raita',
  },
  Wednesday: {
    Breakfast: 'Paratha (Aloo), Curd, Pickle, Tea',
    Lunch: 'Rice, Dal Palak, Bhindi Fry, Roti, Salad',
    'Evening Snacks': 'Vada Pav, Chai',
    Dinner: 'Roti, Matar Paneer, Rice, Moong Dal',
  },
  Thursday: {
    Breakfast: 'Upma, Boiled Egg/Banana, Coffee',
    Lunch: 'Rice, Chana Dal, Cabbage Sabzi, Roti, Buttermilk',
    'Evening Snacks': 'Biscuits, Tea, Fruit',
    Dinner: 'Roti, Mix Dal, Jeera Rice, Aloo Matar',
  },
  Friday: {
    Breakfast: 'Dosa, Sambar, Chutney, Tea',
    Lunch: 'Rice, Kadhi Pakoda, Tinda Sabzi, Roti, Salad',
    'Evening Snacks': 'Pav Bhaji, Juice',
    Dinner: 'Roti, Palak Paneer, Rice, Arhar Dal',
  },
  Saturday: {
    Breakfast: 'Chole Bhature, Lassi',
    Lunch: 'Biryani (Veg), Raita, Roti, Salad',
    'Evening Snacks': 'Momos (Veg), Sauce',
    Dinner: 'Roti, Shahi Paneer, Rice, Dal Makhani',
  },
  Sunday: {
    Breakfast: 'Puri Bhaji, Halwa, Tea',
    Lunch: 'Rice, Rajma, Paneer Tikka, Roti, Sweet',
    'Evening Snacks': 'Maggi, Cold Drink',
    Dinner: 'Roti, Malai Kofta, Rice, Yellow Dal, Ice Cream',
  },
};

export const SAMPLE_NONVEG_MENU = {
  Monday: {
    Breakfast: 'Poha, Boiled Eggs (2), Tea, Banana',
    Lunch: 'Rice, Dal Tadka, Chicken Curry, Roti, Salad',
    'Evening Snacks': 'Samosa, Chai',
    Dinner: 'Roti, Butter Chicken, Rice, Dal Fry',
  },
  Tuesday: {
    Breakfast: 'Idli, Sambar, Coconut Chutney, Coffee',
    Lunch: 'Rice, Rajma, Egg Bhurji, Roti, Curd',
    'Evening Snacks': 'Bread Pakora, Tea',
    Dinner: 'Roti, Fish Curry, Rice, Raita',
  },
  Wednesday: {
    Breakfast: 'Paratha (Aloo), Omelette, Pickle, Tea',
    Lunch: 'Rice, Dal Palak, Chicken Fry, Roti, Salad',
    'Evening Snacks': 'Vada Pav, Chai',
    Dinner: 'Roti, Mutton Curry, Rice, Moong Dal',
  },
  Thursday: {
    Breakfast: 'Upma, Boiled Eggs (2), Coffee',
    Lunch: 'Rice, Chana Dal, Egg Curry, Roti, Buttermilk',
    'Evening Snacks': 'Biscuits, Tea, Fruit',
    Dinner: 'Roti, Chicken Keema, Jeera Rice, Aloo Matar',
  },
  Friday: {
    Breakfast: 'Dosa, Sambar, Chutney, Tea',
    Lunch: 'Rice, Kadhi Pakoda, Chicken Biryani, Roti, Salad',
    'Evening Snacks': 'Pav Bhaji, Juice',
    Dinner: 'Roti, Chicken Tikka Masala, Rice, Arhar Dal',
  },
  Saturday: {
    Breakfast: 'Chole Bhature, Lassi',
    Lunch: 'Chicken Biryani, Raita, Roti, Salad',
    'Evening Snacks': 'Chicken Momos, Sauce',
    Dinner: 'Roti, Kadai Chicken, Rice, Dal Makhani',
  },
  Sunday: {
    Breakfast: 'Puri Bhaji, Halwa, Omelette, Tea',
    Lunch: 'Rice, Mutton Biryani, Chicken Leg Piece, Roti, Sweet',
    'Evening Snacks': 'Maggi, Cold Drink',
    Dinner: 'Roti, Butter Chicken, Rice, Yellow Dal, Ice Cream',
  },
};

// Recipe logic with dynamic protein gap prioritization & LEAN vs BULK Goal Support
export function generateRecipes(checkedItems, customItems, proteinGap = 0, fitnessGoal = 'LEAN') {
  const allItems = [...checkedItems, ...customItems.filter(i => i.trim())];
  const has = (item) => allItems.some(i => i.toLowerCase().includes(item.toLowerCase()));
  const isLean = fitnessGoal === 'LEAN';

  const preWorkout = [];
  const postWorkout = [];
  const hostelHacks = [];

  // ================= INTERNET HOSTEL HACKS (LEAN vs BULK) =================
  if (isLean) {
    hostelHacks.push({
      name: '🔥 Mess Dal Soya Hack (Zero Cook)',
      ingredients: ['1 cup Mess Yellow/Black Dal', '30g Soya Chunks (Soaked in hot water 10 min)'],
      instructions: 'Soak raw soya chunks in hot water for 10 min in your room kettle/flask. Squeeze out water completely and stir into your mess dal bowl. Instantly adds ~16g pure protein with zero extra fat!',
      timing: 'Lunch or Dinner',
      calories: '~160 kcal',
      proteinGrams: 16,
      tag: 'LEAN CUTTING HACK',
      goal: 'LEAN',
    });

    hostelHacks.push({
      name: '🥗 Sprouted Moong & Lemon Satiety Chaat',
      ingredients: ['½ cup Sprouted Moong', 'Black salt', 'Lemon juice', 'Chopped cucumber/onion'],
      instructions: 'Buy ready-sprouted moong dal or soak overnight in room. Sprinkle lemon juice, black salt, and cucumber. Low calorie, high volume fiber stack that keeps you full for hours.',
      timing: 'Evening Snack',
      calories: '~120 kcal',
      proteinGrams: 10,
      tag: 'LEAN SATIETY HACK',
      goal: 'LEAN',
    });

    hostelHacks.push({
      name: '🥛 Cold Sattu Mint Sip (Clean Plant Protein)',
      ingredients: ['2 tbsp Roasted Chana Powder (Sattu)', '250ml Cold Water', 'Pinch of Black Salt & Lemon'],
      instructions: 'Stir 2 tbsp Sattu into cold water with lemon and black salt. Refreshing, traditional Indian student sip that fills protein gap without heavy fats.',
      timing: 'Mid-afternoon or Pre-Workout',
      calories: '~130 kcal',
      proteinGrams: 9,
      tag: 'LOW-CAL HYDRATION',
      goal: 'LEAN',
    });

    if (has('Eggs')) {
      hostelHacks.push({
        name: '🍳 Kettle Egg White Pepper Bowl',
        ingredients: ['3-4 Egg Whites (Boiled in Kettle)', 'Black Pepper & Salt'],
        instructions: 'Boil eggs in electric kettle (8-10 min). Discard yolks for a pure lean cut. Season whites with black pepper. 100% lean bioavailability.',
        timing: 'Post-Workout or Breakfast',
        calories: '~75 kcal',
        proteinGrams: 14,
        tag: 'PURE LEAN PROTEIN',
        goal: 'LEAN',
      });
    }
  } else {
    // BULK HACKS
    hostelHacks.push({
      name: '🏋️ Kettle PB-Oat Banana Mass Gainer Mash',
      ingredients: ['¾ cup Oats', '2 tbsp Peanut Butter', '1 Banana (mashed)', '2 tbsp Milk Powder', 'Hot Water'],
      instructions: 'Cook oats with boiling kettle water. Stir in 2 tbsp peanut butter, milk powder, and mashed banana. High calorie (550+ kcal) clean mass gainer bowl made in 3 minutes.',
      timing: 'Post-Workout or Breakfast',
      calories: '~560 kcal',
      proteinGrams: 22,
      tag: 'BULK MASS BUILDER',
      goal: 'BULK',
    });

    hostelHacks.push({
      name: '🥛 Sattu & Whole Milk Density Shake',
      ingredients: ['3 tbsp Sattu (Roasted Gram)', '250ml Milk or 3 tbsp Milk Powder', '1 tbsp Jaggery / Honey'],
      instructions: 'Vigorously shake sattu, milk, and jaggery in a shaker bottle. Traditional high-energy mass-gain shake packed with complex carbs, healthy fats, and protein.',
      timing: 'Mid-morning or Post-Workout',
      calories: '~380 kcal',
      proteinGrams: 18,
      tag: 'CALORIE SURPLUS',
      goal: 'BULK',
    });

    hostelHacks.push({
      name: '🥜 Double-Paneer & PB Roti Stack',
      ingredients: ['2 Mess Rotis', '2 tbsp Peanut Butter', '50g Raw Paneer (Crumble)'],
      instructions: 'Spread peanut butter over warm mess rotis and fill with crumbled raw paneer. Roll into wraps. Easy 450+ kcal surplus snack with zero cooking.',
      timing: 'Evening Snack',
      calories: '~480 kcal',
      proteinGrams: 20,
      tag: 'DENSE SURPLUS STACK',
      goal: 'BULK',
    });

    hostelHacks.push({
      name: '🥣 Curd + Jaggery + Roasted Chana Bowl',
      ingredients: ['1 cup Mess Curd (Dahi)', '1 cup Roasted Chana (Bhuna Chana)', '1 tbsp Jaggery'],
      instructions: 'Mix roasted chana into curd with jaggery. Probiotic-rich digestive mass builder that provides steady sustained energy and high protein.',
      timing: 'Post-Lunch or Post-Workout',
      calories: '~340 kcal',
      proteinGrams: 18,
      tag: 'DIGESTIVE MASS BOOST',
      goal: 'BULK',
    });
  }

  // ================= PRE-WORKOUT RECIPES =================
  if (has('Bananas') && has('Peanut Butter') && has('Honey')) {
    preWorkout.push({
      name: '⚡ Quick Energy Pre-Workout Spread',
      ingredients: ['1 Banana', '2 tbsp Peanut Butter', '1 tsp Honey'],
      instructions: 'Slice banana, spread peanut butter on each slice, drizzle with honey. Quick, delicious energy in 2 minutes.',
      timing: '30-45 min before workout',
      calories: '~320 kcal',
      proteinGrams: 8,
      tag: isLean ? 'Moderate Energy' : 'High Calorie Fuel',
      goal: 'BOTH',
    });
  }

  if (has('Bananas') && has('Oats')) {
    preWorkout.push({
      name: '🥣 Banana Oat Power Bowl',
      ingredients: ['1 Banana (mashed)', '½ cup Oats', 'Hot water/milk', has('Honey') ? '1 tsp Honey' : null].filter(Boolean),
      instructions: 'Mix oats with hot water or milk. Let sit for 3 min. Mash in banana and mix well. Add honey if available.',
      timing: '45-60 min before workout',
      calories: '~280 kcal',
      proteinGrams: 7,
      tag: 'Sustained Energy',
      goal: 'BOTH',
    });
  }

  if (has('Bananas') && has('Almonds')) {
    preWorkout.push({
      name: '🥜 Banana Almond Fuel Pack',
      ingredients: ['1 Banana', '10-12 Almonds'],
      instructions: 'Eat banana with a handful of almonds. The combo of fast carbs + healthy fats provides steady energy.',
      timing: '30 min before workout',
      calories: '~250 kcal',
      proteinGrams: 6,
      tag: 'Quick Fuel',
      goal: 'BOTH',
    });
  }

  if (has('Oats') && has('Peanut Butter')) {
    preWorkout.push({
      name: '💪 PB Oat Energy Bites (No Cook)',
      ingredients: ['½ cup Oats', '2 tbsp Peanut Butter', has('Honey') ? '1 tbsp Honey' : '1 tsp sugar'].filter(Boolean),
      instructions: 'Mix all ingredients in a bowl. Roll into small balls. Refrigerate for 10 min if possible. Grab and go!',
      timing: '30-45 min before workout',
      calories: '~300 kcal',
      proteinGrams: 10,
      tag: isLean ? 'Portion Control' : 'Dense Snack',
      goal: 'BOTH',
    });
  }

  if (has('Bananas')) {
    preWorkout.push({
      name: '🍌 Simple Banana Boost',
      ingredients: ['1-2 Bananas'],
      instructions: 'The classic pre-workout. Fast-digesting carbs for immediate energy. Eat 1-2 bananas.',
      timing: '15-30 min before workout',
      calories: '~105 kcal per banana',
      proteinGrams: 1,
      tag: 'Classic Lean Carbs',
      goal: 'LEAN',
    });
  }

  // ================= POST-WORKOUT RECIPES =================
  if (has('Whey Protein') && has('Milk Powder') && has('Oats')) {
    postWorkout.push({
      name: '🥤 High Protein Recovery Shake',
      ingredients: ['1 scoop Whey Protein', '2 tbsp Milk Powder', '3 tbsp Oats', '300ml water', has('Bananas') ? '½ Banana' : null, has('Honey') ? '1 tsp Honey' : null].filter(Boolean),
      instructions: 'Mix milk powder in water first. Add whey protein and shake/stir vigorously. Add crushed oats for thickness. Best consumed immediately.',
      timing: 'Within 30 min after workout',
      calories: '~400 kcal',
      proteinGrams: 35,
      tag: isLean ? 'High Protein Cut' : 'Mass Recovery',
      goal: 'BOTH',
    });
  }

  if (has('Whey Protein') && has('Bananas')) {
    postWorkout.push({
      name: '🍌 Banana Protein Shake',
      ingredients: ['1 scoop Whey Protein', '1 Banana (mashed)', '250ml water'],
      instructions: 'Mash banana thoroughly. Mix whey in water. Combine and stir well. Thick, creamy, and protein-packed.',
      timing: 'Within 30 min after workout',
      calories: '~280 kcal',
      proteinGrams: 28,
      tag: 'Quick Protein',
      goal: 'BOTH',
    });
  }

  if (has('Eggs') && has('Oats')) {
    postWorkout.push({
      name: '🍳 Egg & Oat Recovery Bowl',
      ingredients: [isLean ? '3 Boiled Egg Whites' : '2-3 Whole Boiled Eggs', '½ cup Oats (cooked)', 'Salt & Pepper'],
      instructions: 'Cook oats with water (microwave 2 min). Chop boiled eggs and mix in. Season with salt and pepper. High protein recovery meal.',
      timing: 'Within 45 min after workout',
      calories: isLean ? '~240 kcal' : '~350 kcal',
      proteinGrams: 25,
      tag: isLean ? 'Lean Muscle Fuel' : 'Mass Builder',
      goal: 'BOTH',
    });
  }

  if (has('Eggs') && has('Milk Powder')) {
    postWorkout.push({
      name: '🥛 Egg Protein Milk',
      ingredients: ['2 Boiled Egg Whites', '2 tbsp Milk Powder', '250ml water', has('Honey') ? '1 tsp Honey' : null].filter(Boolean),
      instructions: 'Mix milk powder in warm water. Chop or blend egg whites into the milk. Add honey for taste. High protein recovery drink.',
      timing: 'Within 30 min after workout',
      calories: '~200 kcal',
      proteinGrams: 20,
      tag: 'Lean Protein',
      goal: 'LEAN',
    });
  }

  if (has('Whey Protein')) {
    postWorkout.push({
      name: '💧 Classic Whey Shake',
      ingredients: ['1 scoop Whey Protein', '300ml cold water'],
      instructions: 'Mix whey protein in cold water. Shake vigorously for 30 seconds. Simple, effective, and fast-absorbing.',
      timing: 'Immediately after workout',
      calories: '~120 kcal',
      proteinGrams: 24,
      tag: 'Pure Protein Cut',
      goal: 'LEAN',
    });
  }

  if (has('Oats') && has('Milk Powder') && has('Almonds')) {
    postWorkout.push({
      name: '🥣 Overnight Oats Recovery',
      ingredients: ['½ cup Oats', '2 tbsp Milk Powder', '5-6 Almonds (crushed)', 'Water', has('Honey') ? '1 tsp Honey' : null].filter(Boolean),
      instructions: 'Mix oats, milk powder, and water the night before. Add crushed almonds on top. Grab it right after your workout for an easy meal.',
      timing: 'Prep night before, eat post-workout',
      calories: '~350 kcal',
      proteinGrams: 15,
      tag: 'Meal Prep Fuel',
      goal: 'BOTH',
    });
  }

  if (has('Peanut Butter') && (has('Bananas') || has('Milk Powder'))) {
    postWorkout.push({
      name: '🥤 Peanut Butter Protein Smoothie',
      ingredients: ['2 tbsp Peanut Butter', has('Bananas') ? '1 Banana' : null, has('Milk Powder') ? '2 tbsp Milk Powder' : null, '250ml water/milk', has('Honey') ? '1 tsp Honey' : null].filter(Boolean),
      instructions: 'Blend or vigorously shake peanut butter with water/milk and mashed banana until smooth. Rich, calorie-dense hostel shake.',
      timing: 'Within 30-45 min after workout',
      calories: '~360 kcal',
      proteinGrams: 16,
      tag: 'Calorie Surplus Shake',
      goal: 'BULK',
    });
  }

  if (has('Peanut Butter') && has('Oats') && has('Honey')) {
    postWorkout.push({
      name: '🍯 PB Honey Oat Recovery Bar',
      ingredients: ['½ cup Oats', '2 tbsp Peanut Butter', '1 tbsp Honey'],
      instructions: 'Mix all ingredients into a thick paste. Press into a flat shape. Refrigerate 15 min. Cut into bars. Portable post-workout fuel!',
      timing: 'Within 1 hour after workout',
      calories: '~380 kcal',
      proteinGrams: 12,
      tag: 'Portable Mass Fuel',
      goal: 'BULK',
    });
  }

  // Fallback if nothing checked
  if (preWorkout.length === 0) {
    preWorkout.push({
      name: '📋 No Items Selected',
      ingredients: [],
      instructions: 'Check some room inventory items in your setup to get personalized pre-workout recipe recommendations!',
      timing: 'Update your inventory in settings',
      calories: 'N/A',
      proteinGrams: 0,
      tag: 'Setup Required',
      goal: 'BOTH',
    });
  }

  if (postWorkout.length === 0) {
    postWorkout.push({
      name: '📋 No Items Selected',
      ingredients: [],
      instructions: 'Check some room inventory items (especially Whey Protein, Eggs, Oats, Milk Powder) to get post-workout recipe recommendations!',
      timing: 'Update your inventory in settings',
      calories: 'N/A',
      proteinGrams: 0,
      tag: 'Setup Required',
      goal: 'BOTH',
    });
  }

  // Protein gap prioritization
  if (proteinGap > 0) {
    postWorkout.sort((a, b) => (b.proteinGrams || 0) - (a.proteinGrams || 0));
    postWorkout.forEach(r => {
      if (r.proteinGrams > 0) {
        const covered = Math.min(r.proteinGrams, proteinGap);
        r.gapFillBadge = `Fills ~${covered}g of your ${proteinGap}g protein gap!`;
      }
    });
  }

  return { preWorkout, postWorkout, hostelHacks };
}

