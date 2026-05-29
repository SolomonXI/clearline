import { getToken } from './client.js'

const BASE = import.meta.env.VITE_API_URL

export async function getInsight(taskId) {
  const res = await fetch(`${BASE}/tasks/${taskId}/insight`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    credentials: 'include',
  })
  if (res.status === 404) throw new Error('No insight')
  if (!res.ok) throw new Error('Failed to fetch insight')
  return res.json()  // { id, taskId, summary, detail, createdAt, updatedAt }
}

export async function generateInsight(taskId, context, onChunk) {
  const res = await fetch(`${BASE}/tasks/${taskId}/insight`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    credentials: 'include',
    body: JSON.stringify({ context }),
  })

  if (!res.ok) throw new Error('Failed to generate insight')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''  // keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') return
      try {
        const { text } = JSON.parse(payload)
        onChunk(text)
      } catch {}
    }
  }
}
