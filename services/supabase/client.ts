/**
 * Supabase client — Phase 5 ACTIVE.
 * SUPABASE_ENABLED = true → factory returns Supabase repositories.
 *
 * Session persistence: AsyncStorage (auto-refresh, survives app restart).
 * Offline: session reads from AsyncStorage (no network). Profile fetch gracefully
 * falls back to user_metadata when offline.
 *
 * Deactivate: set SUPABASE_ENABLED = false to fall back to local SQLite auth.
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const SUPABASE_ENABLED = true as const;

export const supabaseConfig = {
  url:          SUPABASE_URL,
  anonKey:      SUPABASE_ANON_KEY,
  isConfigured: SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '',
} as const;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:          AsyncStorage,
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
  },
});
