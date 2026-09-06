import { createClient } from '@supabase/supabase-js';

// ─── Client-side Supabase (يعمل في المتصفح) ───
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// ─── Server-side Supabase (يعمل في API routes فقط) ───
export const createServerClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

// ─── Helper: Get user from request token ───
export async function getUserFromToken(token) {
  if (!token) return null;
  const sb = createServerClient();
  const { data: { user }, error } = await sb.auth.getUser(token);
  return error ? null : user;
}
