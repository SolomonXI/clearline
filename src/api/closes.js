import client from './client.js'

export async function getCloses() {
  const { data } = await client.get('/closes')
  return data  // array of close objects with stats
}

export async function getClose(id) {
  const { data } = await client.get(`/closes/${id}`)
  return data
}
