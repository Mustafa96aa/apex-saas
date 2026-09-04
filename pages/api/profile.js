/**
 * /api/profile
 * GET   → جلب الملف الشخصي
 * PATCH → تعديل الإعدادات
 */

import { getUserFromToken, createServerClient } from '../../lib/supabase';

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const sb = createServerClient();

  try {
    if (req.method === 'GET') {
      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return res.json(data);
    }

    if (req.method === 'PATCH') {
      const allowed = ['name','role','focus_dur','ai_style','theme'];
      const updates = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => allowed.includes(k))
      );

      const { data, error } = await sb
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return res.json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
