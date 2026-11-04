import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ETAS,
  catById,
  dueLabel,
  relTime,
  stageOf,
  statusMeta,
  urgById,
  userById,
  useStore,
} from '../store.jsx'
import StageTrack from './StageTrack.jsx'
import { Avatar, StatusPill } from './bits.jsx'
import {
  IconAlert,
  IconCheck,
  IconClock,
  IconHeart,
  IconPin,
  IconRefresh,
  IconShield,
  IconStar,
  IconX,
  IconZap,
} from './Icons.jsx'

const EVENT_STYLE = {
  created: { c: '#38bdf8', e: '🙋' },
  support: { c: '#34d399', e: '💬' },
  commit: { c: '#fbbf24', e: '🤝' },
  helper_done: { c: '#a78bfa', e: '📦' },
  dispute: { c: '#fb7185', e: '⚠️' },
  resolved: { c: '#2dd4bf', e: '✅' },
  release: { c: '#94a3b8', e: '↩️' },
}

function PersonCard({ id, role, tint }) {
  const u = userById(id)
  if (!u) return null
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-2.5">
      <Avatar id={id} size={38} />
      <div className="min-w-0">
        <div className="truncate text-[0.88rem] font-semibold text-white">{u.name}</div>
        <div className="truncate text-[0.7rem]" style={{ color: tint }}>
          {role}
        </div>
      </div>
    </div>
  )
}

