import client from './client.js'

export async function getMyOrg() {
  const { data } = await client.get('/organisations/me')
  return data
}
