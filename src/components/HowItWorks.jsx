import { useState } from 'react'
import { STAGES } from '../store.jsx'
import { IconArrow } from './Icons.jsx'

const DETAIL = [
  'A student, a senior, an organiser — anyone can post a need in under 30 seconds with category, urgency, place and deadline.',
  'Members back the request to signal “I’m around”. Support becomes visible instead of disappearing into a group chat.',
  'One member commits and becomes the named helper with an expected completion time. Vague offers turn into a trackable commitment.',
  'The helper marks it delivered, then the requester must verify it. Neither side can close the loop alone — a dispute keeps it open.',
  'Only then does the request close, writing a two-sided proof entry into both people’s trust history.',
]

const EXAMPLES = [
  '“Notes before the exam”',
  '“Collect my mother’s medicine”',
  '“12 fest volunteers”',
  '“O+ donor at 6 AM”',
  '“Lost wallet near Gate 3”',
]

export default function HowItWorks() {
  const [flipped, setFlipped] = useState(null)

  return (
    <section id="how" className="relative scroll-mt-[150px] pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-bold tracking-[0.2em] text-gold/85 uppercase">
            The accountability loop
          </p>
          <h2 className="display mt-2 text-3xl font-bold text-white sm:text-4xl">
            Five steps, one promise: <span className="text-gradient">it actually happens</span>
          </h2>
        </div>
        <p className="max-w-sm text-[0.85rem] text-white/48">
          Hover (or tap) a card to flip it for the full explanation. Every step is stored in the
          request’s immutable activity trail.
        </p>
      </div>

      <div className="stage mt-7">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {STAGES.map((s, i) => (
            <div
              key={s.key}
              className={`flip h-[16.5rem] cursor-pointer ${flipped === i ? 'is-flipped' : ''}`}
              onClick={() => setFlipped((f) => (f === i ? null : i))}
            >
              <div className="flip-inner">
                {/* front */}
                <div
                  className="flip-face card3d preserve flex flex-col p-4"
                  style={{
                    background: 'linear-gradient(160deg, rgba(255,255,255,.08), rgba(255,255,255,.02))',
                    border: '1px solid rgba(255,255,255,.11)',
                    transform: `translateZ(${i * 4}px)`,
                  }}
                >
                  <div className="shine" />
                  <div className="relative flex items-center justify-between">
                    <span className="stat-num text-[2.6rem] leading-none text-white/10">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/12 bg-black/30 text-xl">
                      {s.emoji}
                    </span>
                  </div>
                  <div className="display relative mt-auto text-[1.3rem] font-semibold text-white">
                    {s.name}
                  </div>
                  <p className="relative mt-1.5 text-[0.8rem] leading-snug text-white/50">{s.blurb}</p>
                  <span className="relative mt-3 inline-flex items-center gap-1.5 text-[0.68rem] font-semibold text-mint/80">
                    flip for detail <IconArrow size={12} />
                  </span>
                </div>

                {/* back */}
                <div
                  className="flip-face flip-back flex flex-col p-4"
                  style={{
                    background: 'linear-gradient(160deg, rgba(45,212,191,.16), rgba(56,189,248,.07))',
                    border: '1px solid rgba(45,212,191,.42)',
                    boxShadow: '0 30px 60px -34px rgba(45,212,191,.9)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="tag" style={{ background: 'rgba(5,7,14,.45)', color: '#9df3e6', border: '1px solid rgba(45,212,191,.5)' }}>
                      step {i + 1}
                    </span>
                    <span className="text-lg">{s.emoji}</span>
                  </div>
                  <div className="display mt-3 text-[1.15rem] font-semibold text-white">{s.name}</div>
                  <p className="mt-2 text-[0.8rem] leading-relaxed text-white/72">{DETAIL[i]}</p>
                  <div className="mt-auto pt-3 text-[0.7rem] text-white/55">
                    <span className="text-mint">example:</span> {EXAMPLES[i]}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
