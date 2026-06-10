import type { TagKey } from '@/lib/tags'

interface Props {
  tagKey: TagKey
  size?: number
}

export function TagIcon({ tagKey, size = 14 }: Props) {
  const svg = {
    width: size,
    height: size,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (tagKey) {
    // Drop with checkmark — approved for diabetics
    case 'apto_diabeticos':
      return (
        <svg {...svg}>
          <path d="M8 2L5.5 6.5C5 8.5 5.5 11 8 12C10.5 11 11 8.5 10.5 6.5L8 2Z" />
          <polyline points="6,8.5 7.5,10 10.5,7" strokeWidth="1.2" />
        </svg>
      )

    // Heart with EKG pulse line — heart health / hypertension
    case 'apto_hipertensos':
      return (
        <svg {...svg}>
          <path d="M8 12.5C8 12.5 2.5 9 2.5 6C2.5 4.2 4 3 5.5 3.5C6.5 4 7.5 5.5 8 6C8.5 5.5 9.5 4 10.5 3.5C12 3 13.5 4.2 13.5 6C13.5 9 8 12.5 8 12.5Z" />
          <polyline points="4,7 6,7 7,5 8.5,9.5 9.5,6.5 12,7" strokeWidth="1" />
        </svg>
      )

    // Wheat stalk with diagonal slash — gluten-free / celiac safe
    case 'apto_celiacs':
      return (
        <svg {...svg}>
          <line x1="8" y1="15" x2="8" y2="2" />
          <path d="M8 12C6.5 11 5 9 5.5 7.5C6 6 8 6.5 8 8" />
          <path d="M8 12C9.5 11 11 9 10.5 7.5C10 6 8 6.5 8 8" />
          <path d="M8 8.5C6.5 7.5 5 5.5 5.5 4C6 2.5 8 3 8 4.5" />
          <path d="M8 8.5C9.5 7.5 11 5.5 10.5 4C10 2.5 8 3 8 4.5" />
          <line x1="4" y1="13" x2="12" y2="3" strokeWidth="1.8" />
        </svg>
      )

    // Leaf — vegan
    case 'apto_veganos':
      return (
        <svg {...svg}>
          <path d="M8 13.5C8 13.5 3 9.5 3 6C3 3 5.5 1.5 8 2.5C10.5 1.5 13 3 13 6C13 9.5 8 13.5 8 13.5Z" />
          <line x1="8" y1="13.5" x2="8" y2="5" />
          <path d="M8 10C6 8.5 5 7.5 5 6" strokeWidth="1" />
        </svg>
      )

    // Carrot — vegetarian
    case 'apto_vegetarianos':
      return (
        <svg {...svg}>
          <path d="M6 4C6 4 5 6.5 5.5 9L7.5 14L9.5 9C10 6.5 9 4 9 4" />
          <line x1="7.5" y1="4" x2="7.5" y2="13" strokeWidth="0.8" />
          <path d="M7 3.5C7 1.5 5.5 1.5 6 3.5" strokeWidth="1.2" />
          <path d="M8 3.5C8 1.5 9.5 1.5 9 3.5" strokeWidth="1.2" />
          <path d="M6 3C5 0.5 3.5 1.5 4.5 3" strokeWidth="1.2" />
        </svg>
      )

    // Drop with X — lactose-free
    case 'sin_lactosa':
      return (
        <svg {...svg}>
          <path d="M8 2L5 7.5C4.5 10 5.5 13 8 13.5C10.5 13 11.5 10 11 7.5L8 2Z" />
          <line x1="5.5" y1="7.5" x2="10.5" y2="12" strokeWidth="1.2" />
          <line x1="10.5" y1="7.5" x2="5.5" y2="12" strokeWidth="1.2" />
        </svg>
      )

    // Circular leaf — organic
    case 'organico':
      return (
        <svg {...svg}>
          <path d="M8 12.5C8 12.5 3.5 9 3.5 5.5C3.5 3 5.5 2 8 3C10.5 2 12.5 3 12.5 5.5C12.5 9 8 12.5 8 12.5Z" />
          <line x1="8" y1="12.5" x2="8" y2="5" />
          <path d="M5 4.5C4 5.5 3.5 7 4 8.5" strokeWidth="1" />
          <path d="M5 14C5 14 5.5 12.5 7 12.5" strokeWidth="1.2" />
          <polyline points="5,14 6.5,14.5 6,13" strokeWidth="1.2" />
        </svg>
      )

    // Flame — spicy
    case 'picante':
      return (
        <svg {...svg}>
          <path d="M8 14.5C5.5 14.5 4 12.5 4 10.5C4 8.5 5 7 5.5 5.5C6 4 5.5 2 5.5 2C7 3 7.5 4.5 8 6C8.5 4.5 9 3.5 9 2.5C10.5 4.5 11 7 10 9C9.5 10 10.5 10 11 10.5C11 12.5 10.5 14.5 8 14.5Z" />
          <path d="M8 12.5C7 12 6.5 11 7 9.5C7.5 8.5 7.5 7.5 7.5 7.5C8.5 8.5 8.5 9.5 8 10.5" strokeWidth="1" />
        </svg>
      )

    default:
      return (
        <svg {...svg}>
          <circle cx="8" cy="8" r="5.5" />
          <line x1="8" y1="5" x2="8" y2="8.5" />
          <circle cx="8" cy="11" r="0.75" fill="currentColor" stroke="none" />
        </svg>
      )
  }
}
