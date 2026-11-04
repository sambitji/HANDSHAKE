import { useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Feed from './components/Feed.jsx'
import Sidebar from './components/Sidebar.jsx'
import RequestDetail from './components/RequestDetail.jsx'
import CreateRequest from './components/CreateRequest.jsx'
import Toast from './components/Toast.jsx'
import Confetti from './components/Confetti.jsx'
import { Logo, Wordmark } from './components/Brand.jsx'
import { IconRefresh, IconShield, IconSpark } from './components/Icons.jsx'
import { useStore } from './store.jsx'

function Footer({ onCreate }) {
  const { resetDemo, requests } = useStore()
  const resolved = requests.filter((r) => r.status === 'resolved').length

  return (
    <footer className="relative border-t border-white/8 bg-black/40">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={40} />
            <span>
              <Wordmark />
              <span className="block text-[0.6rem] uppercase tracking-[0.22em] text-white/38">
                community accountability layer
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-md text-[0.86rem] leading-relaxed text-white/50">
            HelpLoop finds the person. ProofPing proves it happened. HANDSHAKE keeps both — one
            request, tracked from <span className="text-white/80">ask</span> to{' '}
            <span className="text-white/80">verified help</span>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {['React 19', 'Vite', 'Tailwind v4', 'Three.js / R3F', 'Framer Motion', 'localStorage'].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[0.68rem] text-white/50"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </div>

        <div>
          <div className="text-[0.68rem] font-bold tracking-[0.16em] text-white/40 uppercase">Jump to</div>
          <div className="mt-3 flex flex-col gap-2 text-[0.86rem] text-white/55">
            <a className="transition hover:text-mint" href="#feed">
              Community feed
            </a>
            <a className="transition hover:text-mint" href="#how">
              The 5-step loop
            </a>
            <a className="transition hover:text-mint" href="#trust">
              Trust ledger
            </a>
            <a className="transition hover:text-mint" href="#top">
              Back to top
            </a>
          </div>
        </div>

        <div>
          <div className="text-[0.68rem] font-bold tracking-[0.16em] text-white/40 uppercase">Demo controls</div>
          <div className="mt-3 flex flex-col items-start gap-2">
            <button onClick={onCreate} className="btn btn-primary btn-sm">
              <IconSpark size={14} /> Post a request
            </button>
            <button onClick={resetDemo} className="btn btn-ghost btn-sm">
              <IconRefresh size={14} /> Reset demo data
            </button>
            <p className="mt-1 text-[0.74rem] leading-relaxed text-white/45">
              {resolved} request{resolved === 1 ? '' : 's'} closed with two-sided proof in this session.
              Everything persists in your browser only.
            </p>
          </div>
        </div>
      </div>

      <div className="divider" />
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-5 text-[0.72rem] text-white/35">
        <span>HANDSHAKE — hackathon prototype · no backend, no paid API.</span>
        <span className="inline-flex items-center gap-1.5">
          <IconShield size={13} className="text-mint/70" /> accountability without false certainty
        </span>
      </div>
    </footer>
  )
}

export default function App() {
  const { requests } = useStore()
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)

  const selected = selectedId ? requests.find((r) => r.id === selectedId) || null : null

  return (
    <div className="relative min-h-screen">
      <div className="ambient" />
      <div className="grid-veil" />

      <div className="relative z-10">
        <Nav onCreate={() => setCreating(true)} />
        <Hero onCreate={() => setCreating(true)} />

        <main className="mx-auto max-w-[1400px] px-5 pb-20">
          <HowItWorks />

          <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_335px]">
            <Feed onOpen={(r) => setSelectedId(r.id)} />
            <Sidebar />
          </div>
        </main>

        <Footer onCreate={() => setCreating(true)} />
      </div>

      <RequestDetail request={selected} onClose={() => setSelectedId(null)} />
      <CreateRequest open={creating} onClose={() => setCreating(false)} />
      <Toast />
      <Confetti />
    </div>
  )
}
