import { useAuth } from '../context/AuthContext.jsx'
export default function Login() {
  const { login } = useAuth()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)' }}>
      <button className="btn-primary" onClick={login} style={{ padding: '10px 24px', fontSize: 13 }}>
        Sign in to Clearline
      </button>
    </div>
  )
}
