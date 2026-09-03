import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('vc-wishlist')
    return saved ? JSON.parse(saved) : []
  })
  const syncedUserId = useRef(null)

  useEffect(() => {
    localStorage.setItem('vc-wishlist', JSON.stringify(items))
  }, [items])

  // Same cross-device merge pattern as the cart: on login, union whatever
  // was already saved to the account with whatever's local, rather than
  // one overwriting the other.
  useEffect(() => {
    if (!user || syncedUserId.current === user.id) return
    syncedUserId.current = user.id

    async function mergeOnLogin() {
      const { data: rows } = await supabase.from('wishlist_items').select('item').eq('user_id', user.id)
      const dbItems = (rows || []).map((r) => r.item)

      setItems((currentLocal) => {
        const merged = [...dbItems]
        for (const localItem of currentLocal) {
          if (!merged.some((i) => String(i.id) === String(localItem.id))) {
            merged.push(localItem)
          }
        }
        if (merged.length > 0) {
          supabase.from('wishlist_items').upsert(
            merged.map((item) => ({ user_id: user.id, product_id: String(item.id), item })),
            { onConflict: 'user_id,product_id' }
          )
        }
        return merged
      })
    }

    mergeOnLogin()
  }, [user])

  function toggleWishlist(product) {
    setItems((prev) => {
      const exists = prev.find((item) => String(item.id) === String(product.id))
      if (exists) {
        if (user) {
          supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', String(product.id))
        }
        return prev.filter((item) => String(item.id) !== String(product.id))
      }
      if (user) {
        supabase.from('wishlist_items').upsert(
          { user_id: user.id, product_id: String(product.id), item: product },
          { onConflict: 'user_id,product_id' }
        )
      }
      return [...prev, product]
    })
  }

  function isWishlisted(id) {
    return items.some((item) => String(item.id) === String(id))
  }

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}