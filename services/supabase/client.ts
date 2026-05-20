/**
 * Supabase client — Phase 5 placeholder.
 * SUPABASE_ENABLED = false keeps the app fully offline.
 *
 * To activate:
 *   1. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
 *   2. Run: npx expo install @supabase/supabase-js
 *   3. Set SUPABASE_ENABLED = true
 *   4. Uncomment the createClient block below
 */

// import { createClient } from '@supabase/supabase-js';
// import type { Database } from '@/types/database';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const SUPABASE_ENABLED = false as const;

export const supabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  isConfigured: SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '',
} as const;

// Phase 5: replace null with real client
// export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
//   auth: {
//     persistSession: false,  // managed manually via expo-secure-store
//     autoRefreshToken: false,
//   },
// });

export type PlaceholderClient = null;
export const supabase: PlaceholderClient = null;
