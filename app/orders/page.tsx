'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileDown, ChevronDown, X } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'
import { toast } from '../../lib/toast'

const SL: Record<string,string> = { pending:'Pending', confirmed:'Confirmed', processing:'Processing', shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled' }
const SC: Record<string,{bg:string,c:string}> = {
  pending:    { bg:'var(--amber-lt)', c:'var(--amber)' },
  confirmed:  { bg:'var(--blue-lt)',  c:'var(--blue)'  },
  processing: { bg:'var(--purple-lt)',c:'var(--purple)' },
  shipped:    { bg:'rgba(249,115,22,.13)', c:'#f97316' },
  delivered:  { bg:'var(--green-lt)', c:'var(--green)' },
  cancelled:  { bg:'var(--red-lt)',   c:'var(--red)'   },
}
const STATUSES = Object.keys(SL)

const printInvoice = (o: any) => {
  const win = window.open('', '_blank')
  if (!win) return
  const items = o.order_items || []
  const subtotal = items.reduce((s: number, i: any) => s + i.quantity * parseFloat(i.price), 0)
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    *{margin:0;padding:0;box-sizing:border-box} body{font-family:system-ui,sans-serif;color:#111;padding:32px;font-size:13px}
    .logo{font-size:22px;font-weight:900;background:linear-gradient(135deg,#7c3aed,#4f46e5);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .hdr{display:flex;justify-content:space-between;align-items:start;margin-bottom:24px}
    hr{border:none;border-top:1.5px solid #e5e7eb;margin:18px 0}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:18px}
    .sl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#9ca3af;margin-bottom:7px}
    p{font-size:13px;color:#374151;line-height:1.6} strong{color:#111}
    .badge{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;background:#ede9fe;color:#7c3aed}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th{padding:9px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;background:#f9fafb;border-bottom:1.5px solid #e5e7eb}
    td{padding:11px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151}
    .totals{margin-left:auto;width:200px;margin-top:16px}
    .tr{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#6b7280}
    .grand{display:flex;justify-content:space-between;padding:10px 0 0;font-size:15px;font-weight:900;color:#7c3aed;border-top:2px solid #e5e7eb;margin-top:6px}
    .foot{text-align:center;margin-top:36px;font-size:11px;color:#9ca3af}
  </style></head><body>
  <div class="hdr">
    <div><div class="logo">SoCart</div><p style="color:#9ca3af;font-size:11px;margin-top:3px">Invoice</p></div>
    <div style="text-align:right">
      <p style="font-weight:900;font-size:17px;color:#111">${o.order_number}</p>
      <p style="font-size:11px;color:#9ca3af">${new Date(o.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
      <div style="margin-top:6px"><span class="badge">${SL[o.status]||o.status}</span></div>
    </div>
  </div>
  <hr>
  <div class="g2">
    <div><div class="sl">Delivery</div>
      <p><strong>${o.delivery_name}</strong></p><p>${o.delivery_phone}</p><p>${o.delivery_address}</p><p>${o.delivery_area}</p>
      ${o.note?`<p style="font-style:italic;color:#6b7280;margin-top:4px">Note: ${o.note}</p>`:''}
    </div>
    <div><div class="sl">Payment</div>
      <p>Method: <strong style="text-transform:uppercase">${o.payment_method}</strong></p>
      <p>Status: <strong style="text-transform:capitalize">${o.payment_status}</strong></p>
      ${o.payment_number?`<p>Number: ${o.payment_number}</p>`:''}
      ${o.payment_trx?`<p>TRX: ${o.payment_trx}</p>`:''}
    </div>
  </div>
  <table>
    <thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${items.map((i:any)=>`<tr>
      <td>${i.product_name}${i.selected_variant?`<br><span style="font-size:11px;color:#9ca3af">${Object.entries(i.selected_variant).map(([k,v])=>`${k}: ${v}`).join(', ')}</span>`:''}</td>
      <td>${i.quantity}</td><td>৳${parseFloat(i.price).toFixed(0)}</td>
      <td style="text-align:right">৳${(i.quantity*parseFloat(i.price)).toFixed(0)}</td>
    </tr>`).join('')}</tbody>
  </table>
  <div class="totals">
    <div class="tr"><span>Subtotal</span><span>৳${subtotal.toFixed(0)}</span></div>
    <div class="tr"><span>Delivery</span><span>৳${parseFloat(o.delivery_charge||0).toFixed(0)}</span></div>
    <div class="grand"><span>Total</span><span>৳${parseFloat(o.total_amount).toFixed(0)}</span></div>
  </div>
  <div class="foot">Thank you for shopping with SoCart!</div>
  </body></html>`)
  win.document.close()
  setTimeout(() => win.print(), 400)
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders]   = useState<any[]>([])
  const [filter, setFilter]   = useState('')
  const [sel, setSel]         = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote]       = useState('')

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    load()
  }, [])

  const load = async (s?: string) => {
    setLoading(true)
    const r = await api.get(s ? `/api/orders/all?status=${s}` : '/api/orders/all').catch(()=>({data:[]}))
    setOrders(r.data); setLoading(false)
  }

  const updStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/orders/${id}/status?status=${status}${note ? `&note=${encodeURIComponent(note)}` : ''}`)
      toast.success(`Order marked as ${SL[status]}`)
      setNote(''); load(filter||undefined)
      if (sel?.id === id) setSel((p:any) => ({...p, status}))
    } catch { toast.error('Failed to update status') }
  }

  const updPay = async (id: string, ps: string) => {
    try {
      await api.put(`/api/orders/${id}/payment?payment_status=${ps}`)
      toast.success('Payment status updated')
      load(filter||undefined)
    } catch { toast.error('Failed to update payment') }
  }

  const iStyle: React.CSSProperties = { background:'var(--s2)', border:'1.5px solid var(--bdr2)', borderRadius:12, padding:'12px 14px', fontSize:14, color:'var(--txt)', width:'100%' }
  const secLabel: React.CSSProperties = { fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--txt3)', marginBottom:8, display:'block' }

  return (
    <Shell>
      {/* Filter chips */}
      <div className="noscroll" style={{ display:'flex', gap:7, padding:'12px 14px 0', overflowX:'auto' }}>
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s||undefined) }} style={{
            flexShrink:0, padding:'7px 14px', borderRadius:99, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .15s',
            background: filter===s ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'var(--s2)',
            border: filter===s ? 'none' : '1px solid var(--bdr2)',
            color: filter===s ? 'white' : 'var(--txt2)',
            boxShadow: filter===s ? '0 4px 12px rgba(124,58,237,.3)' : 'none',
          }}>
            {s ? SL[s] : 'All'}
          </button>
        ))}
      </div>

      <div className="anim-fadeup" style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid var(--accent-lt)', borderTopColor:'var(--accent)', animation:'spin 1s linear infinite' }} />
          </div>
        ) : orders.length === 0 ? (
          <p style={{ textAlign:'center', paddingTop:60, color:'var(--txt2)', fontSize:14 }}>No orders found</p>
        ) : orders.map((o: any) => {
          const s = SC[o.status] || SC.pending
          return (
            <div key={o.id} style={{ background:'var(--s1)', border:'1px solid var(--bdr)', borderRadius:18, padding:'13px 14px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:13, color:'var(--accent-text)' }}>{o.order_number}</p>
                  <p style={{ fontSize:12, color:'var(--txt2)', marginTop:2 }}>{o.delivery_name} · {o.delivery_phone}</p>
                </div>
                <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:99, background:s.bg, color:s.c, textTransform:'capitalize', whiteSpace:'nowrap' }}>
                  {SL[o.status]}
                </span>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid var(--bdr)' }}>
                <p style={{ fontWeight:800, fontSize:15, color:'var(--txt)' }}>৳{Math.round(parseFloat(o.total_amount))}</p>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <select value={o.status} onChange={e => updStatus(o.id, e.target.value)} style={{ background:'var(--s2)', border:'1px solid var(--bdr2)', borderRadius:9, padding:'7px 10px', fontSize:12, fontWeight:600, color:'var(--txt)', cursor:'pointer' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{SL[s]}</option>)}
                  </select>
                  <button onClick={() => printInvoice(o)} style={{ width:34, height:34, borderRadius:9, background:'var(--green-lt)', border:'1px solid rgba(16,185,129,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }} title="Invoice">
                    <FileDown size={15} color="var(--green)" />
                  </button>
                  <button onClick={() => setSel(o)} style={{ width:34, height:34, borderRadius:9, background:'var(--accent-lt)', border:'1px solid rgba(124,58,237,.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    <ChevronDown size={15} color="var(--accent-text)" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail sheet */}
      {sel && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.65)', backdropFilter:'blur(4px)' }} onClick={() => setSel(null)} />
          <div className="anim-slideup" style={{ position:'relative', width:'100%', maxHeight:'92vh', display:'flex', flexDirection:'column', background:'var(--s1)', borderRadius:'22px 22px 0 0', border:'1px solid var(--bdr2)', borderBottom:'none' }}>
            <div style={{ display:'flex', justifyContent:'center', padding:'10px 0 4px' }}>
              <div style={{ width:36, height:3, borderRadius:99, background:'var(--s4)' }} />
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 18px 12px', borderBottom:'1px solid var(--bdr)' }}>
              <div>
                <p style={{ fontWeight:800, fontSize:15, color:'var(--txt)' }}>{sel.order_number}</p>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:SC[sel.status]?.bg, color:SC[sel.status]?.c, textTransform:'capitalize' }}>{SL[sel.status]}</span>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => printInvoice(sel)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, background:'var(--green-lt)', border:'1px solid rgba(16,185,129,.2)', color:'var(--green)', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  <FileDown size={13} /> Invoice
                </button>
                <button onClick={() => setSel(null)} style={{ width:30, height:30, borderRadius:8, background:'var(--s3)', border:'1px solid var(--bdr)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <X size={14} color="var(--txt2)" />
                </button>
              </div>
            </div>

            <div style={{ overflowY:'auto', flex:1, padding:'16px 18px', display:'flex', flexDirection:'column', gap:12 }}>
              {/* Delivery */}
              <div style={{ background:'var(--s2)', borderRadius:14, padding:14 }}>
                <span style={secLabel}>Delivery</span>
                <div style={{ display:'flex', flexDirection:'column', gap:4, fontSize:13 }}>
                  <p><span style={{ color:'var(--txt2)' }}>Name: </span><strong style={{ color:'var(--txt)' }}>{sel.delivery_name}</strong></p>
                  <p style={{ color:'var(--txt2)' }}>Phone: <span style={{ color:'var(--txt)' }}>{sel.delivery_phone}</span></p>
                  <p style={{ color:'var(--txt2)' }}>Area: <span style={{ color:'var(--txt)' }}>{sel.delivery_area}</span></p>
                  <p style={{ color:'var(--txt2)' }}>Address: <span style={{ color:'var(--txt)' }}>{sel.delivery_address}</span></p>
                  {sel.note && <p style={{ color:'var(--txt3)', fontStyle:'italic' }}>Note: {sel.note}</p>}
                </div>
              </div>

              {/* Payment */}
              <div style={{ background:'var(--s2)', borderRadius:14, padding:14 }}>
                <span style={secLabel}>Payment</span>
                <div style={{ display:'flex', flexDirection:'column', gap:4, fontSize:13, marginBottom:10 }}>
                  <p><span style={{ color:'var(--txt2)' }}>Method: </span><strong style={{ color:'var(--txt)', textTransform:'uppercase' }}>{sel.payment_method}</strong></p>
                  <p><span style={{ color:'var(--txt2)' }}>Status: </span><span style={{ color:'var(--txt)', textTransform:'capitalize' }}>{sel.payment_status}</span></p>
                  {sel.payment_number && <p><span style={{ color:'var(--txt2)' }}>Number: </span><span style={{ color:'var(--txt)' }}>{sel.payment_number}</span></p>}
                  {sel.payment_trx    && <p><span style={{ color:'var(--txt2)' }}>TRX: </span><span style={{ color:'var(--txt)' }}>{sel.payment_trx}</span></p>}
                </div>
                <select value={sel.payment_status}
                  onChange={e => { updPay(sel.id, e.target.value); setSel((p:any)=>({...p,payment_status:e.target.value})) }}
                  style={iStyle}>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Items */}
              <div style={{ background:'var(--s2)', borderRadius:14, padding:14 }}>
                <span style={secLabel}>Items</span>
                {sel.order_items?.map((i: any) => (
                  <div key={i.id} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                      <span style={{ color:'var(--txt)' }}>{i.product_name} <span style={{ color:'var(--txt2)' }}>×{i.quantity}</span></span>
                      <span style={{ fontWeight:700, color:'var(--txt)' }}>৳{(i.price*i.quantity).toFixed(0)}</span>
                    </div>
                    {i.selected_variant && <p style={{ fontSize:11, color:'var(--txt3)', marginTop:2 }}>{Object.entries(i.selected_variant).map(([k,v])=>`${k}: ${v}`).join(' · ')}</p>}
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid var(--bdr)', fontWeight:800, fontSize:14 }}>
                  <span style={{ color:'var(--txt)' }}>Total</span>
                  <span style={{ color:'var(--accent-text)' }}>৳{parseFloat(sel.total_amount).toFixed(0)}</span>
                </div>
              </div>

              {/* Update */}
              <div style={{ display:'flex', flexDirection:'column', gap:8, paddingBottom:24 }}>
                <span style={secLabel}>Update Status</span>
                <select value={sel.status} onChange={e => setSel((p:any)=>({...p,status:e.target.value}))} style={iStyle}>
                  {STATUSES.map(s => <option key={s} value={s}>{SL[s]}</option>)}
                </select>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note for customer (optional)" style={iStyle} />
                <button onClick={() => updStatus(sel.id, sel.status)} style={{
                  padding:'13px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:14, color:'white',
                  background:'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow:'0 4px 16px rgba(124,58,237,.3)',
                }}>
                  Update & Notify Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
