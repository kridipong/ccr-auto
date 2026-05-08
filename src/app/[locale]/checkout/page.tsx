'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/lib/i18n/locale-provider'
import { t } from '@/lib/i18n'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'
import { Banknote, Upload, CheckCircle } from 'lucide-react'

const supabase = createClient()

export default function CheckoutPage() {
  const { locale } = useLocale()
  const router = useRouter()
  const { items, total, clearCart } = useCart()

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.address) {
      setError(locale === 'th' ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please fill in all required fields')
      return
    }
    setSubmitting(true)
    setError('')

    const orderItems = items.map(i => ({
      product_id: i.product_id,
      product_name: i.name,
      sku: i.sku,
      price: i.price,
      quantity: i.quantity,
    }))

    const { data, error: err } = await supabase.from('orders').insert({
      items: orderItems,
      total,
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email || null,
      customer_address: form.address,
      payment_method: 'bank_transfer',
      status: 'pending',
    }).select().single()

    if (err) {
      setError(err.message)
      setSubmitting(false)
      return
    }

    clearCart()
    setSuccess(true)
    setSubmitting(false)
  }

  if (items.length === 0 && !success) {
    router.push(`/${locale}/cart`)
    return null
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('checkout.success', locale)}</h1>
        <p className="text-gray-500 mb-6">
          {locale === 'th'
            ? 'คำสั่งซื้อของคุณถูกบันทึกแล้ว เราจะติดต่อกลับโดยเร็วที่สุด'
            : 'Your order has been placed. We will contact you shortly.'}
        </p>
        <button
          onClick={() => router.push(`/${locale}/products`)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          {t('products.all', locale)}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('checkout.title', locale)}</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-3 space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">{t('checkout.name', locale)} *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">{t('checkout.phone', locale)} *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">{t('checkout.email', locale)}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">{t('checkout.address', locale)} *</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300"
          >
            {submitting ? t('common.loading', locale) : t('checkout.place_order', locale)}
          </button>
        </form>

        {/* Order Summary + Bank Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3">{locale === 'th' ? 'รายการสินค้า' : 'Order Items'}</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate">{item.name} x{item.quantity}</span>
                  <span className="font-medium">฿{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
              <span>{t('cart.total', locale)}</span>
              <span className="text-red-600">฿{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Bank Transfer Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Banknote size={20} className="text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">{t('checkout.bank_info', locale)}</h3>
            </div>
            <div className="space-y-1 text-sm text-yellow-900">
              <p><strong>{t('checkout.bank_name', locale)}</strong></p>
              <p>{t('checkout.bank_account', locale)}</p>
              <p>{t('checkout.bank_holder', locale)}</p>
              <p className="mt-2 text-xs text-yellow-700">
                {locale === 'th'
                  ? 'หลังจากโอนเงินกรุณาแจ้งชำระเงินผ่าน Line หรือโทรศัพท์'
                  : 'After payment, please notify us via Line or phone.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
