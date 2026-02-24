'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Eye, FileDown } from 'lucide-react'
import Layout from '../../components/Layout'
import { api, getToken } from '../../lib/api'

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled']
const STATUS_LABEL: Record<string,string> = {
  pending:'Pending', confirmed:'Confirmed', processing:'Processing',
  shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled'
}
const STATUS_COLOR: Record<string,string> = {
  pending:'bg-amber-100 text-amber-700', confirmed:'bg-blue-100 text-blue-700',
  processing:'bg-purple-100 text-purple-700', shipped:'bg-orange-100 text-orange-700',
  delivered:'bg-green-100 text-green-700', cancelled:'bg-rose-100 text-rose-700'
}

const generateInvoice = (o: any) => {
  const win = window.open('', '_blank')
  if (!win) return
  const items = (o.order_items || [])
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#1e293b;padding:32px}
    .header{display:flex;justify-content:space-between;margin-bottom:24px}
    .logo{font-size:22px;font-weight:700;color:#2563eb}
    hr{border:none;border-top:2px solid #e2e8f0;margin:16px 0}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
    .label{font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:600;margin-bottom:6px}
    p{font-size:13px;color:#475569;margin-bottom:2px}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    th{background:#f8fafc;padding:8px;text-align:left;font-size:11px;color:#94a3b8;font-weight:600;border-bottom:2px solid #e2e8f0}
    td{padding:10px 8px;font-size:13px;border-bottom:1px solid #f1f5f9}
    .total-row{font-weight:700;color:#2563eb;font-size:15px;border-top:2px solid #e2e8f0!important}
    .badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;background:#dbeafe;color:#2563eb}
    .footer{margin-top:32px;text-align:center;font-size:11px;color:#94a3b8}
  </style></head><body>
  <div class="header">
    <div><div class="logo">SoCart</div><p style="font-size:11px;color:#94a3b8;margin-top:2px">Invoice</p></div>
    <div style="text-align:right">
      <p style="font-weight:700;font-size:16px">${o.order_number}</p>
      <p style="font-size:12px;color:#94a3b8">${new Date(o.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>
      <span class="badge">${STATUS_LABEL[o.status]}</span>
    </div>
  </div>
  <hr>
  <div class="grid">
    <div>
      <div class="label">Delivery</div>
      <p><strong>${o.delivery_name}</strong></p>
      <p>${o.delivery_phone}</p>
      <p>${o.delivery_address}</p>
      <p>${o.delivery_area}</p>
      ${o.note ? `<p style="margin-top:4px;font-style:italic;color:#64748b">Note: ${o.note}</p>` : ''}
    </div>
    <div>
      <div class="label">Payment</div>
      <p>Method: <strong>${o.payment_method?.toUpperCase()}</strong></p>
      <p>Status: <strong>${o.payment_status}</strong></p>
      ${o.payment_number ? `<p>Number: ${o.payment_number}</p>` : ''}
      ${o.payment_trx ? `<p>TRX: ${o.payment_trx}</p>` : ''}
    </div>
  </div>
  <table>
    <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>
      ${items.map((i: any) => `<tr>
        <td>${i.product_name}${i.selected_variant ? `<br><span style="font-size:11px;color:#94a3b8">${Object.entries(i.selected_variant).map(([k,v])=>`${k}: ${v}`).join(', ')}</span>` : ''}</td>
        <td>${i.quantity}</td><td>৳${parseFloat(i.price).toFixed(0)}</td>
        <td style="text-align:right">৳${(i.quantity*parseFloat(i.price)).toFixed(0)}</td>
      </tr>`).join('')}
      <tr><td colspan="3" style="text-align:right;font-size:12px;color:#94a3b8">Delivery</td><td style="text-align:right">৳${parseFloat(o.delivery_charge||0).toFixed(0)}</td></tr>
      <tr class="total-row"><td colspan="3" style="text-align:right">Total</td><td style="text-align:right">৳${parseFloat(o.total_amount).toFixed(0)}</td></tr>
    </tbody>
  </table>
  <div class="footer">Thank you for shopping with SoCart!</div>
  </body></html>`)
  win.document.close()
  setTimeout(() => win.print(), 400)
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders]     = useState<any[]>([])
  const [filter, setFilter]     = useState('')
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading]   = useState(true)
  const [note, setNote]         = useState('')

  useEffect(() => {
    if (!getToken()) { router.push('/'); return }
    load()
  }, [])

  const load = async (status?: string) => {
    setLoading(true)
    const r = await api.get(status ? `/api/orders/all?status=${status}` : '/api/orders/all').catch(() => ({ data: [] }))
    setOrders(r.data)
    setLoading(false)
  }

  const updateStatus = async (orderId: string, status: string) => {
    await api.put(`/api/orders/${orderId}/status?status=${status}${note ? `&note=${encodeURIComponent(note)}` : ''}`)
    setNote('')
    load(filter || undefined)
    if (selected?.id === orderId) setSelected((p: any) => ({ ...p, status }))
  }

  const updatePayment = async (orderId: string, ps: string) => {
    await api.put(`/api/orders/${orderId}/payment?payment_status=${ps}`)
    load(filter || undefined)
  }

  return (
    <Layout>
      {/* Filter Tabs */}
      <div className="flex gap-2 px-4 pt-4 pb-2 overflow-x-auto scrollbar-hide">
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s || undefined) }}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition
              ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}>
            {s ? STATUS_LABEL[s] : 'All'}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2 pb-2">
        {loading
          ? <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          : orders.length === 0
            ? <div className="text-center py-12 text-slate-400 text-sm">No orders found</div>
            : orders.map((o: any) => (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-blue-600">{o.order_number}</p>
                    <p className="text-xs text-slate-500">{o.delivery_name} · {o.delivery_phone}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[o.status]}`}>
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800">৳{parseFloat(o.total_amount).toFixed(0)}</p>
                  <div className="flex items-center gap-2">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 outline-none">
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                    <button onClick={() => generateInvoice(o)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Invoice">
                      <FileDown size={16} />
                    </button>
                    <button onClick={() => setSelected(o)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
        }
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-3xl">
              <div>
                <h3 className="font-bold text-slate-900">{selected.order_number}</h3>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[selected.status]}`}>
                  {STATUS_LABEL[selected.status]}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => generateInvoice(selected)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-semibold">
                  <FileDown size={13} /> Invoice
                </button>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-3 text-sm">
              <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Delivery</p>
                <p><span className="text-slate-400">Name:</span> <span className="font-medium">{selected.delivery_name}</span></p>
                <p><span className="text-slate-400">Phone:</span> {selected.delivery_phone}</p>
                <p><span className="text-slate-400">Area:</span> {selected.delivery_area}</p>
                <p><span className="text-slate-400">Address:</span> {selected.delivery_address}</p>
                {selected.note && <p><span className="text-slate-400">Note:</span> {selected.note}</p>}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Payment</p>
                <p><span className="text-slate-400">Method:</span> <strong className="uppercase">{selected.payment_method}</strong></p>
                <p><span className="text-slate-400">Status:</span> <span className="capitalize">{selected.payment_status}</span></p>
                {selected.payment_number && <p><span className="text-slate-400">Number:</span> {selected.payment_number}</p>}
                {selected.payment_trx && <p><span className="text-slate-400">TRX:</span> {selected.payment_trx}</p>}
                <div className="mt-2">
                  <select value={selected.payment_status}
                    onChange={e => { updatePayment(selected.id, e.target.value); setSelected((p: any) => ({...p, payment_status: e.target.value})) }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Items</p>
                <div className="space-y-2">
                  {selected.order_items?.map((i: any) => (
                    <div key={i.id}>
                      <div className="flex justify-between">
                        <span>{i.product_name} x{i.quantity}</span>
                        <span className="font-medium">৳{(i.price * i.quantity).toFixed(0)}</span>
                      </div>
                      {i.selected_variant && (
                        <p className="text-xs text-slate-400">
                          {Object.entries(i.selected_variant).map(([k,v]) => `${k}: ${v}`).join(' · ')}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">৳{parseFloat(selected.total_amount).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">Update Status</p>
                <select value={selected.status} onChange={e => setSelected((p: any) => ({...p, status: e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <input value={note} onChange={e => setNote(e.target.value)}
                  placeholder="Note for customer (optional)"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
                <button onClick={() => updateStatus(selected.id, selected.status)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold">
                  Update & Notify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
