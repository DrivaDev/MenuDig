'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'
import { Menu } from '@/models/Menu'
import { Dish } from '@/models/Dish'

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function timesOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
  return s1 < e2 && s2 < e1
}

// ─── createMenu ───────────────────────────────────────────────────────────────
export async function createMenu(prevState: any, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const name = formData.get('name')?.toString().trim()
  if (!name) return { success: false, error: 'El nombre del menú es obligatorio.' }

  const startTime = formData.get('startTime')?.toString().trim() || null
  const endTime   = formData.get('endTime')?.toString().trim() || null

  if ((startTime && !endTime) || (!startTime && endTime)) {
    return { success: false, error: 'Ingresá tanto el horario de inicio como el de fin, o dejá ambos vacíos.' }
  }

  if (startTime && endTime) {
    const s = timeToMinutes(startTime)
    const e = timeToMinutes(endTime)
    if (s >= e) return { success: false, error: 'El horario de inicio debe ser anterior al de fin.' }
  }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  interface MenuLean { _id: string; startTime: string | null; endTime: string | null }
  const existing = await Menu.find({ restaurantId: restaurant._id }).lean<MenuLean[]>()

  if (existing.length >= 4) {
    return { success: false, error: 'Podés crear hasta 4 menús por restaurante.' }
  }

  if (startTime && endTime) {
    const s = timeToMinutes(startTime)
    const e = timeToMinutes(endTime)
    for (const m of existing) {
      if (!m.startTime || !m.endTime) continue
      if (timesOverlap(s, e, timeToMinutes(m.startTime), timeToMinutes(m.endTime))) {
        return { success: false, error: 'El horario se superpone con un menú existente.' }
      }
    }
  }

  await Menu.create({
    restaurantId: restaurant._id,
    name,
    startTime,
    endTime,
    isActive: false,
    order: existing.length,
  })

  revalidatePath('/menu/' + restaurant.slug)
  return { success: true }
}

// ─── updateMenu ───────────────────────────────────────────────────────────────
export async function updateMenu(prevState: any, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const menuId = formData.get('menuId')?.toString()
  if (!menuId) return { success: false, error: 'Datos inválidos.' }

  const name = formData.get('name')?.toString().trim()
  if (!name) return { success: false, error: 'El nombre del menú es obligatorio.' }

  const startTime = formData.get('startTime')?.toString().trim() || null
  const endTime   = formData.get('endTime')?.toString().trim() || null

  if ((startTime && !endTime) || (!startTime && endTime)) {
    return { success: false, error: 'Ingresá tanto el horario de inicio como el de fin, o dejá ambos vacíos.' }
  }

  if (startTime && endTime) {
    const s = timeToMinutes(startTime)
    const e = timeToMinutes(endTime)
    if (s >= e) return { success: false, error: 'El horario de inicio debe ser anterior al de fin.' }
  }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const menu = await Menu.findOne({ _id: menuId, restaurantId: restaurant._id })
  if (!menu) return { success: false, error: 'Menú no encontrado.' }

  if (startTime && endTime) {
    const s = timeToMinutes(startTime)
    const e = timeToMinutes(endTime)
    interface OtherLean { startTime: string | null; endTime: string | null }
    const others = await Menu.find({ restaurantId: restaurant._id, _id: { $ne: menuId } }).lean<OtherLean[]>()
    for (const m of others) {
      if (!m.startTime || !m.endTime) continue
      if (timesOverlap(s, e, timeToMinutes(m.startTime), timeToMinutes(m.endTime))) {
        return { success: false, error: 'El horario se superpone con otro menú.' }
      }
    }
  }

  await Menu.updateOne(
    { _id: menuId, restaurantId: restaurant._id },
    { $set: { name, startTime, endTime } }
  )

  revalidatePath('/menu/' + restaurant.slug)
  return { success: true }
}

// ─── deleteMenu ───────────────────────────────────────────────────────────────
export async function deleteMenu(prevState: any, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const menuId = formData.get('menuId')?.toString()
  if (!menuId) return { success: false, error: 'Datos inválidos.' }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const menu = await Menu.findOne({ _id: menuId, restaurantId: restaurant._id })
  if (!menu) return { success: false, error: 'Menú no encontrado.' }

  const menuCount = await Menu.countDocuments({ restaurantId: restaurant._id })
  if (menuCount <= 1) return { success: false, error: 'No podés eliminar el único menú. El menú Estándar siempre debe existir.' }

  // Remove this menu from all dishes
  await Dish.updateMany(
    { restaurantId: restaurant._id },
    { $pull: { menuIds: menu._id } }
  )

  await Menu.deleteOne({ _id: menuId, restaurantId: restaurant._id })

  revalidatePath('/menu/' + restaurant.slug)
  return { success: true }
}

// ─── toggleMenuActive (manual mode only) ─────────────────────────────────────
export async function toggleMenuActive(prevState: any, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const menuId = formData.get('menuId')?.toString()
  if (!menuId) return { success: false, error: 'Datos inválidos.' }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const menu = await Menu.findOne({ _id: menuId, restaurantId: restaurant._id })
  if (!menu) return { success: false, error: 'Menú no encontrado.' }

  const newActive = !menu.isActive

  if (newActive) {
    await Menu.updateMany(
      { restaurantId: restaurant._id, _id: { $ne: menuId } },
      { $set: { isActive: false } }
    )
  }

  await Menu.updateOne(
    { _id: menuId, restaurantId: restaurant._id },
    { $set: { isActive: newActive } }
  )

  revalidatePath('/menu/' + restaurant.slug)
  return { success: true, isActive: newActive }
}
