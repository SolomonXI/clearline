export default function StatCell({ value, label, color, last = false }) {
  return (
    <div style={{
      flex: 1, padding: '8px 0', textAlign: 'center',
      background: 'var(--stat-cell-bg)',
      borderRight: last ? 'none' : '1px solid var(--stat-cell-border)',
    }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color, lineHeight: 1, letterSpacing: '-0.4px', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: 2 }}>
        {label}
      </div>
    </div>
  )
}
