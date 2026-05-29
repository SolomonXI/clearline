import Topbar from '../components/Topbar.jsx'
import { invoices } from '../data/invoices.js'

const stages = [
  { id: 'new',        label: 'New' },
  { id: 'extracting', label: 'Extracting' },
  { id: 'pending',    label: 'Pending Approval' },
  { id: 'approved',   label: 'Approved' },
  { id: 'synced',     label: 'Synced to QuickBooks' },
]

export default function InvoicesTeaser() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <Topbar breadcrumb="Workspace" title="Invoices" />
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, minWidth: 900 }}>
          {stages.map(stage => (
            <div key={stage.id}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                {stage.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {invoices.filter(i => i.stage === stage.id).map(inv => (
                  <div key={inv.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{inv.vendor}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-text)', fontVariantNumeric: 'tabular-nums' }}>{inv.amount}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>{inv.date}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Coming soon overlay */}
      <div style={{
        position: 'absolute', top: 52, left: 0, right: 0, bottom: 0,
        background: 'rgba(13,17,23,0.82)', backdropFilter: 'blur(4px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.4px' }}>Invoice Approval</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 380, lineHeight: 1.6 }}>
          AI-powered invoice capture, configurable approval workflows, and one-click sync to QuickBooks. Launching Q3 2026.
        </div>
        <button className="btn-primary" style={{ marginTop: 8, padding: '9px 24px', fontSize: 13 }}>
          Join the waitlist
        </button>
      </div>
    </div>
  )
}
