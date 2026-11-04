import { STAGES, stageOf, relTime } from '../store.jsx'
import { IconCheck } from './Icons.jsx'

/**
 * The 5-step commitment track, rendered on a tilted 3D rail.
 * The active pod pops forward, completed pods are stamped.
 */
export default function StageTrack({ request, compact = false }) {
  const active = stageOf(request)
  const pct = (active / (STAGES.length - 1)) * 100

  const stamp = (i) => {
    if (i === 0) return relTime(request.createdAt)
    if (i === 1 && request.pledges.length) return `${request.pledges.length} backed`
    if (i === 2 && request.claimedAt) return relTime(request.claimedAt)
    if (i === 3 && request.helperMarkedAt) return relTime(request.helperMarkedAt)
    if (i === 4 && request.requesterConfirmedAt) return relTime(request.requesterConfirmedAt)
    return null
  }

  return (
    <div className="stage select-none">
      <div
        className="preserve relative"
        style={{ transform: 'rotateX(13deg)', transformOrigin: 'bottom center' }}
      >
        {/* rail */}
        <div className="absolute top-[46%] right-2 left-2 h-[4px] -translate-y-1/2 overflow-hidden rounded-full bg-white/8">
          <div
            className="beam-flow h-full rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${Math.max(6, pct)}%` }}
          />
        </div>

        <div className="relative flex gap-2">
          {STAGES.map((s, i) => {
            const done = i < active
            const on = i === active
            const z = on ? 54 : done ? 30 : 12
            const color = done || on ? (on ? '#eafffb' : '#2dd4bf') : 'rgba(255,255,255,.45)'
            const label = stamp(i)

            return (
              <div key={s.key} className="min-w-0 flex-1">
                <div
                  className="preserve rounded-2xl border px-2 py-2.5 text-center transition-all duration-500"
                  style={{
                    transform: `translateZ(${z}px)`,
                    background: on
                      ? 'linear-gradient(160deg, rgba(45,212,191,.2), rgba(10,16,30,.9))'
                      : done
                        ? 'linear-gradient(160deg, rgba(45,212,191,.09), rgba(10,16,30,.86))'
                        : 'rgba(255,255,255,.035)',
                    borderColor: on
                      ? 'rgba(45,212,191,.7)'
                      : done
                        ? 'rgba(45,212,191,.3)'
                        : 'rgba(255,255,255,.1)',
                    boxShadow: on ? '0 22px 44px -26px rgba(45,212,191,.95)' : 'none',
                  }}
                >
                  <div className="mx-auto grid h-7 w-7 place-items-center rounded-lg border border-white/12 bg-black/35 text-[0.85rem]">
                    {done ? <IconCheck size={14} className="text-mint" sw={2.6} /> : s.emoji}
                  </div>
                  <div
                    className="display mt-1.5 truncate text-[0.8rem] font-semibold"
                    style={{ color }}
                  >
                    {s.name}
                  </div>
                  {!compact && (
                    <div className="mt-0.5 truncate text-[0.62rem] text-white/35">
                      {label || (on ? 'now' : '—')}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {!compact && (
        <p className="mt-2.5 text-center text-[0.7rem] text-white/42">
          <span className="text-mint">Step {active + 1} of 5</span> · {STAGES[active].blurb}
          {request.status === 'claimed' && request.eta && (
            <>
              {' '}
              · helper ETA <span className="font-semibold text-gold">{request.eta}</span>
            </>
          )}
        </p>
      )}
    </div>
  )
}
