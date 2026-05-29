import { useState, useEffect, useCallback } from 'react'
import { getCloses, getClose } from '../api/closes.js'
import { normalizeClose } from '../utils/enums.js'

export function useCloses() {
  const [closes, setCloses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCloses()
      setCloses(data.map(normalizeClose))
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { closes, loading, error, refetch: fetch }
}

export function useClose(id) {
  const [close, setClose] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getClose(id)
      setClose(normalizeClose(data))
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetch() }, [fetch])

  return { close, loading, error, refetch: fetch }
}
