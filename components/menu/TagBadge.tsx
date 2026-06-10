import { TAGS } from '@/lib/tags'
import { TagIcon } from '@/components/menu/TagIcon'
import type { TagKey } from '@/lib/tags'

interface Props {
  tagKey: TagKey
}

export function TagBadge({ tagKey }: Props) {
  const tag = TAGS.find(t => t.key === tagKey)
  const label = tag?.label ?? tagKey

  return (
    <span
      className="relative group/badge"
      role="img"
      aria-label={label}
      tabIndex={0}
    >
      <span className="flex items-center justify-center w-5 h-5 text-brand-texto/40 select-none cursor-default">
        <TagIcon tagKey={tagKey} size={13} />
      </span>
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-brand-titulares text-white text-sm font-normal rounded whitespace-nowrap opacity-0 group-hover/badge:opacity-100 group-focus-within/badge:opacity-100 pointer-events-none transition-opacity duration-150 z-20"
        aria-hidden="true"
      >
        {label}
      </span>
    </span>
  )
}
