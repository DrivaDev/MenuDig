import { TAGS } from '@/lib/tags'
import type { TagKey } from '@/lib/tags'

interface Props {
  tagKey: TagKey
}

export function TagBadge({ tagKey }: Props) {
  const tag = TAGS.find(t => t.key === tagKey)
  if (!tag) return null
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
        tag.type === 'suitable'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-amber-50 text-amber-700'
      }`}
    >
      {tag.label}
    </span>
  )
}
