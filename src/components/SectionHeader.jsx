const pipColors = {
  ap: 'var(--pip-ap)', ar: 'var(--pip-ar)', gl: 'var(--pip-gl)',
  cash: 'var(--pip-cash)', 'fixed-assets': 'var(--pip-fa)', revenue: 'var(--pip-rev)',
}

const sectionNames = {
  ap: 'Accounts Payable', ar: 'Accounts Receivable', gl: 'General Ledger',
  cash: 'Cash & Banking', 'fixed-assets': 'Fixed Assets', revenue: 'Revenue',
}

export default function SectionHeader({ section, done, total }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '9px 18px 7px',
      position: 'sticky', top: 0,
      background: 'var(--section-hdr-bg)', zIndex: 1,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: pipColors[section], flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', flex: 1 }}>
        {sectionNames[section] || section}
      </span>
      <span style={{ fontSize: 10, color: 'var(--text-ghost)', fontVariantNumeric: 'tabular-nums' }}>
        {done} / {total}
      </span>
    </div>
  )
}
