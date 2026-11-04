import Hero3D from './Hero3D.jsx'
import { IconArrow, IconPlus, IconShield, IconSpark, IconZap } from './Icons.jsx'
import { STAGES, useStore } from '../store.jsx'

const LOOP = STAGES.map((s, i) => ({ ...s, n: i + 1 }))

export default function Hero({ onCreate }) {
  const { requests } = useStore()
  const resolved = requests.filter((r) => r.status === 'resolved').length
  const live = requests.filter((r) => r.status !== 'resolved').length
  const awaiting = requests.filter((r) => r.status === 'helper_done').length

  return (
    <section id="top" className="relative isolate overflow-hidden">
      <Hero3D />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-8 px-5 pb-14 pt-14 sm:pt-20 lg:min-h-[86vh] lg:grid-cols-2 lg:pb-20">
        <div className="max-w-[36rem]">
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.72rem] font-semibold tracking-[0.12em] text-white/70 uppercase">
            <span className="h-1.5 w-1.5 animate-dot rounded-full bg-mint" />
            HelpLoop + ProofPing = HANDSHAKE
          </div>

          <h1 className="display mt-5 text-[2.6rem] leading-[0.98] font-bold text-balance sm:text-6xl lg:text-[4.2rem]">
            From asking for help
            <br />
            to <span className="text-gradient">making sure it happens.</span>
          </h1>

          <p className="mt-5 max-w-[33rem] text-[1.02rem] leading-relaxed text-white/62">
            Requests posted in community groups get buried, and commitments get forgotten. HANDSHAKE
            connects the person who needs help with the person who offers it — and keeps the request
            open until <span className="font-semibold text-white">both sides confirm it is done</span>.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button onClick={onCreate} className="btn btn-primary btn-lg">
              <IconPlus size={17} sw={2.4} /> Post a request
            </button>
            <a href="#feed" className="btn btn-ghost btn-lg">
              Explore the feed <IconArrow size={16} />
            </a>
          </div>

          <div className="mt-8 grid max-w-[32rem] grid-cols-3 gap-3">
            {[
              { v: live, l: 'requests live', c: '#38bdf8' },
              { v: resolved, l: 'confirmed resolved', c: '#2dd4bf' },
              { v: awaiting, l: 'awaiting verify', c: '#a78bfa' },
            ].map((s) => (
              <div key={s.l} className="glass rounded-2xl px-3 py-3">
                <div className="stat-num text-2xl" style={{ color: s.c }}>
                  {s.v}
                </div>
                <div className="text-[0.68rem] leading-tight text-white/45">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block" />
      </div>

      {/* the loop strip */}
      <div className="relative mx-auto max-w-[1400px] px-5 pb-12">
        <div className="stage">
          <div className="preserve flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LOOP.map((s, i) => (
              <div
                key={s.key}
                className="glass card3d group min-w-[12.5rem] flex-1 rounded-2xl p-3.5"
                style={{ transform: `translateZ(${i * 6}px)` }}
              >
                <div className="shine" />
                <div className="relative flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/12 bg-white/6 text-[0.9rem]">
                    {s.emoji}
                  </span>
                  <span className="text-[0.66rem] font-bold tracking-[0.16em] text-white/35 uppercase">
                    Step {s.n}
                  </span>
                  {i === 3 && (
                    <span className="ml-auto flex items-center gap-1 rounded-md bg-violet/18 px-1.5 py-0.5 text-[0.6rem] font-bold text-violet">
                      <IconShield size={10} /> 2-sided
                    </span>
                  )}
                </div>
                <div className="display mt-2 text-[1.05rem] font-semibold text-white">{s.name}</div>
                <div className="mt-0.5 text-[0.74rem] leading-snug text-white/48">{s.blurb}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.72rem] text-white/42">
          <span className="inline-flex items-center gap-1.5">
            <IconSpark size={13} className="text-gold" /> React + Tailwind + localStorage — no backend
            for the demo
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconZap size={13} className="text-mint" /> Real 3D hero · mouse-parallax community network
          </span>
        </div>
      </div>
    </section>
  )
}
