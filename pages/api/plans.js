/**
 * /api/plans — الخطط والأسعار (عام، للقراءة فقط)
 * حسابات الدفع (Sham Cash / بايميرا) تأتي من متغيرات البيئة في Vercel
 */
import { createServerClient } from '../../lib/supabase';
import { OFFER } from '../../lib/pricing';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('plans')
    .select('account_type,name,price_usd,included_members,extra_member_price_usd,daily_ai_limit')
    .eq('active', true);
  if (error) return res.status(500).json({ error: 'تعذّر تحميل الخطط' });

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  return res.json({
    plans: data,
    offer: OFFER,
    payment_accounts: {
      sham_cash: process.env.PAYMENT_SHAM_CASH_ACCOUNT || null,
      bimera:    process.env.PAYMENT_BIMERA_ACCOUNT || null,
    },
  });
}
