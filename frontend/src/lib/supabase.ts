import { createClient } from "@supabase/supabase-js";

// Uses external URLs and the heavily tracked ANON key mapped from Next.js server vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Aether System Warning: Supabase Keys are undefined securely. Database insertions will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
