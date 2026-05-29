import client from './client.js'

export async function getComments(taskId) {
  const { data } = await client.get(`/tasks/${taskId}/comments`)
  return data  // array of { id, text, taskId, authorId, createdAt, author: { id, name, initials } }
}

export async function postComment(taskId, text) {
  const { data } = await client.post(`/tasks/${taskId}/comments`, { text })
  return data
}

export async function deleteComment(commentId) {
  await client.delete(`/comments/${commentId}`)
}
