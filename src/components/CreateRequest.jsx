import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES, URGENCIES, useStore } from '../store.jsx'
import RequestCard from './RequestCard.jsx'
import { IconSend, IconSpark, IconX } from './Icons.jsx'

const HOUR = 3600 * 1000

const DUE_OPTIONS = [
  { id: '6h', label: 'In 6 hours', ms: 6 * HOUR },
  { id: '24h', label: 'Tomorrow', ms: 24 * HOUR },
  { id: '72h', label: 'In 3 days', ms: 72 * HOUR },
  { id: '168h', label: 'Next week', ms: 7 * 24 * HOUR },
]

export default function CreateRequest({ open, onClose }) {
  const { createRequest, currentUserId } = useStore()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('study')
  const [urgency, setUrgency] = useState('normal')
  const [place, setPlace] = useState('')
  const [due, setDue] = useState('24h')
  const firstField = useRef(null)

  const reset = () => {
    setTitle('')
    setBody('')
    setCategory('study')
    setUrgency('normal')
    setPlace('')
    setDue('24h')
  }

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => firstField.current?.focus(), 260)
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const valid = title.trim().length >= 8 && body.trim().length >= 12

  const preview = useMemo(
    () => ({
      id: 'preview',
      title: title.trim() || 'What do you need help with?',
      body: body.trim() || 'Write one honest sentence about the help you need — people reply faster to specifics.',
      category,
      urgency,
      requesterId: currentUserId,
      place: place.trim() || 'Anywhere in the community',
      createdAt: Date.now(),
      dueAt: Date.now() + (DUE_OPTIONS.find((d) => d.id === due)?.ms ?? 24 * HOUR),
      status: 'open',
      pledges: [],
      helperId: null,
      claimedAt: null,
      eta: null,
      helperMarkedAt: null,
      requesterConfirmedAt: null,
      disputes: 0,
      events: [],
    }),
    [title, body, category, urgency, place, due, currentUserId],
  )

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    const opt = DUE_OPTIONS.find((d) => d.id === due)
    createRequest({
      title,
      body,
      category,
      urgency,
      place,
      dueAt: Date.now() + (opt?.ms ?? 24 * HOUR),
    })
    reset()
    onClose()
    setTimeout(() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 320)
  }

  return (
    <AnimatePresence>
      {open && (
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
            aria-label="Post a new request"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 70, rotateX: -14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, rotateX: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            style={{ transformPerspective: 1600 }}
            className="glass-deep preserve relative mx-auto my-5 w-full max-w-5xl rounded-[30px] p-5 sm:my-10 sm:p-7"
          >
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm absolute top-4 right-4 z-10 !px-2.5"
              aria-label="Close"
            >
              <IconX size={16} />
            </button>

            <p className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.2em] text-mint/80 uppercase">
              <IconSpark size={14} /> Step 1 · Request
            </p>
            <h2 className="display mt-2 pr-12 text-2xl font-bold text-white sm:text-[1.9rem]">
              Ask your community for help
            </h2>
            <p className="mt-1.5 max-w-lg text-[0.85rem] text-white/50">
              Specific requests get answered. Add what you need, where you are, and by when — the feed
              updates live.
            </p>

            <form onSubmit={submit} className="mt-6 grid gap-7 lg:grid-cols-[1.05fr_1fr]">
              {/* ---------------- form ---------------- */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[0.72rem] font-bold tracking-[0.13em] text-white/45 uppercase">
                    What do you need? *
                  </label>
                  <input
                    ref={firstField}
                    className="field"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. USB-C 65W charger for tomorrow's demo"
                    maxLength={90}
                  />
                  <div className="mt-1 flex justify-between text-[0.68rem] text-white/35">
                    <span className={title.trim().length && title.trim().length < 8 ? 'text-rose' : ''}>
                      {title.trim().length >= 8 ? 'looks good' : 'at least 8 characters'}
                    </span>
                    <span>{title.length}/90</span>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[0.72rem] font-bold tracking-[0.13em] text-white/45 uppercase">
                    Details *
                  </label>
                  <textarea
                    className="field"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Where, when, and what exactly you need. Be honest about the stakes."
                    maxLength={400}
                  />
                  <div className="mt-1 flex justify-between text-[0.68rem] text-white/35">
                    <span>{body.trim().length >= 12 ? 'ready to post' : 'at least 12 characters'}</span>
                    <span>{body.length}/400</span>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[0.72rem] font-bold tracking-[0.13em] text-white/45 uppercase">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`chip ${category === c.id ? 'chip-on' : ''}`}
                      >
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[0.72rem] font-bold tracking-[0.13em] text-white/45 uppercase">
                    Urgency
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {URGENCIES.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setUrgency(u.id)}
                        className={`chip ${urgency === u.id ? 'chip-on' : ''}`}
                        style={
                          urgency === u.id
                            ? { background: u.bg, borderColor: `${u.color}90`, color: u.color }
                            : undefined
                        }
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[0.72rem] font-bold tracking-[0.13em] text-white/45 uppercase">
                      Where
                    </label>
                    <input
                      className="field"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="Block C · Gate 3 · online"
                      maxLength={48}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[0.72rem] font-bold tracking-[0.13em] text-white/45 uppercase">
                      Needed by
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DUE_OPTIONS.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDue(d.id)}
                          className={`chip !text-[0.72rem] ${due === d.id ? 'chip-on' : ''}`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button type="submit" className="btn btn-primary btn-lg" disabled={!valid}>
                    <IconSend size={17} /> Post to the feed
                  </button>
                  <button type="button" className="btn btn-ghost btn-lg" onClick={onClose}>
                    Cancel
                  </button>
                  {!valid && (
                    <span className="text-[0.74rem] text-white/40">fill in the two required fields</span>
                  )}
                </div>
              </div>

              {/* ---------------- live preview ---------------- */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[0.72rem] font-bold tracking-[0.13em] text-white/45 uppercase">
                    Live preview · step 1
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[0.7rem] text-mint/80">
                    <span className="h-1.5 w-1.5 animate-dot rounded-full bg-mint" /> tilting card
                  </span>
                </div>
                <RequestCard request={preview} onOpen={() => {}} />
                <p className="mt-4 rounded-2xl border border-white/10 bg-white/4 p-3 text-[0.76rem] leading-relaxed text-white/50">
                  <span className="font-semibold text-white/80">After you post:</span> the community backs
                  it → one member commits with an ETA → they mark it delivered →{' '}
                  <span className="font-semibold text-mint">you confirm receipt</span> → only then does it
                  close and both of you earn trust history.
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
