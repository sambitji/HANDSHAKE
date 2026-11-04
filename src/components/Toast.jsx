import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store.jsx'
import { IconAlert, IconCheck, IconInfo } from './Icons.jsx'

const TONE = {
  ok: { c: '#2dd4bf', Icon: IconCheck },
  info: { c: '#38bdf8', Icon: IconInfo },
  warn: { c: '#fbbf24', Icon: IconAlert },
}

export default function Toast() {
  const { toast } = useStore()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: 34, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 22, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="glass-deep pointer-events-auto flex max-w-[92vw] items-center gap-2.5 rounded-full py-2.5 pr-5 pl-3.5 shadow-2xl"
          >
            {(() => {
              const t = TONE[toast.tone] || TONE.ok
              const Icon = t.Icon
              return (
                <>
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
                    style={{ background: `${t.c}22`, color: t.c, boxShadow: `0 0 18px -6px ${t.c}` }}
                  >
                    <Icon size={15} sw={2.6} />
                  </span>
                  <span className="text-[0.84rem] text-white/85">{toast.message}</span>
                </>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
