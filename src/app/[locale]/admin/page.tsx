'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { Package, ShoppingBag, Car, Tags, Award } from 'lucide-react'

const supabase = createClient()

export default function AdminDashboard() {
  const { locale } = useLocale()
  const [stats, setStats] = useState({ products: 0, orders: 0, makes: 0, categories: 0, brands: 0 })
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('makes').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('brands').select('*', { count: 'exact', head: true }),
    ]).then(([p, o, m, c, b]) => {
      setStats({
        products: p.count || 0,
        orders: o.count || 0,
        makes: m.count || 0,
        categories: c.count || 0,
        brands: b.count || 0,
      })
    })

    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5).then(({ data }) => {
      if (data) setRecentOrders(data)
    })
  }, [])

  const cards = [
    { icon: Package, label: t('admin.products', locale), value: stats.products, color: 'bg-blue-500' },
    { icon: ShoppingBag, label: t('admin.orders', locale), value: stats.orders, color: 'bg-green-500' },
    { icon: Award, label: locale === 'th' ? 'แบรนด์' : 'Brands', value: stats.brands, color: 'bg-pink-500' },
    { icon: Car, label: t('admin.vehicles', locale), value: stats.makes, color: 'bg-purple-500' },
    { icon: Tags, label: t('admin.categories', locale), value: stats.categories, color: 'bg-orange-500' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border shadow-sm">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
              <card.icon size={20} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-gray-700 mb-3">
        {locale === 'th' ? 'คำสั่งซื้อล่าสุด' : 'Recent Orders'}
      </h2>
      {recentOrders.length === 0 ? (
        <p className="text-gray-400 text-sm">{locale === 'th' ? 'ไม่มีคำสั่งซื้อ' : 'No orders yet'}</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left p-3">{locale === 'th' ? 'ลูกค้า' : 'Customer'}</th>
                <th className="text-left p-3">{locale === 'th' ? 'ยอดรวม' : 'Total'}</th>
                <th className="text-left p-3">{locale === 'th' ? 'สถานะ' : 'Status'}</th>
                <th className="text-left p-3">{locale === 'th' ? 'วันที่' : 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-3">{order.customer_name}</td>
                  <td className="p-3 font-medium">฿{order.total.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
