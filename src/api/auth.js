import client, { setToken, clearToken } from './client.js'

export async function login(email, password) {
  const { data } = await client.post('/auth/login', { email, password })
  setToken(data.accessToken)
  return data  // { accessToken, user, org }
}

export async function register(name, email, password, orgName) {
  const { data } = await client.post('/auth/register', { name, email, password, orgName })
  setToken(data.accessToken)
  return data  // { accessToken, user, org }
}

export async function logout() {
  try { await client.post('/auth/logout') } catch {}
  clearToken()
}

export async function refresh() {
  const { data } = await client.post('/auth/refresh')
  setToken(data.accessToken)
  return data  // { accessToken }
}
