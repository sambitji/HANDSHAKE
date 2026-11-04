import { useEffect, useRef } from 'react'
import { useStore } from '../store.jsx'

const COLORS = ['#2dd4bf', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399', '#ffffff']

/** Lightweight canvas confetti — fires whenever a request gets two-sided confirmation. */
export default function Confetti() {
  const { party } = useStore()
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!party) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const N = 150
    const parts = Array.from({ length: N }, () => ({
      x: w / 2 + (Math.random() - 0.5) * Math.min(w * 0.5, 420),
      y: h * 0.46 + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 13,
      vy: -Math.random() * 15 - 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      w: 5 + Math.random() * 8,
      h: 7 + Math.random() * 10,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      life: 1,
      delay: Math.random() * 14,
    }))

    let frame = 0
    const tick = () => {
      frame += 1
      ctx.clearRect(0, 0, w, h)

      let alive = false
      for (const p of parts) {
        if (frame < p.delay) {
          alive = true
          continue
        }
        p.vy += 0.42
        p.vx *= 0.985
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        if (frame > 62) p.life = Math.max(0, p.life - 0.02)
        if (p.life > 0 && p.y < h + 60) alive = true

        ctx.save()
        ctx.globalAlpha = p.life
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.c
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }

      if (alive && frame < 260) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, w, h)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [party])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[80]"
      aria-hidden="true"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
