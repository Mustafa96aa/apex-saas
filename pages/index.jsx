/**
 * APEX SaaS — Production Version
 * ────────────────────────────────────────────────
 * ✅ Supabase Auth (تسجيل / دخول حقيقي)
 * ✅ /api/chat proxy (API key مخفي في السيرفر)
 * ✅ /api/tasks (بيانات محفوظة في Supabase)
 * ✅ Dark / Light mode
 * ✅ Swipe gestures
 * ✅ Focus Mode
 * ✅ Undo system
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/* ─── STYLES ─── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --bg:#0A1130;--s1:#101A3D;--s2:#16224D;--s3:#1C2B5E;
      --b:#2A3768;--b2:#3A4A85;
      --cy:#19C2B0;--cy2:#12A494;--cy-rgb:25,194,176;--on:#101A3D;
      --am:#f59e0b;--gr:#10b981;--rd:#ef4444;
      --tx:#F5F7FF;--tx2:#A9B4DB;--mu:#7C88B8;--sw:265px;
      --lg-top:#FFFFFF;--lg-ck:#101A3D;--lg-c3:#6C74FF;
    }
    [data-acc="employee"]{--cy:#3D9BF0;--cy2:#2E85D6;--cy-rgb:61,155,240;--on:#101A3D;}
    [data-acc="manager"]{--cy:#6C74FF;--cy2:#4C54E6;--cy-rgb:108,116,255;--on:#FFFFFF;}
    [data-acc="owner"]{--cy:#F5F7FF;--cy2:#D9DEF2;--cy-rgb:245,247,255;--on:#101A3D;}
    html,body{background:var(--bg);color:var(--tx);direction:rtl;overflow-x:hidden;font-family:'Sora','IBM Plex Sans Arabic',sans-serif;}
    .gb{background-image:radial-gradient(ellipse 90% 40% at 50% -10%,rgba(var(--cy-rgb),.05),transparent),linear-gradient(rgba(var(--cy-rgb),.015) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--cy-rgb),.015) 1px,transparent 1px);background-size:100%,50px 50px,50px 50px;}
    .light{--bg:#F5F7FF;--s1:#FFFFFF;--s2:#F5F7FF;--s3:#EBEEFA;--b:#D9DEF2;--b2:#C3CBE6;--tx:#101A3D;--tx2:#4A5578;--mu:#7C86AA;
      --cy:#0FA797;--cy2:#0B8A7C;--cy-rgb:15,167,151;--on:#FFFFFF;--lg-top:#101A3D;--lg-ck:#FFFFFF;--lg-c3:#4C54E6;}
    .light[data-acc="employee"]{--cy:#2B86DB;--cy2:#1F6DB8;--cy-rgb:43,134,219;--on:#FFFFFF;}
    .light[data-acc="manager"]{--cy:#4C54E6;--cy2:#3A41C4;--cy-rgb:76,84,230;--on:#FFFFFF;}
    .light[data-acc="owner"]{--cy:#101A3D;--cy2:#2A3768;--cy-rgb:16,26,61;--on:#FFFFFF;}
    .light .gb{background-image:radial-gradient(ellipse 90% 40% at 50% -10%,rgba(var(--cy-rgb),.04),transparent),linear-gradient(rgba(var(--cy-rgb),.03) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--cy-rgb),.03) 1px,transparent 1px);background-size:100%,50px 50px,50px 50px;}
    ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:var(--b2);border-radius:3px;}
    @keyframes fi{from{opacity:0;transform:translateY(9px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fi2{from{opacity:0;transform:scale(.94);}to{opacity:1;transform:scale(1);}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes pulse{0%,100%{opacity:.5;transform:scale(1);}50%{opacity:1;transform:scale(1.15);}}
    @keyframes sideIn{from{transform:translateX(calc(var(--sw)+4px));}to{transform:translateX(0);}}
    @keyframes fIn{from{opacity:0;}to{opacity:1;}}
    @keyframes toastIn{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    .fi{animation:fi .22s ease forwards;}
    .fi2{animation:fi2 .2s ease forwards;}
    .spin{animation:spin .85s linear infinite;display:inline-block;}
    .mono{font-family:'JetBrains Mono',monospace;}
    .sidebar{position:fixed;top:0;right:0;bottom:0;width:var(--sw);z-index:70;background:rgba(6,12,23,.98);border-left:1px solid var(--b);backdrop-filter:blur(28px);display:flex;flex-direction:column;box-shadow:-16px 0 60px rgba(0,0,0,.7);transition:transform .3s cubic-bezier(.4,0,.2,1);}
    .sidebar.open{transform:translateX(0);}
    .sidebar.closed{transform:translateX(calc(var(--sw)+4px));}
    .light .sidebar{background:rgba(238,244,251,.98);}
    .overlay{position:fixed;inset:0;z-index:69;background:rgba(2,5,9,.8);backdrop-filter:blur(5px);animation:fIn .22s ease;}
    .hbg{cursor:pointer;display:flex;flex-direction:column;gap:5px;padding:10px;border-radius:10px;transition:background .15s;border:none;background:transparent;}
    .hbg:hover{background:var(--s2);}
    .hbg span{display:block;height:2px;border-radius:2px;background:var(--tx2);transition:all .28s cubic-bezier(.4,0,.2,1);}
    .hbg.open span{background:var(--cy);}
    .hbg.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
    .hbg.open span:nth-child(2){opacity:0;transform:scaleX(0);}
    .hbg.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
    .tab{border:none;cursor:pointer;font-family:'Sora','IBM Plex Sans Arabic',sans-serif;transition:all .18s;background:transparent;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;flex:1;border-top:2px solid transparent;}
    .tab.on{border-top-color:var(--cy);}
    .bp{background:linear-gradient(135deg,var(--cy),var(--cy2))!important;color:var(--on)!important;border:none!important;cursor:pointer;font-family:'Sora','IBM Plex Sans Arabic',sans-serif;font-weight:800;transition:all .18s;}
    .bp:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(var(--cy-rgb),.3);}
    .bp:disabled{opacity:.35;transform:none!important;}
    .ghost{background:transparent;border:1px solid var(--b);color:var(--tx2);cursor:pointer;font-family:'Sora','IBM Plex Sans Arabic',sans-serif;transition:all .14s;border-radius:10px;}
    .ghost:hover{background:var(--s2);border-color:var(--b2);color:var(--tx);}
    .inp{background:var(--s1);border:1px solid var(--b);border-radius:12px;padding:12px 16px;color:var(--tx);font-size:14px;direction:rtl;width:100%;font-family:'Sora','IBM Plex Sans Arabic',sans-serif;transition:border .16s;}
    input:focus{outline:none!important;border-color:rgba(var(--cy-rgb),.5)!important;box-shadow:0 0 0 3px rgba(var(--cy-rgb),.07)!important;}
    select{background:var(--s1);border:1px solid var(--b);color:var(--tx);direction:rtl;font-family:'Sora','IBM Plex Sans Arabic',sans-serif;}
    .role-card{border:2px solid var(--b);border-radius:14px;padding:14px;cursor:pointer;transition:all .18s;text-align:center;background:var(--s1);}
    .role-card:hover{border-color:rgba(var(--cy-rgb),.35);background:var(--s2);}
    .role-card.sel{border-color:var(--cy);background:rgba(var(--cy-rgb),.07);}
  `}</style>
);

/* ─── CONSTANTS ─── */
const CM={
  "عمل":{c:"#3D9BF0",i:"💼"},"اجتماع":{c:"#7c3aed",i:"🤝"},"تواصل":{c:"#10b981",i:"📬"},
  "مبيعات":{c:"#f59e0b",i:"💰"},"مالية":{c:"#fbbf24",i:"📊"},"تقني":{c:"#3b82f6",i:"⚙️"},
  "توثيق":{c:"#6366f1",i:"📄"},"عام":{c:"#475569",i:"📌"},
};
const PM={high:{c:"#ef4444",l:"عالية",d:"●●●"},medium:{c:"#f59e0b",l:"متوسطة",d:"●●○"},low:{c:"#3D9BF0",l:"منخفضة",d:"●○○"}};
const ROLES={
  personal:{l:"شخصي",i:"👤",desc:"تنظيم الحياة اليومية",ai:"المستخدم شخص عادي يريد تنظيم مهامه الشخصية"},
  employee:{l:"موظف",i:"💼",desc:"إدارة مهام العمل",ai:"المستخدم موظف يحتاج إدارة مهام العمل والاجتماعات"},
  manager:{l:"مدير",i:"👥",desc:"قيادة فريق ومشاريع",ai:"المستخدم مدير يقود فريقاً ويتابع مشاريع متعددة"},
  business:{l:"صاحب عمل",i:"🏢",desc:"إدارة شركة ونمو الأعمال",ai:"المستخدم صاحب عمل يركز على استراتيجية الشركة والنمو"},
};

const ACCOUNT_TYPES=[
  {k:"personal",l:"شخصي",i:"👤",desc:"طالب أو مهامك اليومية"},
  {k:"employee",l:"موظف",i:"💼",desc:"إنتاجية أعلى بعملك"},
  {k:"manager",l:"مدير",i:"👥",desc:"تشرف على فريق صغير"},
  {k:"owner",l:"صاحب عمل",i:"🏢",desc:"تدير المدراء والموظفين"},
];

/* ─── API HELPERS ─── */
async function apiCall(path, method='GET', body=null, token=null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  return res.json();
}

/* ─── ATOMS ─── */
function ApexLogo({sz=30,fsz=15,sub=false}){
  return(
    <div style={{display:'flex',alignItems:'center',gap:Math.round(sz*0.3),direction:'ltr'}}>
      <svg width={Math.round(sz*64/62)} height={sz} viewBox="0 0 64 62" role="img" aria-label="Apex">
        <rect x="4" y="40" width="10" height="18" rx="5" style={{fill:'#19C2B0'}}/>
        <rect x="18" y="28" width="10" height="30" rx="5" style={{fill:'#3D9BF0'}}/>
        <rect x="32" y="16" width="10" height="42" rx="5" style={{fill:'var(--lg-c3)'}}/>
        <rect x="46" y="14" width="10" height="44" rx="5" style={{fill:'var(--lg-top)'}}/>
        <circle cx="51" cy="11" r="8" style={{fill:'var(--lg-top)'}}/>
        <path d="M47 11.2L50 14L55.2 8.2" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{stroke:'var(--lg-ck)'}}/>
      </svg>
      <div>
        <div style={{fontFamily:"'Sora',sans-serif",fontSize:Math.round(fsz*1.5),fontWeight:700,letterSpacing:'-.03em',color:'var(--tx)',lineHeight:1}}>Apex</div>
        {sub&&<div dir="rtl" style={{fontSize:10,color:'var(--mu)',marginTop:3,fontWeight:500}}>أنجز مهامك بذكاء</div>}
      </div>
    </div>
  );
}

