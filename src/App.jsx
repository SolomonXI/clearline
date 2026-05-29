import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Overview from './pages/Overview.jsx'
import CloseList from './pages/CloseList.jsx'
import CloseDetail from './pages/CloseDetail.jsx'
import InvoicesTeaser from './pages/InvoicesTeaser.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/overview"  element={<Overview />} />
            <Route path="/close"     element={<CloseList />} />
            <Route path="/close/:id" element={<CloseDetail />} />
            <Route path="/invoices"  element={<InvoicesTeaser />} />
            <Route path="/settings"  element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
