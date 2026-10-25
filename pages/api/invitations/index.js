/**
 * /api/invitations
 * POST   → مدير: دعوة موظف لفريقه | صاحب عمل: دعوة مدير لشركته
 * DELETE → ?id=xxx  إلغاء دعوة معلّقة
 */

import { getUserFromToken, createServerClient, hasActiveAccess } from '../../../lib/supabase';

const MAX_PENDING = 20;

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const sb = createServerClient();

  try {
    if (req.method === 'POST') {
      const { data: profile } = await sb.from('profiles')
        .select('id,account_type').eq('id', user.id).single();
      if (!profile) return res.status(404).json({ error: 'الملف الشخصي غير موجود' });

      if (!['manager', 'owner'].includes(profile.account_type)) {
        return res.status(403).json({ error: 'الدعوات للمدير وصاحب العمل فقط' });
      }
      if (!(await hasActiveAccess(user.id))) {
        return res.status(402).json({ error: 'انتهت فترتك التجريبية أو اشتراكك', subscription_required: true });
      }

      const email = (req.body?.email || '').trim().toLowerCase() || null;

      const { count: pending } = await sb.from('invitations')
        .select('*', { count: 'exact', head: true })
        .eq('invited_by', user.id).eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());
      if ((pending || 0) >= MAX_PENDING) {
        return res.status(400).json({ error: 'لديك دعوات معلّقة كثيرة، ألغِ بعضها أولاً' });
      }

      let row;
      if (profile.account_type === 'manager') {
        const { data: team } = await sb.from('teams').select('id').eq('manager_id', user.id).maybeSingle();
        if (!team) return res.status(404).json({ error: 'لا يوجد فريق لحسابك' });

        const [{ data: capacity }, { count: members }] = await Promise.all([
          sb.rpc('team_capacity', { p_team: team.id }),
          sb.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', team.id),
        ]);
        if ((members || 0) >= (capacity || 0)) {
          return res.status(400).json({ error: 'فريقك مكتمل. أضف مقعداً إضافياً لدعوة موظف جديد.', team_full: true });
        }
        row = { kind: 'employee', team_id: team.id, email, invited_by: user.id };
      } else {
        const { data: org } = await sb.from('organizations').select('id').eq('owner_id', user.id).maybeSingle();
        if (!org) return res.status(404).json({ error: 'لا توجد شركة لحسابك' });
        row = { kind: 'manager', org_id: org.id, email, invited_by: user.id };
      }

      const { data, error } = await sb.from('invitations').insert(row)
        .select('id,code,kind,email,expires_at').single();
      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id مطلوب' });
      const { error } = await sb.from('invitations').update({ status: 'revoked' })
        .eq('id', id).eq('invited_by', user.id).eq('status', 'pending');
      if (error) throw error;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Invitations API Error:', error);
    return res.status(500).json({ error: 'حدث خطأ، حاول مرة أخرى' });
  }
}
