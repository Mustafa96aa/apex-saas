/**
 * /api/chat — Anthropic API Proxy
 * ─────────────────────────────────
 * يخفي الـ API Key عن المتصفح تماماً
 * يتحقق من هوية المستخدم قبل السماح بالاستخدام
 * يتتبع الاستخدام لمنع الإفراط
 */

import { getUserFromToken, createServerClient } from '../../lib/supabase';

// حد أقصى للاستخدام المجاني (يومياً)
const FREE_DAILY_LIMIT  = 20;  // 20 طلب/يوم
const PRO_DAILY_LIMIT   = 200; // 200 طلب/يوم

export default async function handler(req, res) {
  // فقط POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── تحقق من المصادقة ───────────────────────
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);

  if (!user) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول للاستخدام' });
  }

  // ─── تحقق من حد الاستخدام ──────────────────
  const sb = createServerClient();

  // جلب الخطة الحالية للمستخدم
  const { data: profile } = await sb
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan  = profile?.plan || 'free';
  const limit = plan === 'pro' || plan === 'team' ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;

  // عدد الطلبات اليوم
  const today = new Date().toISOString().split('T')[0];
  const { count } = await sb
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', `${today}T00:00:00Z`);

  if ((count || 0) >= limit) {
    return res.status(429).json({
      error: plan === 'free'
        ? `وصلت للحد اليومي المجاني (${FREE_DAILY_LIMIT} طلبات). ارقَّ لـ Pro للحصول على ${PRO_DAILY_LIMIT} طلباً/يوم`
        : 'وصلت للحد اليومي، يرجى المحاولة غداً',
      limit_reached: true,
      plan,
    });
  }

  // ─── استدعاء Anthropic API ──────────────────
  try {
    const { model, max_tokens, system, messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: Math.min(max_tokens || 1000, 2000), // حد أقصى للتوكنز
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();

    // ─── سجّل الاستخدام ─────────────────────
    await sb.from('ai_usage').insert({
      user_id: user.id,
      tokens_used: data.usage?.input_tokens + data.usage?.output_tokens || 0,
    });

    return res.json(data);

  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(500).json({ error: 'خطأ في خدمة الذكاء الاصطناعي' });
  }
}
