'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Check } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

const SECTIONS = [
  { title:'Shop Info', fields:[
    { key:'shop_name',  label:'Shop Name',  type:'text'   },
    { key:'shop_phone', label:'Phone',      type:'text'   },
  ]},
  { title:'Delivery', fields:[
    { key:'delivery_charge',     label:'Delivery Charge (৳)',     type:'number' },
    { key:'free_delivery_above', label:'Free Delivery Above (৳)', type:'number' },
  ]},
  { title:'Payment Numbers', fields:[
    { key:'bkash_number',  label:'bKash',  type:'text' },
    { key:'nagad_number',  label:'Nagad',  type:'text' },
    { key:'rocket_number', label:'Rocket', type:'text' },
  ]},
]

export default function SettingsPage() {
  const router = useRouter()
  const [form, setForm]     = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    api.get('/api/admin/settings').then(r => setForm(r.data)).catch(()=>{})
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/api/admin/settings', form)
      toast.success('Settings saved!')
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch { toast.error('Failed to save settings') }
    setSaving(false)
  }

  return (
    <Shell>
      <div className="anim-fadeup" style={{ padding:'14px', display:'flex', flexDirection:'column', gap:12 }}>
        {SECTIONS.map(({ title, fields }) => (
          <div key={title} style={{ background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18, padding:'14px 16px' }}>
            <p style={{ fontWeight:700, fontSize:13, color:'var(--txt)', marginBottom:14 }}>{title}</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {fields.map(({ key, label, type }) => (
                <div key={key}>
                  <p style={{ fontSize:11, fontWeight:600, color:'var(--txt3)', marginBottom:6 }}>{label}</p>
                  <input type={type} value={form[key]||''} onChange={e => setForm((f:any) => ({...f,[key]:e.target.value}))}
                    style={{ background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--txt)', width:'100%' }} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={save} disabled={saving} style={{
          width:'100%', padding:'14px', borderRadius:14, border:'none', cursor:'pointer',
          fontWeight:700, fontSize:14, color:'white',
          background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
          boxShadow: saved ? '0 4px 16px rgba(16,185,129,.3)' : '0 4px 16px rgba(124,58,237,.35)',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          transition:'all .3s', marginBottom:8,
        }}>
          {saved ? <><Check size={16}/>Saved!</> : saving ? 'Saving...' : <><Save size={16}/>Save Settings</>}
        </button>
      </div>
    </Shell>
  )
}
