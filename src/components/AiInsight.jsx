export default function AiInsight({ summary, detail }) {
  return (
    <div style={{
      borderRadius: 9, padding: '13px 14px',
      background: 'var(--ai-bg)',
      border: '1px solid var(--ai-border)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--ai-top)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        <span style={{
          background: 'linear-gradient(135deg,#4F6EF7,#7C3AED)',
          borderRadius: 4, padding: '2px 6px',
          fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.3px', textTransform: 'uppercase',
        }}>
          Clearline AI
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ai-label)' }}>Variance insight</span>
      </div>
      <p style={{ fontSize: 11, color: 'var(--ai-text)', lineHeight: 1.65 }}>
        <strong style={{ color: 'var(--ai-strong)', fontWeight: 600 }}>{summary}</strong>{' '}{detail}
      </p>
    </div>
  )
}
