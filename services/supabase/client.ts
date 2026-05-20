/**
 * Supabase client — initialized but NOT yet wired to auth flows.
 *
 * SUPABASE_ENABLED = false  →  app stays fully offline (local SQLite auth).
 * SUPABASE_ENABLED = true   →  Phase 5: factory switches to Supabase repositories.
 *
 * To activate Phase 5:
 *   1. Set SUPABASE_ENABLED = true below
 *   2. Implement SupabaseAuthRepository / SupabaseUserRepository methods
 *   3. That's it — factories in services/repositories/index.ts do the rest
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const SUPABASE_ENABLED = false as const;

export const supabaseConfig = {
  url:          SUPABASE_URL,
  anonKey:      SUPABASE_ANON_KEY,
  isConfigured: SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '',
} as const;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:   false,  // handled manually via expo-secure-store in Phase 5
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
