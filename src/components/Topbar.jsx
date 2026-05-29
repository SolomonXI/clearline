import ThemeToggle from './ThemeToggle.jsx'

export default function Topbar({ breadcrumb, title, actions }) {
  return (
    <header style={{
      background: 'var(--topbar-bg)', height: 52,
      padding: '0 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', borderBottom: '1px solid var(--border)',
      flexShrink: 0, transition: 'background 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {breadcrumb && <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 500 }}>{breadcrumb}</span>}
        {breadcrumb && <span style={{ color: 'var(--border)', margin: '0 5px' }}>/</span>}
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {actions}
        <ThemeToggle />
      </div>
    </header>
  )
}
