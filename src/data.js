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

// Recipe logic
export function generateRecipes(checkedItems, customItems) {
  const allItems = [...checkedItems, ...customItems.filter(i => i.trim())];
  const has = (item) => allItems.some(i => i.toLowerCase().includes(item.toLowerCase()));

  const preWorkout = [];
  const postWorkout = [];

  // Pre-workout recipes
  if (has('Bananas') && has('Peanut Butter') && has('Honey')) {
    preWorkout.push({
      name: '⚡ Quick Energy Pre-Workout Spread',
      ingredients: ['1 Banana', '2 tbsp Peanut Butter', '1 tsp Honey'],
      instructions: 'Slice banana, spread peanut butter on each slice, drizzle with honey. Quick, delicious energy in 2 minutes.',
      timing: '30-45 min before workout',
      calories: '~320 kcal',
      tag: 'Energy Boost',
    });
  }

  if (has('Bananas') && has('Oats')) {
    preWorkout.push({
      name: '🥣 Banana Oat Power Bowl',
      ingredients: ['1 Banana (mashed)', '½ cup Oats', 'Hot water/milk', has('Honey') ? '1 tsp Honey' : null].filter(Boolean),
      instructions: 'Mix oats with hot water or milk. Let sit for 3 min. Mash in banana and mix well. Add honey if available.',
      timing: '45-60 min before workout',
      calories: '~280 kcal',
      tag: 'Sustained Energy',
    });
  }

  if (has('Bananas') && has('Almonds')) {
    preWorkout.push({
      name: '🥜 Banana Almond Fuel Pack',
      ingredients: ['1 Banana', '10-12 Almonds'],
      instructions: 'Eat banana with a handful of almonds. The combo of fast carbs + healthy fats provides steady energy.',
      timing: '30 min before workout',
      calories: '~250 kcal',
      tag: 'Quick Fuel',
    });
  }

  if (has('Oats') && has('Peanut Butter')) {
    preWorkout.push({
      name: '💪 PB Oat Energy Bites (No Cook)',
      ingredients: ['½ cup Oats', '2 tbsp Peanut Butter', has('Honey') ? '1 tbsp Honey' : '1 tsp sugar'].filter(Boolean),
      instructions: 'Mix all ingredients in a bowl. Roll into small balls. Refrigerate for 10 min if possible. Grab and go!',
      timing: '30-45 min before workout',
      calories: '~300 kcal',
      tag: 'Grab & Go',
    });
  }

  if (has('Bananas')) {
    preWorkout.push({
      name: '🍌 Simple Banana Boost',
      ingredients: ['1-2 Bananas'],
      instructions: 'The classic pre-workout. Fast-digesting carbs for immediate energy. Eat 1-2 bananas.',
      timing: '15-30 min before workout',
      calories: '~105 kcal per banana',
      tag: 'Classic',
    });
  }

  // Post-workout recipes
  if (has('Whey Protein') && has('Milk Powder') && has('Oats')) {
    postWorkout.push({
      name: '🥤 High Protein Recovery Shake',
      ingredients: ['1 scoop Whey Protein', '2 tbsp Milk Powder', '3 tbsp Oats', '300ml water', has('Bananas') ? '½ Banana' : null, has('Honey') ? '1 tsp Honey' : null].filter(Boolean),
      instructions: 'Mix milk powder in water first. Add whey protein and shake/stir vigorously. Add crushed oats for thickness. Best consumed immediately.',
      timing: 'Within 30 min after workout',
      calories: '~400 kcal | ~35g protein',
      tag: 'Maximum Recovery',
    });
  }

  if (has('Whey Protein') && has('Bananas')) {
    postWorkout.push({
      name: '🍌 Banana Protein Shake',
      ingredients: ['1 scoop Whey Protein', '1 Banana (mashed)', '250ml water'],
      instructions: 'Mash banana thoroughly. Mix whey in water. Combine and stir well. Thick, creamy, and protein-packed.',
      timing: 'Within 30 min after workout',
      calories: '~280 kcal | ~28g protein',
      tag: 'Quick Protein',
    });
  }

  if (has('Eggs') && has('Oats')) {
    postWorkout.push({
      name: '🍳 Egg & Oat Recovery Bowl',
      ingredients: ['2-3 Boiled Eggs', '½ cup Oats (cooked)', 'Salt & Pepper'],
      instructions: 'Cook oats with water (microwave 2 min). Chop boiled eggs and mix in. Season with salt and pepper. High protein, high carb recovery meal.',
      timing: 'Within 45 min after workout',
      calories: '~350 kcal | ~25g protein',
      tag: 'Muscle Builder',
    });
  }

  if (has('Eggs') && has('Milk Powder')) {
    postWorkout.push({
      name: '🥛 Egg Protein Milk',
      ingredients: ['2 Boiled Egg Whites', '2 tbsp Milk Powder', '250ml water', has('Honey') ? '1 tsp Honey' : null].filter(Boolean),
      instructions: 'Mix milk powder in warm water. Chop or blend egg whites into the milk. Add honey for taste. High protein recovery drink.',
      timing: 'Within 30 min after workout',
      calories: '~200 kcal | ~20g protein',
      tag: 'Lean Protein',
    });
  }

  if (has('Whey Protein')) {
    postWorkout.push({
      name: '💧 Classic Whey Shake',
      ingredients: ['1 scoop Whey Protein', '300ml cold water'],
      instructions: 'Mix whey protein in cold water. Shake vigorously for 30 seconds. Simple, effective, and fast-absorbing.',
      timing: 'Immediately after workout',
      calories: '~120 kcal | ~24g protein',
      tag: 'Essential',
    });
  }

  if (has('Oats') && has('Milk Powder') && has('Almonds')) {
    postWorkout.push({
      name: '🥣 Overnight Oats Recovery',
      ingredients: ['½ cup Oats', '2 tbsp Milk Powder', '5-6 Almonds (crushed)', 'Water', has('Honey') ? '1 tsp Honey' : null].filter(Boolean),
      instructions: 'Mix oats, milk powder, and water the night before. Add crushed almonds on top. Grab it right after your workout for an easy meal.',
      timing: 'Prep night before, eat post-workout',
      calories: '~350 kcal | ~15g protein',
      tag: 'Meal Prep',
    });
  }

  if (has('Peanut Butter') && has('Oats') && has('Honey')) {
    postWorkout.push({
      name: '🍯 PB Honey Oat Recovery Bar',
      ingredients: ['½ cup Oats', '2 tbsp Peanut Butter', '1 tbsp Honey'],
      instructions: 'Mix all ingredients into a thick paste. Press into a flat shape. Refrigerate 15 min. Cut into bars. Portable post-workout fuel!',
      timing: 'Within 1 hour after workout',
      calories: '~380 kcal | ~12g protein',
      tag: 'Portable Fuel',
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
      tag: 'Setup Required',
    });
  }

  if (postWorkout.length === 0) {
    postWorkout.push({
      name: '📋 No Items Selected',
      ingredients: [],
      instructions: 'Check some room inventory items (especially Whey Protein, Eggs, Oats, Milk Powder) to get post-workout recipe recommendations!',
      timing: 'Update your inventory in settings',
      calories: 'N/A',
      tag: 'Setup Required',
    });
  }

  return { preWorkout, postWorkout };
}
