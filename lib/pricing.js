/**
 * lib/pricing.js — منطق الأسعار (مصدر الحقيقة: جدول plans)
 * العرض: ادفع شهرين وخذ 3 (الدفع لـ 3 أشهر = سعر شهرين)
 */

export const OFFER = { months: 3, paidMonths: 2 };
export const ALLOWED_MONTHS = [1, 3];
export const PAYMENT_METHODS = ['sham_cash', 'bimera'];

// أقصى عدد إضافات مسموح بطلب واحد (مقاعد موظفين للمدير / مديرين إضافيين لصاحب العمل)
export const MAX_EXTRA = { manager: 20, owner: 10 };

const round2 = (n) => Math.round(n * 100) / 100;

export function computeQuote(plan, months, extra) {
  const m = ALLOWED_MONTHS.includes(Number(months)) ? Number(months) : 1;
  const e = Math.max(0, Math.floor(Number(extra) || 0));
  const perMonth = Number(plan.price_usd) + e * Number(plan.extra_member_price_usd);
  const paidMonths = m === OFFER.months ? OFFER.paidMonths : m;
  const total = round2(perMonth * paidMonths);
  const full = round2(perMonth * m);
  return {
    months: m,
    extra_members: e,
    per_month: round2(perMonth),
    paid_months: paidMonths,
    total,
    saving: round2(full - total),
  };
}

export async function getPlan(sb, accountType) {
  const { data } = await sb
    .from('plans')
    .select('account_type,name,price_usd,included_members,extra_member_price_usd,daily_ai_limit')
    .eq('account_type', accountType)
    .eq('active', true)
    .maybeSingle();
  return data || null;
}

export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
