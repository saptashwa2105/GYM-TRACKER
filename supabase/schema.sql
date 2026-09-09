-- ==============================================================================
-- GYMFORGE DATABASE SCHEMA (SUPABASE POSTGRESQL + ROW-LEVEL SECURITY)
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Navigate to the "SQL Editor" tab on the left sidebar.
-- 3. Paste and run this entire script to create tables, indexes, triggers, and RLS policies.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Stores user profile preferences (fitness goal, dietary preference)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  fitness_goal TEXT DEFAULT 'LEAN' CHECK (fitness_goal IN ('LEAN', 'BULK')),
  diet_pref TEXT DEFAULT 'VEG' CHECK (diet_pref IN ('VEG', 'NON-VEG')),
  target_protein INTEGER DEFAULT 140,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKOUT SPLITS TABLE
-- Stores the 7-day routine split configuration per user
CREATE TABLE IF NOT EXISTS public.workout_splits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  target_muscles JSONB NOT NULL DEFAULT '["Chest", "Triceps", "NIL", "NIL"]'::jsonb,
  is_rest_day BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_day UNIQUE (user_id, day_of_week)
);

-- 3. WORKOUT LOGS TABLE
-- Stores individual exercise logs, sets, reps, weight, and completion state
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  day_of_week TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '12',
  weight_kg NUMERIC(6, 2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MESS MENU LOGS TABLE
-- Stores the meal records for Breakfast, Lunch, Evening Snacks, and Dinner
CREATE TABLE IF NOT EXISTS public.mess_menu_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  date DATE DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Evening Snacks', 'Dinner')),
  food_items TEXT NOT NULL DEFAULT '',
  calories INTEGER DEFAULT 0,
  protein NUMERIC(5, 1) DEFAULT 0,
  carbs NUMERIC(5, 1) DEFAULT 0,
  fats NUMERIC(5, 1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_day_meal UNIQUE (user_id, day_of_week, meal_type)
);

-- 5. ROOM INVENTORY TABLE
-- Stores student room supplies (protein powder, oats, peanut butter, eggs, etc.)
CREATE TABLE IF NOT EXISTS public.room_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT DEFAULT 'units',
  category TEXT DEFAULT 'Supplements',
  is_in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_item UNIQUE (user_id, item_name)
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workout_splits_user ON public.workout_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_mess_menu_logs_user_day ON public.mess_menu_logs(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_room_inventory_user ON public.room_inventory(user_id);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Ensures users can ONLY view, insert, update, or delete their own data
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_menu_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_inventory ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Workout Splits Policies
CREATE POLICY "Users can view their own workout splits"
  ON public.workout_splits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout splits"
  ON public.workout_splits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout splits"
  ON public.workout_splits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout splits"
  ON public.workout_splits FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Workout Logs Policies
CREATE POLICY "Users can view their own workout logs"
  ON public.workout_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout logs"
  ON public.workout_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout logs"
  ON public.workout_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout logs"
  ON public.workout_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Mess Menu Logs Policies
CREATE POLICY "Users can view their own mess menu logs"
  ON public.mess_menu_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mess menu logs"
  ON public.mess_menu_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mess menu logs"
  ON public.mess_menu_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mess menu logs"
  ON public.mess_menu_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Room Inventory Policies
CREATE POLICY "Users can view their own room inventory"
  ON public.room_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own room inventory"
  ON public.room_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own room inventory"
  ON public.room_inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own room inventory"
  ON public.room_inventory FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- Creates a profile row automatically whenever a new auth user signs up
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, fitness_goal, diet_pref, target_protein)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'LEAN',
    'VEG',
    140
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
