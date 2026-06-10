import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'
import { Category } from '@/models/Category'
import { Subcategory } from '@/models/Subcategory'
import CategoriesClient from '@/components/dashboard/CategoriesClient'

interface SubcategoryLean { _id: string; categoryId: string; name: string; order: number }

export default async function CategoriesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{
    _id: string
    slug: string
  }>()
  if (!restaurant) redirect('/dashboard')

  const [categories, subcategories] = await Promise.all([
    Category.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean(),
    Subcategory.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean<SubcategoryLean[]>(),
  ])

  const subcatsByCategory: Record<string, { _id: string; name: string }[]> = {}
  for (const sub of subcategories) {
    const key = String(sub.categoryId)
    if (!subcatsByCategory[key]) subcatsByCategory[key] = []
    subcatsByCategory[key].push({ _id: String(sub._id), name: sub.name })
  }

  return (
    <CategoriesClient
      categories={JSON.parse(JSON.stringify(categories))}
      subcategoriesByCategory={subcatsByCategory}
    />
  )
}
