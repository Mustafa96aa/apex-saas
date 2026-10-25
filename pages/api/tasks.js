/**
 * /api/tasks — Task CRUD
 * ─────────────────────────────────
 * GET    → مهامي (?status=today) أو (?scope=assigned) المهام اللي وزّعتها على فريقي
 * POST   → مهمة جديدة (assignee_id اختياري: المدير يعطي مهمة لموظف بفريقه)
 * PATCH  → تعديل مهمة
 * DELETE → حذف مهمة (?id=xxx)
 *
 * ملاحظة: الحقل `due` في الواجهة مخزّن في `due_label` بقاعدة البيانات.
 */

import { getUserFromToken, createServerClient, hasActiveAccess } from '../../lib/supabase';

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES   = ['today', 'upcoming', 'review', 'done'];

const shape = (r) => ({ ...r, due: r.due_label || '' });

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const sb = createServerClient();

  try {
    // ── GET ──────────────────────────────────
    if (req.method === 'GET') {
      const { status, scope } = req.query;

      if (scope === 'assigned') {
        const { data, error } = await sb.from('tasks')
          .select('*, assignee:profiles!tasks_user_id_fkey(name,email)')
          .eq('created_by', user.id).neq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return res.json((data || []).map(shape));
      }

      let query = sb.from('tasks').select('*').eq('user_id', user.id);
      if (status) query = query.eq('status', status);
      query = query.order('created_at', { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return res.json((data || []).map(shape));
    }

    // ── POST ─────────────────────────────────
    if (req.method === 'POST') {
      if (!(await hasActiveAccess(user.id))) {
        return res.status(402).json({ error: 'انتهت فترتك التجريبية أو اشتراكك', subscription_required: true });
      }

      const { title, priority, status, due, cat, suggested, assignee_id } = req.body || {};
      if (!title?.trim()) return res.status(400).json({ error: 'العنوان مطلوب' });

      let userId = user.id;
      let teamId = null;

      // مهمة لموظف: لازم يكون من فريقي
      if (assignee_id && assignee_id !== user.id) {
        const { data: team } = await sb.from('teams').select('id').eq('manager_id', user.id).maybeSingle();
        if (!team) return res.status(403).json({ error: 'غير مسموح بتوزيع المهام' });
        const { data: member } = await sb.from('team_members').select('user_id')
          .eq('team_id', team.id).eq('user_id', assignee_id).maybeSingle();
        if (!member) return res.status(403).json({ error: 'هذا الموظف ليس في فريقك' });
        userId = assignee_id;
        teamId = team.id;
      }

      const { data, error } = await sb.from('tasks').insert({
        user_id:    userId,
        created_by: user.id,
        team_id:    teamId,
        title:      title.trim(),
        priority:   PRIORITIES.includes(priority) ? priority : 'medium',
        status:     STATUSES.includes(status) ? status : 'today',
        due_label:  due || null,
        cat:        cat || 'عام',
        suggested:  !!suggested,
      }).select().single();

      if (error) throw error;
      return res.status(201).json(shape(data));
    }

    // ── PATCH ────────────────────────────────
    if (req.method === 'PATCH') {
      const { id, ...body } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id مطلوب' });

      const { data: task } = await sb.from('tasks')
        .select('id,user_id,created_by').eq('id', id).maybeSingle();
      if (!task || (task.user_id !== user.id && task.created_by !== user.id)) {
        return res.status(404).json({ error: 'المهمة غير موجودة' });
      }

      // المهمة وزّعها غيري → أغيّر حالتها فقط
      const isMine = task.created_by === user.id;
      const updates = {};
      if (body.status && STATUSES.includes(body.status)) {
        updates.status = body.status;
        updates.completed_at = body.status === 'done' ? new Date().toISOString() : null;
      }
      if (isMine) {
        if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim();
        if (PRIORITIES.includes(body.priority)) updates.priority = body.priority;
        if (typeof body.cat === 'string') updates.cat = body.cat;
        if (typeof body.suggested === 'boolean') updates.suggested = body.suggested;
        if ('due' in body) updates.due_label = body.due || null;
      }
      if (!Object.keys(updates).length) return res.status(400).json({ error: 'لا يوجد ما يُعدَّل' });

      const { data, error } = await sb.from('tasks').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return res.json(shape(data));
    }

    // ── DELETE ───────────────────────────────
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id مطلوب' });

      // أحذف فقط المهام اللي أنا أنشأتها
      const { error } = await sb.from('tasks').delete().eq('id', id).eq('created_by', user.id);
      if (error) throw error;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Tasks API Error:', error);
    return res.status(500).json({ error: 'حدث خطأ، حاول مرة أخرى' });
  }
}
