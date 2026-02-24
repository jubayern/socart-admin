'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'
import Layout from '../../components/Layout'
import { api, getToken } from '../../lib/api'

const FIELDS = [
  { section: 'Shop', items: [
    { key: 'shop_name',  label: 'Shop Name',  type: 'text' },
    { key: 'shop_phone', label: 'Shop Phone', type: 'text' },
  ]},
  { section: 'Delivery', items: [
    { key: 'delivery_charge',     label: 'Delivery Charge (৳)',    type: 'number' },
    { key: 'free_delivery_above', label: 'Free Delivery Above (৳)', type: 'number' },
  ]},
  { section: 'Payment Numbers', items: [
    { key: 'bkash_number',  label: 'bKash',  type: 'text' },
    { key: 'nagad_number',  label: 'Nagad',  type: 'text' },
    { key: 'rocket_number', label: 'Rocket', type: 'text' },
  ]},
]

export default function SettingsPage() {
  const router = useRouter()
  const [form, setForm]     = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  useEffect(() => {
    if (!getToken()) { router.push('/'); return }
    api.get('/api/admin/settings').then(r => setForm(r.data)).catch(() => {})
  }, [])

  const save = async () => {
    setSaving(true)
    await api.put('/api/admin/settings', form).catch(() => {})
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout>
      <div className="px-4 py-4 space-y-4">
        {FIELDS.map(({ section, items }) => (
          <div key={section} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h2 className="font-semibold text-slate-700 text-sm mb-3">{section}</h2>
            <div className="space-y-3">
              {items.map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-slate-400 block mb-1">{label}</label>
                  <input type={type} value={form[key] || ''} onChange={e => setForm((f: any) => ({...f, [key]: e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50">
          {saved ? 'Saved!' : saving ? 'Saving...' : <><Save size={15} /> Save Settings</>}
        </button>
      </div>
    </Layout>
  )
}
