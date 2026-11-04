import { CATEGORIES, relTime, statsFor, userById, useStore } from '../store.jsx'
import { Avatar, TrustBadge } from './bits.jsx'
import { IconClock, IconEye, IconShield, IconStar, IconTrend, IconUsers } from './Icons.jsx'

function Pulse() {
  const { requests } = useStore()
  const counts = {
    open: requests.filter((r) => r.status === 'open').length,
    claimed: requests.filter((r) => r.status === 'claimed').length,
    helper_done: requests.filter((r) => r.status === 'helper_done').length,
    resolved: requests.filter((r) => r.status === 'resolved').length,
  }

  const perCat = CATEGORIES.map((c) => ({
    ...c,
    n: requests.filter((r) => r.category === c.id && r.status !== 'resolved').length,
  })).filter((c) => c.n > 0)
  const max = Math.max(1, ...perCat.map((c) => c.n))

  const tiles = [
    { k: 'open', l: 'open', v: counts.open, c: '#34d399' },
    { k: 'claimed', l: 'in progress', v: counts.claimed, c: '#fbbf24' },
    { k: 'helper_done', l: 'awaiting verify', v: counts.helper_done, c: '#a78bfa' },
    { k: 'resolved', l: 'resolved', v: counts.resolved, c: '#2dd4bf' },
  ]

  return (
    <div className="glass rounded-[26px] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-bold tracking-[0.16em] text-white/45 uppercase">Community pulse</span>
        <span className="flex items-center gap-1.5 rounded-full border border-leaf/35 bg-leaf/12 px-2 py-0.5 text-[0.64rem] font-bold text-leaf">
          <span className="h-1.5 w-1.5 animate-dot rounded-full bg-leaf" /> LIVE
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {tiles.map((t) => (
          <div key={t.k} className="rounded-2xl border border-white/10 bg-black/25 p-2.5">
            <div className="stat-num text-2xl" style={{ color: t.c }}>
              {t.v}
            </div>
            <div className="text-[0.66rem] text-white/45">{t.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <div className="text-[0.66rem] font-bold tracking-[0.14em] text-white/35 uppercase">
          Live demand by category
        </div>
        {perCat.map((c, i) => (
          <div key={c.id} className="stage">
            <div
              className="flex items-center gap-2"
              style={{ transform: `translateZ(${i * 3}px)` }}
            >
              <span className="w-6 text-[0.85rem]">{c.emoji}</span>
              <span className="w-[5.6rem] shrink-0 truncate text-[0.72rem] text-white/55">{c.label}</span>
              <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/8">
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
                  style={{
                    width: `${(c.n / max) * 100}%`,
                    background: 'linear-gradient(90deg,#2dd4bf,#38bdf8)',
                    boxShadow: '0 0 14px -3px #2dd4bf',
                  }}
                />
              </span>
              <span className="w-4 text-right text-[0.7rem] font-bold text-white/55">{c.n}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Ledger() {
  const { requests, currentUserId } = useStore()
  const s = statsFor(requests, currentUserId)
  const me = userById(currentUserId)

  return (
    <div id="trust" className="glass scroll-mt-[150px] rounded-[26px] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] font-bold tracking-[0.16em] text-white/45 uppercase">Trust ledger</span>
        <IconShield size={15} className="text-mint" />
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
        <Avatar id={me.id} size={44} />
        <div className="min-w-0">
          <div className="truncate text-[0.95rem] font-semibold text-white">{me.name}</div>
          <div className="truncate text-[0.7rem] text-white/45">{me.role}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="stat-num text-xl text-mint">{s.helped + s.received}</div>
          <div className="text-[0.62rem] text-white/40">proofs</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <TrustBadge
          label="Helped"
          value={s.helped}
          hint="requests you delivered & got verified"
          tone="#2dd4bf"
          icon={<IconUsers size={12} />}
        />
        <TrustBadge
          label="Received"
          value={s.received}
          hint="asks you closed with real help"
          tone="#38bdf8"
          icon={<IconEye size={12} />}
        />
        <TrustBadge
          label="Reliability"
          value={s.reliability === null ? '—' : `${s.reliability}%`}
          hint={
            s.disputes
              ? `${s.disputes} dispute${s.disputes > 1 ? 's' : ''} on record`
              : 'no confirmation disputes'
          }
          tone={s.reliability === null ? '#94a3b8' : s.reliability >= 90 ? '#34d399' : '#fbbf24'}
          icon={<IconStar size={12} />}
        />
        <TrustBadge
          label="Response"
          value={s.avgResponse === null ? '—' : `${s.avgResponse}m`}
          hint="average time to commit"
          tone="#a78bfa"
          icon={<IconClock size={12} />}
        />
      </div>

      <div className="mt-4 text-[0.66rem] font-bold tracking-[0.14em] text-white/35 uppercase">
        Recent proof
      </div>
      <div className="mt-2 space-y-2">
        {s.history.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/15 p-3 text-[0.76rem] text-white/45">
            No completed loops yet — help someone and it lands here.
          </p>
        )}
        {s.history.slice(0, 4).map((r) => {
          const asHelper = r.helperId === currentUserId
          return (
            <div key={r.id} className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/4 p-2.5">
              <span
                className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md text-[10px]"
                style={{
                  background: asHelper ? 'rgba(45,212,191,.18)' : 'rgba(56,189,248,.18)',
                  color: asHelper ? '#2dd4bf' : '#38bdf8',
                }}
              >
                ✓
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.78rem] text-white/75">{r.title}</span>
                <span className="text-[0.66rem] text-white/40">
                  {asHelper ? 'as helper' : 'as requester'} · {relTime(r.requesterConfirmedAt)}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-mint/25 bg-mint/8 p-3">
        <IconTrend size={15} className="mt-0.5 shrink-0 text-mint" />
        <p className="text-[0.72rem] leading-relaxed text-white/60">
          Trust only changes after <span className="font-semibold text-mint">both confirmations</span>.
          A one-sided tick never writes history.
        </p>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { requests } = useStore()
  const live = requests.filter((r) => r.status !== 'resolved').length

  return (
    <aside className="flex flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
      <Pulse />
      <Ledger />

      <div className="glass rounded-[26px] p-4">
        <div className="text-[0.7rem] font-bold tracking-[0.16em] text-white/45 uppercase">
          How accountability works
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="text-center">
            <Avatar id="u2" size={40} />
            <div className="mt-1 text-[0.64rem] text-white/50">requester</div>
          </div>
          <div className="relative h-px flex-1 bg-gradient-to-r from-gold/60 via-mint/70 to-aqua/60">
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-mint/35 bg-black/50 px-1.5 py-0.5 text-[0.6rem] font-bold text-mint">
              confirm twice
            </span>
          </div>
          <div className="text-center">
            <Avatar id="u3" size={40} />
            <div className="mt-1 text-[0.64rem] text-white/50">helper</div>
          </div>
        </div>
        <p className="mt-3 text-[0.74rem] leading-relaxed text-white/55">
          The helper marks it delivered. The requester confirms it arrived. Only{' '}
          <span className="text-white/85">2 of 2</span> closes the {live} open loops currently in your
          community.
        </p>
      </div>
    </aside>
  )
}
