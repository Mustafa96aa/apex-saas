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

// ─── Server-side Supabase بصلاحيات كاملة (API routes فقط) ───
export const createServerClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

// ─── Server-side Supabase باسم المستخدم (auth.uid() يعمل داخل الدوال) ───
export const createUserClient = (token) =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

// ─── Helper: Get user from request token ───
export async function getUserFromToken(token) {
  if (!token) return null;
  const sb = createServerClient();
  const { data: { user }, error } = await sb.auth.getUser(token);
  return error ? null : user;
}

// ─── Helper: هل الحساب مسموح له باستخدام التطبيق الآن؟ (اشتراكه أو اشتراك مديره) ───
export async function hasActiveAccess(userId) {
  const sb = createServerClient();
  const { data } = await sb.rpc('has_active_access', { p_user: userId });
  return !!data;
}
