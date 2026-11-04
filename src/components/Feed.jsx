import { useMemo, useState } from 'react'
import { CATEGORIES, URGENCIES, useStore } from '../store.jsx'
import RequestCard from './RequestCard.jsx'
import { EmptyState } from './bits.jsx'
import { IconLayers } from './Icons.jsx'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'active', label: 'In progress' },
  { id: 'helper_done', label: 'Awaiting verify' },
  { id: 'resolved', label: 'Resolved' },
]

const SORTS = [
  { id: 'urgent', label: 'Most urgent' },
  { id: 'new', label: 'Newest' },
  { id: 'due', label: 'Closing soon' },
]

export default function Feed({ onOpen }) {
  const { requests, currentUserId } = useStore()
  const [tab, setTab] = useState('all')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('urgent')
  const [mineOnly, setMineOnly] = useState(false)

  const list = useMemo(() => {
    let out = requests.filter((r) => {
      if (tab === 'open' && r.status !== 'open') return false
      if (tab === 'active' && r.status !== 'claimed') return false
      if (tab === 'helper_done' && r.status !== 'helper_done') return false
      if (tab === 'resolved' && r.status !== 'resolved') return false
      if (cat !== 'all' && r.category !== cat) return false
      if (mineOnly && r.requesterId !== currentUserId && r.helperId !== currentUserId && !r.pledges.includes(currentUserId))
        return false
      return true
    })

    out = [...out].sort((a, b) => {
      if (sort === 'new') return b.createdAt - a.createdAt
      if (sort === 'due') return (a.dueAt || Infinity) - (b.dueAt || Infinity)
      const rank = (r) =>
        (r.status === 'resolved' ? -10 : 0) + URGENCIES.find((u) => u.id === r.urgency)?.rank
      return rank(b) - rank(a) || b.createdAt - a.createdAt
    })
    return out
  }, [requests, tab, cat, sort, mineOnly, currentUserId])

  return (
    <section id="feed" className="relative scroll-mt-[150px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.2em] text-mint/80 uppercase">
            <IconLayers size={14} /> Community feed
          </p>
          <h2 className="display mt-2 text-3xl font-bold text-white sm:text-4xl">
            Open requests in your community
          </h2>
          <p className="mt-1.5 max-w-xl text-[0.9rem] text-white/50">
            Every card tracks one commitment from <span className="text-white/75">ask</span> to{' '}
            <span className="text-white/75">verified help</span>. Nothing gets buried.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="field !w-auto !rounded-full !py-2 text-[0.8rem]"
            aria-label="Sort requests"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setMineOnly((v) => !v)}
            className={`chip ${mineOnly ? 'chip-on' : ''}`}
            title="Only show requests you posted, backed or committed to"
          >
            My circle
          </button>
        </div>
      </div>

      {/* status tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const count = requests.filter((r) =>
            t.id === 'all'
              ? true
              : t.id === 'active'
                ? r.status === 'claimed'
                : r.status === t.id,
          ).length
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`chip ${tab === t.id ? 'chip-on' : ''}`}>
              {t.label}
              <span className="rounded-full bg-black/35 px-1.5 text-[0.66rem]">{count}</span>
            </button>
          )
        })}
      </div>

      {/* categories */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setCat('all')} className={`chip !text-[0.72rem] ${cat === 'all' ? 'chip-on' : ''}`}>
          All categories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`chip !text-[0.72rem] ${cat === c.id ? 'chip-on' : ''}`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="stage mt-6">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.length === 0 ? (
            <EmptyState
              title="Nothing matches those filters"
              body="Try another tab, or post the request your community is waiting for."
            />
          ) : (
            list.map((r) => <RequestCard key={r.id} request={r} onOpen={onOpen} />)
          )}
        </div>
      </div>
    </section>
  )
}
