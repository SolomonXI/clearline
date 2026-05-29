import { useState, useEffect, useCallback } from 'react'
import { getTasksForClose } from '../api/tasks.js'
import { normalizeTask } from '../utils/enums.js'

export function useTasks(closeId) {
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!closeId) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await getTasksForClose(closeId)
      const normalized = {}
      for (const [section, tasks] of Object.entries(data)) {
        normalized[section] = tasks.map(normalizeTask)
      }
      setGrouped(normalized)
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [closeId])

  useEffect(() => { fetch() }, [fetch])

  function updateTaskLocal(taskId, updates) {
    setGrouped(prev => {
      const next = {}
      for (const [section, tasks] of Object.entries(prev)) {
        next[section] = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      }
      return next
    })
  }

  return { grouped, loading, error, refetch: fetch, updateTaskLocal }
}
