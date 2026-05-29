import { useState, useEffect, useCallback } from 'react'
import { getComments } from '../api/comments.js'

export function useComments(taskId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!taskId) { setComments([]); return }
    setLoading(true)
    try {
      const data = await getComments(taskId)
      setComments(data)
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => { fetch() }, [fetch])

  return { comments, loading, error, refetch: fetch }
}
