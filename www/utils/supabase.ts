import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log({ env: process.env, supabaseUrl, supabaseKey });
  throw new Error("Supabase URL or Supabase Key is undefined.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
