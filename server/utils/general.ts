import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials required');
}

client = createClient(supabaseUrl, supabaseKey);

export const supabase = client as ReturnType<typeof createClient>;
