/**
 * /admin — لوحة تحكم المدير
 * محمية بكلمة مرور
 */
import { useState, useEffect } from 'react';

const PLANS = { pro:'Pro 🚀', team:'Team 👥' };
const METHODS = { syriatel:'Syriatel Cash 📱', mtn:'MTN Cash 📱', usdt:'USDT 💰', bank:'حوالة بنكية 🏦' };

export default function AdminDashboard() {
  const [auth,     setAuth]     = useState(false);
  const [key,      setKey]      = useState('');
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState(null);
  const [filter,   setFilter]   = useState('pending');

  const loadRequests = async (adminKey=key) => {
    setLoading(true);
    const r = await fetch('/api/payment/list', {
      headers: { 'x-admin-key': adminKey },
    });
    const d = await r.json();
    if (d.error) { setMsg('❌ كلمة المرور خاطئة'); setAuth(false); }
    else { setRequests(d); setAuth(true); }
    setLoading(false);
  };

  const handle = async (requestId, action, note='') => {
    const r = await fetch('/api/payment/approve', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-admin-key': key },
      body: JSON.stringify({ requestId, action, note }),
    });
    const d = await r.json();
    setMsg(d.message || d.error);
    loadRequests();
  };

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);

  const s = {
    page:  { minHeight:'100vh', background:'#020509', color:'#dce8f5', fontFamily:'Cairo,sans-serif', direction:'rtl', padding:'24px' },
    card:  { background:'#0a1220', border:'1px solid #112235', borderRadius:14, padding:20, marginBottom:12 },
    btn:   { padding:'8px 16px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'Cairo', fontWeight:700, fontSize:13 },
    badge: { padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 },
  };

  if (!auth) return (
    <div style={{...s.page, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{...s.card, width:360, textAlign:'center'}}>
        <h1 style={{fontSize:20, marginBottom:6, background:'linear-gradient(90deg,#00d4ff,#f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>▲ APEX Admin</h1>
        <p style={{fontSize:12, color:'#3d556e', marginBottom:20}}>لوحة تحكم المدير</p>
        {msg && <p style={{color:'#ef4444', fontSize:13, marginBottom:12}}>{msg}</p>}
        <input value={key} onChange={e=>setKey(e.target.value)} type="password" placeholder="Admin Secret Key..." onKeyDown={e=>e.key==='Enter'&&loadRequests(key)}
          style={{width:'100%', background:'#060c17', border:'1px solid #112235', borderRadius:10, padding:'10px 14px', color:'#dce8f5', fontSize:14, marginBottom:12, direction:'ltr', fontFamily:'monospace'}}/>
        <button onClick={()=>loadRequests(key)} disabled={!key}
          style={{...s.btn, width:'100%', padding:12, background:'linear-gradient(135deg,#00d4ff,#0066ff)', color:'#000', fontSize:14}}>
          دخول
        </button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24}}>
        <h1 style={{fontSize:20, background:'linear-gradient(90deg,#00d4ff,#f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>▲ APEX Admin</h1>
        <div style={{display:'flex', gap:8}}>
          {['pending','approved','rejected','all'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{...s.btn, background:filter===f?'rgba(0,212,255,.15)':'#0a1220', border:`1px solid ${filter===f?'#00d4ff':'#112235'}`, color:filter===f?'#00d4ff':'#7a9ab5'}}>
              {f==='pending'?'معلق':f==='approved'?'موافق':f==='rejected'?'مرفوض':'الكل'}
              {f!=='all'&&<span style={{marginRight:6, background:'rgba(0,212,255,.15)', borderRadius:10, padding:'1px 6px', fontSize:10}}>
                {requests.filter(r=>r.status===f).length}
              </span>}
            </button>
          ))}
          <button onClick={()=>loadRequests()} style={{...s.btn, background:'#0a1220', border:'1px solid #112235', color:'#7a9ab5'}}>↻</button>
        </div>
      </div>

      {msg && (
        <div style={{background:'rgba(0,212,255,.07)', border:'1px solid rgba(0,212,255,.2)', borderRadius:12, padding:'12px 16px', marginBottom:16, color:'#00d4ff', fontSize:13}}>
          {msg} <button onClick={()=>setMsg(null)} style={{background:'none',border:'none',color:'#3d556e',cursor:'pointer',float:'left'}}>✕</button>
        </div>
      )}

      {loading ? (
        <p style={{textAlign:'center', color:'#3d556e', padding:40}}>جاري التحميل...</p>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center', padding:60, color:'#3d556e'}}>
          <p style={{fontSize:40, marginBottom:12}}>📭</p>
          <p>لا توجد طلبات {filter==='pending'?'معلقة':''}</p>
        </div>
      ) : filtered.map(r => (
        <div key={r.id} style={s.card}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
            <div>
              <p style={{fontWeight:700, fontSize:15, marginBottom:4}}>{r.user_email}</p>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                <span style={{...s.badge, background:'rgba(0,212,255,.1)', color:'#00d4ff'}}>{PLANS[r.plan]||r.plan}</span>
                <span style={{...s.badge, background:'rgba(245,158,11,.1)', color:'#f59e0b'}}>{METHODS[r.method]||r.method}</span>
                <span style={{...s.badge, background:r.status==='approved'?'rgba(16,185,129,.1)':r.status==='rejected'?'rgba(239,68,68,.1)':'rgba(100,116,139,.15)', color:r.status==='approved'?'#10b981':r.status==='rejected'?'#ef4444':'#94a3b8'}}>
                  {r.status==='pending'?'⏳ معلق':r.status==='approved'?'✅ موافق':'❌ مرفوض'}
                </span>
              </div>
            </div>
            <p style={{fontSize:11, color:'#3d556e', fontFamily:'monospace'}}>{new Date(r.created_at).toLocaleDateString('ar')}</p>
          </div>

          <div style={{background:'#060c17', borderRadius:10, padding:'10px 14px', marginBottom:12}}>
            <p style={{fontSize:12, color:'#7a9ab5', marginBottom:4}}>رقم المرجع / إثبات الدفع:</p>
            <p style={{fontSize:13, color:'#dce8f5', fontFamily:'monospace'}}>{r.reference}</p>
            {r.amount && <p style={{fontSize:12, color:'#f59e0b', marginTop:4}}>المبلغ: {r.amount}</p>}
            {r.notes && <p style={{fontSize:12, color:'#7a9ab5', marginTop:4}}>ملاحظات: {r.notes}</p>}
          </div>

          {r.status === 'pending' && (
            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>{const note=prompt('ملاحظة للموافقة (اختياري):');if(note!==null)handle(r.id,'approve',note);}}
                style={{...s.btn, background:'rgba(16,185,129,.15)', border:'1px solid rgba(16,185,129,.3)', color:'#10b981', flex:1}}>
                ✅ موافقة وتفعيل
              </button>
              <button onClick={()=>{const note=prompt('سبب الرفض:');if(note!==null)handle(r.id,'reject',note);}}
                style={{...s.btn, background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.25)', color:'#ef4444', flex:1}}>
                ❌ رفض
              </button>
            </div>
          )}

          {r.status !== 'pending' && r.admin_note && (
            <p style={{fontSize:12, color:'#3d556e', marginTop:8}}>📝 ملاحظة المدير: {r.admin_note}</p>
          )}
        </div>
      ))}
    </div>
  );
}
