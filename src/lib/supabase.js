import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are provided
export const isMock = !supabaseUrl || !supabaseAnonKey;

export const supabase = isMock
    ? { isMock: true }
    : createClient(supabaseUrl, supabaseAnonKey);
