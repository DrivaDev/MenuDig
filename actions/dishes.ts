'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { createHash } from 'crypto'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'
import { Dish } from '@/models/Dish'
import { Category } from '@/models/Category'
import { Subcategory } from '@/models/Subcategory'

// Delete a Cloudinary asset using the REST API + native crypto (no SDK needed)
async function cloudinaryDestroy(publicId: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET as string
  const timestamp = Math.round(Date.now() / 1000)
  const toSign    = `public_id=${publicId}&timestamp=${timestamp}`
  const signature = createHash('sha1').update(toSign + apiSecret).digest('hex')

  const body = new URLSearchParams({
    public_id: publicId,
    api_key:   apiKey!,
    timestamp: String(timestamp),
    signature,
  })

  await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })
}

// ─── createDish ───────────────────────────────────────────────────────────────
export async function createDish(prevState: any, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const name = formData.get('name')?.toString().trim()
  if (!name) return { success: false, error: 'El nombre del plato es obligatorio.' }

  const categoryId = formData.get('categoryId')?.toString() || undefined
  if (!categoryId) return { success: false, error: 'Seleccioná una categoría para el plato.' }

  const priceStr = formData.get('price')?.toString() ?? ''
  const price = Math.round(parseFloat(priceStr === '' ? '0' : priceStr) * 100)
  if (!isFinite(price)) return { success: false, error: 'Ingresá un precio válido en pesos.' }
  if (price < 0) return { success: false, error: 'El precio no puede ser negativo.' }

  const description     = formData.get('description')?.toString().trim() ?? ''
  const imageUrl        = formData.get('imageUrl')?.toString() ?? ''
  const imagePublicId   = formData.get('imagePublicId')?.toString() ?? ''
  const allergens       = formData.getAll('allergens').map(String)
  const tags            = formData.getAll('tags').map(String)
  const available       = formData.get('available') === 'true'
  const subcategoryIdRaw = formData.get('subcategoryId')?.toString() || null
  const menuIds         = formData.getAll('menuIds').map(String).filter(Boolean)

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const category = await Category.findOne({ _id: categoryId, restaurantId: restaurant._id }).lean()
  if (!category) return { success: false, error: 'Categoría no válida.' }

  let subcategoryId: string | null = null
  if (subcategoryIdRaw) {
    const sub = await Subcategory.findOne({
      _id: subcategoryIdRaw,
      restaurantId: restaurant._id,
      categoryId,
    }).lean()
    if (!sub) return { success: false, error: 'Subcategoría no válida.' }
    subcategoryId = subcategoryIdRaw
  }

  // Assign order = max order in this category + 1
  const maxOrderDoc = await Dish
    .findOne({ restaurantId: restaurant._id, categoryId })
    .sort({ order: -1 })
    .lean<{ order: number }>()

  await Dish.create({
    restaurantId: restaurant._id,
    categoryId,
    subcategoryId,
    name,
    description,
    price,
    imageUrl,
    imagePublicId,
    allergens,
    tags,
    available,
    menuIds,
    order: (maxOrderDoc?.order ?? -1) + 1,
  })

  revalidatePath('/menu/' + restaurant.slug)
  return { success: true }
}

