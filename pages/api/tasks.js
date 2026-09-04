/**
 * /api/tasks — Task CRUD
 * ─────────────────────────────────
 * GET    → جلب كل مهام المستخدم
 * POST   → إضافة مهمة جديدة
 * PATCH  → تعديل مهمة
 * DELETE → حذف مهمة (?id=xxx)
 */

import { getUserFromToken, createServerClient } from '../../lib/supabase';

export default async function handler(req, res) {
  // تحقق من المصادقة
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const sb = createServerClient();

  try {
    // ── GET: جلب المهام ──────────────────────
    if (req.method === 'GET') {
      const { status } = req.query;
      let query = sb.from('tasks').select('*').eq('user_id', user.id);
      if (status) query = query.eq('status', status);
      query = query.order('created_at', { ascending: true });
      const { data, error } = await query;
      if (error) throw error;
      return res.json(data);
    }

    // ── POST: إضافة مهمة ─────────────────────
    if (req.method === 'POST') {
      const { title, priority, status, due, cat, suggested } = req.body;
      if (!title?.trim()) return res.status(400).json({ error: 'العنوان مطلوب' });

      const { data, error } = await sb
        .from('tasks')
        .insert({
          user_id: user.id,
          title: title.trim(),
          priority: priority || 'medium',
          status:   status   || 'today',
          due,
          cat:       cat      || 'عام',
          suggested: suggested || false,
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    // ── PATCH: تعديل مهمة ────────────────────
    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body;
      if (!id) return res.status(400).json({ error: 'id مطلوب' });

      // حذف الحقول الغير مسموحة
      delete updates.user_id;
      delete updates.created_at;

      const { data, error } = await sb
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // تأكد أن المهمة تخص المستخدم
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    }

    // ── DELETE: حذف مهمة ─────────────────────
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id مطلوب' });

      const { error } = await sb
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Tasks API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
