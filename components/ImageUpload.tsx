'use client'
import { useRef, useState } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL      || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
  max?: number
  folder?: string
}

export default function ImageUpload({ value, onChange, max, folder = 'general' }: Props) {
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    const ext  = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await sb.storage.from('products').upload(path, file, { upsert: true })
    if (error) { alert('Upload gagal: ' + error.message); return null }
    return sb.storage.from('products').getPublicUrl(path).data.publicUrl
  }

  const onChange2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setBusy(true)
    for (const f of files) {
      if (max && value.length >= max) break
      const url = await upload(f)
      if (url) onChange([...value, url])
    }
    setBusy(false)
    e.target.value = ''
  }

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const canAdd  = !max || value.length < max

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={i} className="relative w-[72px] h-[72px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            <img src={url} className="w-full h-full object-cover" alt="" />
            <button onClick={() => remove(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
              <X size={10} className="text-white" />
            </button>
          </div>
        ))}
        {canAdd && (
          <button onClick={() => ref.current?.click()} disabled={busy}
            style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}
            className="w-[72px] h-[72px] rounded-2xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-1 transition">
            {busy ? <Loader2 size={20} className="animate-spin" /> : <><Camera size={20} /><span className="text-[10px] font-semibold">Photo</span></>}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" multiple={!max || max > 1} className="hidden" onChange={onChange2} />
    </div>
  )
}
