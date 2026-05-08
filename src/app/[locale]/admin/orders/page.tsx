'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Eye } from 'lucide-react'

const supabase = createClient()
const statuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']

export default function AdminOrders() {
  const { locale } = useLocale()
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    loadOrders()
  }, [filter])

  const loadOrders = async () => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (filter) query = query.eq('status', filter)
    const { data } = await query
    if (data) setOrders(data)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    loadOrders()
    if (selected?.id === id) setSelected({ ...selected, status })
  }

  const statusBadge = (s: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs ${colors[s] || ''}`}>{s}</span>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Orders list */}
      <div className="md:col-span-2">
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setFilter('')}
            className={`px-3 py-1.5 rounded-lg text-sm border ${!filter ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
            {locale === 'th' ? 'ทั้งหมด' : 'All'}
          </button>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${filter === s ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {orders.map(order => (
            <button
              key={order.id}
              onClick={() => setSelected(order)}
              className={`w-full text-left bg-white border rounded-xl p-4 hover:shadow-sm transition ${
                selected?.id === order.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-800">{order.customer_name}</p>
                  <p className="text-xs text-gray-400">{order.customer_phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">฿{order.total.toLocaleString()}</p>
                  {statusBadge(order.status)}
                </div>
              </div>
              <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
            </button>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">{locale === 'th' ? 'ไม่มีคำสั่งซื้อ' : 'No orders'}</p>
          )}
        </div>
      </div>

      {/* Order detail */}
      <div className="md:col-span-1">
        {selected ? (
          <div className="bg-white border rounded-xl p-4 sticky top-20">
            <h3 className="font-semibold text-gray-700 mb-3">{locale === 'th' ? 'รายละเอียด' : 'Details'}</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">{t('checkout.name', locale)}:</span> {selected.customer_name}</p>
              <p><span className="text-gray-400">{t('checkout.phone', locale)}:</span> {selected.customer_phone}</p>
              {selected.customer_email && <p><span className="text-gray-400">{t('checkout.email', locale)}:</span> {selected.customer_email}</p>}
              <p><span className="text-gray-400">{t('checkout.address', locale)}:</span> {selected.customer_address}</p>
              <p><span className="text-gray-400">{locale === 'th' ? 'วันที่' : 'Date'} :</span> {new Date(selected.created_at).toLocaleString()}</p>
            </div>

            {/* Items */}
            <div className="mt-4 border-t pt-3">
              <h4 className="font-medium text-gray-600 text-sm mb-2">{locale === 'th' ? 'สินค้า' : 'Items'}</h4>
              {(selected.items || []).map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-gray-600">{item.product_name} x{item.quantity}</span>
                  <span>฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>{t('cart.total', locale)}</span>
                <span className="text-red-600">฿{selected.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Status actions */}
            <div className="mt-4 border-t pt-3">
              <h4 className="font-medium text-gray-600 text-sm mb-2">{locale === 'th' ? 'เปลี่ยนสถานะ' : 'Update Status'}</h4>
              <div className="flex flex-wrap gap-1">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    disabled={selected.status === s}
                    className={`px-2 py-1 text-xs rounded border ${
                      selected.status === s
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-blue-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border rounded-xl p-4 text-center text-gray-400 text-sm">
            {locale === 'th' ? 'เลือกคำสั่งซื้อเพื่อดูรายละเอียด' : 'Select an order to view details'}
          </div>
        )}
      </div>
    </div>
  )
}
