import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'
import { Menu } from '@/models/Menu'
import MenusClient from '@/components/dashboard/MenusClient'

interface MenuLean {
  _id: string
  name: string
  startTime: string | null
  endTime: string | null
  isActive: boolean
  order: number
}

export default async function MenusPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) redirect('/dashboard')

  const menus = await Menu.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean<MenuLean[]>()

  return (
    <MenusClient menus={JSON.parse(JSON.stringify(menus))} />
  )
}
