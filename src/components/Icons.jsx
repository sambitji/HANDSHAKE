/* Minimal hand-rolled icon set — keeps the bundle dependency-free. */

const S = ({ children, size = 16, className = '', sw = 1.9, ...rest }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
)

export const IconPlus = (p) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
)

export const IconCheck = (p) => (
  <S {...p}>
    <path d="M20 6 9 17l-5-5" />
  </S>
)

export const IconX = (p) => (
  <S {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </S>
)

export const IconClock = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 1.9" />
  </S>
)

export const IconPin = (p) => (
  <S {...p}>
    <path d="M20 10.2c0 5.8-8 11.8-8 11.8s-8-6-8-11.8a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.8" />
  </S>
)

export const IconSpark = (p) => (
  <S {...p}>
    <path d="M11 2.6 13 8l5.4 2-5.4 2-2 5.4-2-5.4L3.6 10 9 8l2-5.4Z" />
    <path d="M18.6 15.4 19.4 17.6l2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
  </S>
)

export const IconShield = (p) => (
  <S {...p}>
    <path d="M12 3.2 19 6v6c0 4.4-3 7.7-7 8.8-4-1.1-7-4.4-7-8.8V6l7-2.8Z" />
    <path d="m9.2 12 2 2 3.6-3.9" />
  </S>
)

export const IconArrow = (p) => (
  <S {...p}>
    <path d="M5 12h13M12.5 6l6 6-6 6" />
  </S>
)

export const IconChevron = (p) => (
  <S {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </S>
)

export const IconUsers = (p) => (
  <S {...p}>
    <circle cx="9" cy="8" r="3.3" />
    <path d="M2.8 19c.7-3.4 3.1-5.2 6.2-5.2s5.5 1.8 6.2 5.2" />
    <path d="M16.3 5.4a3.3 3.3 0 0 1 0 5.2M18 14.2c1.8.8 2.9 2.4 3.2 4.3" />
  </S>
)

export const IconHeart = (p) => (
  <S {...p}>
    <path d="M12 20.2S4.5 15.6 4.5 10.6A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7.5 2.6c0 5-7.5 9.6-7.5 9.6Z" />
  </S>
)

export const IconZap = (p) => (
  <S {...p}>
    <path d="M13.2 2.5 4.5 13.6h6.6l-.9 7.9 9-11.4h-6.7l.7-7.6Z" />
  </S>
)

export const IconStar = (p) => (
  <S {...p}>
    <path d="m12 3.4 2.7 5.5 6.1.9-4.4 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.2 9.8l6.1-.9L12 3.4Z" />
  </S>
)

export const IconAlert = (p) => (
  <S {...p}>
    <path d="M12 4 2.8 20h18.4L12 4Z" />
    <path d="M12 10.2v4M12 17.4v.01" />
  </S>
)

export const IconRefresh = (p) => (
  <S {...p}>
    <path d="M20.2 12a8.2 8.2 0 1 1-2.6-6" />
    <path d="M20.2 4v5.2H15" />
  </S>
)

export const IconLayers = (p) => (
  <S {...p}>
    <path d="m12 3 8.6 4.7L12 12.4 3.4 7.7 12 3Z" />
    <path d="m3.4 12.6 8.6 4.7 8.6-4.7M3.4 17.1l8.6 4.7 8.6-4.7" />
  </S>
)

export const IconEye = (p) => (
  <S {...p}>
    <path d="M2.2 12S6 6.2 12 6.2 21.8 12 21.8 12 18 17.8 12 17.8 2.2 12 2.2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </S>
)

export const IconTrend = (p) => (
  <S {...p}>
    <path d="M3 17.2 9.2 11l3.7 3.7L21 6.6" />
    <path d="M15.4 6.6H21v5.6" />
  </S>
)

export const IconInfo = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11.2v5M12 7.9v.01" />
  </S>
)

export const IconHand = (p) => (
  <S {...p}>
    <path d="M8.5 12.5V6.4a1.7 1.7 0 1 1 3.4 0v4.6" />
    <path d="M11.9 10.4V5.2a1.7 1.7 0 1 1 3.4 0v5.6" />
    <path d="M15.3 11.2V7.6a1.7 1.7 0 1 1 3.4 0v6.6c0 3.6-2.5 6.4-6.1 6.4-3.1 0-4.6-1.4-6.1-4l-2.4-4a1.7 1.7 0 0 1 2.8-1.9l1.7 2.1" />
  </S>
)

export const IconSend = (p) => (
  <S {...p}>
    <path d="M21 3.5 3 10.8l7.3 2.6 2.6 7.3L21 3.5Z" />
    <path d="m10.3 13.4 4.6-4.6" />
  </S>
)
