/**
 * /api/payment/approve
 * ─────────────────────────────────
 * المدير يوافق أو يرفض طلب الترقية
 * محمي بـ ADMIN_SECRET_KEY
 */

import { createServerClient } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // تحقق من صلاحية المدير
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'غير مصرح' });
  }

  const { requestId, action, note } = req.body;
  // action: 'approve' | 'reject'

  if (!requestId || !action) {
    return res.status(400).json({ error: 'requestId و action مطلوبان' });
  }

  const sb = createServerClient();

  // جلب الطلب
  const { data: request, error: fetchError } = await sb
    .from('payment_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) {
    return res.status(404).json({ error: 'الطلب غير موجود' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({ error: 'هذا الطلب تمت معالجته مسبقاً' });
  }

  if (action === 'approve') {
    // حساب تاريخ انتهاء الاشتراك (30 يوم)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // تحديث خطة المستخدم
    await sb.from('profiles').update({
      plan: request.plan,
      plan_started_at:  new Date().toISOString(),
      plan_expires_at:  expiresAt.toISOString(),
    }).eq('id', request.user_id);

    // تحديث حالة الطلب
    await sb.from('payment_requests').update({
      status:      'approved',
      admin_note:  note || 'تمت الموافقة',
      reviewed_at: new Date().toISOString(),
    }).eq('id', requestId);

    return res.json({
      success: true,
      message: `تم تفعيل خطة ${request.plan} للمستخدم ${request.user_email}`,
    });
  }

  if (action === 'reject') {
    await sb.from('payment_requests').update({
      status:      'rejected',
      admin_note:  note || 'تم الرفض',
      reviewed_at: new Date().toISOString(),
    }).eq('id', requestId);

    return res.json({
      success: true,
      message: `تم رفض طلب ${request.user_email}`,
    });
  }

  return res.status(400).json({ error: 'action غير صحيح' });
}
