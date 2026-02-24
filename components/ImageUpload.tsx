'use client'
import { useRef, useState } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL      || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface Props { value: string[]; onChange: (u: string[]) => void; max?: number; folder?: string }

export default function ImageUpload({ value, onChange, max, folder = 'general' }: Props) {
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    const ext  = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await sb.storage.from('products').upload(path, file, { upsert: true })
    if (error) { alert('Upload failed: ' + error.message); return null }
    return sb.storage.from('products').getPublicUrl(path).data.publicUrl
  }

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const remove = (i: number) => onChange(value.filter((_,idx) => idx !== i))

  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {value.map((url, i) => (
        <div key={i} style={{ position:'relative', width:72, height:72, borderRadius:12, overflow:'hidden', border:'1.5px solid var(--bdr2)', flexShrink:0 }}>
          <img src={url} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
          <button onClick={() => remove(i)} style={{
            position:'absolute', top:4, right:4, width:20, height:20, borderRadius:'50%',
            background:'rgba(0,0,0,.7)', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <X size={11} color="white" />
          </button>
        </div>
      ))}
      {(!max || value.length < max) && (
        <button onClick={() => ref.current?.click()} disabled={busy} style={{
          width:72, height:72, borderRadius:12, flexShrink:0, cursor:'pointer',
          background:'var(--s2)', border:'1.5px dashed var(--bdr2)',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          gap:4, color:'var(--txt2)',
        }}>
          {busy ? <Loader2 size={20} style={{ animation:'spin 1s linear infinite' }} /> : <><Camera size={20} /><span style={{ fontSize:10, fontWeight:600 }}>Photo</span></>}
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" multiple={!max || max > 1} style={{ display:'none' }} onChange={handle} />
    </div>
  )
}
