'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { CartItem } from '@/lib/types'

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQty: () => {},
  clearCart: () => {},
  total: 0,
  count: 0,
})

export function useCart() {
  return useContext(CartContext)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('ccr-cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const save = useCallback((newItems: CartItem[]) => {
    setItems(newItems)
    localStorage.setItem('ccr-cart', JSON.stringify(newItems))
  }, [])

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.product_id)
      const newItems = existing
        ? prev.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...item, quantity: 1 }]
      localStorage.setItem('ccr-cart', JSON.stringify(newItems))
      return newItems
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const newItems = prev.filter(i => i.product_id !== productId)
      localStorage.setItem('ccr-cart', JSON.stringify(newItems))
      return newItems
    })
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty < 1) return
    setItems(prev => {
      const newItems = prev.map(i => i.product_id === productId ? { ...i, quantity: qty } : i)
      localStorage.setItem('ccr-cart', JSON.stringify(newItems))
      return newItems
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem('ccr-cart')
  }, [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}
