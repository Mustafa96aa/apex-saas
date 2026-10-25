/**
 * /api/team
 * GET    → تفاصيل الفريق (مدير) / الشركة (صاحب عمل) / فريقي (موظف)
 * DELETE → ?user_id=xxx  المدير يزيل موظفاً
 *          (بدون user_id) الموظف يغادر فريقه
 */

import { getUserFromToken, createServerClient } from '../../lib/supabase';
import { getTeamOverview } from '../../lib/team';

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const sb = createServerClient();

  try {
    const { data: profile } = await sb.from('profiles')
      .select('id,account_type').eq('id', user.id).single();
    if (!profile) return res.status(404).json({ error: 'الملف الشخصي غير موجود' });

    if (req.method === 'GET') {
      return res.json(await getTeamOverview(sb, profile, true));
    }

    if (req.method === 'DELETE') {
      const targetId = req.query.user_id;

      // موظف يغادر بنفسه
      if (!targetId) {
        if (profile.account_type !== 'employee') return res.status(403).json({ error: 'غير مسموح' });
        const { error } = await sb.from('team_members').delete().eq('user_id', user.id);
        if (error) throw error;
        return res.json({ success: true });
      }

      // مدير يزيل موظفاً من فريقه
      if (profile.account_type !== 'manager') return res.status(403).json({ error: 'غير مسموح' });
      const { data: team } = await sb.from('teams').select('id').eq('manager_id', user.id).maybeSingle();
      if (!team) return res.status(404).json({ error: 'لا يوجد فريق' });

      const { error } = await sb.from('team_members').delete()
        .eq('team_id', team.id).eq('user_id', targetId);
      if (error) throw error;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Team API Error:', error);
    return res.status(500).json({ error: 'حدث خطأ، حاول مرة أخرى' });
  }
}
