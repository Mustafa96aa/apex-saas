/**
 * /api/chat — Anthropic API Proxy
 * ─────────────────────────────────
 * يخفي الـ API Key عن المتصفح تماماً
 * يتحقق من الهوية + من الاشتراك/التجربة (حسابه أو حساب مديره)
 * يطبّق الحد اليومي حسب خطة نوع الحساب (جدول plans)
 *
 * TODO (خطوة تأمين chat): نقل الـ system prompt للسيرفر بدل استقباله من المتصفح.
 */

import { getUserFromToken, createServerClient, hasActiveAccess } from '../../lib/supabase';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const DEFAULT_DAILY_LIMIT = 200;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── تحقق من المصادقة ───────────────────────
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول للاستخدام' });
  }

  const sb = createServerClient();

  // ─── تحقق من الاشتراك / التجربة ─────────────
  if (!(await hasActiveAccess(user.id))) {
    return res.status(402).json({
      error: 'انتهت فترتك التجريبية أو اشتراكك. جدّد للاستمرار باستخدام الذكاء الاصطناعي.',
      subscription_required: true,
    });
  }

  // ─── الحد اليومي حسب خطة نوع الحساب ─────────
  const { data: profile } = await sb.from('profiles')
    .select('account_type').eq('id', user.id).single();
  const { data: plan } = await sb.from('plans')
    .select('daily_ai_limit').eq('account_type', profile?.account_type || 'personal').maybeSingle();
  const limit = plan?.daily_ai_limit ?? DEFAULT_DAILY_LIMIT;

  const today = new Date().toISOString().split('T')[0];
  const { count } = await sb.from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', `${today}T00:00:00Z`);

  if ((count || 0) >= limit) {
    return res.status(429).json({
      error: 'وصلت للحد اليومي للذكاء الاصطناعي، جرّب غداً.',
      limit_reached: true,
    });
  }

  // ─── استدعاء Anthropic API ──────────────────
  try {
    const { max_tokens, system, messages } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'messages مطلوبة' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL, // الموديل يُحدَّد من السيرفر فقط
        max_tokens: Math.min(max_tokens || 1000, 2000),
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Anthropic error:', err);
      return res.status(response.status).json({ error: 'خطأ في خدمة الذكاء الاصطناعي' });
    }

    const data = await response.json();

    await sb.from('ai_usage').insert({
      user_id: user.id,
      tokens_used: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    });

    return res.json(data);

  } catch (error) {
    console.error('AI API Error:', error);
    return res.status(500).json({ error: 'خطأ في خدمة الذكاء الاصطناعي' });
  }
}
