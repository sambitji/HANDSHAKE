import { useEffect, useRef, useState } from 'react'
import { Logo, Wordmark } from './Brand.jsx'
import { IconChevron, IconCheck, IconPlus, IconRefresh, IconShield, IconUsers } from './Icons.jsx'
import { USERS, statsFor, useStore } from '../store.jsx'

function PersonaMenu({ onCreate }) {
  const { currentUserId, setCurrentUser, requests, resetDemo } = useStore()
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const me = USERS.find((u) => u.id === currentUserId)
  const stats = statsFor(requests, currentUserId)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative" ref={box}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn btn-ghost btn-sm !rounded-2xl !py-1.5 !pl-1.5 !pr-3"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className="grid h-8 w-8 place-items-center rounded-xl text-lg"
          style={{ background: 'rgba(255,255,255,.07)' }}
        >
          {me.avatar}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-[0.72rem] text-white/45">Viewing as</span>
          <span className="block text-[0.84rem] font-semibold text-white">{me.short}</span>
        </span>
        <IconChevron size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="glass-deep absolute right-0 z-50 mt-2 w-[19rem] origin-top-right overflow-hidden rounded-2xl p-2 rise">
          <p className="flex items-center gap-1.5 px-2 pb-1.5 pt-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-white/40">
            <IconUsers size={13} /> Switch persona
          </p>
          {USERS.map((u) => {
            const s = statsFor(requests, u.id)
            const active = u.id === currentUserId
            return (
              <button
                key={u.id}
                onClick={() => {
                  setCurrentUser(u.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition ${
                  active ? 'bg-mint/15 text-white' : 'text-white/72 hover:bg-white/8 hover:text-white'
                }`}
              >
                <span className="text-xl">{u.avatar}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.86rem] font-semibold">{u.name}</span>
                  <span className="block truncate text-[0.7rem] text-white/45">{u.role}</span>
                </span>
                <span className="text-right text-[0.66rem] leading-tight text-white/45">
                  <span className="block font-bold text-mint">{s.helped}</span>
                  helped
                </span>
                {active && <IconCheck size={15} className="text-mint" />}
              </button>
            )
          })}
          <div className="divider my-1.5" />
          <button
            onClick={() => {
              resetDemo()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[0.8rem] text-white/55 transition hover:bg-white/8 hover:text-white"
          >
            <IconRefresh size={14} /> Reset demo data
          </button>
        </div>
      )}
      <span className="sr-only">{stats.helped}</span>
    </div>
  )
}

export default function Nav({ onCreate }) {
  const { requests } = useStore()
  const openCount = requests.filter((r) => r.status !== 'resolved').length

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <nav className="glass mx-auto flex max-w-[1400px] items-center gap-3 rounded-[22px] px-3 py-2.5 sm:px-4">
        <a href="#top" className="flex items-center gap-2.5">
          <Logo size={38} />
          <span className="hidden sm:block">
            <Wordmark />
            <span className="block text-[0.6rem] uppercase tracking-[0.22em] text-white/38">
              community accountability layer
            </span>
          </span>
        </a>

        <span className="mx-1 hidden items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[0.7rem] font-semibold text-white/60 md:inline-flex">
          <span className="h-1.5 w-1.5 animate-dot rounded-full bg-leaf" />
          {openCount} live requests
        </span>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="#feed"
            className="hidden rounded-full px-3 py-1.5 text-[0.84rem] font-medium text-white/65 transition hover:text-white lg:block"
          >
            Feed
          </a>
          <a
            href="#how"
            className="hidden rounded-full px-3 py-1.5 text-[0.84rem] font-medium text-white/65 transition hover:text-white lg:block"
          >
            How it works
          </a>
          <a
            href="#trust"
            className="hidden rounded-full px-3 py-1.5 text-[0.84rem] font-medium text-white/65 transition hover:text-white lg:block"
          >
            Trust
          </a>

          <PersonaMenu />

          <button onClick={onCreate} className="btn btn-primary btn-sm !px-4">
            <IconPlus size={15} sw={2.4} />
            <span className="hidden sm:inline">New request</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </nav>

      <div className="mx-auto mt-2 hidden max-w-[1400px] items-center gap-2 px-1 text-[0.68rem] text-white/35 xl:flex">
        <IconShield size={13} className="text-mint/70" />
        Two-sided confirmation: a helper cannot close a request alone — the requester must verify it too.
      </div>
    </header>
  )
}