export default function RequestDetail({ request: r, onClose }) {
  const { currentUserId, commit, uncommit, pledge, helperDone, confirmReceived, dispute } = useStore()
  const [eta, setEta] = useState(ETAS[0])
  const [mode, setMode] = useState('idle') // idle | commit | proof

  useEffect(() => {
    setEta(ETAS[0])
    setMode('idle')
  }, [r?.id])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = r ? 'hidden' : ''
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [r, onClose])

  const isMine = r?.requesterId === currentUserId
  const iAmHelper = r?.helperId === currentUserId
  const meta = r ? statusMeta(r) : null
  const cat = r ? catById(r.category) : null
  const urg = r ? urgById(r.urgency) : null
  const stage = r ? stageOf(r) : 0

  return (
    <AnimatePresence>
      {r && (
        <motion.div
          className="stage fixed inset-0 z-50 overflow-y-auto overscroll-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <div className="fixed inset-0 bg-black/72 backdrop-blur-md" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={r.title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 70, rotateX: -14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, rotateX: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            style={{ transformPerspective: 1600 }}
            className="glass-deep preserve relative mx-auto my-5 w-full max-w-4xl rounded-[30px] p-5 sm:my-10 sm:p-7"
          >
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm absolute top-4 right-4 z-10 !px-2.5"
              aria-label="Close"
            >
              <IconX size={16} />
            </button>

            {/* header */}
            <div className="flex flex-wrap items-center gap-2 pr-12">
              <span
                className="tag"
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: '#cfdef5' }}
              >
                {cat.emoji} {cat.label}
              </span>
              <span className="tag" style={{ background: urg.bg, color: urg.color, border: `1px solid ${urg.color}55` }}>
                {urg.label} urgency
              </span>
              <StatusPill status={r.status} color={meta.color} label={meta.label} pulse={r.status === 'helper_done'} />
            </div>

            <h2 className="display mt-3 pr-6 text-2xl leading-tight font-bold text-white sm:text-[1.9rem]">
              {r.title}
            </h2>

            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-white/62">{r.body}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.78rem] text-white/48">
              <span className="inline-flex items-center gap-1.5">
                <IconClock size={13} /> posted {relTime(r.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconPin size={13} /> {r.place}
              </span>
              <span className="inline-flex items-center gap-1.5" style={{ color: stage >= 2 ? '#fbbf24' : undefined }}>
                <IconZap size={13} />
                {stage >= 2 && r.eta ? `expected: ${r.eta}` : dueLabel(r.dueAt)}
              </span>
            </div>

            {/* 5-step track */}
            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[0.68rem] font-bold tracking-[0.18em] text-white/40 uppercase">
                  Commitment tracker
                </span>
                <span className="text-[0.68rem] text-white/40">request → connect → commit → verify → resolved</span>
              </div>
              <StageTrack request={r} />
            </div>

            {/* two people */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <PersonCard id={r.requesterId} role="Needs help" tint="#38bdf8" />
              {r.helperId ? (
                <PersonCard id={r.helperId} role="Assigned helper" tint="#fbbf24" />
              ) : (
                <div className="flex items-center gap-2.5 rounded-2xl border border-dashed border-white/18 bg-white/3 p-2.5">
                  <span className="grid h-[38px] w-[38px] place-items-center rounded-xl border border-white/15 bg-white/5 text-lg">
                    ?
                  </span>
                  <div>
                    <div className="text-[0.88rem] font-semibold text-white/70">No helper yet</div>
                    <div className="text-[0.7rem] text-white/40">
                      {r.pledges.length
                        ? `${r.pledges.length} member${r.pledges.length > 1 ? 's have' : ' has'} backed it`
                        : 'waiting for someone to commit'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* backers */}
            {r.pledges.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-3 py-2.5">
                <span className="text-[0.72rem] text-white/45">Backed by</span>
                {r.pledges.map((id) => (
                  <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-white/7 px-2 py-1 text-[0.72rem] text-white/70">
                    <Avatar id={id} size={18} /> {userById(id)?.short}
                  </span>
                ))}
              </div>
            )}

            {/* ------------- action zone ------------- */}
            <div className="mt-5 rounded-[24px] border border-white/10 bg-gradient-to-b from-white/6 to-white/2 p-4">
              {r.status === 'open' && !isMine && (
                <div>
                  {mode === 'commit' ? (
                    <div>
                      <p className="text-[0.8rem] font-semibold text-white/75">
                        When can you deliver? The requester will see this ETA on the tracker.
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {ETAS.map((e) => (
                          <button key={e} onClick={() => setEta(e)} className={`chip ${eta === e ? 'chip-on' : ''}`}>
                            {e}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3.5 flex flex-wrap gap-2">
                        <button className="btn btn-primary btn-md" onClick={() => commit(r.id, eta)}>
                          <IconShield size={16} /> Confirm commitment
                        </button>
                        <button className="btn btn-ghost btn-md" onClick={() => setMode('idle')}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.92rem] font-semibold text-white">You can take this one.</p>
                        <p className="text-[0.78rem] text-white/48">
                          Committing assigns you as the helper and starts the tracked commitment.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-md" onClick={() => pledge(r.id)} disabled={r.pledges.includes(currentUserId)}>
                          <IconHeart size={15} /> {r.pledges.includes(currentUserId) ? 'Backed' : 'Just back it'}
                        </button>
                        <button className="btn btn-primary btn-md" onClick={() => setMode('commit')}>
                          <IconShield size={16} /> I can help
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {r.status === 'open' && isMine && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.92rem] font-semibold text-white">Your request is live.</p>
                    <p className="text-[0.78rem] text-white/48">
                      {r.pledges.length
                        ? `${r.pledges.length} member${r.pledges.length > 1 ? 's have' : ' has'} backed it — one of them can commit as your helper.`
                        : 'Share it in your community group to get a reply faster.'}
                    </p>
                  </div>
                  <span className="tag" style={{ background: 'rgba(56,189,248,.14)', color: '#38bdf8', border: '1px solid rgba(56,189,248,.4)' }}>
                    step 2 · connecting
                  </span>
                </div>
              )}

              {r.status === 'claimed' && iAmHelper && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.92rem] font-semibold text-white">You are the assigned helper.</p>
                    <p className="text-[0.78rem] text-white/48">
                      ETA <span className="font-semibold text-gold">{r.eta}</span>. Once you deliver, mark it
                      done — then the requester still has to verify.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-md" onClick={() => uncommit(r.id)}>
                      <IconRefresh size={15} /> Step back
                    </button>
                    <button className="btn btn-gold btn-md" onClick={() => helperDone(r.id)}>
                      <IconCheck size={16} sw={2.5} /> Mark as completed
                    </button>
                  </div>
                </div>
              )}

              {r.status === 'claimed' && isMine && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.92rem] font-semibold text-white">
                      {userById(r.helperId)?.short} is on it.
                    </p>
                    <p className="text-[0.78rem] text-white/48">
                      Expected {r.eta}. You can confirm only after the helper marks it delivered.
                    </p>
                  </div>
                  <span className="tag" style={{ background: 'rgba(251,191,36,.14)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.4)' }}>
                    step 3 · committed
                  </span>
                </div>
              )}

              {r.status === 'claimed' && !isMine && !iAmHelper && (
                <div className="flex items-center gap-3 text-[0.84rem] text-white/55">
                  <span className="tag" style={{ background: 'rgba(251,191,36,.14)', color: '#fbbf24', border: '1px solid rgba(251,191,36,.4)' }}>
                    in progress
                  </span>
                  <span>
                    {userById(r.helperId)?.short} committed · {r.eta}
                  </span>
                </div>
              )}

              {r.status === 'helper_done' && isMine && (
                <div>
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[0.95rem] font-semibold text-white">
                        <IconStar size={16} className="text-violet" />
                        {userById(r.helperId)?.short} says the help is delivered.
                      </p>
                      <p className="mt-1 text-[0.78rem] text-white/48">
                        A helper cannot close this alone. Confirm only if you actually received the help —
                        this is what writes trust history for both of you.
                      </p>
                    </div>
                    {mode !== 'proof' && (
                      <div className="flex gap-2">
                        <button className="btn btn-danger btn-md" onClick={() => dispute(r.id)}>
                          Not yet
                        </button>
                        <button className="btn btn-primary btn-md" onClick={() => confirmReceived(r.id)}>
                          <IconShield size={16} /> Confirm receipt
                        </button>
                      </div>
                    )}
                  </div>
                  {mode === 'proof' && (
                    <div className="mt-3 flex gap-2">
                      <button className="btn btn-ghost btn-md" onClick={() => setMode('idle')}>
                        Back
                      </button>
                    </div>
                  )}
                </div>
              )}

              {r.status === 'helper_done' && !isMine && (
                <div className="flex items-center gap-3 text-[0.84rem] text-white/55">
                  <span className="tag animate-dot" style={{ background: 'rgba(167,139,250,.16)', color: '#a78bfa', border: '1px solid rgba(167,139,250,.45)' }}>
                    half confirmed
                  </span>
                  <span>Delivered · waiting for {userById(r.requesterId)?.short} to verify receipt.</span>
                </div>
              )}

              {r.status === 'resolved' && (
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl border border-mint/40 bg-mint/15 text-xl">
                      ✅
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.98rem] font-semibold text-white">Resolved with two-sided proof</p>
                      <p className="text-[0.78rem] text-white/48">
                        Helper marked delivered {relTime(r.helperMarkedAt)} · requester confirmed{' '}
                        {relTime(r.requesterConfirmedAt)}
                      </p>
                    </div>
                    <span className="tag" style={{ background: 'rgba(45,212,191,.16)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,.45)' }}>
                      trust +1 both sides
                    </span>
                  </div>
                  {r.disputes > 0 && (
                    <p className="mt-3 flex items-start gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2 text-[0.76rem] text-gold">
                      <IconAlert size={14} className="mt-0.5 shrink-0" />
                      {r.disputes} confirmation dispute{r.disputes > 1 ? 's' : ''} happened before both sides
                      agreed — exactly the accountability this loop is for.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ------------- timeline ------------- */}
            <div className="mt-6">
              <div className="mb-3 text-[0.68rem] font-bold tracking-[0.18em] text-white/40 uppercase">
                Activity trail (immutable)
              </div>
              <ol className="relative space-y-3 border-l border-white/12 pl-4">
                {[...r.events].reverse().map((e) => {
                  const s = EVENT_STYLE[e.kind] || EVENT_STYLE.created
                  return (
                    <li key={e.id} className="relative">
                      <span
                        className="absolute top-1 -left-[23px] grid h-4 w-4 place-items-center rounded-full text-[9px]"
                        style={{ background: `${s.c}26`, boxShadow: `0 0 0 3px rgba(5,7,14,1), 0 0 14px -3px ${s.c}` }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.c }} />
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[0.83rem] text-white/75">{e.text}</span>
                        <span className="ml-auto shrink-0 text-[0.68rem] text-white/32">{relTime(e.at)}</span>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
