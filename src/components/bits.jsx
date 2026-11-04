import { userById } from '../store.jsx'
import { IconShield } from './Icons.jsx'

export function Avatar({ id, size = 30, ring = true }) {
  const u = userById(id)
  if (!u) return null
  return (
    <span
      title={u.name}
      className={`grid shrink-0 place-items-center rounded-xl ${ring ? 'avatar-ring' : ''}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.54,
        background: `linear-gradient(140deg, ${u.tint}38, rgba(255,255,255,.06))`,
        ['--ring']: `${u.tint}90`,
      }}
    >
      {u.avatar}
    </span>
  )
}

export function StatusPill({ status, color, label, pulse = false }) {
  return (
    <span
      className="tag"
      style={{ color, background: `${color}1f`, border: `1px solid ${color}55` }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${pulse ? 'animate-dot' : ''}`}
        style={{ background: color }}
      />
      {label}
    </span>
  )
}

export function DotProgress({ stage, count = 5, colors = ['#34d399', '#38bdf8', '#fbbf24', '#a78bfa', '#2dd4bf'] }) {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: i === stage ? 22 : 9,
            background: i <= stage ? colors[i] : 'rgba(255,255,255,.14)',
            boxShadow: i === stage ? `0 0 12px -2px ${colors[i]}` : 'none',
          }}
        />
      ))}
    </div>
  )
}

export function TrustBadge({ label, value, hint, tone = '#2dd4bf', icon }) {
  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center gap-1.5 text-[0.66rem] font-bold uppercase tracking-[0.13em] text-white/40">
        {icon} {label}
      </div>
      <div className="stat-num mt-1 text-2xl" style={{ color: tone }}>
        {value}
      </div>
      <div className="text-[0.68rem] leading-tight text-white/42">{hint}</div>
    </div>
  )
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="glass col-span-full rounded-3xl px-6 py-14 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/12 bg-white/5 text-2xl">
        🤝
      </div>
      <h4 className="display mt-4 text-lg font-semibold text-white">{title}</h4>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-white/50">{body}</p>
      {action}
    </div>
  )
}

export function ProveNote({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border border-mint/30 bg-mint/10 px-2 py-1 text-[0.66rem] font-semibold text-mint ${className}`}
    >
      <IconShield size={12} /> both sides must confirm
    </span>
  )
}
