/**
 * /api/payment/approve
 * الأدمن يوافق أو يرفض طلب الاشتراك — محمي بـ ADMIN_SECRET_KEY
 * الموافقة تفعّل جدول subscriptions (وتمدّد الاشتراك الحالي إن كان فعّالاً)
 */

import { createServerClient } from '../../../lib/supabase';
import { isAdminRequest } from '../../../lib/admin';
import { addMonths } from '../../../lib/pricing';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'غير مصرح' });

  const { requestId, action, note } = req.body || {};
  if (!requestId || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'requestId و action (approve|reject) مطلوبان' });
  }

  const sb  = createServerClient();
  const now = new Date();

  const { data: request } = await sb.from('payment_requests').select('*').eq('id', requestId).single();
  if (!request) return res.status(404).json({ error: 'الطلب غير موجود' });

  // "حجز" الطلب: يتغيّر فقط إن كان لا يزال معلقاً (يمنع المعالجة المزدوجة)
  const finalStatus = action === 'approve' ? 'approved' : 'rejected';
  const { data: claimed } = await sb.from('payment_requests')
    .update({
      status:      finalStatus,
      admin_note:  note || (action === 'approve' ? 'تمت الموافقة' : 'تم الرفض'),
      reviewed_at: now.toISOString(),
    })
    .eq('id', requestId).eq('status', 'pending')
    .select('id');
  if (!claimed || claimed.length === 0) {
    return res.status(400).json({ error: 'هذا الطلب تمت معالجته مسبقاً' });
  }

  if (action === 'reject') {
    return res.json({ success: true, message: `تم رفض طلب ${request.user_email}` });
  }

  // الموافقة: تمديد من نهاية الاشتراك الفعّال الحالي، أو من الآن
  const { data: sub } = await sb.from('subscriptions')
    .select('status,current_period_start,current_period_end,trial_ends_at')
    .eq('user_id', request.user_id).maybeSingle();

  const stillActive = sub?.status === 'active' && sub.current_period_end && new Date(sub.current_period_end) > now;
  const start = stillActive ? new Date(sub.current_period_start) : now;
  const end   = addMonths(stillActive ? new Date(sub.current_period_end) : now, request.months);

  const { error } = await sb.from('subscriptions').upsert({
    user_id:              request.user_id,
    status:               'active',
    current_period_start: start.toISOString(),
    current_period_end:   end.toISOString(),
    extra_members:        request.extra_members,
    trial_ends_at:        sub?.trial_ends_at || null,
  }, { onConflict: 'user_id' });

  if (error) {
    console.error('Approve subscription error:', error);
    // رجّع الطلب معلقاً حتى لا يضيع
    await sb.from('payment_requests')
      .update({ status: 'pending', admin_note: null, reviewed_at: null }).eq('id', requestId);
    return res.status(500).json({ error: 'تعذّر تفعيل الاشتراك، الطلب ما زال معلقاً' });
  }

  return res.json({
    success: true,
    message: `تم تفعيل اشتراك ${request.user_email} حتى ${end.toLocaleDateString('en-GB')}`,
  });
}
