'use client'

import { useState, useEffect } from 'react'
import { getActiveMenuId } from '@/lib/activeMenu'
import { MenuCategoryNav } from './MenuCategoryNav'
import { DishRow } from './DishRow'

interface MenuData {
  _id: string
  startTime: string | null
  endTime: string | null
  isActive: boolean
}

interface CategoryData {
  _id: string
  name: string
  order: number
}

interface SubcategoryData {
  _id: string
  categoryId: string
  name: string
  order: number
}

interface DishData {
  _id: string
  categoryId: string
  subcategoryId?: string | null
  name: string
  description: string
  price: number
  imageUrl: string
  allergens: string[]
  tags?: string[]
  menuIds?: string[]
}

interface Props {
  menus: MenuData[]
  categories: CategoryData[]
  subcategoriesByCategory: Record<string, SubcategoryData[]>
  dishesByCategory: Record<string, DishData[]>
  menuColor: string
}

export default function MenuDishesView({
  menus,
  categories,
  subcategoriesByCategory,
  dishesByCategory,
  menuColor,
}: Props) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(() =>
    getActiveMenuId(menus)
  )

  // Recalculate active menu every minute
  useEffect(() => {
    if (menus.length === 0) return
    const tick = () => setActiveMenuId(getActiveMenuId(menus))
    const id = setInterval(tick, 60 * 1000)
    return () => clearInterval(id)
  }, [menus])

  const hasMenus = menus.length > 0

  // Filter dishes by active menu (if menus exist)
  const filteredDishesByCategory: Record<string, DishData[]> = {}
  for (const [catId, dishes] of Object.entries(dishesByCategory)) {
    if (!hasMenus || !activeMenuId) {
      filteredDishesByCategory[catId] = dishes
    } else {
      filteredDishesByCategory[catId] = dishes.filter(d =>
        d.menuIds && d.menuIds.includes(activeMenuId)
      )
    }
  }

  // Only show categories that have at least one dish after filtering
  const populatedCategories = categories.filter(
    cat => (filteredDishesByCategory[cat._id] ?? []).length > 0
  )

  return (
    <>
      {populatedCategories.length > 0 && (
        <MenuCategoryNav
          categories={populatedCategories.map(c => ({ _id: c._id, name: c.name }))}
          menuColor={menuColor}
        />
      )}

      <main>
        {populatedCategories.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-base font-normal text-brand-texto">Sin platos disponibles</p>
            <p className="text-sm font-normal text-brand-texto mt-2">
              Este restaurante aún no ha publicado su menú.
            </p>
          </div>
        ) : (
          populatedCategories.map(cat => {
            const catDishes  = filteredDishesByCategory[cat._id] ?? []
            const catSubcats = subcategoriesByCategory[cat._id] ?? []
            const hasSubcats = catSubcats.length > 0

            const noSubcatDishes = hasSubcats
              ? catDishes.filter(d => !d.subcategoryId)
              : catDishes

            const dishesBySubcat: Record<string, DishData[]> = {}
            if (hasSubcats) {
              for (const sub of catSubcats) {
                dishesBySubcat[sub._id] = catDishes.filter(
                  d => d.subcategoryId && String(d.subcategoryId) === sub._id
                )
              }
            }

            return (
              <section
                key={cat._id}
                id={`category-${cat._id}`}
                className="scroll-mt-12"
              >
                <div className="px-4 py-3 bg-brand-fondo border-b border-gray-100">
                  <h2 className="text-lg font-bold text-brand-titulares leading-tight">
                    {cat.name}
                  </h2>
                </div>

                {noSubcatDishes.map(dish => (
                  <DishRow key={dish._id} dish={dish} />
                ))}

                {hasSubcats && catSubcats.map(sub => {
                  const subDishes = dishesBySubcat[sub._id] ?? []
                  if (subDishes.length === 0) return null
                  return (
                    <div key={sub._id}>
                      <div className="px-4 py-2 bg-brand-fondo/60 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-brand-titulares/70 uppercase tracking-wide">
                          {sub.name}
                        </h3>
                      </div>
                      {subDishes.map(dish => (
                        <DishRow key={dish._id} dish={dish} />
                      ))}
                    </div>
                  )
                })}
              </section>
            )
          })
        )}
      </main>
    </>
  )
}
