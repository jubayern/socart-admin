'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL      || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface Props {
  value:    string[]
  onChange: (urls: string[]) => void
  max?:     number   // default unlimited (1 for single image)
  folder?:  string   // storage folder
}

export default function ImageUpload({ value, onChange, max, folder = 'general' }: Props) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
    setUploading(false)
    if (error) { alert('Upload failed: ' + error.message); return null }
    const { data } = supabase.storage.from('products').getPublicUrl(path)
    return data.publicUrl
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const f of files) {
      if (max && value.length >= max) break
      const url = await upload(f)
      if (url) onChange([...value, url])
    }
    e.target.value = ''
  }

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  const canAdd = !max || value.length < max

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button onClick={() => remove(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center">
              <X size={10} />
            </button>
          </div>
        ))}

        {canAdd && (
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition bg-slate-50">
            {uploading
              ? <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              : <><Upload size={18} /><span className="text-[10px] mt-1">Upload</span></>
            }
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple={!max || max > 1} className="hidden" onChange={handleChange} />
      <p className="text-xs text-slate-400">JPG, PNG, WEBP{max === 1 ? ' — 1 image' : max ? ` — max ${max}` : ''}</p>
    </div>
  )
}
