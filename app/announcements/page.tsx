'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, X, Check } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

const EMPTY = { text:'', bg_color:'#7c3aed', is_active:true }

export default function AnnouncementsPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen]   = useState(false)
  const [form, setForm]   = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (!getToken()) { router.replace('/'); return }; load() }, [])
  const load = () => api.get('/api/admin/announcements').then(r => setItems(r.data)).catch(()=>{})

  const save = async () => {
    if (!form.text.trim()) { toast.error('Text required'); return }
    setSaving(true)
    try {
      await api.post('/api/admin/announcements', form)
      toast.success('Announcement created!'); setOpen(false); setForm(EMPTY); load()
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  const del = async (id: string) => {
    await api.delete(`/api/admin/announcements/${id}`).catch(()=>{})
    toast.success('Deleted'); load()
  }

  const toggle = async (item: any) => {
    await api.put(`/api/admin/announcements/${item.id}`, { ...item, is_active: !item.is_active }).catch(()=>{})
    toast.success(!item.is_active ? 'Activated!' : 'Deactivated'); load()
  }

  const iS: React.CSSProperties = { background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--txt)', width:'100%' }

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:14 }}>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
          <button onClick={() => setOpen(true)} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', border:'none', cursor:'pointer', color:'white', fontSize:13, fontWeight:700 }}>
            <Plus size={15}/> Add Announcement
          </button>
        </div>
        {items.length === 0 ? (
          <p style={{ textAlign:'center', paddingTop:60, color:'var(--txt2)' }}>No announcements</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {items.map((item:any) => (
              <div key={item.id} style={{ background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:16, padding:'13px 14px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:8 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <div style={{ width:16, height:16, borderRadius:'50%', background:item.bg_color, flexShrink:0 }}/>
                    <p style={{ fontSize:13, fontWeight:600, color:'var(--txt)' }}>{item.text}</p>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background: item.is_active?'var(--green-lt)':'var(--s4)', color: item.is_active?'var(--green)':'var(--txt3)', flexShrink:0 }}>
                    {item.is_active ? 'Active' : 'Off'}
                  </span>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => toggle(item)} style={{ flex:1, padding:'8px', borderRadius:9, border:'none', background: item.is_active?'var(--s3)':'var(--green-lt)', color: item.is_active?'var(--txt2)':'var(--green)', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                    {item.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => del(item.id)} style={{ width:34, height:34, borderRadius:9, background:'var(--red-lt)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <Trash2 size={13} color="var(--red)"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)' }} onClick={() => setOpen(false)}/>
          <div className="anim-slideup" style={{ position:'relative', width:'100%', background:'var(--s1)', borderRadius:'22px 22px 0 0', border:'1px solid var(--bdr2)', borderBottom:'none', padding:'16px 18px 32px' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}><div style={{ width:36, height:3, borderRadius:99, background:'var(--s4)' }}/></div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <p style={{ fontWeight:800, fontSize:15, color:'var(--txt)' }}>New Announcement</p>
              <button onClick={() => setOpen(false)} style={{ width:30, height:30, borderRadius:8, background:'var(--s3)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={14} color="var(--txt2)"/></button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <textarea value={form.text} onChange={e => setForm((f:any)=>({...f,text:e.target.value}))} rows={3} placeholder="Announcement text *" style={{ ...iS, resize:'none' }}/>
              <div>
                <p style={{ fontSize:12, color:'var(--txt2)', marginBottom:6 }}>Background Color</p>
                <div style={{ display:'flex', gap:8 }}>
                  {['#7c3aed','#dc2626','#059669','#d97706','#2563eb','#0f172a'].map(c => (
                    <div key={c} onClick={() => setForm((f:any)=>({...f,bg_color:c}))} style={{ width:32, height:32, borderRadius:8, background:c, cursor:'pointer', border: form.bg_color===c?'2px solid white':'2px solid transparent', boxShadow: form.bg_color===c?'0 0 0 2px '+c:undefined }}/>
                  ))}
                </div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600, color:'var(--txt2)', cursor:'pointer' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm((f:any)=>({...f,is_active:e.target.checked}))}/>Active
              </label>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setOpen(false)} style={{ flex:1, padding:'13px', borderRadius:12, background:'var(--s3)', border:'1px solid var(--bdr2)', color:'var(--txt2)', fontWeight:600, fontSize:14, cursor:'pointer' }}>Cancel</button>
                <button onClick={save} disabled={saving||!form.text} style={{ flex:1, padding:'13px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, color:'white', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', opacity:!form.text?0.5:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                  {saving?'Saving...':<><Check size={15}/>Create</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
