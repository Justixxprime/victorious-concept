import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('vc-wishlist')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('vc-wishlist', JSON.stringify(items))
  }, [items])

  function toggleWishlist(product) {
    setItems((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) {
        return prev.filter((item) => item.id !== product.id)
      }
      return [...prev, product]
    })
  }

  function isWishlisted(id) {
    return items.some((item) => item.id === id)
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