/**
 * /api/profile
 * GET   → الملف الشخصي + الاشتراك + حالة الوصول + ملخص الفريق
 * PATCH → تعديل الإعدادات
 */

import { getUserFromToken, createServerClient, hasActiveAccess } from '../../lib/supabase';
import { getTeamOverview } from '../../lib/team';

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const sb = createServerClient();

  try {
    if (req.method === 'GET') {
      const { data: profile, error } = await sb
        .from('profiles').select('*').eq('id', user.id).single();
      if (error || !profile) return res.status(404).json({ error: 'الملف الشخصي غير موجود' });

      // أول مرة: دور الذكاء الاصطناعي الافتراضي حسب نوع الحساب
      if (!profile.role) {
        const role = profile.account_type === 'owner' ? 'business' : profile.account_type;
        await sb.from('profiles').update({ role }).eq('id', user.id);
        profile.role = role;
      }

      const [{ data: subscription }, access, team] = await Promise.all([
        sb.from('subscriptions')
          .select('status,trial_ends_at,current_period_end,extra_members')
          .eq('user_id', user.id).maybeSingle(),
        hasActiveAccess(user.id),
        getTeamOverview(sb, profile, false),
      ]);

      return res.json({ ...profile, subscription: subscription || null, access, team });
    }

    if (req.method === 'PATCH') {
      const allowed = ['name', 'role', 'focus_dur', 'ai_style', 'theme'];
      const updates = Object.fromEntries(
        Object.entries(req.body || {}).filter(([k]) => allowed.includes(k))
      );

      const { data, error } = await sb
        .from('profiles').update(updates).eq('id', user.id).select().single();
      if (error) throw error;
      return res.json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Profile API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
