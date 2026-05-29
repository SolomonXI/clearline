import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, register as apiRegister, logout as apiLogout, refresh } from '../api/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [org, setOrg] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Restore session from httpOnly cookie on mount
  useEffect(() => {
    refresh()
      .then(() => {
        const stored = sessionStorage.getItem('cl_user')
        const storedOrg = sessionStorage.getItem('cl_org')
        if (stored && storedOrg) {
          setUser(JSON.parse(stored))
          setOrg(JSON.parse(storedOrg))
        }
      })
      .catch(() => {
        sessionStorage.removeItem('cl_user')
        sessionStorage.removeItem('cl_org')
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await apiLogin(email, password)
    setUser(data.user)
    setOrg(data.org)
    sessionStorage.setItem('cl_user', JSON.stringify(data.user))
    sessionStorage.setItem('cl_org', JSON.stringify(data.org))
    navigate('/overview')
  }

  async function registerUser(name, email, password, orgName) {
    const data = await apiRegister(name, email, password, orgName)
    setUser(data.user)
    setOrg(data.org)
    sessionStorage.setItem('cl_user', JSON.stringify(data.user))
    sessionStorage.setItem('cl_org', JSON.stringify(data.org))
    navigate('/overview')
  }

  async function logout() {
    await apiLogout()
    setUser(null)
    setOrg(null)
    sessionStorage.removeItem('cl_user')
    sessionStorage.removeItem('cl_org')
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, org, loading, login, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
