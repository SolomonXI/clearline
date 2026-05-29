export default function ProgressBar({ pct, showLabel = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--progress-track)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--progress-fill)', borderRadius: 9999 }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {pct}%
        </span>
      )}
    </div>
  )
}
