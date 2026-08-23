import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useAddresses() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchAddresses() {
    if (!user) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setAddresses(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAddresses()
  }, [user])

  async function addAddress(address) {
    if (!user) return
    await supabase.from('addresses').insert({ ...address, user_id: user.id })
    fetchAddresses()
  }

  async function deleteAddress(id) {
    await supabase.from('addresses').delete().eq('id', id)
    fetchAddresses()
  }

  return { addresses, loading, addAddress, deleteAddress }
}