import { useRef } from 'react'
import { catById, dueLabel, relTime, stageOf, statusMeta, urgById, userById, useStore } from '../store.jsx'
import { Avatar, DotProgress, StatusPill } from './bits.jsx'
import { IconCheck, IconClock, IconHeart, IconPin, IconShield, IconZap } from './Icons.jsx'

export default function RequestCard({ request: r, onOpen }) {
  const { currentUserId, pledge, helperDone, confirmReceived } = useStore()
  const shell = useRef(null)
  const card = useRef(null)

  const cat = catById(r.category)
  const urg = urgById(r.urgency)
  const meta = statusMeta(r)
  const stage = stageOf(r)
  const requester = userById(r.requesterId)
  const helper = r.helperId ? userById(r.helperId) : null
  const isMine = r.requesterId === currentUserId
  const iAmHelper = r.helperId === currentUserId

  const onMove = (e) => {
    const el = shell.current
    const inner = card.current
    if (!el || !inner) return
    const b = el.getBoundingClientRect()
    const px = (e.clientX - b.left) / b.width
    const py = (e.clientY - b.top) / b.height
    el.style.setProperty('--mx', `${px * 100}%`)
    el.style.setProperty('--my', `${py * 100}%`)
    inner.style.transform = `rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 13}deg)`
  }

  const onLeave = () => {
    const el = shell.current
    const inner = card.current
    if (el) {
      el.style.setProperty('--mx', '50%')
      el.style.setProperty('--my', '0%')
    }
    if (inner) inner.style.transform = 'rotateX(0deg) rotateY(0deg)'
  }

  let action = { label: 'View details', tone: 'ghost', kind: 'view' }
  if (r.status === 'open') {
    action = isMine
      ? { label: 'This is your request', tone: 'ghost', kind: 'mine' }
      : { label: 'I can help', tone: 'primary', kind: 'help' }
  } else if (r.status === 'claimed') {
    action = iAmHelper
      ? { label: 'Mark as completed', tone: 'gold', kind: 'done' }
      : isMine
        ? { label: `Waiting on ${helper?.short || 'helper'}`, tone: 'ghost', kind: 'view' }
        : { label: 'Track commitment', tone: 'ghost', kind: 'view' }
  } else if (r.status === 'helper_done') {
    action = isMine
      ? { label: 'Confirm you got help', tone: 'primary', kind: 'confirm' }
      : { label: 'Awaiting requester', tone: 'ghost', kind: 'view' }
  } else {
    action = { label: 'View proof', tone: 'ghost', kind: 'view' }
  }

  const runAction = (e) => {
    e.stopPropagation()
    if (action.kind === 'done') return helperDone(r.id)
    if (action.kind === 'confirm') return confirmReceived(r.id)
    if (action.kind === 'help') return onOpen(r)
    onOpen(r)
  }

  return (
    <div
      className="stage"
      ref={shell}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ '--mx': '50%', '--my': '0%' }}
    >
      <article
        ref={card}
        onClick={() => onOpen(r)}
        className="card3d preserve relative cursor-pointer rounded-[26px] p-4 sm:p-5"
        style={{
          background: 'linear-gradient(158deg, rgba(255,255,255,.075), rgba(255,255,255,.02))',
          borderColor: 'rgba(255,255,255,.1)',
          border: '1px solid rgba(255,255,255,.1)',
          transition: 'transform .14s linear, box-shadow .3s ease',
        }}
      >
        <div className="shine" />

        {/* row 1 */}
        <div className="preserve relative flex items-start gap-2" style={{ transform: 'translateZ(34px)' }}>
          <span className="tag" style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: '#cfdef5' }}>
            {cat.emoji} {cat.label}
          </span>
          <span className="tag" style={{ background: urg.bg, color: urg.color, border: `1px solid ${urg.color}55` }}>
            {urg.rank >= 3 && <IconZap size={11} sw={2.4} />}
            {urg.label}
          </span>
          <span className="ml-auto">
            <StatusPill status={r.status} color={meta.color} label={meta.label} pulse={r.status === 'helper_done'} />
          </span>
        </div>

        {/* title */}
        <h3
          className="display relative mt-3 text-[1.08rem] leading-snug font-semibold text-white"
          style={{ transform: 'translateZ(22px)' }}
        >
          {r.title}
        </h3>

        {/* body */}
        <p
          className="relative mt-1.5 line-clamp-2 text-[0.84rem] leading-relaxed text-white/50"
          style={{ transform: 'translateZ(14px)' }}
        >
          {r.body}
        </p>

        {/* meta */}
        <div
          className="relative mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.73rem] text-white/45"
          style={{ transform: 'translateZ(26px)' }}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <Avatar id={r.requesterId} size={22} />
            <span className="truncate font-medium text-white/72">{requester?.short}</span>
            <span className="text-white/30">·</span>
            {relTime(r.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <IconPin size={12} className="text-white/35" />
            {r.place}
          </span>
          <span className="inline-flex items-center gap-1" style={{ color: stage >= 2 ? '#fbbf24' : undefined }}>
            <IconClock size={12} />
            {stage >= 2 && r.eta ? `ETA ${r.eta}` : dueLabel(r.dueAt)}
          </span>
        </div>

        {/* progress + backers */}
        <div
          className="preserve relative mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5"
          style={{ transform: 'translateZ(40px)' }}
        >
          <DotProgress stage={stage} />
          <div className="flex items-center gap-2">
            {r.pledges.length > 0 ? (
              <span className="flex -space-x-2">
                {r.pledges.slice(0, 3).map((id) => (
                  <Avatar key={id} id={id} size={22} />
                ))}
                {r.pledges.length > 3 && (
                  <span className="grid h-[22px] min-w-[22px] place-items-center rounded-xl border border-white/20 bg-white/10 px-1 text-[0.62rem] font-bold text-white/70">
                    +{r.pledges.length - 3}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-[0.68rem] text-white/35">no one has replied yet</span>
            )}
            <span className="text-[0.68rem] font-semibold text-white/45">
              {r.pledges.length} backed
            </span>
          </div>
        </div>

        {/* action bar */}
        <div
          className="preserve relative mt-3.5 flex items-center gap-2"
          style={{ transform: 'translateZ(52px)' }}
        >
          <button
            onClick={runAction}
            className={`btn btn-sm flex-1 ${action.tone === 'primary' ? 'btn-primary' : action.tone === 'gold' ? 'btn-gold' : 'btn-ghost'}`}
          >
            {action.kind === 'confirm' && <IconShield size={14} />}
            {action.kind === 'done' && <IconCheck size={14} sw={2.5} />}
            {action.kind === 'help' && <IconHeart size={14} />}
            {action.label}
          </button>

          {r.status === 'open' && !isMine && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                pledge(r.id)
              }}
              className="btn btn-ghost btn-sm !px-3"
              title="Back this request without taking the commitment"
              disabled={r.pledges.includes(currentUserId)}
            >
              {r.pledges.includes(currentUserId) ? 'Backed' : 'Back it'}
            </button>
          )}
        </div>

        {helper && (
          <div
            className="relative mt-3 flex items-center gap-1.5 rounded-xl bg-white/5 px-2.5 py-1.5 text-[0.7rem] text-white/55"
            style={{ transform: 'translateZ(28px)' }}
          >
            <Avatar id={helper.id} size={20} />
            <span>
              <span className="font-semibold text-white/85">{helper.short}</span> is the assigned helper
              {r.status === 'helper_done' && (
                <span className="text-violet"> · delivered, waiting for confirmation</span>
              )}
              {r.status === 'resolved' && <span className="text-mint"> · both sides confirmed</span>}
            </span>
          </div>
        )}
      </article>
    </div>
  )
}
