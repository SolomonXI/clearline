import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Sidebar from './Sidebar.jsx'

export default function Layout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-app)', transition: 'background 0.2s' }}>
        <Outlet />
      </div>
    </div>
  )
}