// ─── updateDish ───────────────────────────────────────────────────────────────
export async function updateDish(prevState: any, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const dishId = formData.get('dishId')?.toString()
  const name   = formData.get('name')?.toString().trim()
  if (!name) return { success: false, error: 'El nombre del plato es obligatorio.' }

  const categoryId = formData.get('categoryId')?.toString() || undefined
  if (!categoryId) return { success: false, error: 'Seleccioná una categoría para el plato.' }

  const priceStr = formData.get('price')?.toString() ?? ''
  const price    = Math.round(parseFloat(priceStr === '' ? '0' : priceStr) * 100)
  if (!isFinite(price)) return { success: false, error: 'Ingresá un precio válido en pesos.' }
  if (price < 0) return { success: false, error: 'El precio no puede ser negativo.' }

  const description     = formData.get('description')?.toString().trim() ?? ''
  const imageUrl        = formData.get('imageUrl')?.toString() ?? ''
  const imagePublicId   = formData.get('imagePublicId')?.toString() ?? ''
  const allergens       = formData.getAll('allergens').map(String)
  const tags            = formData.getAll('tags').map(String)
  const available       = formData.get('available') === 'true'
  const subcategoryIdRaw = formData.get('subcategoryId')?.toString() || null
  const menuIds         = formData.getAll('menuIds').map(String).filter(Boolean)

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const category = await Category.findOne({ _id: categoryId, restaurantId: restaurant._id }).lean()
  if (!category) return { success: false, error: 'Categoría no válida.' }

  let subcategoryId: string | null = null
  if (subcategoryIdRaw) {
    const sub = await Subcategory.findOne({
      _id: subcategoryIdRaw,
      restaurantId: restaurant._id,
      categoryId,
    }).lean()
    if (!sub) return { success: false, error: 'Subcategoría no válida.' }
    subcategoryId = subcategoryIdRaw
  }

  const dish = await Dish.findOne({ _id: dishId, restaurantId: restaurant._id })
  if (!dish) return { success: false, error: 'Plato no encontrado.' }

  await Dish.updateOne(
    { _id: dishId, restaurantId: restaurant._id },
    { $set: { name, description, price, categoryId, subcategoryId, imageUrl, imagePublicId, allergens, tags, available, menuIds } }
  )

  revalidatePath('/menu/' + restaurant.slug)
  return { success: true }
}

// ─── deleteDish ───────────────────────────────────────────────────────────────
export async function deleteDish(prevState: any, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const dishId = formData.get('dishId')?.toString()
  if (!dishId) return { success: false, error: 'Datos inválidos.' }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const dish = await Dish.findOne({ _id: dishId, restaurantId: restaurant._id })
    .lean<{ imagePublicId: string }>()
  if (!dish) return { success: false, error: 'Plato no encontrado.' }

  // Delete Cloudinary asset before removing DB record
  if (dish.imagePublicId) {
    try {
      await cloudinaryDestroy(dish.imagePublicId)
    } catch (err) {
      console.error('[Cloudinary delete failed]', err)
    }
  }

  await Dish.deleteOne({ _id: dishId, restaurantId: restaurant._id })
  revalidatePath('/menu/' + restaurant.slug)
  return { success: true }
}

// ─── reorderDishes (bulk — DnD) ───────────────────────────────────────────────
export async function reorderDishes(prevState: any, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const raw = formData.get('orderedIds')?.toString()
  if (!raw) return { success: false, error: 'Datos inválidos.' }

  let orderedIds: string[]
  try {
    orderedIds = JSON.parse(raw)
    if (!Array.isArray(orderedIds)) throw new Error()
  } catch {
    return { success: false, error: 'Datos inválidos.' }
  }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  // Ownership check
  const owned = await Dish.countDocuments({ _id: { $in: orderedIds }, restaurantId: restaurant._id })
  if (owned !== orderedIds.length) return { success: false, error: 'Datos inválidos.' }

  await Promise.all(
    orderedIds.map((id, index) =>
      Dish.updateOne({ _id: id, restaurantId: restaurant._id }, { $set: { order: index } })
    )
  )

  revalidatePath('/menu/' + restaurant.slug)
  return { success: true }
}

// ─── toggleAvailability ───────────────────────────────────────────────────────
export async function toggleAvailability(prevState: any, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const dishId = formData.get('dishId')?.toString()
  if (!dishId) return { success: false, error: 'Datos inválidos.' }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const dish = await Dish.findOne({ _id: dishId, restaurantId: restaurant._id })
  if (!dish) return { success: false, error: 'Plato no encontrado.' }

  await Dish.updateOne(
    { _id: dishId, restaurantId: restaurant._id },
    { $set: { available: !dish.available } }
  )

  revalidatePath('/menu/' + restaurant.slug)
  return { success: true, available: !dish.available }
}
