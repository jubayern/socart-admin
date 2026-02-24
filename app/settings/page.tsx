'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Check } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'

const SECTIONS = [
  { title:'Shop', fields:[
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
  const [form, setForm]   = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    api.get('/api/admin/settings').then(r => setForm(r.data)).catch(()=>{})
  }, [])

  const save = async () => {
    setSaving(true)
    await api.put('/api/admin/settings', form).catch(()=>{})
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Shell title="Settings">
      <div className="px-4 py-4 space-y-4">
        {SECTIONS.map(({ title, fields }) => (
          <div key={title} className="rounded-3xl p-4 shadow-sm" style={{ background:'var(--card)' }}>
            <p className="font-bold text-sm mb-4" style={{ color:'var(--text)' }}>{title}</p>
            <div className="space-y-3">
              {fields.map(({ key, label, type }) => (
                <div key={key}>
                  <p className="text-xs font-semibold mb-1.5" style={{ color:'var(--muted)' }}>{label}</p>
                  <input type={type} value={form[key]||''}
                    onChange={e => setForm((f: any) => ({...f,[key]:e.target.value}))}
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                    style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }} />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white disabled:opacity-50 shadow-sm"
          style={{ background: saved ? '#15803d' : 'var(--brand)' }}>
          {saved ? <><Check size={16}/>Saved!</> : saving ? 'Saving...' : <><Save size={16}/>Save Settings</>}
        </button>
      </div>
    </Shell>
  )
}
