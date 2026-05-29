import client from './client.js'

export async function getTasksForClose(closeId) {
  const { data } = await client.get(`/closes/${closeId}/tasks`)
  return data  // { AP: [...], AR: [...], GL: [...], ... }
}

export async function updateTask(taskId, updates) {
  const { data } = await client.patch(`/tasks/${taskId}`, updates)
  return data
}
