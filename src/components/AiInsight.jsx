import { useState, useEffect } from 'react'
import { getInsight, generateInsight } from '../api/insights.js'

export default function AiInsight({ taskId }) {
  const [phase, setPhase] = useState('checking')   // checking | idle | streaming | done
  const [context, setContext] = useState('')
  const [streamText, setStreamText] = useState('')
  const [insight, setInsight] = useState(null)      // { summary, detail }
  const [genError, setGenError] = useState('')

  useEffect(() => {
    if (!taskId) return
    setPhase('checking')
    setInsight(null)
    setStreamText('')
    setContext('')
    setGenError('')

    getInsight(taskId)
      .then(data => {
        setInsight({ summary: data.summary, detail: data.detail })
        setPhase('done')
      })
      .catch(() => setPhase('idle'))
  }, [taskId])

  async function handleGenerate() {
    if (!context.trim()) return
    setPhase('streaming')
    setStreamText('')
    setGenError('')
    let full = ''
    try {
      await generateInsight(taskId, context, text => {
        full += text
        setStreamText(prev => prev + text)
      })
      const summaryMatch = full.match(/SUMMARY:\s*(.+?)(?:\n|DETAIL:|$)/s)
      const detailMatch = full.match(/DETAIL:\s*(.+?)$/s)
      setInsight({
        summary: summaryMatch?.[1]?.trim() ?? full,
        detail: detailMatch?.[1]?.trim() ?? '',
      })
      setPhase('done')
    } catch {
      setGenError('Generation failed. Please try again.')
      setPhase('idle')
    }
  }

  if (phase === 'checking') return null

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
        }}>Clearline AI</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ai-label)' }}>Variance insight</span>
        {phase === 'done' && (
          <button
            onClick={() => { setPhase('idle'); setContext('') }}
            style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-faint)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Regenerate
          </button>
        )}
      </div>

      {phase === 'idle' && (
        <>
          {genError && (
            <div style={{ fontSize: 11, color: 'var(--error-text,#dc2626)', marginBottom: 8 }}>{genError}</div>
          )}
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Paste a number or note (e.g. '£4,280 variance in AP')..."
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '8px 10px',
              fontSize: 11, color: 'var(--text-secondary)',
              resize: 'vertical', fontFamily: 'inherit', outline: 'none',
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={!context.trim()}
            style={{
              marginTop: 8, padding: '6px 14px', borderRadius: 6,
              background: 'linear-gradient(135deg,#4F6EF7,#7C3AED)',
              border: 'none', color: '#fff', fontSize: 11, fontWeight: 600,
              cursor: context.trim() ? 'pointer' : 'not-allowed',
              opacity: context.trim() ? 1 : 0.5,
            }}
          >
            Generate Insight
          </button>
        </>
      )}

      {phase === 'streaming' && (
        <p style={{ fontSize: 11, color: 'var(--ai-text)', lineHeight: 1.65, margin: 0 }}>
          {streamText}<span style={{ opacity: 0.4 }}>▌</span>
        </p>
      )}

      {phase === 'done' && insight && (
        <p style={{ fontSize: 11, color: 'var(--ai-text)', lineHeight: 1.65, margin: 0 }}>
          <strong style={{ color: 'var(--ai-strong)', fontWeight: 600 }}>{insight.summary}</strong>
          {insight.detail ? <> {insight.detail}</> : null}
        </p>
      )}
    </div>
  )
}
