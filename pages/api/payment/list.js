/**
 * /api/payment/list — جلب طلبات الدفع للمدير
 */
import { createServerClient } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) return res.status(403).json({ error: 'غير مصرح' });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('payment_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}
