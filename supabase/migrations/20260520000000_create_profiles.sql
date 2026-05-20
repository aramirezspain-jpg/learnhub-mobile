-- =============================================================================
-- LearnHub — Profiles table + auto-create trigger
-- Run this in Supabase Dashboard → SQL Editor, or via Supabase CLI:
--   supabase db push
--
-- BEFORE RUNNING: Disable email confirmation in Supabase Dashboard →
--   Authentication → Providers → Email → toggle "Confirm email" OFF
-- =============================================================================

-- ─── Table ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT        NOT NULL DEFAULT '',
  display_name  TEXT        NOT NULL DEFAULT '',
  rol           TEXT        NOT NULL DEFAULT 'member' CHECK (rol IN ('member', 'leader', 'admin')),
  iglesia       TEXT,
  ministerio    TEXT,
  ciudad        TEXT,
  pais          TEXT,
  bio           TEXT,
  photo_url     TEXT,
  church_id     TEXT,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "profile_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profile_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (belt-and-suspenders alongside trigger)
CREATE POLICY "profile_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── Auto-create profile on signup (trigger) ──────────────────────────────────
-- Fires server-side when auth.users row is inserted — no network call needed.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, display_name, rol,
    iglesia, ministerio,
    fecha_registro, created_at, updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    'member',
    NEW.raw_user_meta_data->>'iglesia',
    NEW.raw_user_meta_data->>'ministerio',
    NOW(), NOW(), NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop and recreate to avoid duplicate trigger errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── Auto-update updated_at ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
