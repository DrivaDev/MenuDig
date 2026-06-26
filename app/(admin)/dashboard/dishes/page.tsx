import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'
import { Category } from '@/models/Category'
import { Dish } from '@/models/Dish'
import { Subcategory } from '@/models/Subcategory'
import { Menu } from '@/models/Menu'
import DishesClient from '@/components/dashboard/DishesClient'

interface SubcategoryLean { _id: string; categoryId: string; name: string }
interface MenuLean { _id: string; name: string }

export default async function DishesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{
    _id: string
    slug: string
  }>()
  if (!restaurant) redirect('/dashboard')

  const [categories, dishes, subcategories, menus] = await Promise.all([
    Category.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean(),
    Dish.find({ restaurantId: restaurant._id }).sort({ order: 1, createdAt: 1 }).lean(),
    Subcategory.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean<SubcategoryLean[]>(),
    Menu.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean<MenuLean[]>(),
  ])

  const subcatsByCategory: Record<string, { _id: string; name: string }[]> = {}
  for (const sub of subcategories) {
    const key = String(sub.categoryId)
    if (!subcatsByCategory[key]) subcatsByCategory[key] = []
    subcatsByCategory[key].push({ _id: String(sub._id), name: sub.name })
  }

  return (
    <DishesClient
      dishes={JSON.parse(JSON.stringify(dishes))}
      categories={JSON.parse(JSON.stringify(categories))}
      subcategoriesByCategory={subcatsByCategory}
      menus={JSON.parse(JSON.stringify(menus))}
    />
  )
}
