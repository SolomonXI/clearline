import { useState } from 'react'
import Topbar from '../components/Topbar.jsx'
import Avatar from '../components/Avatar.jsx'
import { team } from '../data/team.js'

const categories = ['Company', 'Team members', 'Notifications', 'Integrations', 'Security']

export default function Settings() {
  const [active, setActive] = useState('Team members')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Topbar title="Settings" />
      <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '220px 1fr' }}>
        {/* Category list */}
        <div style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border)', padding: '16px 10px', overflowY: 'auto' }}>
          {categories.map(c => (
            <div key={c} onClick={() => setActive(c)} style={{
              padding: '8px 12px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 500,
              color: active === c ? 'var(--accent-text)' : 'var(--text-muted)',
              background: active === c ? 'var(--accent-subtle)' : 'transparent',
              marginBottom: 2, transition: 'background 0.12s',
            }}>{c}</div>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: 24 }}>
          {active === 'Team members' && (
            <div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: 4 }}>Team Members</div>
              <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 20 }}>Manage who has access to your Clearline workspace.</div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', padding: '8px 18px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  {['Member', 'Email', 'Role'].map(h => (
                    <span key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</span>
                  ))}
                </div>
                {team.map(m => (
                  <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', padding: '12px 18px', borderTop: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={m.initials} color={m.color} size={28} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-faint)', background: 'var(--bg-subtle)', padding: '3px 8px', borderRadius: 5, display: 'inline-block' }}>{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {active === 'Integrations' && (
            <div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: 20 }}>Integrations</div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 480 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>QuickBooks Online</div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>Last synced 1 hour ago · Acme Corp</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--chip-done-bg)', color: 'var(--chip-done-text)', padding: '4px 10px', borderRadius: 5 }}>Connected</span>
              </div>
            </div>
          )}
          {!['Team members', 'Integrations'].includes(active) && (
            <div style={{ color: 'var(--text-ghost)', fontSize: 12, fontStyle: 'italic' }}>
              {active} settings — coming soon.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