function Ring({pct=0,size=72,stroke=5,color="#3D9BF0"}){
  const r=(size-stroke-2)/2,c=2*Math.PI*r,off=c-(pct/100)*c;
  return(
    <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(128,140,190,.18)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{transition:'stroke-dashoffset .8s ease'}}/>
    </svg>
  );
}

/* ─── AUTH SCREEN ─── */
function AuthScreen({onAuth}){
  const [mode,setMode]=useState('signin');
  const [email,setEmail]=useState('');
  const [pass,setPass]=useState('');
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);
  const [ok,setOk]=useState(null);
  const [name,setName]=useState('');
  const [acct,setAcct]=useState('personal');
  const [invite,setInvite]=useState('');
  const [dI,setDI]=useState(0);
  const demos=["اقترح مهام ذكية لأسبوعي","ما أهم مهمة أركز عليها الآن؟","احذف المهام المكتملة تلقائياً","حلّل إنتاجيتي وأعطني رؤى"];
  useEffect(()=>{const t=setInterval(()=>setDI(i=>(i+1)%demos.length),2800);return()=>clearInterval(t);},[]);
  useEffect(()=>{
    const q=new URLSearchParams(window.location.search).get('invite');
    if(q){setMode('signup');setAcct('employee');setInvite(q);}
  },[]);

  const submit=async()=>{
    if(!email.trim()||!pass){setErr("يرجى إكمال جميع الحقول");return;}
    if(pass.length<6){setErr("كلمة المرور 6 أحرف على الأقل");return;}
    if(mode==='signup'&&!name.trim()){setErr("اكتب اسمك");return;}
    setLoading(true);setErr(null);setOk(null);
    try{
      if(mode==='signup'){
        if(acct==='employee'&&invite.trim())localStorage.setItem('apex_invite',invite.trim());
        const {data,error}=await supabase.auth.signUp({email,password:pass,options:{data:{name:name.trim(),account_type:acct},emailRedirectTo:window.location.origin}});
        if(error)throw error;
        if(data.user&&!data.session){setOk("✅ تحقق من بريدك الإلكتروني وأكّد حسابك");}
        else if(data.session){onAuth(data.session);}
      }else{
        const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
        if(error)throw error;
        onAuth(data.session);
      }
    }catch(e){setErr(e.message||"حدث خطأ في المصادقة");}
    setLoading(false);
  };

  return(
    <div className="gb" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className="fi2" style={{background:'linear-gradient(160deg,var(--s2),var(--s3))',border:'1px solid var(--b2)',borderRadius:24,padding:'38px 30px',width:440,maxWidth:'100%',boxShadow:'0 40px 100px rgba(0,0,0,.7)'}}>
        <div style={{textAlign:'center',marginBottom:26}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:16}}><ApexLogo sz={44} fsz={20} sub/></div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:5}}>{mode==='signin'?"مرحباً بك مجدداً 👋":"ابدأ رحلتك مع Apex ✨"}</h2>
          <p style={{fontSize:13,color:'var(--mu)'}}>مساعدك الذكي للإنتاجية والتركيز</p>
        </div>
        {/* Demo strip */}
        <div style={{background:'var(--s1)',border:'1px solid var(--b)',borderRadius:12,padding:'11px 15px',marginBottom:22,display:'flex',alignItems:'center',gap:9}}>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:'var(--cy)',flexShrink:0}}>›</span>
          <span key={dI} className="fi" style={{flex:1,fontSize:12,color:'var(--cy)',fontFamily:"'JetBrains Mono',monospace"}}>{demos[dI]}</span>
          <span style={{fontSize:15,opacity:.5}}>🎙</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:13}}>
          <div>
            <label style={{fontSize:11,color:'var(--tx2)',display:'block',marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>EMAIL</label>
            <input className="inp" type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="name@example.com" dir="ltr"/>
          </div>
          <div>
            <label style={{fontSize:11,color:'var(--tx2)',display:'block',marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>PASSWORD</label>
            <input className="inp" type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="••••••••"/>
          </div>
          {mode==='signup'&&(<>
            <div>
              <label style={{fontSize:11,color:'var(--tx2)',display:'block',marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>NAME</label>
              <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="اسمك..."/>
            </div>
            <div>
              <label style={{fontSize:11,color:'var(--tx2)',display:'block',marginBottom:6,fontFamily:"'JetBrains Mono',monospace"}}>ACCOUNT_TYPE</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {ACCOUNT_TYPES.map(a=>(
                  <div key={a.k} className={`role-card${acct===a.k?' sel':''}`} onClick={()=>setAcct(a.k)} style={{padding:'10px'}}>
                    <div style={{fontSize:20,marginBottom:4}}>{a.i}</div>
                    <p style={{fontSize:12,fontWeight:700,color:acct===a.k?'var(--cy)':'var(--tx)',marginBottom:2}}>{a.l}</p>
                    <p style={{fontSize:10,color:'var(--mu)',lineHeight:1.4}}>{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            {acct==='employee'&&(
              <div>
                <label style={{fontSize:11,color:'var(--tx2)',display:'block',marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>INVITE_CODE · اختياري</label>
                <input className="inp" value={invite} onChange={e=>setInvite(e.target.value)} placeholder="كود دعوة من مديرك" dir="ltr"/>
              </div>
            )}
            {!(acct==='employee'&&invite.trim())&&<p style={{fontSize:11,color:'var(--mu)',textAlign:'center'}}>🎁 تجربة مجانية 7 أيام بعد تأكيد بريدك</p>}
          </>)}
          {err&&<div style={{fontSize:12,color:'var(--rd)',background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.15)',borderRadius:10,padding:'10px 13px'}}>{err}</div>}
          {ok&&<div style={{fontSize:12,color:'var(--gr)',background:'rgba(16,185,129,.07)',border:'1px solid rgba(16,185,129,.2)',borderRadius:10,padding:'10px 13px'}}>{ok}</div>}
          <button onClick={submit} disabled={loading} className="bp" style={{padding:'13px',borderRadius:13,fontSize:14,marginTop:2}}>
            {loading?<><span className="spin">↻</span> جاري...</>:mode==='signin'?"🚀 تسجيل الدخول":"✨ إنشاء حساب"}
          </button>
          <p style={{textAlign:'center',fontSize:13,color:'var(--mu)'}}>
            {mode==='signin'?"ليس لديك حساب؟ ":"لديك حساب؟ "}
            <button onClick={()=>{setMode(m=>m==='signin'?'signup':'signin');setErr(null);setOk(null);}} style={{background:'none',border:'none',color:'var(--cy)',cursor:'pointer',fontFamily:"'Sora','IBM Plex Sans Arabic'",fontSize:13,fontWeight:700}}>
              {mode==='signin'?"سجّل الآن":"سجّل دخولك"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── ONBOARDING (role selection after first signup) ─── */
function Onboarding({user,token,onDone}){
  const [name,setName]=useState(user?.email?.split('@')[0]||'');
  const [role,setRole]=useState(null);
  const [loading,setLoading]=useState(false);

  const finish=async()=>{
    if(!role)return;
    setLoading(true);
    await apiCall('/api/profile','PATCH',{name:name.trim()||user.email.split('@')[0],role},token);
    onDone({name,role});
    setLoading(false);
  };

  return(
    <div className="gb" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div className="fi2" style={{background:'linear-gradient(160deg,var(--s2),var(--s3))',border:'1px solid var(--b2)',borderRadius:24,padding:'36px 28px',width:460,maxWidth:'100%',boxShadow:'0 40px 100px rgba(0,0,0,.7)'}}>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:14}}><ApexLogo sz={40} fsz={18} sub/></div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:6}}>خصّص تجربتك 🎯</h2>
          <p style={{fontSize:13,color:'var(--mu)',lineHeight:1.7}}>سيُكيّف Apex توصياته الذكية حسب دورك</p>
        </div>
        <div style={{marginBottom:18}}>
          <label style={{fontSize:11,color:'var(--tx2)',display:'block',marginBottom:6,fontFamily:"'JetBrains Mono',monospace"}}>USER_NAME</label>
          <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="اسمك..."/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:22}}>
          {Object.entries(ROLES).map(([k,r])=>(
            <div key={k} className={`role-card${role===k?' sel':''}`} onClick={()=>setRole(k)}>
              <div style={{fontSize:26,marginBottom:6}}>{r.i}</div>
              <p style={{fontSize:13,fontWeight:700,color:role===k?'var(--cy)':'var(--tx)',marginBottom:3}}>{r.l}</p>
              <p style={{fontSize:10,color:'var(--mu)',lineHeight:1.5}}>{r.desc}</p>
            </div>
          ))}
        </div>
        <button onClick={finish} disabled={!role||loading} className="bp" style={{width:'100%',padding:'13px',borderRadius:13,fontSize:14}}>
          {loading?<><span className="spin">↻</span> جاري...</>:"▲ ابدأ الإنتاجية"}
        </button>
      </div>
    </div>
  );
}

/* ─── TEAM MODAL ─── */
function TeamModal({profile,token,onClose,onChanged}){
  const [data,setData]=useState(null);
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState(null);
  const [code,setCode]=useState('');
  const [email,setEmail]=useState('');
  const [fresh,setFresh]=useState(null);
  const [copied,setCopied]=useState(null);

  const load=async()=>{
    const d=await apiCall('/api/team','GET',null,token);
    if(d.error){setErr(d.error);setData({kind:'none'});}else setData(d);
  };
  useEffect(()=>{load();},[]);

  const createInvite=async()=>{
    setBusy(true);setErr(null);
    const r=await apiCall('/api/invitations','POST',{email:email.trim()||undefined},token);
    if(r.error)setErr(r.error);else{setFresh(r);setEmail('');await load();}
    setBusy(false);
  };
  const revoke=async(id)=>{await apiCall(`/api/invitations?id=${id}`,'DELETE',null,token);if(fresh?.id===id)setFresh(null);load();};
  const removeMember=async(uid)=>{
    if(!window.confirm("إزالة هذا الموظف من الفريق؟"))return;
    await apiCall(`/api/team?user_id=${uid}`,'DELETE',null,token);
    await load();onChanged&&onChanged();
  };
  const leave=async()=>{
    if(!window.confirm("مغادرة الفريق؟ ستحتاج اشتراكاً خاصاً بك للاستمرار."))return;
    await apiCall('/api/team','DELETE',null,token);
    await load();onChanged&&onChanged();
  };
  const join=async()=>{
    if(!code.trim())return;
    setBusy(true);setErr(null);
    const r=await apiCall('/api/invitations/accept','POST',{code:code.trim()},token);
    if(r.error)setErr(r.error);else{setCode('');await load();onChanged&&onChanged();}
    setBusy(false);
  };
  const copy=(txt,key)=>{try{navigator.clipboard.writeText(txt);setCopied(key);setTimeout(()=>setCopied(null),1500);}catch(e){}};
  const link=(c)=>`${typeof window!=='undefined'?window.location.origin:''}/?invite=${c}`;

  const Box=({children})=>(<div style={{background:'var(--s1)',border:'1px solid var(--b)',borderRadius:12,padding:'12px 14px',marginBottom:12}}>{children}</div>);
  const Lbl=({children})=>(<p style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",marginBottom:8,letterSpacing:'.05em'}}>{children}</p>);

  const InviteList=({items,withLink})=>items.length>0&&(
    <Box>
      <Lbl>PENDING_INVITES</Lbl>
      {items.map(i=>(
        <div key={i.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid var(--b)'}}>
          <span className="mono" style={{fontSize:13,color:'var(--cy)',flex:1}} dir="ltr">{i.code}{i.email?` · ${i.email}`:''}</span>
          <button onClick={()=>copy(withLink?link(i.code):i.code,i.id)} className="ghost" style={{padding:'4px 10px',fontSize:11}}>{copied===i.id?"✓":"نسخ"}</button>
          <button onClick={()=>revoke(i.id)} style={{background:'none',border:'none',color:'var(--rd)',cursor:'pointer',fontSize:14}}>✕</button>
        </div>
      ))}
    </Box>
  );

  const InviteForm=({label,withLink})=>(
    <Box>
      <Lbl>NEW_INVITE</Lbl>
      <input className="inp" type="email" dir="ltr" value={email} onChange={e=>setEmail(e.target.value)} placeholder="إيميل المدعو (اختياري)" style={{marginBottom:8}}/>
      <button onClick={createInvite} disabled={busy} className="bp" style={{width:'100%',padding:'10px',borderRadius:11,fontSize:13}}>{busy?"...":label}</button>
      {fresh&&(
        <div style={{marginTop:10,textAlign:'center'}}>
          <p style={{fontSize:11,color:'var(--mu)',marginBottom:4}}>كود الدعوة (صالح 7 أيام)</p>
          <p className="mono" dir="ltr" style={{fontSize:20,color:'var(--cy)',fontWeight:700,letterSpacing:'.1em'}}>{fresh.code}</p>
          <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:8}}>
            <button onClick={()=>copy(fresh.code,'code')} className="ghost" style={{padding:'6px 12px',fontSize:12}}>{copied==='code'?"✓ تم":"نسخ الكود"}</button>
            {withLink&&<button onClick={()=>copy(link(fresh.code),'link')} className="ghost" style={{padding:'6px 12px',fontSize:12}}>{copied==='link'?"✓ تم":"نسخ الرابط"}</button>}
          </div>
        </div>
      )}
    </Box>
  );

  const JoinBox=({title,hint})=>(
    <Box>
      <Lbl>{title}</Lbl>
      <p style={{fontSize:12,color:'var(--tx2)',marginBottom:8,lineHeight:1.6}}>{hint}</p>
      <div style={{display:'flex',gap:8}}>
        <input className="inp" dir="ltr" value={code} onChange={e=>setCode(e.target.value)} placeholder="CODE" style={{flex:1}}/>
        <button onClick={join} disabled={busy||!code.trim()} className="bp" style={{padding:'0 18px',borderRadius:11,fontSize:13}}>انضم</button>
      </div>
    </Box>
  );

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(2,5,9,.88)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(8px)'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fi2" style={{background:'var(--s2)',border:'1px solid var(--b2)',borderRadius:22,padding:24,width:480,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 40px 100px rgba(0,0,0,.8)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
          <div>
            <h3 style={{fontSize:16,fontWeight:800}}>👥 {data?.kind==='owner'?"شركتي":"فريقي"}</h3>
            <p style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{data?.kind==='manager'&&data.team?data.team.name:data?.kind==='owner'&&data.org?data.org.name:'team.manage()'}</p>
          </div>
          <button onClick={onClose} className="ghost" style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>✕</button>
        </div>

        {!data&&<p style={{textAlign:'center',color:'var(--mu)',padding:24}}><span className="spin">↻</span></p>}
        {err&&<div style={{fontSize:12,color:'var(--rd)',background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.15)',borderRadius:10,padding:'10px 13px',marginBottom:12}}>{err}</div>}

        {/* ── مدير ── */}
        {data?.kind==='manager'&&(<>
          <Box>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <Lbl>SEATS</Lbl>
              <span className="mono" style={{fontSize:13,color:data.members.length>=data.capacity?'var(--am)':'var(--cy)'}}>{data.members.length} / {data.capacity}</span>
            </div>
            <div style={{height:6,background:'var(--b)',borderRadius:4,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${data.capacity?Math.min(100,data.members.length/data.capacity*100):0}%`,background:'linear-gradient(90deg,var(--cy),var(--cy2))'}}/>
            </div>
          </Box>
          <Box>
            <Lbl>MEMBERS</Lbl>
            {data.members.length===0&&<p style={{fontSize:12,color:'var(--mu)'}}>لا يوجد موظفين بعد. أنشئ دعوة وشاركها معهم.</p>}
            {data.members.map(m=>(
              <div key={m.user_id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'1px solid var(--b)'}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700}}>{m.name||m.email}</p>
                  <p style={{fontSize:10,color:'var(--mu)'}} dir="ltr">{m.email}</p>
                </div>
                <button onClick={()=>removeMember(m.user_id)} style={{background:'none',border:'none',color:'var(--rd)',cursor:'pointer',fontSize:14}}>✕</button>
              </div>
            ))}
          </Box>
          <InviteForm label="➕ إنشاء دعوة موظف" withLink/>
          <InviteList items={data.invitations||[]} withLink/>
          {!data.team?.in_org&&<JoinBox title="LINK_TO_COMPANY" hint="إذا صاحب العمل أعطاك كود دعوة، أدخله لربط فريقك بالشركة."/>}
        </>)}

        {/* ── صاحب عمل ── */}
        {data?.kind==='owner'&&(<>
          <Box>
            <Lbl>MANAGERS</Lbl>
            {data.teams.length===0&&<p style={{fontSize:12,color:'var(--mu)'}}>لا يوجد مدراء بعد. أنشئ دعوة وأعطها للمدير.</p>}
            {data.teams.map(t=>(
              <div key={t.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'1px solid var(--b)'}}>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:13,fontWeight:700}}>{t.manager_name||t.manager_email}</p>
                  <p style={{fontSize:10,color:'var(--mu)'}} dir="ltr">{t.manager_email}</p>
                </div>
                <span className="mono" style={{fontSize:12,color:'var(--cy)'}}>👥 {t.members}</span>
              </div>
            ))}
          </Box>
          <InviteForm label="➕ إنشاء دعوة مدير"/>
          <InviteList items={data.invitations||[]}/>
        </>)}

        {/* ── موظف ── */}
        {data?.kind==='employee'&&(data.team?(
          <Box>
            <Lbl>TEAM</Lbl>
            <p style={{fontSize:14,fontWeight:700,marginBottom:2}}>{data.team.name}</p>
            <p style={{fontSize:12,color:'var(--tx2)',marginBottom:12}}>المدير: {data.team.manager_name||'—'} · اشتراكك مغطّى من المدير</p>
            <button onClick={leave} className="ghost" style={{padding:'8px 14px',fontSize:12,color:'var(--rd)'}}>مغادرة الفريق</button>
          </Box>
        ):(
          <JoinBox title="JOIN_TEAM" hint="أدخل كود الدعوة اللي أعطاك إياه مديرك للانضمام لفريقه."/>
        ))}

        {data?.kind==='none'&&!err&&<p style={{fontSize:12,color:'var(--mu)',textAlign:'center'}}>الحساب الشخصي لا يحتاج فريقاً.</p>}
      </div>
    </div>
  );
}

/* ─── SUBSCRIPTION MODAL ─── */
const ACCT_AR={personal:"شخصي",employee:"موظف",manager:"مدير",owner:"صاحب عمل"};
function SubscriptionModal({profile,token,onClose,onChanged}){
  const [plans,setPlans]=useState(null);
  const [mine,setMine]=useState([]);
  const [months,setMonths]=useState(3);
  const [extra,setExtra]=useState(0);
  const [method,setMethod]=useState('sham_cash');
  const [ref,setRef]=useState('');
  const [notes,setNotes]=useState('');
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState(null);
  const [done,setDone]=useState(false);
  const [copied,setCopied]=useState(false);

  const type=profile.account_type;
  const canExtra=type==='manager'||type==='owner';
  const maxExtra=type==='manager'?20:10;
  const sub=profile.subscription;

  useEffect(()=>{(async()=>{
    const [p,r]=await Promise.all([
      apiCall('/api/plans','GET',null,null),
      apiCall('/api/payment/request','GET',null,token),
    ]);
    if(p.plans)setPlans(p);else setErr(p.error||'تعذّر تحميل الخطط');
    if(Array.isArray(r))setMine(r);
  })();},[]);

  const plan=plans?.plans?.find(x=>x.account_type===type);
  const offer=plans?.offer||{months:3,paidMonths:2};
  const memberCount=type==='manager'?(profile.team?.members?.length||0):0;
  const minExtra=plan?Math.max(0,memberCount-plan.included_members):0;

  useEffect(()=>{if(plan&&canExtra)setExtra(Math.max(sub?.extra_members||0,minExtra));},[plans]);

  const perMonth=plan?Number(plan.price_usd)+extra*Number(plan.extra_member_price_usd):0;
  const paid=months===offer.months?offer.paidMonths:months;
  const total=Math.round(perMonth*paid*100)/100;
  const saving=Math.round(perMonth*(months-paid)*100)/100;
  const pending=mine.find(x=>x.status==='pending');
  const lastRejected=!pending&&mine[0]?.status==='rejected'?mine[0]:null;
  const account=plans?.payment_accounts?.[method];

  const fmt=d=>new Date(d).toLocaleDateString('en-GB');
  const now=Date.now();
  const statusLine=sub?.status==='active'&&sub.current_period_end&&new Date(sub.current_period_end)>now
    ?`✅ اشتراكك فعّال حتى ${fmt(sub.current_period_end)}`
    :sub?.status==='trial'&&sub.trial_ends_at&&new Date(sub.trial_ends_at)>now
      ?`🎁 تجربة مجانية حتى ${fmt(sub.trial_ends_at)}`
      :"⏳ اشتراكك منتهي";

  const submit=async()=>{
    setBusy(true);setErr(null);
    const r=await apiCall('/api/payment/request','POST',{months,extra_members:extra,method,reference:ref,notes},token);
    if(r.error)setErr(r.error);
    else{
      setDone(true);
      const l=await apiCall('/api/payment/request','GET',null,token);
      if(Array.isArray(l))setMine(l);
      onChanged&&onChanged();
    }
    setBusy(false);
  };
  const copy=txt=>{try{navigator.clipboard.writeText(txt);setCopied(true);setTimeout(()=>setCopied(false),1500);}catch(e){}};

  const Box=({children})=>(<div style={{background:'var(--s1)',border:'1px solid var(--b)',borderRadius:12,padding:'12px 14px',marginBottom:12}}>{children}</div>);
  const Lbl=({children})=>(<p style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",marginBottom:8,letterSpacing:'.05em'}}>{children}</p>);
  const Opt=({on,onClick,children,badge})=>(
    <button onClick={onClick} style={{flex:1,padding:'10px 8px',borderRadius:11,cursor:'pointer',fontSize:13,fontWeight:700,position:'relative',
      background:on?'rgba(var(--cy-rgb),.1)':'var(--s2)',border:`1px solid ${on?'var(--cy)':'var(--b)'}`,color:on?'var(--cy)':'var(--tx2)'}}>
      {children}
      {badge&&<span style={{position:'absolute',top:-8,left:8,background:'var(--gr)',color:'#000',fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:10}}>{badge}</span>}
    </button>
  );

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(2,5,9,.88)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(8px)'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fi2" style={{background:'var(--s2)',border:'1px solid var(--b2)',borderRadius:22,padding:24,width:480,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 40px 100px rgba(0,0,0,.8)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
          <div>
            <h3 style={{fontSize:16,fontWeight:800}}>💳 الاشتراك</h3>
            <p style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>{ACCT_AR[type]||type}</p>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--mu)',fontSize:18,cursor:'pointer'}}>✕</button>
        </div>

        <Box><p style={{fontSize:13,fontWeight:700}}>{statusLine}</p></Box>
        {err&&<p style={{fontSize:12,color:'var(--rd)',marginBottom:12}}>⚠️ {err}</p>}
        {!plans&&!err&&<p style={{fontSize:13,color:'var(--mu)',textAlign:'center',padding:20}}>جاري التحميل...</p>}

        {(pending||done)&&(
          <Box>
            <p style={{fontSize:14,fontWeight:700,marginBottom:6}}>⏳ طلبك قيد المراجعة</p>
            <p style={{fontSize:12,color:'var(--tx2)',lineHeight:1.7}}>سنتحقق من الدفع ونفعّل اشتراكك خلال 24 ساعة.{pending?` المبلغ: $${pending.amount} · ${pending.months} شهر`:''}</p>
          </Box>
        )}

        {lastRejected&&(
          <Box><p style={{fontSize:12,color:'var(--rd)',lineHeight:1.7}}>❌ تم رفض آخر طلب{lastRejected.admin_note?`: ${lastRejected.admin_note}`:''}. يمكنك إرسال طلب جديد.</p></Box>
        )}

        {plan&&!pending&&!done&&(
          <>
            <Box>
              <Lbl>PLAN</Lbl>
              <p style={{fontSize:15,fontWeight:800,marginBottom:4}}>{ACCT_AR[type]} · ${Number(plan.price_usd)}<span style={{fontSize:11,fontWeight:400,color:'var(--mu)'}}> / شهر</span></p>
              <p style={{fontSize:12,color:'var(--tx2)',lineHeight:1.7}}>
                {plan.daily_ai_limit} طلب ذكاء اصطناعي يومياً
                {type==='manager'?` · يشمل ${plan.included_members} موظفين`:''}
                {type==='owner'?` · يشمل ${plan.included_members} مديرين`:''}
              </p>
            </Box>

            {canExtra&&(
              <Box>
                <Lbl>{type==='manager'?'EXTRA_SEATS':'EXTRA_MANAGERS'}</Lbl>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <button className="ghost" onClick={()=>setExtra(Math.max(minExtra,extra-1))} style={{width:36,height:36,borderRadius:10,fontSize:18}}>−</button>
                  <span className="mono" style={{fontSize:18,fontWeight:800,minWidth:28,textAlign:'center'}}>{extra}</span>
                  <button className="ghost" onClick={()=>setExtra(Math.min(maxExtra,extra+1))} style={{width:36,height:36,borderRadius:10,fontSize:18}}>+</button>
                  <p style={{fontSize:12,color:'var(--tx2)',flex:1}}>{type==='manager'?'مقعد موظف إضافي':'مدير إضافي'} · ${Number(plan.extra_member_price_usd)} / شهر لكل واحد</p>
                </div>
              </Box>
            )}

            <Box>
              <Lbl>PERIOD</Lbl>
              <div style={{display:'flex',gap:8}}>
                <Opt on={months===1} onClick={()=>setMonths(1)}>شهر</Opt>
                <Opt on={months===offer.months} onClick={()=>setMonths(offer.months)} badge={`ادفع ${offer.paidMonths} وخذ ${offer.months}`}>{offer.months} أشهر</Opt>
              </div>
              <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginTop:14}}>
                <span style={{fontSize:12,color:'var(--tx2)'}}>المبلغ المطلوب</span>
                <span className="mono" style={{fontSize:22,fontWeight:800,color:'var(--cy)'}}>${total}</span>
              </div>
              {saving>0&&<p style={{fontSize:11,color:'var(--gr)',marginTop:4,textAlign:'left'}} dir="ltr">وفّرت ${saving}</p>}
            </Box>

            <Box>
              <Lbl>PAYMENT_METHOD</Lbl>
              <div style={{display:'flex',gap:8,marginBottom:12}}>
                <Opt on={method==='sham_cash'} onClick={()=>setMethod('sham_cash')}>Sham Cash</Opt>
                <Opt on={method==='bimera'} onClick={()=>setMethod('bimera')}>بايميرا</Opt>
              </div>
              <p style={{fontSize:12,color:'var(--tx2)',lineHeight:1.7,marginBottom:8}}>
                حوّل ${total} إلى حساب {method==='sham_cash'?'Sham Cash':'بايميرا'} التالي، ثم أدخل رقم العملية:
              </p>
              {account?(
                <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--s2)',borderRadius:10,padding:'9px 12px',marginBottom:12}}>
                  <span className="mono" dir="ltr" style={{fontSize:13,color:'var(--cy)',flex:1,wordBreak:'break-all'}}>{account}</span>
                  <button onClick={()=>copy(account)} className="ghost" style={{padding:'4px 10px',fontSize:11}}>{copied?"✓":"نسخ"}</button>
                </div>
              ):(
                <p style={{fontSize:12,color:'var(--am)',marginBottom:12}}>حساب الدفع غير محدد بعد، تواصل مع الدعم.</p>
              )}
              <input className="inp" dir="ltr" value={ref} onChange={e=>setRef(e.target.value)} placeholder="رقم العملية / المرجع" style={{marginBottom:8}}/>
              <input className="inp" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="ملاحظات (اختياري)"/>
            </Box>

            <button onClick={submit} disabled={busy||ref.trim().length<4} className="bp" style={{width:'100%',padding:'13px',borderRadius:13,fontSize:14}}>
              {busy?<><span className="spin">↻</span> جاري الإرسال...</>:`إرسال طلب الاشتراك · $${total}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── SWIPEABLE TASK CARD ─── */
function SwipeCard({t,onToggle,onDel,onDelay}){
  const [dx,setDx]=useState(0);
  const startRef=useRef(null);
  const activeRef=useRef(false);
  const T=78,MAX=115;
  const pr=PM[t.priority]||PM.medium,cm=CM[t.cat]||CM["عام"],done=t.status==="done";
  const onTS=e=>{startRef.current={x:e.touches[0].clientX,y:e.touches[0].clientY};activeRef.current=false;};
  const onTM=e=>{
    if(!startRef.current)return;
    const ddx=e.touches[0].clientX-startRef.current.x,ddy=e.touches[0].clientY-startRef.current.y;
    if(!activeRef.current&&Math.abs(ddx)>Math.abs(ddy)&&Math.abs(ddx)>8){activeRef.current=true;}
    if(activeRef.current){e.preventDefault();setDx(Math.max(-MAX,Math.min(MAX,ddx)));}
  };
  const onTE=()=>{if(dx>T)onToggle(t.id);else if(dx<-T)onDel(t.id);setDx(0);startRef.current=null;activeRef.current=false;};
  const ca=Math.min(1,Math.max(0,dx/T)),da=Math.min(1,Math.max(0,-dx/T));
  return(
    <div style={{position:'relative',marginBottom:10,borderRadius:14,overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,background:`rgba(16,185,129,${ca*.2})`,display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:22,borderRadius:14}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,opacity:ca}}><span style={{fontSize:24,color:'var(--gr)'}}>✓</span><span style={{fontSize:10,color:'var(--gr)',fontWeight:700}}>إكمال</span></div>
      </div>
      <div style={{position:'absolute',inset:0,background:`rgba(239,68,68,${da*.2})`,display:'flex',alignItems:'center',justifyContent:'flex-start',paddingLeft:22,borderRadius:14}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,opacity:da}}><span style={{fontSize:24,color:'var(--rd)'}}>🗑</span><span style={{fontSize:10,color:'var(--rd)',fontWeight:700}}>حذف</span></div>
      </div>
      <div onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
        style={{transform:`translateX(${dx}px)`,transition:dx===0?'transform .3s ease':'none',background:'linear-gradient(135deg,var(--s2),var(--s3))',border:`1px solid var(--b)`,borderRight:`3px solid ${done?"var(--mu)":pr.c}`,borderRadius:14,padding:'14px 16px',opacity:done?.55:1}}>
        <div style={{display:'flex',gap:11,alignItems:'flex-start'}}>
          <button onClick={()=>onToggle(t.id)} style={{width:22,height:22,borderRadius:'50%',flexShrink:0,marginTop:1,border:`2px solid ${done?"var(--gr)":"var(--mu)"}`,background:done?"var(--gr)":"transparent",color:done?"#000":"transparent",fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .15s'}}>✓</button>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:14,fontWeight:600,color:done?"var(--mu)":"var(--tx)",textDecoration:done?"line-through":"none",lineHeight:1.55,marginBottom:7}}>{t.title}</p>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
              <span style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:cm.c+"15",color:cm.c,border:`1px solid ${cm.c}22`}}>{cm.i} {t.cat}</span>
              <span style={{fontSize:11,color:'var(--tx2)',fontFamily:"'JetBrains Mono',monospace"}}>⏰ {t.due}</span>
              <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:pr.c+"12",color:pr.c,border:`1px solid ${pr.c}20`,fontFamily:"'JetBrains Mono',monospace"}}>{pr.d}</span>
              {t.suggested&&<span style={{fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:20,background:'rgba(var(--cy-rgb),.07)',color:'var(--cy)',border:'1px solid rgba(var(--cy-rgb),.18)'}}>✦ AI</span>}
            </div>
          </div>
          {!done&&<button onClick={()=>onDelay(t.id)} style={{background:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.15)',color:'#f59e0b',borderRadius:9,width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,cursor:'pointer',flexShrink:0}}>⏰</button>}
        </div>
      </div>
    </div>
  );
}

/* ─── ADD MODAL ─── */
function AddModal({onAdd,onClose}){
  const [f,setF]=useState({title:'',priority:'medium',status:'today',due:'اليوم',cat:'عام'});
  const u=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(2,5,9,.88)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(7px)'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fi2" style={{background:'linear-gradient(135deg,var(--s2),var(--s3))',border:'1px solid var(--b2)',borderRadius:20,padding:26,width:500,maxWidth:'94vw',boxShadow:'0 30px 80px rgba(0,0,0,.7)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div><h3 style={{fontSize:15,fontWeight:800}}>+ مهمة جديدة</h3><p style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>task.create()</p></div>
          <button onClick={onClose} className="ghost" style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>✕</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <input className="inp" value={f.title} onChange={u('title')} placeholder="عنوان المهمة..." autoFocus/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <select value={f.priority} onChange={u('priority')} style={{borderRadius:10,padding:'10px 13px',fontSize:13,width:'100%'}}>
              <option value="high">●●● عالية</option><option value="medium">●●○ متوسطة</option><option value="low">●○○ منخفضة</option>
            </select>
            <select value={f.status} onChange={u('status')} style={{borderRadius:10,padding:'10px 13px',fontSize:13,width:'100%'}}>
              <option value="today">☀️ اليوم</option><option value="upcoming">📅 قادمة</option>
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <input className="inp" value={f.due} onChange={u('due')} placeholder="الموعد..."/>
            <select value={f.cat} onChange={u('cat')} style={{borderRadius:10,padding:'10px 13px',fontSize:13,width:'100%'}}>
              {Object.entries(CM).map(([k,v])=><option key={k} value={k}>{v.i} {k}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:20}}>
          <button onClick={()=>{if(f.title.trim())onAdd(f);}} disabled={!f.title.trim()} className="bp" style={{flex:1,padding:'12px',borderRadius:12,fontSize:14}}>✓ إضافة</button>
          <button onClick={onClose} className="ghost" style={{padding:'12px 20px'}}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

/* ─── FOCUS MODAL ─── */
function FocusModal({tasks,profile,token,onClose}){
  const [st,setSt]=useState({loading:true,title:null,reason:null,tips:[],taskId:null});
  useEffect(()=>{
    (async()=>{
      const today=tasks.filter(t=>t.status==="today");
      if(!today.length){setSt({loading:false,title:null,reason:"لا توجد مهام لليوم! أضف مهاماً أولاً.",tips:[]});return;}
      try{
        const res=await apiCall('/api/chat','POST',{
          model:"claude-sonnet-4-20250514",max_tokens:400,
          system:`أنت مستشار إنتاجية خبير. أعد JSON فقط: {"taskId":<id>,"title":"...","reason":"سبب قصير ومقنع","tips":["نصيحة 1","نصيحة 2"]}`,
          messages:[{role:"user",content:`${ROLES[profile?.role]?.ai||""}\nالمستخدم: ${profile?.name}\nمهام اليوم:\n${JSON.stringify(today)}\n\nما أهم مهمة يجب التركيز عليها الآن ولماذا؟`}]
        },token);
        const raw=res.content?.map(b=>b.text||"").join("")||"{}";
        const r=JSON.parse(raw.replace(/```json\n?|```/g,"").trim());
        setSt({loading:false,...r});
      }catch{setSt({loading:false,title:null,reason:"حدث خطأ في التحليل.",tips:[]});}
    })();
  },[]);
  const focusTask=tasks.find(t=>t.id===st.taskId);
  const cm=CM[focusTask?.cat]||CM["عام"];
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(2,5,9,.9)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(8px)'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fi2" style={{background:'linear-gradient(160deg,var(--s2),var(--s3))',border:'1px solid var(--b2)',borderRadius:22,padding:28,width:460,maxWidth:'100%',boxShadow:'0 40px 100px rgba(0,0,0,.8)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:10,background:'rgba(var(--cy-rgb),.1)',border:'1px solid rgba(var(--cy-rgb),.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🎯</div>
            <div><h3 style={{fontSize:15,fontWeight:800}}>وضع التركيز</h3><p style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace"}}>focus.analyze()</p></div>
          </div>
          <button onClick={onClose} className="ghost" style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>✕</button>
        </div>
        {st.loading?(
          <div style={{textAlign:'center',padding:'30px 0'}}><span className="spin" style={{fontSize:28,color:'var(--cy)',display:'block',marginBottom:14}}>↻</span><p style={{fontSize:13,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace"}}>تحليل المهام...</p></div>
        ):st.title?(
          <>
            <div style={{background:'rgba(var(--cy-rgb),.05)',border:'1px solid rgba(var(--cy-rgb),.15)',borderRadius:16,padding:'18px 20px',marginBottom:18}}>
              <p style={{fontSize:11,color:'var(--cy)',fontWeight:700,marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>ركّز الآن على</p>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <span style={{fontSize:22}}>{cm.i}</span><p style={{fontSize:16,fontWeight:800,color:'var(--tx)',lineHeight:1.45,flex:1}}>{st.title}</p>
              </div>
              <div style={{background:'rgba(0,0,0,.2)',borderRadius:10,padding:'10px 14px'}}><p style={{fontSize:13,color:'var(--tx2)',lineHeight:1.65}}>💡 {st.reason}</p></div>
            </div>
            {st.tips?.length>0&&<div style={{marginBottom:20}}>
              <p style={{fontSize:11,color:'var(--mu)',fontWeight:700,marginBottom:10,fontFamily:"'JetBrains Mono',monospace"}}>TIPS</p>
              {st.tips.map((tip,i)=>(
                <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',marginBottom:8}}>
                  <span style={{width:18,height:18,borderRadius:'50%',background:'rgba(var(--cy-rgb),.12)',color:'var(--cy)',fontSize:9,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>{i+1}</span>
                  <p style={{fontSize:12,color:'var(--tx2)',lineHeight:1.6}}>{tip}</p>
                </div>
              ))}
            </div>}
            <button onClick={onClose} className="bp" style={{width:'100%',padding:'12px',borderRadius:13,fontSize:14}}>▲ ابدأ الآن</button>
          </>
        ):(
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <p style={{fontSize:14,color:'var(--tx2)',lineHeight:1.65}}>{st.reason}</p>
            <button onClick={onClose} className="ghost" style={{marginTop:16,padding:'10px 24px'}}>إغلاق</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ANALYTICS ─── */
function Analytics({tasks}){
  const total=Math.max(tasks.length,1),done=tasks.filter(t=>t.status==="done").length,rate=Math.round((done/total)*100);
  const cats=Object.entries(CM).map(([n,m])=>({n,m,v:tasks.filter(t=>t.cat===n).length})).filter(d=>d.v>0).sort((a,b)=>b.v-a.v);
  const pris=[["high","عالية","#ef4444"],["medium","متوسطة","#f59e0b"],["low","منخفضة","#3D9BF0"]].map(([k,l,c])=>({l,c,v:tasks.filter(t=>t.priority===k).length}));
  return(
    <div className="fi">
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
        {[{l:"إجمالي",v:tasks.length,c:"var(--cy)",i:"▲"},{l:"مكتمل",v:`${rate}%`,c:"var(--gr)",i:"◆"},{l:"اليوم",v:tasks.filter(t=>t.status==="today").length,c:"var(--am)",i:"◉"}].map((s,i)=>(
          <div key={i} style={{background:'linear-gradient(135deg,var(--s2),var(--s3))',border:'1px solid var(--b)',borderRadius:13,padding:'16px 10px',textAlign:'center'}}>
            <div style={{fontSize:13,color:s.c,fontFamily:"'JetBrains Mono',monospace",marginBottom:5,opacity:.7}}>{s.i}</div>
            <div style={{fontSize:26,fontWeight:900,color:s.c,fontFamily:"'JetBrains Mono',monospace"}}>{s.v}</div>
            <div style={{fontSize:10,color:'var(--mu)',marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div style={{background:'linear-gradient(135deg,var(--s2),var(--s3))',border:'1px solid var(--b)',borderRadius:13,padding:18}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:14}}><span style={{width:2,height:14,borderRadius:2,background:'var(--cy)',flexShrink:0}}/><h3 style={{fontSize:13,fontWeight:700}}>الفئات</h3></div>
          {cats.length===0?<p style={{fontSize:12,color:'var(--mu)'}}>لا توجد مهام</p>:cats.slice(0,6).map(d=>(
            <div key={d.n} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:11,color:'var(--tx2)'}}>{d.m.i} {d.n}</span><span style={{fontSize:11,color:d.m.c,fontWeight:700}}>{d.v}</span></div>
              <div style={{background:'var(--b)',borderRadius:4,height:4,overflow:'hidden'}}><div style={{width:`${(d.v/total)*100}%`,height:'100%',background:d.m.c,borderRadius:4,transition:'width .7s ease'}}/></div>
            </div>
          ))}
        </div>
        <div style={{background:'linear-gradient(135deg,var(--s2),var(--s3))',border:'1px solid var(--b)',borderRadius:13,padding:18}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:14}}><span style={{width:2,height:14,borderRadius:2,background:'var(--gr)',flexShrink:0}}/><h3 style={{fontSize:13,fontWeight:700}}>الإنجاز</h3></div>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
            <div style={{position:'relative',flexShrink:0}}>
              <Ring pct={rate} size={82} stroke={7} color="var(--gr)"/>
              <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:16,fontWeight:900,color:'var(--gr)',fontFamily:"'JetBrains Mono',monospace"}}>{rate}%</span></div>
            </div>
            <div><p style={{fontSize:12,fontWeight:700,marginBottom:3}}>{rate>=70?"ممتاز 🔥":rate>=40?"جيد 💪":"واصل 📈"}</p><p style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace"}}>{done}/{tasks.length} done</p></div>
          </div>
          {pris.map(p=>(
            <div key={p.l} style={{display:'flex',alignItems:'center',gap:7,marginBottom:7}}>
              <span style={{fontSize:10,color:'var(--tx2)',minWidth:50}}>{p.l}</span>
              <div style={{flex:1,background:'var(--b)',borderRadius:3,height:4,overflow:'hidden'}}><div style={{width:`${(p.v/total)*100}%`,height:'100%',background:p.c,borderRadius:3,transition:'width .65s'}}/></div>
              <span style={{fontSize:10,color:p.c,fontWeight:700,minWidth:14,fontFamily:"'JetBrains Mono',monospace"}}>{p.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SETTINGS MODAL ─── */
function SettingsModal({profile,theme,token,onSave,onClose}){
  const [name,setName]=useState(profile?.name||"");
  const [role,setRole]=useState(profile?.role||"personal");
  const [th,setTh]=useState(theme);
  const [focus,setFocus]=useState(profile?.focus_dur||25);
  const [aiStyle,setAiStyle]=useState(profile?.ai_style||"balanced");
  const [loading,setLoading]=useState(false);

  const save=async()=>{
    setLoading(true);
    await apiCall('/api/profile','PATCH',{name:name.trim(),role,focus_dur:focus,ai_style:aiStyle,theme:th},token);
    if(typeof window!=='undefined')localStorage.setItem('apex_theme',th);
    onSave({name:name.trim(),role,focus_dur:focus,ai_style:aiStyle,theme:th});
    setLoading(false);
  };

  const Row=({label,children})=>(
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--b)'}}>
      <span style={{fontSize:13,color:'var(--tx2)'}}>{label}</span>{children}
    </div>
  );

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(2,5,9,.88)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(8px)'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="fi2" style={{background:'var(--s2)',border:'1px solid var(--b2)',borderRadius:22,padding:28,width:480,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 40px 100px rgba(0,0,0,.8)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
          <div><h3 style={{fontSize:16,fontWeight:800}}>⚙️ الإعدادات</h3><p style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>settings.configure()</p></div>
          <button onClick={onClose} className="ghost" style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',padding:0}}>✕</button>
        </div>
        {/* APPEARANCE */}
        <div style={{marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:12}}><span style={{width:2,height:14,borderRadius:2,background:'var(--cy)',flexShrink:0}}/><p style={{fontSize:11,fontWeight:700,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em'}}>APPEARANCE</p></div>
          <Row label="وضع العرض">
            <div style={{display:'flex',gap:6}}>
              {[{k:"dark",l:"🌙 داكن"},{k:"light",l:"☀️ فاتح"}].map(t=>(
                <button key={t.k} onClick={()=>setTh(t.k)} style={{padding:'6px 14px',borderRadius:9,border:`1.5px solid ${th===t.k?"var(--cy)":"var(--b)"}`,background:th===t.k?"rgba(var(--cy-rgb),.1)":"transparent",color:th===t.k?"var(--cy)":"var(--tx2)",fontSize:12,fontWeight:th===t.k?700:400,cursor:'pointer',fontFamily:"'Sora','IBM Plex Sans Arabic',sans-serif",transition:'all .15s'}}>{t.l}</button>
              ))}
            </div>
          </Row>
        </div>
        {/* PROFILE */}
        <div style={{marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:12}}><span style={{width:2,height:14,borderRadius:2,background:'var(--am)',flexShrink:0}}/><p style={{fontSize:11,fontWeight:700,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em'}}>PROFILE</p></div>
          <div style={{marginBottom:12}}><label style={{fontSize:11,color:'var(--tx2)',display:'block',marginBottom:6,fontFamily:"'JetBrains Mono',monospace"}}>USER_NAME</label><input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="اسمك..."/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            {Object.entries(ROLES).map(([k,r])=>(
              <div key={k} onClick={()=>setRole(k)} style={{border:`2px solid ${role===k?"var(--cy)":"var(--b)"}`,borderRadius:12,padding:'10px',cursor:'pointer',background:role===k?"rgba(var(--cy-rgb),.07)":"var(--s1)",transition:'all .15s',textAlign:'center'}}>
                <div style={{fontSize:20,marginBottom:3}}>{r.i}</div>
                <p style={{fontSize:12,fontWeight:700,color:role===k?"var(--cy)":"var(--tx)"}}>{r.l}</p>
              </div>
            ))}
          </div>
        </div>
        {/* FOCUS */}
        <div style={{marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:12}}><span style={{width:2,height:14,borderRadius:2,background:'var(--gr)',flexShrink:0}}/><p style={{fontSize:11,fontWeight:700,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em'}}>FOCUS SESSION</p></div>
          <Row label="مدة جلسة التركيز">
            <div style={{display:'flex',gap:6}}>
              {[15,25,45].map(m=>(
                <button key={m} onClick={()=>setFocus(m)} style={{width:44,height:32,borderRadius:9,border:`1.5px solid ${focus===m?"var(--cy)":"var(--b)"}`,background:focus===m?"rgba(var(--cy-rgb),.1)":"transparent",color:focus===m?"var(--cy)":"var(--tx2)",fontSize:12,fontWeight:focus===m?700:400,cursor:'pointer',fontFamily:"'JetBrains Mono',monospace",transition:'all .15s'}}>{m}′</button>
              ))}
            </div>
          </Row>
        </div>
        {/* AI */}
        <div style={{marginBottom:22}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:12}}><span style={{width:2,height:14,borderRadius:2,background:'var(--pu,#7c3aed)',flexShrink:0}}/><p style={{fontSize:11,fontWeight:700,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em'}}>AI BEHAVIOR</p></div>
          <Row label="أسلوب المساعد">
            <select value={aiStyle} onChange={e=>setAiStyle(e.target.value)} style={{borderRadius:9,padding:'6px 12px',fontSize:12,border:'1px solid var(--b)',fontFamily:"'Sora','IBM Plex Sans Arabic',sans-serif"}}>
              <option value="balanced">⚖️ متوازن</option>
              <option value="coach">💪 محفّز</option>
              <option value="direct">⚡ مباشر</option>
              <option value="analytical">📊 تحليلي</option>
            </select>
          </Row>
        </div>
        <button onClick={save} disabled={loading} className="bp" style={{width:'100%',padding:'13px',borderRadius:13,fontSize:14}}>
          {loading?<><span className="spin">↻</span> جاري الحفظ...</>:"✓ حفظ الإعدادات"}
        </button>
      </div>
    </div>
  );
}

/* ─── UNDO TOAST ─── */
function UndoToast({item,onUndo,onDismiss}){
  useEffect(()=>{const t=setTimeout(onDismiss,5000);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:'fixed',bottom:130,left:'50%',transform:'translateX(-50%)',zIndex:300,animation:'toastIn .25s ease forwards',whiteSpace:'nowrap'}}>
      <div style={{background:'var(--s2)',border:'1px solid var(--b2)',borderRadius:14,padding:'11px 18px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 12px 40px rgba(0,0,0,.6)'}}>
        <span style={{fontSize:13,color:'var(--tx2)'}}>{item.action==="delete"?"🗑 تم الحذف":"✅ تم الإكمال"}</span>
        <button onClick={onUndo} style={{background:'rgba(var(--cy-rgb),.1)',border:'1px solid rgba(var(--cy-rgb),.25)',color:'var(--cy)',borderRadius:8,padding:'4px 12px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'Sora','IBM Plex Sans Arabic',sans-serif"}}>↩ تراجع</button>
        <button onClick={onDismiss} style={{background:'none',border:'none',color:'var(--mu)',cursor:'pointer',fontSize:13}}>✕</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════ */
export default function App(){
  const [scr,setScr]=useState("loading"); // loading|auth|onboard|app
  const [session,setSession]=useState(null);
  const [profile,setProfile]=useState(null);
  const [tasks,setTasks]=useState([]);
  const [view,setView]=useState("today");
  const [sideOpen,setSide]=useState(false);
  const [theme,setTheme]=useState("dark");
  const [cmd,setCmd]=useState("");
  const [listen,setListen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState(null);
  const [addOpen,setAdd]=useState(false);
  const [focusOpen,setFocus]=useState(false);
  const [settingsOpen,setSettings]=useState(false);
  const [teamOpen,setTeam]=useState(false);
  const [subOpen,setSub]=useState(false);
  const [undo,setUndo]=useState(null);
  const [search,setSrch]=useState("");
  const [tasksLoading,setTL]=useState(false);
  const recRef=useRef(null);
  const token=session?.access_token;

  /* ── Boot ── */
  useEffect(()=>{
    // Load theme
    if(typeof window!=='undefined'){
      const t=localStorage.getItem('apex_theme');
      if(t)setTheme(t);
    }
    // Check Supabase session
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session){setSession(session);loadProfile(session);}
      else setScr("auth");
    });
    // Listen for auth changes
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(session){setSession(session);}
      else{setSession(null);setProfile(null);setTasks([]);setScr("auth");}
    });
    return()=>subscription.unsubscribe();
  },[]);

  /* ── Speech ── */
  useEffect(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(SR){const r=new SR();r.lang="ar-SA";r.continuous=false;r.onresult=e=>{setCmd(e.results[0][0].transcript);setListen(false);};r.onend=()=>setListen(false);recRef.current=r;}
  },[]);

  useEffect(()=>{const fn=e=>{if(e.key==="Escape"){setSide(false);setFocus(false);setAdd(false);setSettings(false);}};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn);},[]);

  /* ── Load profile & tasks ── */
  const loadProfile=async(sess)=>{
    const tok=sess?.access_token||token;
    // دعوة محفوظة من وقت التسجيل (قبل تأكيد الإيميل)؟ اقبلها الآن
    if(typeof window!=='undefined'){
      const inv=localStorage.getItem('apex_invite');
      if(inv){
        localStorage.removeItem('apex_invite');
        const r=await apiCall('/api/invitations/accept','POST',{code:inv},tok);
        setMsg(r.error?`⚠️ ${r.error}`:"✅ انضممت للفريق بنجاح");
      }
    }
    const p=await apiCall('/api/profile','GET',null,tok);
    if(p.id){
      setProfile(p);
      if(p.theme)setTheme(p.theme);
      setScr("app");loadTasks(tok);
    }else{setScr("onboard");}
  };

  const loadTasks=async(tok=token)=>{
    setTL(true);
    const data=await apiCall('/api/tasks','GET',null,tok);
    if(Array.isArray(data))setTasks(data);
    setTL(false);
  };

  /* ── Auth handlers ── */
  const handleAuth=async(sess)=>{
    setSession(sess);
    await loadProfile(sess);
  };

  const handleOnboardDone=async(info)=>{
    setProfile(p=>({...p,...info}));
    setScr("app");
    await loadTasks();
  };

  const handleSignOut=async()=>{
    await supabase.auth.signOut();
    setSide(false);
  };

  /* ── Task CRUD (synced with Supabase) ── */
  const addTask=async(f)=>{
    const created=await apiCall('/api/tasks','POST',f,token);
    if(created.id)setTasks(p=>[...p,created]);
    setAdd(false);
  };

  const toggleTask=async(id)=>{
    const t=tasks.find(x=>x.id===id);if(!t)return;
    const ns=t.status==="done"?"today":"done";
    setTasks(p=>p.map(x=>x.id===id?{...x,status:ns}:x));
    if(ns==="done")setUndo({task:{...t},action:"complete"});
    await apiCall('/api/tasks','PATCH',{id,status:ns},token);
  };

  const delTask=async(id)=>{
    const t=tasks.find(x=>x.id===id);
    setTasks(p=>p.filter(x=>x.id!==id));
    if(t)setUndo({task:t,action:"delete"});
    await apiCall(`/api/tasks?id=${id}`,'DELETE',null,token);
  };

  const delayTask=async(id)=>{
    setTasks(p=>p.map(t=>t.id===id?{...t,status:"upcoming",due:"غداً"}:t));
    await apiCall('/api/tasks','PATCH',{id,status:"upcoming",due:"غداً"},token);
  };

  const handleUndo=async()=>{
    if(!undo)return;
    if(undo.action==="delete"){
      const {id,...rest}=undo.task;
      const created=await apiCall('/api/tasks','POST',rest,token);
      if(created.id)setTasks(p=>[...p,created]);
    }else{
      setTasks(p=>p.map(t=>t.id===undo.task.id?{...t,status:undo.task.status}:t));
      await apiCall('/api/tasks','PATCH',{id:undo.task.id,status:undo.task.status},token);
    }
    setUndo(null);
  };

  /* ── Settings save ── */
  const handleSaveSettings=async(s)=>{
    setProfile(p=>({...p,...s}));
    setTheme(s.theme);
    if(typeof window!=='undefined')localStorage.setItem('apex_theme',s.theme);
    setSettings(false);setSide(false);
  };

  /* ── Toggle theme ── */
  const toggleTheme=async()=>{
    const t=theme==="dark"?"light":"dark";
    setTheme(t);
    if(typeof window!=='undefined')localStorage.setItem('apex_theme',t);
    await apiCall('/api/profile','PATCH',{theme:t},token);
  };

  /* ── Voice ── */
  const toggleListen=()=>{
    if(!recRef.current){setMsg("⚠️ الأوامر الصوتية تتطلب Chrome");return;}
    if(listen){recRef.current.stop();setListen(false);}else{recRef.current.start();setListen(true);setMsg(null);}
  };

  /* ── AI Command (calls /api/chat — API key is safe on server) ── */
  const sendCmd=async()=>{
    if(!cmd.trim()||busy)return;
    setBusy(true);setMsg(null);
    try{
      const roleCtx=ROLES[profile?.role]?.ai||"";
      const styleCtx={balanced:"",coach:"كن محفزاً ومشجعاً.",direct:"كن مختصراً جداً.",analytical:"قدم تحليلاً دقيقاً."}[profile?.ai_style||"balanced"]||"";
      const data=await apiCall('/api/chat','POST',{
        model:"claude-sonnet-4-20250514",max_tokens:1000,
        system:`${roleCtx} ${styleCtx}\nأنت مساعد ذكاء اصطناعي لإدارة المهام. أعد JSON صالح فقط بلا markdown:\n{"actions":[{"type":"add","title":"...","priority":"high|medium|low","status":"today|upcoming","due":"...","cat":"عمل|اجتماع|تواصل|مبيعات|مالية|تقني|توثيق|عام"},{"type":"delete","ids":[...]},{"type":"complete","ids":[...]},{"type":"postpone","ids":[...],"newDue":"..."},{"type":"suggest","tasks":[...]},{"type":"analyze","insight":"..."}],"message":"رسالة قصيرة"}`,
        messages:[{role:"user",content:`المهام:\n${JSON.stringify(tasks.slice(0,20))}\n\nأمر: "${cmd}"`}]
      },token);

      if(data.error){
        setMsg(`⚠️ ${data.error}`);
        setBusy(false);return;
      }

      const raw=data.content?.map(b=>b.text||"").join("")||"{}";
      const result=JSON.parse(raw.replace(/```json\n?|```/g,"").trim());
      let upd=[...tasks];

      for(const a of result.actions||[]){
        if(a.type==="add"){
          const t={title:a.title,priority:a.priority||"medium",status:a.status||"today",due:a.due||"اليوم",cat:a.cat||"عام",suggested:false};
          const created=await apiCall('/api/tasks','POST',t,token);
          if(created.id)upd.push(created);
        }else if(a.type==="delete"){
          upd=upd.filter(t=>!a.ids?.includes(t.id));
          a.ids?.forEach(id=>apiCall(`/api/tasks?id=${id}`,'DELETE',null,token));
        }else if(a.type==="complete"){
          upd=upd.map(t=>a.ids?.includes(t.id)?{...t,status:"done"}:t);
          a.ids?.forEach(id=>apiCall('/api/tasks','PATCH',{id,status:"done"},token));
        }else if(a.type==="postpone"){
          upd=upd.map(t=>a.ids?.includes(t.id)?{...t,status:"upcoming",due:a.newDue||"لاحقاً"}:t);
          a.ids?.forEach(id=>apiCall('/api/tasks','PATCH',{id,status:"upcoming",due:a.newDue||"لاحقاً"},token));
        }else if(a.type==="suggest"){
          for(const st of(a.tasks||[])){
            const created=await apiCall('/api/tasks','POST',{...st,suggested:true},token);
            if(created.id)upd.push(created);
          }
        }
      }
      setTasks(upd);setMsg(result.message||"✓ تم");setCmd("");
    }catch{setMsg("⚠️ خطأ في الاتصال.");}
    setBusy(false);
  };

  /* ── Derived ── */
  const cnt={today:tasks.filter(t=>t.status==="today").length,upcoming:tasks.filter(t=>t.status==="upcoming").length,done:tasks.filter(t=>t.status==="done").length};
  const pct=(cnt.done+cnt.today)>0?Math.round((cnt.done/(cnt.done+cnt.today))*100):0;
  const filtered=view==="analytics"?[]:tasks.filter(t=>t.status===view&&(!search||t.title?.includes(search)||t.cat?.includes(search)));
  const roleInfo=ROLES[profile?.role];
  const TABS=[{k:"today",l:"اليوم",i:"☀️",n:cnt.today},{k:"upcoming",l:"قادمة",i:"📅",n:cnt.upcoming},{k:"done",l:"مكتملة",i:"✅",n:cnt.done},{k:"analytics",l:"تحليل",i:"📊",n:null}];

  /* ── Screens ── */
  if(scr==="loading")return(<div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}><Styles/><div style={{textAlign:'center'}}><ApexLogo sz={46} fsz={20} sub/><p style={{color:'var(--mu)',marginTop:18,fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}><span className="spin">↻</span> loading...</p></div></div>);
  if(scr==="auth")return(<><Styles/><AuthScreen onAuth={handleAuth}/></>);
  if(scr==="onboard")return(<><Styles/><Onboarding user={session?.user} token={token} onDone={handleOnboardDone}/></>);

  /* ── DASHBOARD ── */
  return(
    <div className={`gb${theme==="light"?" light":""}`} data-acc={profile?.account_type||'personal'} style={{minHeight:'100vh',background:'var(--bg)'}}>
      <Styles/>
      {addOpen&&<AddModal onAdd={addTask} onClose={()=>setAdd(false)}/>}
      {focusOpen&&<FocusModal tasks={tasks} profile={profile} token={token} onClose={()=>setFocus(false)}/>}
      {settingsOpen&&<SettingsModal profile={profile} theme={theme} token={token} onSave={handleSaveSettings} onClose={()=>setSettings(false)}/>}
      {teamOpen&&<TeamModal profile={profile} token={token} onClose={()=>setTeam(false)} onChanged={()=>loadProfile(session)}/>}
      {subOpen&&<SubscriptionModal profile={profile} token={token} onClose={()=>setSub(false)} onChanged={()=>loadProfile(session)}/>}
      {undo&&<UndoToast item={undo} onUndo={handleUndo} onDismiss={()=>setUndo(null)}/>}

      {sideOpen&&<div className="overlay" onClick={()=>setSide(false)}/>}

      {/* ─── SIDEBAR ─── */}
      <aside className={`sidebar ${sideOpen?"open":"closed"}`}>
        <div style={{padding:'18px 16px 14px',borderBottom:'1px solid var(--b)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <ApexLogo sz={26} fsz={13} sub/>
          <button onClick={()=>setSide(false)} style={{background:'rgba(var(--cy-rgb),.07)',border:'1px solid rgba(var(--cy-rgb),.14)',color:'var(--cy)',borderRadius:9,width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:13}}>✕</button>
        </div>
        {/* Profile */}
        <div style={{padding:'16px',borderBottom:'1px solid var(--b)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
            <div style={{width:42,height:42,borderRadius:'50%',background:'linear-gradient(135deg,var(--cy),var(--cy2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:800,color:'var(--on)',flexShrink:0,boxShadow:'0 0 18px rgba(var(--cy-rgb),.28)'}}>
              {profile?.name?.[0]?.toUpperCase()||"م"}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:14,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{profile?.name||session?.user?.email}</p>
              {roleInfo&&<div style={{display:'inline-flex',alignItems:'center',gap:4,marginTop:4,background:'rgba(var(--cy-rgb),.07)',border:'1px solid rgba(var(--cy-rgb),.15)',borderRadius:20,padding:'2px 10px'}}>
                <span style={{fontSize:12}}>{roleInfo.i}</span>
                <span style={{fontSize:11,color:'var(--cy)',fontWeight:600}}>{roleInfo.l}</span>
              </div>}
            </div>
          </div>
          <div style={{background:'var(--s1)',border:'1px solid var(--b)',borderRadius:12,padding:'12px 14px'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{position:'relative',flexShrink:0}}>
                <Ring pct={pct} size={52} stroke={5}/>
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:11,fontWeight:800,color:'var(--cy)',fontFamily:"'JetBrains Mono',monospace"}}>{pct}%</span></div>
              </div>
              <div>
                <p style={{fontSize:12,fontWeight:700,marginBottom:3}}>إنجاز اليوم</p>
                <p style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace"}}>{cnt.done}/{tasks.length} tasks</p>
              </div>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div style={{padding:'14px 16px',borderBottom:'1px solid var(--b)'}}>
          <p style={{fontSize:9,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.12em',marginBottom:10}}>QUICK STATS</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
            {[{l:"اليوم",v:cnt.today,c:"var(--am)"},{l:"قادمة",v:cnt.upcoming,c:"var(--cy)"},{l:"منجزة",v:cnt.done,c:"var(--gr)"}].map(s=>(
              <div key={s.l} style={{background:'var(--s1)',border:'1px solid var(--b)',borderRadius:10,padding:'8px 4px',textAlign:'center'}}>
                <div style={{fontSize:20,fontWeight:900,color:s.c,fontFamily:"'JetBrains Mono',monospace"}}>{s.v}</div>
                <div style={{fontSize:9,color:'var(--mu)',marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{flex:1}}/>
        {/* Bottom */}
        <div style={{padding:'14px 16px',borderTop:'1px solid var(--b)',display:'flex',flexDirection:'column',gap:8}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'var(--s1)',border:'1px solid var(--b)',borderRadius:12,padding:'10px 14px'}}>
            <span style={{fontSize:13,color:'var(--tx2)'}}>{theme==="dark"?"🌙 داكن":"☀️ فاتح"}</span>
            <button onClick={toggleTheme} style={{width:48,height:26,borderRadius:13,background:theme==="light"?"var(--cy)":"var(--b2)",transition:'background .22s',position:'relative',border:'none',cursor:'pointer',flexShrink:0}}>
              <div style={{width:20,height:20,borderRadius:'50%',background:theme==="light"?"#000":"var(--tx2)",position:'absolute',top:3,left:theme==="light"?25:3,transition:'left .22s'}}/>
            </button>
          </div>
          {profile&&!(profile.account_type==='employee'&&profile.team?.team)&&(
            <button onClick={()=>{setSub(true);setSide(false);}} className="ghost" style={{padding:'10px',borderRadius:12,fontSize:13,width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <span>💳</span> الاشتراك
            </button>
          )}
          {profile?.account_type&&profile.account_type!=='personal'&&(
            <button onClick={()=>{setTeam(true);setSide(false);}} className="ghost" style={{padding:'10px',borderRadius:12,fontSize:13,width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <span>👥</span> {profile.account_type==='employee'?"فريقي":profile.account_type==='owner'?"شركتي":"فريقي"}
            </button>
          )}
          <button onClick={()=>{setSettings(true);setSide(false);}} className="ghost" style={{padding:'10px',borderRadius:12,fontSize:13,width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <span>⚙️</span> الإعدادات
          </button>
          <button onClick={()=>{setAdd(true);setSide(false);}} className="bp" style={{padding:'11px',borderRadius:12,fontSize:13,width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:7}}>
            <span style={{fontSize:17,lineHeight:1}}>+</span> مهمة جديدة
          </button>
          <button onClick={handleSignOut} style={{background:'none',border:'none',color:'var(--mu)',cursor:'pointer',fontSize:11,fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.04em',padding:'6px',textAlign:'center'}}>
            → تسجيل الخروج
          </button>
          <p style={{textAlign:'center',fontSize:9,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.08em'}}>▲ APEX · powered by Claude AI</p>
        </div>
      </aside>

      {/* ─── HEADER ─── */}
      <header style={{padding:'0 16px',height:56,display:'flex',alignItems:'center',gap:10,position:'sticky',top:0,zIndex:40,background:theme==="light"?'rgba(238,244,251,.93)':'rgba(2,5,9,.93)',backdropFilter:'blur(20px)',borderBottom:'1px solid var(--b)'}}>
        <button className={`hbg${sideOpen?" open":""}`} onClick={()=>setSide(p=>!p)}>
          <span style={{width:20}}/><span style={{width:14}}/><span style={{width:17}}/>
        </button>
        <div style={{flex:1,display:'flex',alignItems:'center'}}><ApexLogo sz={22} fsz={12}/></div>
        <button onClick={()=>setFocus(true)} style={{display:'flex',alignItems:'center',gap:6,background:'rgba(245,158,11,.07)',border:'1px solid rgba(245,158,11,.18)',color:'#f59e0b',borderRadius:10,padding:'7px 12px',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:"'Sora','IBM Plex Sans Arabic',sans-serif",transition:'all .16s'}}>
          🎯 <span style={{fontSize:12}}>ركّز</span>
        </button>
        <button onClick={()=>setAdd(true)} className="bp" style={{width:36,height:36,borderRadius:11,flexShrink:0,fontSize:19,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
      </header>

      {/* ─── TABS ─── */}
      <div style={{position:'sticky',top:56,zIndex:35,background:theme==="light"?'rgba(238,244,251,.93)':'rgba(2,5,9,.93)',backdropFilter:'blur(20px)',borderBottom:'1px solid var(--b)',display:'flex',padding:'0 4px'}}>
        {TABS.map(tab=>(
          <button key={tab.k} className={`tab${view===tab.k?" on":""}`} onClick={()=>setView(tab.k)}
            style={{color:view===tab.k?"var(--cy)":"var(--mu)",fontWeight:view===tab.k?700:400}}>
            <span style={{fontSize:15}}>{tab.i}</span>
            <span style={{fontSize:10,fontFamily:"'Sora','IBM Plex Sans Arabic',sans-serif"}}>{tab.l}</span>
            {tab.n!==null&&<span style={{fontSize:9,background:view===tab.k?"rgba(var(--cy-rgb),.15)":"var(--b)",color:view===tab.k?"var(--cy)":"var(--mu)",borderRadius:10,padding:'1px 5px',fontFamily:"'JetBrains Mono',monospace"}}>{tab.n}</span>}
          </button>
        ))}
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{padding:'16px 16px 140px',maxWidth:680,margin:'0 auto'}}>
        {profile&&profile.access===false&&(
          <div style={{background:'rgba(239,68,68,.07)',border:'1px solid rgba(239,68,68,.2)',borderRadius:12,padding:'11px 15px',marginBottom:14,fontSize:13,color:'var(--rd)',lineHeight:1.6}}>
            ⏳ انتهت فترتك التجريبية أو اشتراكك. {profile.account_type==='employee'?"تواصل مع مديرك لتجديد الاشتراك.":"جدّد اشتراكك للاستمرار باستخدام الذكاء الاصطناعي."}
            {!(profile.account_type==='employee'&&profile.team?.team)&&<button onClick={()=>setSub(true)} className="bp" style={{marginRight:10,padding:'4px 14px',borderRadius:9,fontSize:12}}>جدّد الآن</button>}
          </div>
        )}
        {msg&&(
          <div className="fi" style={{background:'rgba(var(--cy-rgb),.05)',border:'1px solid rgba(var(--cy-rgb),.13)',borderRadius:12,padding:'11px 15px',marginBottom:14,display:'flex',gap:9,alignItems:'flex-start'}}>
            <span style={{fontSize:10,color:'var(--cy)',fontFamily:"'JetBrains Mono',monospace",flexShrink:0,marginTop:2}}>AI ›</span>
            <p style={{fontSize:13,color:'var(--tx)',flex:1,lineHeight:1.65}}>{msg}</p>
            <button onClick={()=>setMsg(null)} style={{background:'none',border:'none',color:'var(--mu)',fontSize:13,cursor:'pointer',flexShrink:0}}>✕</button>
          </div>
        )}
        {view==="analytics"?<Analytics tasks={tasks}/>:(
          <>
            {view==="today"&&cnt.today>0&&(
              <div onClick={()=>setFocus(true)} style={{background:'linear-gradient(135deg,rgba(245,158,11,.07),rgba(245,158,11,.03))',border:'1px solid rgba(245,158,11,.18)',borderRadius:14,padding:'13px 16px',marginBottom:14,cursor:'pointer',display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:22,flexShrink:0}}>🎯</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,fontWeight:700,color:'#f59e0b',marginBottom:2}}>ما مهمتي الآن؟</p>
                  <p style={{fontSize:11,color:'var(--mu)'}}>AI يحلل {cnt.today} مهام ويختار الأهم للتركيز عليها</p>
                </div>
                <span style={{fontSize:16,color:'#f59e0b',opacity:.7}}>←</span>
              </div>
            )}
            {view==="today"&&(
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12}}>
                <span style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace"}}>← اسحب للحذف</span>
                <span style={{flex:1,height:1,background:'var(--b)'}}/>
                <span style={{fontSize:10,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace"}}>للإكمال →</span>
              </div>
            )}
            {tasksLoading?(
              <div style={{textAlign:'center',padding:'50px 0'}}><span className="spin" style={{fontSize:28,color:'var(--cy)',display:'block',marginBottom:12}}>↻</span><p style={{fontSize:12,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace"}}>جاري تحميل المهام...</p></div>
            ):filtered.length===0?(
              <div style={{textAlign:'center',padding:'55px 0',color:'var(--mu)'}}>
                <div style={{fontSize:44,marginBottom:12,opacity:.3}}>{view==="done"?"◆":"▽"}</div>
                <p style={{fontSize:14,fontWeight:700,color:'var(--tx2)',marginBottom:5}}>{view==="done"?"لا توجد مهام مكتملة":search?"لا نتائج":"لا توجد مهام"}</p>
                <p style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>use command bar below</p>
              </div>
            ):filtered.map(t=><SwipeCard key={t.id} t={t} onToggle={toggleTask} onDel={delTask} onDelay={delayTask}/>)}
          </>
        )}
      </div>

      {/* ─── COMMAND BAR ─── */}
      <div style={{position:'fixed',bottom:0,right:0,left:0,background:theme==="light"?'rgba(238,244,251,.97)':'rgba(2,5,9,.97)',backdropFilter:'blur(24px)',borderTop:'1px solid var(--b)',padding:'12px 16px',zIndex:40}}>
        {view!=="analytics"&&<div style={{marginBottom:8}}><input value={search} onChange={e=>setSrch(e.target.value)} placeholder="🔍 بحث في المهام..." style={{width:'100%',background:'var(--s1)',border:'1px solid var(--b)',borderRadius:10,padding:'7px 14px',color:'var(--tx)',fontSize:12,direction:'rtl',fontFamily:"'Sora','IBM Plex Sans Arabic',sans-serif"}}/></div>}
        <div style={{display:'flex',gap:9,alignItems:'center'}}>
          <button onClick={toggleListen} style={{width:42,height:42,borderRadius:12,flexShrink:0,background:listen?"rgba(239,68,68,.12)":"var(--s2)",border:`1.5px solid ${listen?"var(--rd)":"var(--b)"}`,color:listen?"var(--rd)":"var(--mu)",fontSize:17,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .22s',cursor:'pointer',position:'relative'}}>
            {listen&&<span style={{position:'absolute',inset:-4,borderRadius:14,border:'1.5px solid var(--rd)',animation:'pulse 1.1s ease infinite'}}/>}
            {listen?"⏹":"🎙"}
          </button>
          <div style={{flex:1,position:'relative',display:'flex',alignItems:'center'}}>
            <span style={{position:'absolute',right:12,fontSize:11,color:'var(--mu)',fontFamily:"'JetBrains Mono',monospace",pointerEvents:'none',opacity:cmd?0:.5}}>›_</span>
            <input value={cmd} onChange={e=>setCmd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendCmd()}
              placeholder={listen?"🎙 جاري الاستماع...":"اكتب أمراً: أضف، احذف، اقترح، حلل..."}
              disabled={listen}
              style={{width:'100%',background:'var(--s1)',border:'1.5px solid var(--b)',borderRadius:12,padding:'10px 16px 10px 14px',color:'var(--tx)',fontSize:13,direction:'rtl',fontFamily:"'Sora','IBM Plex Sans Arabic',sans-serif"}}/>
          </div>
          <button onClick={sendCmd} disabled={busy||!cmd.trim()} className="bp" style={{width:42,height:42,borderRadius:12,flexShrink:0,fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {busy?<span className="spin" style={{fontSize:13}}>↻</span>:"▲"}
          </button>
        </div>
        <p style={{textAlign:'center',fontSize:9,color:'var(--mu)',marginTop:6,fontFamily:"'JetBrains Mono',monospace",letterSpacing:'.05em'}}>ENTER · اقترح مهام · احذف المكتملة · ما مهمتي الأهم؟</p>
      </div>
    </div>
  );
}
