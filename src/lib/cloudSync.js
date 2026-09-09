import { supabase, isSupabaseConfigured } from './supabaseClient.js';

export const LS_KEY = 'gymforge_data';

/**
 * Check if legacy localStorage data exists that can be migrated
 */
export function hasLegacyLocalData() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.split || parsed?.workouts || parsed?.messMenu || parsed?.roomItems?.length);
  } catch {
    return false;
  }
}

/**
 * Fetch all user cloud data from Supabase
 */
export async function fetchUserData(userId) {
  if (!isSupabaseConfigured() || !userId) {
    return null;
  }

  try {
    const [profileRes, splitsRes, logsRes, mealsRes, inventoryRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('workout_splits').select('*').eq('user_id', userId),
      supabase.from('workout_logs').select('*').eq('user_id', userId),
      supabase.from('mess_menu_logs').select('*').eq('user_id', userId),
      supabase.from('room_inventory').select('*').eq('user_id', userId),
    ]);

    const result = {
      profile: profileRes.data || null,
      splits: splitsRes.data || [],
      workoutLogs: logsRes.data || [],
      meals: mealsRes.data || [],
      inventory: inventoryRes.data || [],
    };

    return result;
  } catch (err) {
    console.error('[CloudSync] Error fetching user cloud data:', err);
    return null;
  }
}

/**
 * Push full local app state to Supabase cloud tables
 */
export async function pushUserData(userId, state) {
  if (!isSupabaseConfigured() || !userId || !state) {
    return { success: false, reason: 'offline_or_mock' };
  }

  try {
    // 1. Sync Profile
    await supabase.from('profiles').upsert({
      id: userId,
      fitness_goal: state.fitnessGoal || 'LEAN',
      diet_pref: state.dietPref || 'VEG',
      target_protein: state.targetProtein || 140,
      updated_at: new Date().toISOString(),
    });

    // 2. Sync Workout Splits
    if (state.split) {
      const splitRows = Object.entries(state.split).map(([day, muscles]) => ({
        user_id: userId,
        day_of_week: day,
        target_muscles: muscles,
        is_rest_day: muscles.every(m => m === 'NIL'),
        updated_at: new Date().toISOString(),
      }));

      await supabase.from('workout_splits').upsert(splitRows, {
        onConflict: 'user_id,day_of_week',
      });
    }

    // 3. Sync Mess Menu Logs
    if (state.messMenu) {
      const mealRows = [];
      Object.entries(state.messMenu).forEach(([day, mealsObj]) => {
        Object.entries(mealsObj || {}).forEach(([mealType, foodItems]) => {
          if (foodItems) {
            mealRows.push({
              user_id: userId,
              day_of_week: day,
              meal_type: mealType,
              food_items: String(foodItems),
              updated_at: new Date().toISOString(),
            });
          }
        });
      });

      if (mealRows.length > 0) {
        await supabase.from('mess_menu_logs').upsert(mealRows, {
          onConflict: 'user_id,day_of_week,meal_type',
        });
      }
    }

    // 4. Sync Room Inventory
    if (state.roomItems && Array.isArray(state.roomItems)) {
      const inventoryRows = state.roomItems.map(item => ({
        user_id: userId,
        item_name: item,
        quantity: 1,
        category: 'Supplements',
        is_in_stock: true,
        updated_at: new Date().toISOString(),
      }));

      if (inventoryRows.length > 0) {
        await supabase.from('room_inventory').upsert(inventoryRows, {
          onConflict: 'user_id,item_name',
        });
      }
    }

    return { success: true };
  } catch (err) {
    console.error('[CloudSync] Error pushing data to Supabase:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Seamlessly migrate legacy local storage data into Supabase
 */
export async function migrateLegacyDataToSupabase(userId) {
  if (!hasLegacyLocalData()) {
    return { success: false, message: 'No local data found to migrate.' };
  }

  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = JSON.parse(raw);
    const result = await pushUserData(userId, parsed);
    if (result.success) {
      localStorage.setItem('gymforge_migrated_to_cloud', 'true');
    }
    return result;
  } catch (err) {
    console.error('[CloudSync] Migration failed:', err);
    return { success: false, error: err.message };
  }
}
