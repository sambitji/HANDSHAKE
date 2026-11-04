import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

/* ------------------------------------------------------------------ *
 *  HANDSHAKE — local-first store (localStorage, no backend required)
 * ------------------------------------------------------------------ */

const KEY = 'handshake.v1'

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

let seq = 0
export const rid = (p = 'r') => `${p}_${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const CATEGORIES = [
  { id: 'study', label: 'Study', emoji: '📚' },
  { id: 'care', label: 'Care', emoji: '🤝' },
  { id: 'events', label: 'Events', emoji: '🎪' },
  { id: 'health', label: 'Health', emoji: '🩺' },
  { id: 'lost', label: 'Lost & Found', emoji: '🧭' },
  { id: 'logistics', label: 'Logistics', emoji: '📦' },
  { id: 'food', label: 'Food', emoji: '🍲' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
]

export const URGENCIES = [
  { id: 'critical', label: 'Critical', color: '#fb7185', bg: 'rgba(251,113,133,.14)', rank: 4 },
  { id: 'high', label: 'High', color: '#fbbf24', bg: 'rgba(251,191,36,.14)', rank: 3 },
  { id: 'normal', label: 'Normal', color: '#38bdf8', bg: 'rgba(56,189,248,.14)', rank: 2 },
  { id: 'low', label: 'Low', color: '#94a3b8', bg: 'rgba(148,163,184,.14)', rank: 1 },
]

export const ETAS = [
  'Within 2 hours',
  'Within this hour',
  'Today, before 8 PM',
  'Tomorrow morning',
  'Pick a time later',
]

export const STAGES = [
  { key: 'request', name: 'Request', emoji: '🙋', blurb: 'Someone asks for help.' },
  { key: 'connect', name: 'Connect', emoji: '💬', blurb: 'Community members respond.' },
  { key: 'commit', name: 'Commit', emoji: '🤝', blurb: 'A helper is assigned with an ETA.' },
  { key: 'verify', name: 'Verify', emoji: '✅', blurb: 'Helper marks done · requester confirms.' },
  { key: 'resolved', name: 'Resolved', emoji: '🏁', blurb: 'Closed and written to trust history.' },
]

export const USERS = [
  { id: 'u1', name: 'Aarav (You)', short: 'Aarav', avatar: '🧑🏽‍💻', tint: '#2dd4bf', role: 'Student · Hostel 2' },
  { id: 'u2', name: 'Priya Nair', short: 'Priya', avatar: '👩🏽‍🎓', tint: '#f472b6', role: 'Class rep · Electronics' },
  { id: 'u3', name: 'Rahul Verma', short: 'Rahul', avatar: '🧔🏽', tint: '#fbbf24', role: 'Volunteer · NSS' },
  { id: 'u4', name: 'Sana Qureshi', short: 'Sana', avatar: '👩🏽‍⚕️', tint: '#60a5fa', role: 'Nurse · City Hospital' },
  { id: 'u5', name: 'Dev Patel', short: 'Dev', avatar: '🧑🏻‍🎤', tint: '#a78bfa', role: 'Event organiser' },
  { id: 'u6', name: 'Meera Iyer', short: 'Meera', avatar: '👩🏾‍🏫', tint: '#34d399', role: 'Faculty · Maths' },
  { id: 'u7', name: 'Mr. Raghavan', short: 'Raghavan', avatar: '👴🏽', tint: '#f59e0b', role: 'Retired · Lane 4' },
]

export const userById = (id) => USERS.find((u) => u.id === id) || null
export const catById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
export const urgById = (id) => URGENCIES.find((u) => u.id === id) || URGENCIES[2]

/* ------------------------------ time ------------------------------ */

export function relTime(ts) {
  if (!ts) return ''
  const d = Date.now() - ts
  if (d < 45 * 1000) return 'just now'
  if (d < HOUR) return `${Math.max(1, Math.round(d / MIN))} min ago`
  if (d < DAY) return `${Math.round(d / HOUR)} h ago`
  const days = Math.round(d / DAY)
  if (days < 7) return `${days} d ago`
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function dueLabel(ts) {
  if (!ts) return 'No deadline'
  const d = ts - Date.now()
  if (d <= 0) return 'Deadline passed'
  if (d < HOUR) return `due in ${Math.max(1, Math.round(d / MIN))} min`
  if (d < DAY) return `due in ${Math.round(d / HOUR)} h`
  return `due in ${Math.round(d / DAY)} d`
}

/* ---------------------------- statuses ---------------------------- */

export function stageOf(r) {
  if (r.status === 'resolved') return 4
  if (r.status === 'helper_done') return 3
  if (r.status === 'claimed') return 2
  if (r.pledges?.length) return 1
  return 0
}

export function statusMeta(r) {
  switch (r.status) {
    case 'claimed':
      return { label: 'In progress', color: '#fbbf24' }
    case 'helper_done':
      return { label: 'Awaiting confirmation', color: '#a78bfa' }
    case 'resolved':
      return { label: 'Resolved', color: '#2dd4bf' }
    default:
      return r.pledges?.length
        ? { label: 'Connecting', color: '#38bdf8' }
        : { label: 'Open', color: '#34d399' }
  }
}

export const isOpen = (r) => r.status === 'open'
export const isActive = (r) => r.status === 'claimed' || r.status === 'helper_done'

/* ------------------------------ seed ------------------------------ */

function ev(at, kind, text) {
  return { id: rid('e'), at, kind, text }
}

function seed() {
  const now = Date.now()

  const base = {
    pledges: [],
    helperId: null,
    claimedAt: null,
    eta: null,
    helperMarkedAt: null,
    requesterConfirmedAt: null,
    disputes: 0,
  }
  const make = (o) => ({
    ...base,
    id: rid(),
    disputes: 0,
    ...o,
    events: o.events || [],
  })

  const requests = [
    make({
      title: 'USB-C 65W charger for tomorrow’s capstone demo',
      body: 'My charger died an hour before the presentation. Anyone around Block C with a USB-C 65W brick I can borrow tonight? I’ll return it charged by 9 AM, promise.',
      category: 'tech',
      urgency: 'high',
      requesterId: 'u2',
      place: 'Block C · Electronics',
      createdAt: now - 42 * MIN,
      dueAt: now + 18 * HOUR,
      status: 'open',
      pledges: ['u6'],
      events: [
        ev(now - 42 * MIN, 'created', 'Priya posted this request'),
        ev(now - 21 * MIN, 'support', 'Meera backed the request'),
      ],
    }),
    make({
      title: 'Notes for Signals & Systems — Unit 3 (Fourier)',
      body: 'I missed four lectures after a fever. Looking for someone who can share scanned notes or last year’s question bank for Unit 3. Happy to trade with my Circuits notes.',
      category: 'study',
      urgency: 'normal',
      requesterId: 'u1',
      place: 'Hostel 2 · Room 214',
      createdAt: now - 2 * HOUR,
      dueAt: now + 30 * HOUR,
      status: 'open',
      pledges: ['u5', 'u3'],
      events: [
        ev(now - 2 * HOUR, 'created', 'Aarav posted this request'),
        ev(now - 96 * MIN, 'support', 'Dev backed the request'),
        ev(now - 74 * MIN, 'support', 'Rahul backed the request'),
      ],
    }),
    make({
      title: 'Collect BP medicine from the pharmacy for my mother',
      body: 'My mother can’t step out and her prescription runs out today. Apollo Pharmacy, Gandhi Chowk — I’ll share the prescription and pay over UPI before you go.',
      category: 'care',
      urgency: 'critical',
      requesterId: 'u4',
      place: 'Gandhi Chowk · 1.2 km',
      createdAt: now - 3 * HOUR,
      dueAt: now + 4 * HOUR,
      status: 'claimed',
      helperId: 'u3',
      claimedAt: now - 3 * HOUR + 22 * MIN,
      eta: 'Within 2 hours',
      pledges: ['u3', 'u1'],
      events: [
        ev(now - 3 * HOUR, 'created', 'Sana posted this request'),
        ev(now - 3 * HOUR + 8 * MIN, 'support', 'Aarav backed the request'),
        ev(now - 3 * HOUR + 22 * MIN, 'commit', 'Rahul committed as helper · ETA Within 2 hours'),
      ],
    }),
    make({
      title: '12 volunteers for the cultural fest registration desk',
      body: 'Two desks, two shifts of six people each. Free food pass, certificate and the best seat in the house. Even one hour of your time helps us start on time.',
      category: 'events',
      urgency: 'normal',
      requesterId: 'u5',
      place: 'Main Auditorium lobby',
      createdAt: now - 6 * HOUR,
      dueAt: now + 40 * HOUR,
      status: 'open',
      pledges: ['u1', 'u4', 'u6'],
      events: [
        ev(now - 6 * HOUR, 'created', 'Dev posted this request'),
        ev(now - 5 * HOUR, 'support', 'Aarav backed the request'),
        ev(now - 4 * HOUR, 'support', 'Sana backed the request'),
        ev(now - 2 * HOUR, 'support', 'Meera backed the request'),
      ],
    }),
    make({
      title: 'Lost black leather wallet near Metro Gate 3',
      body: 'Blue card holder inside with an ID and a bus pass. Last seen at the Gate 3 auto stand around 7 PM. Reward, no questions asked.',
      category: 'lost',
      urgency: 'high',
      requesterId: 'u1',
      place: 'Metro Gate 3',
      createdAt: now - 26 * HOUR,
      dueAt: now + 50 * HOUR,
      status: 'open',
      pledges: [],
      events: [ev(now - 26 * HOUR, 'created', 'Aarav posted this request')],
    }),
    make({
      title: 'O+ blood donor needed at City Hospital, ward 4',
      body: 'Surgery is scheduled tomorrow morning. We need one O+ donor available between 6–8 AM. Travel, food and the half-day off are covered.',
      category: 'health',
      urgency: 'critical',
      requesterId: 'u2',
      place: 'City Hospital · Ward 4',
      createdAt: now - 5 * HOUR,
      dueAt: now + 14 * HOUR,
      status: 'helper_done',
      helperId: 'u4',
      claimedAt: now - 4 * HOUR - 5 * MIN,
      eta: 'Tomorrow, 6:00 AM',
      helperMarkedAt: now - 9 * MIN,
      pledges: ['u4'],
      events: [
        ev(now - 5 * HOUR, 'created', 'Priya posted this request'),
        ev(now - 4 * HOUR - 5 * MIN, 'commit', 'Sana committed as helper · ETA Tomorrow, 6:00 AM'),
        ev(now - 9 * MIN, 'helper_done', 'Sana marked the help as delivered'),
      ],
    }),
    make({
      title: 'Someone to accompany me to the bank for KYC',
      body: 'I am 71 and the token machine confuses me. Need someone patient for an hour on Thursday morning — tea is on me.',
      category: 'care',
      urgency: 'normal',
      requesterId: 'u7',
      place: 'SBI · Lane 4 branch',
      createdAt: now - 20 * HOUR,
      dueAt: now + 60 * HOUR,
      status: 'claimed',
      helperId: 'u6',
      claimedAt: now - 20 * HOUR + 38 * MIN,
      eta: 'Tomorrow morning',
      pledges: ['u6', 'u3'],
      events: [
        ev(now - 20 * HOUR, 'created', 'Mr. Raghavan posted this request'),
        ev(now - 20 * HOUR + 15 * MIN, 'support', 'Rahul backed the request'),
        ev(now - 20 * HOUR + 38 * MIN, 'commit', 'Meera committed as helper · ETA Tomorrow morning'),
      ],
    }),
    make({
      title: 'Photographer for the student film screening',
      body: 'Need someone with any camera (even a phone) for 90 minutes on Saturday — candids + the panel. Credit in the programme booklet.',
      category: 'events',
      urgency: 'low',
      requesterId: 'u2',
      place: 'Open Air Theatre',
      createdAt: now - 9 * HOUR,
      dueAt: now + 70 * HOUR,
      status: 'open',
      pledges: ['u5'],
      events: [
        ev(now - 9 * HOUR, 'created', 'Priya posted this request'),
        ev(now - 7 * HOUR, 'support', 'Dev backed the request'),
      ],
    }),
    make({
      title: 'Help moving 3 boxes to the hostel room (3rd floor, no lift)',
      body: 'Takes about 25 minutes with a second pair of hands. Everything is already packed near the gate.',
      category: 'logistics',
      urgency: 'low',
      requesterId: 'u5',
      place: 'Hostel 2 · Gate',
      createdAt: now - 3 * DAY,
      dueAt: now - 2 * DAY,
      status: 'resolved',
      helperId: 'u1',
      claimedAt: now - 3 * DAY + 12 * MIN,
      eta: 'Today, before 8 PM',
      helperMarkedAt: now - 2 * DAY - 26 * MIN,
      requesterConfirmedAt: now - 2 * DAY - 11 * MIN,
      pledges: ['u1', 'u3'],
      events: [
        ev(now - 3 * DAY, 'created', 'Dev posted this request'),
        ev(now - 3 * DAY + 40 * MIN, 'support', 'Rahul backed the request'),
        ev(now - 3 * DAY + 12 * MIN, 'commit', 'Aarav committed as helper · ETA Today, before 8 PM'),
        ev(now - 2 * DAY - 26 * MIN, 'helper_done', 'Aarav marked the help as delivered'),
        ev(now - 2 * DAY - 11 * MIN, 'resolved', 'Dev confirmed receipt — request resolved'),
      ],
    }),
    make({
      title: 'Weekend maths tuition for a class-10 student',
      body: 'Two hours every Sunday for a month. She lives in the same lane and is preparing for boards.',
      category: 'study',
      urgency: 'normal',
      requesterId: 'u6',
      place: 'Lane 4 · Community hall',
      createdAt: now - 6 * DAY,
      dueAt: now - 4 * DAY,
      status: 'resolved',
      helperId: 'u3',
      claimedAt: now - 6 * DAY + 19 * MIN,
      eta: 'Tomorrow morning',
      helperMarkedAt: now - 4 * DAY - 90 * MIN,
      requesterConfirmedAt: now - 4 * DAY - 62 * MIN,
      pledges: ['u3'],
      events: [
        ev(now - 6 * DAY, 'created', 'Meera posted this request'),
        ev(now - 6 * DAY + 19 * MIN, 'commit', 'Rahul committed as helper · ETA Tomorrow morning'),
        ev(now - 4 * DAY - 90 * MIN, 'helper_done', 'Rahul marked the help as delivered'),
        ev(now - 4 * DAY - 62 * MIN, 'resolved', 'Meera confirmed receipt — request resolved'),
      ],
    }),
    make({
      title: 'Old newspapers & bottles for the recycling drive',
      body: 'Collected 40 kg last month. Drop at the society gate any time before Sunday and I’ll weigh and log it.',
      category: 'logistics',
      urgency: 'low',
      requesterId: 'u7',
      place: 'Society gate',
      createdAt: now - 8 * DAY,
      dueAt: now - 5 * DAY,
      status: 'resolved',
      helperId: 'u1',
      claimedAt: now - 8 * DAY + 26 * MIN,
      eta: 'Within this hour',
      helperMarkedAt: now - 5 * DAY - 40 * MIN,
      requesterConfirmedAt: now - 5 * DAY - 20 * MIN,
      pledges: ['u1'],
      events: [
        ev(now - 8 * DAY, 'created', 'Mr. Raghavan posted this request'),
        ev(now - 8 * DAY + 26 * MIN, 'commit', 'Aarav committed as helper · ETA Within this hour'),
        ev(now - 5 * DAY - 40 * MIN, 'helper_done', 'Aarav marked the help as delivered'),
        ev(now - 5 * DAY - 20 * MIN, 'resolved', 'Mr. Raghavan confirmed receipt — request resolved'),
      ],
    }),
    make({
      title: 'Someone to proofread my scholarship essay tonight',
      body: '800 words, deadline tomorrow 8 AM. Any set of fresh eyes would help — I mainly need grammar and flow.',
      category: 'study',
      urgency: 'high',
      requesterId: 'u5',
      place: 'Online · shared doc',
      createdAt: now - 2 * DAY,
      dueAt: now - 1 * DAY,
      status: 'resolved',
      helperId: 'u6',
      claimedAt: now - 2 * DAY + 12 * MIN,
      eta: 'Today, before 8 PM',
      helperMarkedAt: now - 26 * HOUR + 20 * MIN,
      requesterConfirmedAt: now - 25 * HOUR,
      disputes: 1,
      pledges: ['u6', 'u2'],
      events: [
        ev(now - 2 * DAY, 'created', 'Dev posted this request'),
        ev(now - 2 * DAY + 6 * MIN, 'support', 'Priya backed the request'),
        ev(now - 2 * DAY + 12 * MIN, 'commit', 'Meera committed as helper · ETA Today, before 8 PM'),
        ev(now - 27 * HOUR, 'helper_done', 'Meera marked the help as delivered'),
        ev(now - 26 * HOUR, 'dispute', 'Dev reported that help was not received yet'),
        ev(now - 26 * HOUR + 20 * MIN, 'helper_done', 'Meera delivered again — corrected draft shared'),
        ev(now - 25 * HOUR, 'resolved', 'Dev confirmed receipt — request resolved'),
      ],
    }),
  ]

  return { requests, currentUserId: 'u1' }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.requests?.length) return parsed
    }
  } catch {
    /* fall through to seed */
  }
  return seed()
}

/* ------------------------------ stats ----------------------------- */

export function statsFor(requests, userId) {
  const helped = requests.filter((r) => r.helperId === userId && r.status === 'resolved')
  const received = requests.filter((r) => r.requesterId === userId && r.status === 'resolved')
  const active = requests.filter(
    (r) => (r.helperId === userId || r.pledges.includes(userId)) && r.status !== 'resolved',
  )
  const disputes = requests.filter((r) => r.helperId === userId).reduce((s, r) => s + (r.disputes || 0), 0)
  const attempts = helped.length + disputes
  const responded = requests.filter((r) => r.helperId === userId && r.claimedAt)
  const avgResponse = responded.length
    ? Math.round(responded.reduce((s, r) => s + (r.claimedAt - r.createdAt), 0) / responded.length / MIN)
    : null

  return {
    helped: helped.length,
    received: received.length,
    active: active.length,
    disputes,
    reliability: attempts ? Math.round((helped.length / attempts) * 100) : null,
    avgResponse,
    history: [...helped, ...received].sort((a, b) => (b.requesterConfirmedAt || 0) - (a.requesterConfirmedAt || 0)),
  }
}

/* ----------------------------- context ---------------------------- */

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  const [toast, setToast] = useState(null)
  const [party, setParty] = useState(0)
  const toastTimer = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage full / private mode — demo still works in memory */
    }
  }, [state])

  const pushToast = useCallback((message, tone = 'ok') => {
    setToast({ id: Date.now(), message, tone })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3600)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const patch = useCallback((id, fn) => {
    setState((s) => ({ ...s, requests: s.requests.map((r) => (r.id === id ? fn({ ...r }) : r)) }))
  }, [])

  const api = useMemo(() => {
    const me = state.currentUserId

    return {
      requests: state.requests,
      currentUserId: me,
      setCurrentUser: (id) => setState((s) => ({ ...s, currentUserId: id })),

      resetDemo: () => {
        localStorage.removeItem(KEY)
        setState(seed())
        pushToast('Demo data restored to the seeded scenario.', 'info')
      },

      createRequest: ({ title, body, category, urgency, place, dueAt }) => {
        const id = rid()
        const now = Date.now()
        const req = {
          id,
          title: title.trim(),
          body: body.trim(),
          category,
          urgency,
          requesterId: me,
          place: place.trim() || 'Anywhere in the community',
          createdAt: now,
          dueAt: dueAt || now + 24 * HOUR,
          status: 'open',
          pledges: [],
          helperId: null,
          claimedAt: null,
          eta: null,
          helperMarkedAt: null,
          requesterConfirmedAt: null,
          disputes: 0,
          events: [{ id: rid('e'), at: now, kind: 'created', text: `${userById(me)?.short || 'Someone'} posted this request` }],
        }
        setState((s) => ({ ...s, requests: [req, ...s.requests] }))
        pushToast('Request is live in the community feed.', 'ok')
        return id
      },

      pledge: (id) => {
        const r = state.requests.find((x) => x.id === id)
        if (!r || r.status !== 'open' || r.requesterId === me || r.pledges.includes(me)) return
        patch(id, (x) => {
          x.pledges = [...x.pledges, me]
          x.events = [
            ...x.events,
            { id: rid('e'), at: Date.now(), kind: 'support', text: `${userById(me)?.short} backed the request` },
          ]
          return x
        })
        pushToast('You backed this request — the requester can see your support.', 'info')
      },

      commit: (id, eta) => {
        const r = state.requests.find((x) => x.id === id)
        if (!r || r.status !== 'open' || r.requesterId === me) return
        patch(id, (x) => {
          x.status = 'claimed'
          x.helperId = me
          x.claimedAt = Date.now()
          x.eta = eta
          if (!x.pledges.includes(me)) x.pledges = [...x.pledges, me]
          x.events = [
            ...x.events,
            { id: rid('e'), at: Date.now(), kind: 'commit', text: `${userById(me)?.short} committed as helper · ETA ${eta}` },
          ]
          return x
        })
        pushToast(`Committed. The requester can now track your ETA (${eta}).`, 'ok')
      },

      uncommit: (id) => {
        const r = state.requests.find((x) => x.id === id)
        if (!r || r.helperId !== me) return
        patch(id, (x) => {
          x.status = 'open'
          x.helperId = null
          x.claimedAt = null
          x.eta = null
          x.events = [
            ...x.events,
            { id: rid('e'), at: Date.now(), kind: 'release', text: `${userById(me)?.short} stepped back — request reopened` },
          ]
          return x
        })
        pushToast('You stepped back. The request is open again.', 'info')
      },

      helperDone: (id) => {
        const r = state.requests.find((x) => x.id === id)
        if (!r || r.helperId !== me) return
        patch(id, (x) => {
          x.status = 'helper_done'
          x.helperMarkedAt = Date.now()
          x.events = [
            ...x.events,
            { id: rid('e'), at: Date.now(), kind: 'helper_done', text: `${userById(me)?.short} marked the help as delivered` },
          ]
          return x
        })
        pushToast('Half confirmed. Waiting for the requester to verify.', 'info')
      },

      confirmReceived: (id) => {
        const r = state.requests.find((x) => x.id === id)
        if (!r || r.requesterId !== me || r.status !== 'helper_done') return
        patch(id, (x) => {
          x.status = 'resolved'
          x.requesterConfirmedAt = Date.now()
          x.events = [
            ...x.events,
            {
              id: rid('e'),
              at: Date.now(),
              kind: 'resolved',
              text: `${userById(me)?.short} confirmed receipt — request resolved`,
            },
          ]
          return x
        })
        setParty((p) => p + 1)
        pushToast('Two-sided confirmation complete. Trust history updated.', 'ok')
      },

      dispute: (id) => {
        const r = state.requests.find((x) => x.id === id)
        if (!r || r.requesterId !== me || r.status !== 'helper_done') return
        patch(id, (x) => {
          x.disputes = (x.disputes || 0) + 1
          x.status = 'claimed'
          x.helperMarkedAt = null
          x.events = [
            ...x.events,
            { id: rid('e'), at: Date.now(), kind: 'dispute', text: `${userById(me)?.short} reported that help was not received yet` },
          ]
          return x
        })
        pushToast('Flagged. The request stays assigned until you both agree.', 'warn')
      },
    }
  }, [state, patch, pushToast])

  const value = useMemo(
    () => ({
      ...api,
      toast,
      party,
      pushToast,
      users: USERS,
    }),
    [api, toast, party, pushToast],
  )

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
