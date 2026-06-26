'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'
import { Category } from '@/models/Category'
import { Subcategory } from '@/models/Subcategory'
import { Dish } from '@/models/Dish'

export interface CreateSubcategoryResult {
  success: boolean
  error?: string
  subcategory?: { _id: string; name: string; order: number }
}

export async function createSubcategory(
  prevState: CreateSubcategoryResult,
  formData: FormData,
): Promise<CreateSubcategoryResult> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const name = formData.get('name')?.toString().trim()
  if (!name) return { success: false, error: 'El nombre es obligatorio.' }

  const categoryId = formData.get('categoryId')?.toString()
  if (!categoryId) return { success: false, error: 'Categoría requerida.' }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const category = await Category.findOne({ _id: categoryId, restaurantId: restaurant._id }).lean()
  if (!category) return { success: false, error: 'Categoría no válida.' }

  const maxOrderDoc = await Subcategory
    .findOne({ restaurantId: restaurant._id, categoryId })
    .sort({ order: -1 })
    .lean<{ order: number }>()

  const created = await Subcategory.create({
    restaurantId: restaurant._id,
    categoryId,
    name,
    order: (maxOrderDoc?.order ?? -1) + 1,
  })

  return {
    success: true,
    subcategory: { _id: String(created._id), name: created.name, order: created.order },
  }
}

export interface UpdateSubcategoryResult {
  success: boolean
  error?: string
}

export async function updateSubcategory(
  prevState: UpdateSubcategoryResult,
  formData: FormData,
): Promise<UpdateSubcategoryResult> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const subcategoryId = formData.get('subcategoryId')?.toString()
  const name = formData.get('name')?.toString().trim()
  if (!subcategoryId || !name) return { success: false, error: 'Datos inválidos.' }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const sub = await Subcategory.findOne({ _id: subcategoryId, restaurantId: restaurant._id })
  if (!sub) return { success: false, error: 'Subcategoría no encontrada.' }

  await Subcategory.updateOne({ _id: subcategoryId }, { $set: { name } })
  revalidatePath('/menu/' + restaurant.slug)
  return { success: true }
}

export interface DeleteSubcategoryResult {
  success: boolean
  error?: string
}

export async function deleteSubcategory(
  prevState: DeleteSubcategoryResult,
  formData: FormData,
): Promise<DeleteSubcategoryResult> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const subcategoryId = formData.get('subcategoryId')?.toString()
  if (!subcategoryId) return { success: false, error: 'Datos inválidos.' }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{ _id: string; slug: string }>()
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const sub = await Subcategory.findOne({ _id: subcategoryId, restaurantId: restaurant._id })
  if (!sub) return { success: false, error: 'Subcategoría no encontrada.' }

  await Dish.updateMany(
    { restaurantId: restaurant._id, subcategoryId: sub._id },
    { $set: { subcategoryId: null } }
  )

  await Subcategory.deleteOne({ _id: subcategoryId, restaurantId: restaurant._id })
  revalidatePath('/menu/' + restaurant.slug)
  return { success: true }
}
