import { useState, useEffect } from 'react'

const KEY = 'vc-recently-viewed'
const MAX_ITEMS = 8

export function useRecentlyViewed() {
  const [viewed, setViewed] = useState(() => {
    const saved = localStorage.getItem(KEY)
    return saved ? JSON.parse(saved) : []
  })

  function addViewed(product) {
    setViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id)
      const updated = [product, ...filtered].slice(0, MAX_ITEMS)
      localStorage.setItem(KEY, JSON.stringify(updated))
      return updated
    })
  }

  return { viewed, addViewed }
}