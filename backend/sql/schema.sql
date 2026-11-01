-- ==============================================================================
-- SYDD — Production Relational Database Schema (PostgreSQL / Supabase)
-- 
-- Designed for 10+ years of personal fitness, workout sets, nutrition,
-- hydration, habit consistency, and delta synchronization.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS (Compatible with Supabase Auth auth.users or standalone UUIDs)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. USER SETTINGS & GOALS
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    goals JSONB NOT NULL DEFAULT '{
        "stepsPerDay": 8000,
        "caloriesConsumedKcalPerDay": 2000,
        "proteinGPerDay": 130,
        "carbsGPerDay": 225,
        "fatGPerDay": 65,
        "waterMlPerDay": 2000,
        "workoutMinutesPerDay": 30,
        "workoutGoalEnabled": true
    }'::jsonb,
    unit_water TEXT NOT NULL DEFAULT 'ml' CHECK (unit_water IN ('ml', 'l')),
    unit_weight TEXT NOT NULL DEFAULT 'kg' CHECK (unit_weight IN ('kg', 'lbs')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    schema_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. DAILY RECORDS (Rollup summaries per date)
CREATE TABLE IF NOT EXISTS daily_records (
    id TEXT PRIMARY KEY, -- dr_{YYYY-MM-DD} or UUID
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    steps INT CHECK (steps >= 0),
    calories_consumed_kcal INT CHECK (calories_consumed_kcal >= 0),
    water_ml INT CHECK (water_ml >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_daily_records_user_date UNIQUE (user_id, date)
);

-- 5. WORKOUTS (Discrete training sessions)
CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT NOT NULL DEFAULT 'other',
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. WORKOUT EXERCISES (Exercises performed within a workout)
CREATE TABLE IF NOT EXISTS workout_exercises (
    id TEXT PRIMARY KEY,
    workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id TEXT, -- Slug matching exercise catalog (e.g. barbell-bench-press)
    name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. WORKOUT SETS (Granular sets, reps, load, and completion)
CREATE TABLE IF NOT EXISTS workout_sets (
    id TEXT PRIMARY KEY,
    exercise_id TEXT NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number INT NOT NULL CHECK (set_number > 0),
    reps INT NOT NULL DEFAULT 0 CHECK (reps >= 0),
    weight NUMERIC(6, 2) CHECK (weight >= 0),
    weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
    completed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. NUTRITION ENTRIES (Granular meals, foods, and macros)
CREATE TABLE IF NOT EXISTS nutrition_entries (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Meal',
    calories INT NOT NULL CHECK (calories >= 0),
    protein_g NUMERIC(5, 1) CHECK (protein_g >= 0),
    carbs_g NUMERIC(5, 1) CHECK (carbs_g >= 0),
    fat_g NUMERIC(5, 1) CHECK (fat_g >= 0),
    time TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. HABITS (Habit definitions)
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    archived_at TIMESTAMPTZ
);

-- 10. HABIT COMPLETIONS (Daily habit check-ins)
CREATE TABLE IF NOT EXISTS habit_completions (
    id TEXT PRIMARY KEY, -- {habit_id}_{date}
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_habit_completions_user_habit_date UNIQUE (user_id, habit_id, date)
);

-- 11. WORKOUT ROUTINES (Curated and user-saved workout templates)
CREATE TABLE IF NOT EXISTS workout_routines (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'strength',
    duration_minutes INT CHECK (duration_minutes > 0),
    notes TEXT,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. SYNC AUDIT LOG
CREATE TABLE IF NOT EXISTS sync_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_timestamp TIMESTAMPTZ NOT NULL,
    server_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    records_upserted INT NOT NULL DEFAULT 0,
    sync_mode TEXT NOT NULL DEFAULT 'delta', -- 'delta' or 'full'
    user_agent TEXT,
    ip_address TEXT
);

-- ==============================================================================
-- INDEXES (Optimized for multi-year time series queries and date ranges)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_daily_records_user_date ON daily_records (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises (workout_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON workout_sets (exercise_id, set_number);
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_user_date ON nutrition_entries (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_habit_completions_user_date ON habit_completions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_updated_at ON workouts (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_records_updated_at ON daily_records (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_updated_at ON nutrition_entries (user_id, updated_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) FOR SUPABASE / CLOUD HOSTING
-- ==============================================================================
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;

-- Default policies (allows users to access only their own rows via auth.uid())
-- These activate automatically when connected to Supabase Auth.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
        CREATE POLICY "Users can manage their own settings" ON user_settings
            FOR ALL USING (auth.uid() = user_id);
        CREATE POLICY "Users can manage their own daily records" ON daily_records
            FOR ALL USING (auth.uid() = user_id);
        CREATE POLICY "Users can manage their own workouts" ON workouts
            FOR ALL USING (auth.uid() = user_id);
        CREATE POLICY "Users can manage their own exercises" ON workout_exercises
            FOR ALL USING (workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid()));
        CREATE POLICY "Users can manage their own sets" ON workout_sets
            FOR ALL USING (exercise_id IN (
                SELECT we.id FROM workout_exercises we
                JOIN workouts w ON we.workout_id = w.id
                WHERE w.user_id = auth.uid()
            ));
        CREATE POLICY "Users can manage their own nutrition" ON nutrition_entries
            FOR ALL USING (auth.uid() = user_id);
        CREATE POLICY "Users can manage their own habits" ON habits
            FOR ALL USING (auth.uid() = user_id);
        CREATE POLICY "Users can manage their own habit completions" ON habit_completions
            FOR ALL USING (auth.uid() = user_id);
        CREATE POLICY "Users can manage their own routines" ON workout_routines
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
