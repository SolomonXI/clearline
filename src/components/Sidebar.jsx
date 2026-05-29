import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Avatar from './Avatar.jsx'

const navItems = [
  { to: '/overview',  label: 'Overview',        icon: IconGrid },
  { to: '/close',     label: 'Close Workspace',  icon: IconClose,   badge: '4' },
  { to: '/invoices',  label: 'Invoices',         icon: IconInvoice, soon: true },
  { to: '/settings',  label: 'Settings',         icon: IconSettings, section: 'Config' },
]

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside style={{ background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', width: 220, flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#4F6EF7,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, color: '#F9FAFB', letterSpacing: '-0.3px' }}>Clearline</div>
          <div style={{ fontSize: 9, color: 'var(--sidebar-sub)', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: 1 }}>Finance OS</div>
        </div>
      </div>

      {/* Org */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--sidebar-border)' }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--sidebar-sub)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 5 }}>Workspace</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sidebar-org-bg)', borderRadius: 7, padding: '7px 10px' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sidebar-user)' }}>Acme Corp</span>
          <span style={{ fontSize: 10, color: 'var(--sidebar-sub)' }}>⌄</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <SidebarLabel>Main</SidebarLabel>
        {navItems.filter(n => !n.section).map(n => <SidebarItem key={n.to} {...n} />)}
        <SidebarLabel style={{ marginTop: 6 }}>Config</SidebarLabel>
        {navItems.filter(n => n.section).map(n => <SidebarItem key={n.to} {...n} />)}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar initials={user?.initials || 'SC'} size={28} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--sidebar-user)' }}>{user?.name || 'Sarah Chen'}</div>
          <div style={{ fontSize: 9, color: 'var(--sidebar-sub)', marginTop: 1 }}>Controller · Acme Corp</div>
        </div>
      </div>
    </aside>
  )
}

function SidebarLabel({ children, style }) {
  return <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--sidebar-sub)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '8px 8px 3px', ...style }}>{children}</div>
}

function SidebarItem({ to, label, icon: Icon, badge, soon }) {
  return (
    <NavLink to={to} style={({ isActive }) => ({
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '7px 10px', borderRadius: 7, textDecoration: 'none',
      color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
      background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
      fontSize: 12, fontWeight: 500, transition: 'background 0.12s, color 0.12s',
    })}>
      <Icon />
      {label}
      {badge && <span style={{ marginLeft: 'auto', background: 'rgba(239,68,68,0.25)', color: '#FCA5A5', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 9999 }}>{badge}</span>}
      {soon && <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--sidebar-sub)', fontStyle: 'italic' }}>soon</span>}
    </NavLink>
  )
}

function IconGrid() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>
}
function IconClose() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M2 8h8M2 12h5"/><circle cx="13" cy="11" r="2.5"/><path d="M15 13l1.5 1.5" strokeLinecap="round"/></svg>
}
function IconInvoice() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M6 6h4M6 9h2"/></svg>
}
function IconSettings() {
  return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.41 1.41M11.37 11.37l1.41 1.41M3.22 12.78l1.41-1.41M11.37 4.63l1.41-1.41"/></svg>
}
