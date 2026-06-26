import Image from 'next/image'
import { AllergenBadge } from '@/components/menu/AllergenBadge'
import { TagBadge } from '@/components/menu/TagBadge'
import { ImagePlaceholder } from '@/components/menu/ImagePlaceholder'
import type { AllergenKey } from '@/lib/allergens'
import type { TagKey } from '@/lib/tags'

interface Dish {
  _id: string
  name: string
  description: string
  price: number        // CENTS integer
  imageUrl: string
  allergens: string[]
  tags?: string[]
}

interface Props {
  dish: Dish
}

export function DishRow({ dish }: Props) {
  const priceFormatted = dish.price > 0
    ? (dish.price / 100).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
    : null

  return (
    <article className="flex items-start gap-4 px-4 py-4">
      {/* Left: image slot — fixed 80×80px */}
      <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-gray-100 md:w-24 md:h-24">
        {dish.imageUrl ? (
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            sizes="(min-width: 768px) 96px, 80px"
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {/* Right: text stack */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-normal text-brand-texto leading-normal">{dish.name}</p>
        {dish.description && (
          <p className="text-sm font-normal text-brand-texto leading-normal mt-1 line-clamp-2">
            {dish.description}
          </p>
        )}
        {priceFormatted && (
          <p className="text-base font-bold text-brand-titulares mt-1">{priceFormatted}</p>
        )}
        {dish.allergens.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mt-2">
            {dish.allergens.map(key => (
              <AllergenBadge key={key} allergenKey={key as AllergenKey} />
            ))}
          </div>
        )}
        {(dish.tags?.length ?? 0) > 0 && (
          <div className="flex items-center gap-1 flex-wrap mt-1.5">
            {dish.tags!.map(key => (
              <TagBadge key={key} tagKey={key as TagKey} />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
