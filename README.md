▲ APEX — AI Productivity SaaS
مساعدك الذكي للإنتاجية والتركيز — مدعوم بـ Claude AI
🚀 النشر على Vercel (خطوة بخطوة)
المتطلبات
حساب على github.com
حساب على vercel.com
حساب على supabase.com
مفتاح Anthropic API من console.anthropic.com
الخطوة 1️⃣ — رفع الكود على GitHub
اذهب إلى github.com → New repository
الاسم: apex-saas
اختر Private (مهم لأمان الكود)
اضغط Create repository
اضغط uploading an existing file
ارفع جميع ملفات المشروع
اضغط Commit changes
الخطوة 2️⃣ — إعداد Supabase
اذهب إلى supabase.com → New Project
أدخل اسم المشروع: apex-saas
اختر كلمة مرور قوية للـ Database
اختر المنطقة الأقرب (EU West لمستخدمي الشرق الأوسط)
انتظر حتى يكتمل الإنشاء (دقيقة تقريباً)
اذهب إلى SQL Editor → New Query
الصق محتوى ملف supabase-schema.sql واضغط Run
اذهب إلى Settings → API وانسخ:
Project URL
anon public key
service_role key (سري!)
الخطوة 3️⃣ — النشر على Vercel
اذهب إلى vercel.com → Add New Project
اختر Import Git Repository
اختر مستودع apex-saas من GitHub
قبل الضغط على Deploy — اضغط على Environment Variables
أضف المتغيرات التالية:
ANTHROPIC_API_KEY          = sk-ant-api03-...
NEXT_PUBLIC_SUPABASE_URL   = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY  = eyJhbGciOi...
اضغط Deploy 🚀
انتظر دقيقتين → سيعطيك رابط مثل: https://apex-saas.vercel.app
الخطوة 4️⃣ — تفعيل Auth في Supabase
اذهب إلى Supabase → Authentication → URL Configuration
في Site URL أضف:
https://apex-saas.vercel.app
في Redirect URLs أضف:
https://apex-saas.vercel.app/**
احفظ التغييرات
الخطوة 5️⃣ — دومين مخصص (اختياري)
اشترِ دومين من Namecheap أو GoDaddy (مثال: useapex.ai)
في Vercel → Settings → Domains
أضف دومينك واتبع التعليمات
🏗️ هيكل المشروع
apex-saas/
├── pages/
│   ├── index.jsx          ← التطبيق الرئيسي
│   ├── _app.jsx
│   └── api/
│       ├── chat.js        ← 🔐 Anthropic Proxy
│       ├── tasks.js       ← Task CRUD
│       └── profile.js     ← User Profile
├── lib/
│   └── supabase.js        ← Supabase Client
├── public/
│   └── manifest.json      ← PWA
├── styles/
│   └── globals.css
├── supabase-schema.sql    ← Database Schema
├── vercel.json
├── next.config.js
└── .env.example           ← نموذج متغيرات البيئة
🔐 الأمان
الميزة
الحالة
API Key مخفي في السيرفر
✅
JWT Authentication
✅
Row Level Security
✅
Rate Limiting (20 req/day free)
✅
HTTPS تلقائي
✅ (Vercel)
💰 تكاليف التشغيل
الخدمة
الخطة المجانية
عند النمو
Vercel
100GB bandwidth
$20/شهر
Supabase
500MB DB + 50K users
$25/شهر
Anthropic
حسب الاستخدام
~$0.01/طلب
📞 الدعم
Built with ❤️ using Claude AI by Anthropic