import { useTheme } from '../hooks/useTheme.js'

export default function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: 32, height: 32, borderRadius: 7,
        border: '1px solid var(--btn-ghost-border)',
        background: 'var(--btn-ghost-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.15s',
      }}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
