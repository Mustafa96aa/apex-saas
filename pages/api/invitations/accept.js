/**
 * /api/invitations/accept
 * المستخدم يقبل دعوة بالكود (موظف ← فريق مدير، مدير ← شركة)
 * يعمل باسم المستخدم نفسه حتى تتحقق قاعدة البيانات من هويته
 */

import { getUserFromToken, createUserClient } from '../../../lib/supabase';

const ERRORS = {
  invalid_invitation:           'كود الدعوة غير صالح أو منتهي',
  invitation_email_mismatch:    'هذه الدعوة مخصصة لإيميل آخر',
  wrong_account_type:           'نوع حسابك لا يناسب هذه الدعوة (دعوة الموظفين لحسابات "موظف"، ودعوة المديرين لحسابات "مدير")',
  team_full:                    'الفريق مكتمل. اطلب من مديرك إضافة مقعد.',
  manager_subscription_inactive:'اشتراك المدير منتهي، اطلب منه التجديد.',
  not_employee_account:         'هذه الدعوة لحسابات "موظف" فقط',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  const user  = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'يجب تسجيل الدخول' });

  const code = String(req.body?.code || '').trim();
  if (!code) return res.status(400).json({ error: 'أدخل كود الدعوة' });

  const sb = createUserClient(token);
  const { data, error } = await sb.rpc('accept_invitation', { p_code: code });

  if (error) {
    const key = Object.keys(ERRORS).find(k => error.message?.includes(k));
    if (key) return res.status(400).json({ error: ERRORS[key] });
    if (error.message?.includes('duplicate key')) {
      return res.status(400).json({ error: 'أنت عضو في فريق بالفعل. غادره أولاً للانضمام لفريق آخر.' });
    }
    console.error('Accept invitation error:', error);
    return res.status(500).json({ error: 'تعذّر قبول الدعوة، حاول مرة أخرى' });
  }

  return res.json({ success: true, ...data });
}
