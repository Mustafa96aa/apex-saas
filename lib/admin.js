import crypto from 'crypto';

/** تحقق من مفتاح الأدمن بمقارنة آمنة زمنياً */
export function isAdminRequest(req) {
  const given = String(req.headers['x-admin-key'] || '');
  const secret = String(process.env.ADMIN_SECRET_KEY || '');
  if (!secret || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
