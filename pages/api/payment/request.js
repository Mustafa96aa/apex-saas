/**
 * /api/payment/request
 * ─────────────────────────────────
 * المستخدم يطلب الترقية ويرسل إثبات الدفع
 */

import { getUserFromToken, createServerClient } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'يجب تسجيل الدخول' });

  const {
    plan,           // 'pro' | 'team'
    method,         // 'syriatel' | 'mtn' | 'usdt' | 'bank'
    amount,         // المبلغ
    reference,      // رقم العملية أو ما يثبت الدفع
    notes,          // ملاحظات إضافية
  } = req.body;

  if (!plan || !method || !reference) {
    return res.status(400).json({ error: 'يرجى إكمال جميع الحقول' });
  }

  const sb = createServerClient();

  // تحقق إن لم يكن لديه طلب معلق
  const { data: existing } = await sb
    .from('payment_requests')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (existing) {
    return res.status(400).json({ error: 'لديك طلب معلق بالفعل، انتظر مراجعته' });
  }

  // حفظ الطلب
  const { data, error } = await sb
    .from('payment_requests')
    .insert({
      user_id:   user.id,
      user_email: user.email,
      plan,
      method,
      amount,
      reference,
      notes,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Payment request error:', error);
    return res.status(500).json({ error: 'حدث خطأ، حاول مرة أخرى' });
  }

  // إرسال إشعار للمدير عبر Telegram (اختياري)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const message = `
🆕 طلب ترقية جديد!
👤 المستخدم: ${user.email}
📦 الخطة: ${plan === 'pro' ? 'Pro ($8)' : 'Team ($29)'}
💳 طريقة الدفع: ${method}
🔢 المرجع: ${reference}
📝 ملاحظات: ${notes || 'لا يوجد'}
`;
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
      }),
    }).catch(() => {});
  }

  return res.status(201).json({
    success: true,
    message: 'تم استلام طلبك! سنراجعه خلال 24 ساعة وسيُفعَّل حسابك.',
    requestId: data.id,
  });
}
