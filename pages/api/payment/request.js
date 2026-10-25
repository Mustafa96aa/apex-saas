/**
 * /api/payment/request
 * POST → المستخدم يطلب تفعيل/تجديد اشتراكه ويرسل إثبات الدفع
 * GET  → آخر طلبات المستخدم (لعرض حالة الطلب)
 * السعر يُحسب بالسيرفر من جدول plans، ولا يُؤخذ من المتصفح.
 */

import { getUserFromToken, createServerClient } from '../../../lib/supabase';
import { computeQuote, getPlan, MAX_EXTRA, PAYMENT_METHODS } from '../../../lib/pricing';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') return res.status(405).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'يجب تسجيل الدخول' });

  const sb = createServerClient();

  if (req.method === 'GET') {
    const { data } = await sb.from('payment_requests')
      .select('id,account_type,months,extra_members,method,amount,status,admin_note,created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
    return res.json(data || []);
  }

  const { months = 1, extra_members = 0, method, reference, notes } = req.body || {};
  const ref = String(reference || '').trim();

  if (!PAYMENT_METHODS.includes(method)) {
    return res.status(400).json({ error: 'اختر طريقة الدفع: Sham Cash أو بايميرا' });
  }
  if (ref.length < 4 || ref.length > 120) {
    return res.status(400).json({ error: 'أدخل رقم العملية أو ما يثبت الدفع' });
  }

  const { data: profile } = await sb.from('profiles')
    .select('id,account_type').eq('id', user.id).single();
  if (!profile) return res.status(404).json({ error: 'الملف الشخصي غير موجود' });

  // موظف داخل فريق: اشتراكه مغطّى من المدير
  const { data: member } = await sb.from('team_members').select('team_id').eq('user_id', user.id).maybeSingle();
  if (member) {
    return res.status(400).json({ error: 'اشتراكك مغطّى من مديرك، لا حاجة للدفع.' });
  }

  const plan = await getPlan(sb, profile.account_type);
  if (!plan) return res.status(400).json({ error: 'الخطة غير متاحة حالياً' });

  // الإضافات (مقاعد/مديرين) فقط للمدير وصاحب العمل
  const maxExtra = MAX_EXTRA[profile.account_type] || 0;
  let extra = Math.floor(Number(extra_members) || 0);
  if (extra < 0 || extra > maxExtra) {
    return res.status(400).json({ error: `عدد الإضافات يجب أن يكون بين 0 و ${maxExtra}` });
  }

  // المدير: لا يقلّ عدد المقاعد عن عدد موظفيه الحاليين
  if (profile.account_type === 'manager') {
    const { data: team } = await sb.from('teams').select('id').eq('manager_id', user.id).maybeSingle();
    if (team) {
      const { count } = await sb.from('team_members')
        .select('user_id', { count: 'exact', head: true }).eq('team_id', team.id);
      const minExtra = Math.max(0, (count || 0) - plan.included_members);
      if (extra < minExtra) {
        return res.status(400).json({ error: `لديك ${count} موظفين، يجب ألا يقل عدد المقاعد الإضافية عن ${minExtra}` });
      }
    }
  }

  const quote = computeQuote(plan, months, extra);

  // طلب معلق واحد فقط
  const { data: existing } = await sb.from('payment_requests')
    .select('id').eq('user_id', user.id).eq('status', 'pending').limit(1).maybeSingle();
  if (existing) return res.status(400).json({ error: 'لديك طلب معلق بالفعل، انتظر مراجعته' });

  const { data, error } = await sb.from('payment_requests')
    .insert({
      user_id:       user.id,
      user_email:    user.email,
      account_type:  profile.account_type,
      extra_members: quote.extra_members,
      months:        quote.months,
      method,
      amount:        quote.total,
      reference:     ref,
      notes:         notes ? String(notes).slice(0, 500) : null,
      status:        'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Payment request error:', error);
    return res.status(500).json({ error: 'حدث خطأ، حاول مرة أخرى' });
  }

  // إشعار Telegram (اختياري)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    const text = `🆕 طلب اشتراك جديد
👤 ${user.email}
📦 ${plan.name} · ${quote.months} شهر${quote.extra_members ? ` · +${quote.extra_members} إضافي` : ''}
💵 $${quote.total}
💳 ${method === 'sham_cash' ? 'Sham Cash' : 'بايميرا'}
🔢 ${ref}`;
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text }),
    }).catch(() => {});
  }

  return res.status(201).json({
    success: true,
    message: 'تم استلام طلبك! سنراجعه خلال 24 ساعة وسيُفعَّل حسابك.',
    requestId: data.id,
    quote,
  });
}
