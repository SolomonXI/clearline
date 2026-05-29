import axios from 'axios'

let accessToken = null

export function setToken(token) {
  accessToken = token
}

export function getToken() {
  return accessToken
}

export function clearToken() {
  accessToken = null
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

client.interceptors.request.use(config => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

client.interceptors.response.use(
  // Auto-unwrap the TransformInterceptor { data: ... } envelope
  response => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return client(original)
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        // Unwrap TransformInterceptor envelope
        const refreshData = res.data?.data ?? res.data
        setToken(refreshData.accessToken)
        processQueue(null, refreshData.accessToken)
        original.headers.Authorization = `Bearer ${refreshData.accessToken}`
        return client(original)
      } catch (err) {
        processQueue(err, null)
        clearToken()
        window.location.href = '/'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default client
