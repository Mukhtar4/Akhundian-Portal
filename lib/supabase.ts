
import { createClient } from '@supabase/supabase-js';

// --- INSTRUCTIONS ---
// 1. Go to your Supabase Dashboard -> Settings -> API
// 2. Copy "Project URL" and paste it inside the quotes below.
// 3. Copy "anon" / "public" key and paste it inside the quotes below.

const SUPABASE_URL = 'https://akztuxwqapqpfnvoqnuk.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrenR1eHdxYXBxcGZudm9xbnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTY0NzIsImV4cCI6MjA3OTYzMjQ3Mn0.rpJb2WjYR47No-xeKb9bmD21686JvsCEo2GFnvzPmlM';

// This flag checks if you have actually entered the keys.
// If keys are missing, the app falls back to LocalStorage (Offline Mode).
export const isCloudEnabled = SUPABASE_URL.includes('https') && SUPABASE_ANON_KEY.length > 20;

export const supabase = isCloudEnabled 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;
