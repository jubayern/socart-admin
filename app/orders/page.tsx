'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, FileDown, ChevronDown } from 'lucide-react'
import Shell from '../../components/Shell'
import { api, getToken } from '../../lib/api'

const SL: Record<string,string> = {
  pending:'Pending', confirmed:'Confirmed', processing:'Processing',
  shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled'
}
const SS: Record<string,{bg:string,color:string}> = {
  pending:    {bg:'#fef3c7',color:'#92400e'},
  confirmed:  {bg:'#dbeafe',color:'#1e3a5f'},
  processing: {bg:'#ede9fe',color:'#4c1d95'},
  shipped:    {bg:'#ffedd5',color:'#7c2d12'},
  delivered:  {bg:'#dcfce7',color:'#14532d'},
  cancelled:  {bg:'#fee2e2',color:'#7f1d1d'},
}
const STATUSES = Object.keys(SL)

const printInvoice = (o: any) => {
  const win = window.open('', '_blank')
  if (!win) return
  const items = o.order_items || []
  const subtotal = items.reduce((s: number, i: any) => s + i.quantity * parseFloat(i.price), 0)
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Sora',Arial,sans-serif;color:#111827;padding:32px;font-size:13px}
    .logo{font-size:22px;font-weight:800;color:#3b5bdb;letter-spacing:-0.5px}
    .header{display:flex;justify-content:space-between;align-items:start;margin-bottom:28px}
    .badge{display:inline-block;padding:3px 12px;border-radius:99px;font-size:11px;font-weight:700;background:#dbeafe;color:#1d4ed8}
    hr{border:none;border-top:1.5px solid #e5e7eb;margin:20px 0}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
    .section-label{font-size:10px;font-weight:700;text-transform:uppercase;color:#9ca3af;letter-spacing:.05em;margin-bottom:8px}
    p{line-height:1.6;color:#374151}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    th{padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#9ca3af;background:#f9fafb;border-bottom:1.5px solid #e5e7eb}
    td{padding:12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#374151}
    .total-section{margin-left:auto;width:220px;margin-top:16px}
    .total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#6b7280}
    .grand-total{display:flex;justify-content:space-between;padding:10px 0 0;font-size:15px;font-weight:800;color:#3b5bdb;border-top:2px solid #e5e7eb;margin-top:6px}
    .footer{text-align:center;margin-top:40px;font-size:11px;color:#9ca3af}
  </style></head><body>
  <div class="header">
    <div>
      <div class="logo">SoCart</div>
      <p style="color:#9ca3af;font-size:12px;margin-top:2px">Invoice</p>
    </div>
    <div style="text-align:right">
      <p style="font-weight:800;font-size:17px;color:#111827">${o.order_number}</p>
      <p style="color:#9ca3af;font-size:12px">${new Date(o.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
      <div style="margin-top:6px"><span class="badge">${SL[o.status] || o.status}</span></div>
    </div>
  </div>
  <hr>
  <div class="grid2">
    <div>
      <div class="section-label">Delivery</div>
      <p><strong>${o.delivery_name}</strong></p>
      <p>${o.delivery_phone}</p>
      <p>${o.delivery_address}</p>
      <p>${o.delivery_area}</p>
      ${o.note?`<p style="font-style:italic;color:#6b7280;margin-top:4px">Note: ${o.note}</p>`:''}
    </div>
    <div>
      <div class="section-label">Payment</div>
      <p>Method: <strong style="text-transform:uppercase">${o.payment_method}</strong></p>
      <p>Status: <strong style="text-transform:capitalize">${o.payment_status}</strong></p>
      ${o.payment_number?`<p>Number: ${o.payment_number}</p>`:''}
      ${o.payment_trx?`<p>TRX: ${o.payment_trx}</p>`:''}
    </div>
  </div>
  <table>
    <thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>
      ${items.map((i:any)=>`<tr>
        <td>${i.product_name}${i.selected_variant?`<br><span style="font-size:11px;color:#9ca3af">${Object.entries(i.selected_variant).map(([k,v])=>`${k}: ${v}`).join(', ')}</span>`:''}</td>
        <td>${i.quantity}</td>
        <td>৳${parseFloat(i.price).toFixed(0)}</td>
        <td style="text-align:right">৳${(i.quantity*parseFloat(i.price)).toFixed(0)}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <div class="total-section">
    <div class="total-row"><span>Subtotal</span><span>৳${subtotal.toFixed(0)}</span></div>
    <div class="total-row"><span>Delivery</span><span>৳${parseFloat(o.delivery_charge||0).toFixed(0)}</span></div>
    <div class="grand-total"><span>Total</span><span>৳${parseFloat(o.total_amount).toFixed(0)}</span></div>
  </div>
  <div class="footer">Thank you for shopping with SoCart!</div>
  </body></html>`)
  win.document.close()
  setTimeout(() => win.print(), 400)
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders]     = useState<any[]>([])
  const [filter, setFilter]     = useState('')
  const [sel, setSel]           = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [note, setNote]         = useState('')

  useEffect(() => {
    if (!getToken()) { router.replace('/'); return }
    load()
  }, [])

  const load = async (s?: string) => {
    setLoading(true)
    const r = await api.get(s ? `/api/orders/all?status=${s}` : '/api/orders/all').catch(() => ({data:[]}))
    setOrders(r.data); setLoading(false)
  }

  const updStatus = async (id: string, status: string) => {
    await api.put(`/api/orders/${id}/status?status=${status}${note ? `&note=${encodeURIComponent(note)}` : ''}`)
    setNote(''); load(filter || undefined)
    if (sel?.id === id) setSel((p: any) => ({...p, status}))
  }

  const updPay = async (id: string, ps: string) => {
    await api.put(`/api/orders/${id}/payment?payment_status=${ps}`)
    load(filter || undefined)
  }

  return (
    <Shell title="Orders">
      {/* Filter tabs */}
      <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto hide-scroll">
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s||undefined) }}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: filter===s ? 'var(--brand)' : 'var(--card)',
              color:       filter===s ? 'white'        : 'var(--muted)',
              border:      filter===s ? 'none'         : '1.5px solid var(--border)',
            }}>
            {s ? SL[s] : 'All'}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2.5 pb-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor:'var(--brand-light)', borderTopColor:'var(--brand)' }} />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center py-16 text-sm" style={{ color:'var(--muted)' }}>No orders found</p>
        ) : orders.map((o: any) => {
          const s = SS[o.status] || SS.pending
          return (
            <div key={o.id} className="p-4 rounded-3xl shadow-sm" style={{ background:'var(--card)' }}>
              <div className="flex items-start justify-between mb-2.5">
                <div>
                  <p className="font-bold" style={{ color:'var(--brand)' }}>{o.order_number}</p>
                  <p className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>{o.delivery_name} · {o.delivery_phone}</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full capitalize" style={{ background:s.bg, color:s.color }}>
                  {SL[o.status]}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2" style={{ borderTop:'1px solid var(--border)' }}>
                <p className="font-bold" style={{ color:'var(--text)' }}>৳{Math.round(parseFloat(o.total_amount))}</p>
                <div className="flex items-center gap-2">
                  <select value={o.status} onChange={e => updStatus(o.id, e.target.value)}
                    className="text-xs font-semibold rounded-xl px-2 py-1.5 outline-none"
                    style={{ background:'var(--bg)', color:'var(--text)', border:'1.5px solid var(--border)' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{SL[s]}</option>)}
                  </select>
                  <button onClick={() => printInvoice(o)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background:'#dcfce7', color:'#15803d' }}>
                    <FileDown size={16} />
                  </button>
                  <button onClick={() => setSel(o)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background:'var(--brand-light)', color:'var(--brand)' }}>
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail bottom sheet */}
      {sel && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSel(null)} />
          <div className="relative rounded-t-3xl flex flex-col" style={{ background:'var(--card)', maxHeight:'90vh' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background:'var(--border)' }} />
            </div>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom:'1px solid var(--border)' }}>
              <div>
                <p className="font-bold" style={{ color:'var(--text)' }}>{sel.order_number}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: SS[sel.status]?.bg, color: SS[sel.status]?.color }}>
                  {SL[sel.status]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => printInvoice(sel)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background:'#15803d' }}>
                  <FileDown size={13} /> Invoice
                </button>
                <button onClick={() => setSel(null)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'var(--bg)' }}>
                  <X size={16} style={{ color:'var(--muted)' }} />
                </button>
              </div>
            </div>
            <div className="overflow-auto flex-1 px-5 py-4 space-y-3">
              {/* Delivery */}
              <div className="rounded-2xl p-4 space-y-1.5 text-sm" style={{ background:'var(--bg)' }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'var(--muted)' }}>Delivery</p>
                <p style={{ color:'var(--text)' }}><span style={{ color:'var(--muted)' }}>Name: </span><strong>{sel.delivery_name}</strong></p>
                <p style={{ color:'var(--text)' }}><span style={{ color:'var(--muted)' }}>Phone: </span>{sel.delivery_phone}</p>
                <p style={{ color:'var(--text)' }}><span style={{ color:'var(--muted)' }}>Area: </span>{sel.delivery_area}</p>
                <p style={{ color:'var(--text)' }}><span style={{ color:'var(--muted)' }}>Address: </span>{sel.delivery_address}</p>
                {sel.note && <p style={{ color:'var(--muted)', fontStyle:'italic' }}>Note: {sel.note}</p>}
              </div>
              {/* Payment */}
              <div className="rounded-2xl p-4 space-y-1.5 text-sm" style={{ background:'var(--bg)' }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:'var(--muted)' }}>Payment</p>
                <p style={{ color:'var(--text)' }}><span style={{ color:'var(--muted)' }}>Method: </span><strong className="uppercase">{sel.payment_method}</strong></p>
                <p style={{ color:'var(--text)' }}><span style={{ color:'var(--muted)' }}>Status: </span><span className="capitalize">{sel.payment_status}</span></p>
                {sel.payment_number && <p style={{ color:'var(--text)' }}><span style={{ color:'var(--muted)' }}>Number: </span>{sel.payment_number}</p>}
                {sel.payment_trx    && <p style={{ color:'var(--text)' }}><span style={{ color:'var(--muted)' }}>TRX: </span>{sel.payment_trx}</p>}
                <select value={sel.payment_status}
                  onChange={e => { updPay(sel.id, e.target.value); setSel((p:any)=>({...p,payment_status:e.target.value})) }}
                  className="w-full mt-2 px-3 py-2.5 rounded-xl text-sm font-medium outline-none"
                  style={{ background:'var(--card)', border:'1.5px solid var(--border)', color:'var(--text)' }}>
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              {/* Items */}
              <div className="rounded-2xl p-4" style={{ background:'var(--bg)' }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color:'var(--muted)' }}>Items</p>
                <div className="space-y-2">
                  {sel.order_items?.map((i: any) => (
                    <div key={i.id}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color:'var(--text)' }}>{i.product_name} <span style={{ color:'var(--muted)' }}>x{i.quantity}</span></span>
                        <span className="font-bold" style={{ color:'var(--text)' }}>৳{(i.price*i.quantity).toFixed(0)}</span>
                      </div>
                      {i.selected_variant && (
                        <p className="text-xs mt-0.5" style={{ color:'var(--muted)' }}>
                          {Object.entries(i.selected_variant).map(([k,v])=>`${k}: ${v}`).join(' · ')}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-bold" style={{ borderTop:'1.5px solid var(--border)' }}>
                    <span style={{ color:'var(--text)' }}>Total</span>
                    <span style={{ color:'var(--brand)' }}>৳{parseFloat(sel.total_amount).toFixed(0)}</span>
                  </div>
                </div>
              </div>
              {/* Update status */}
              <div className="space-y-2 pb-6">
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color:'var(--muted)' }}>Update Status</p>
                <select value={sel.status} onChange={e => setSel((p:any)=>({...p,status:e.target.value}))}
                  className="w-full px-4 py-3 rounded-2xl text-sm font-medium outline-none"
                  style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }}>
                  {STATUSES.map(s => <option key={s} value={s}>{SL[s]}</option>)}
                </select>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note for customer (optional)"
                  className="w-full px-4 py-3 rounded-2xl text-sm outline-none"
                  style={{ background:'var(--bg)', border:'1.5px solid var(--border)', color:'var(--text)' }} />
                <button onClick={() => updStatus(sel.id, sel.status)}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold text-white"
                  style={{ background:'var(--brand)' }}>
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
