import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.WWW_SUPABASE_URL;
const supabaseKey = process.env.WWW_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Supabase Key is undefined.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
