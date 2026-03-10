import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials required ');
} else {
  client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      storageKey: 'PROJECT_NAME-auth',
      storage: window.localStorage,
    },
  });
}

export const supabase = client as ReturnType<typeof createClient>;
