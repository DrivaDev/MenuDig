'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'

const DOT_STYLES    = ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded']
const CORNER_STYLES = ['square', 'dot', 'extra-rounded']

function isValidHex(v: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(v)
}

export async function updateQRStyle(prevState: any, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const fgColor     = formData.get('qrFgColor')?.toString().trim()     ?? ''
  const bgColor     = formData.get('qrBgColor')?.toString().trim()     ?? ''
  const dotStyle    = formData.get('qrDotStyle')?.toString().trim()    ?? ''
  const cornerStyle = formData.get('qrCornerStyle')?.toString().trim() ?? ''
  const logoEnabled = formData.get('qrLogoEnabled') === 'true'

  if (!isValidHex(fgColor))            return { success: false, error: 'Color del QR inválido.' }
  if (!isValidHex(bgColor))            return { success: false, error: 'Color de fondo inválido.' }
  if (!DOT_STYLES.includes(dotStyle))  return { success: false, error: 'Estilo de puntos inválido.' }
  if (!CORNER_STYLES.includes(cornerStyle)) return { success: false, error: 'Estilo de esquina inválido.' }

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId })
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  await Restaurant.updateOne(
    { clerkId: userId },
    { $set: { qrFgColor: fgColor, qrBgColor: bgColor, qrDotStyle: dotStyle, qrCornerStyle: cornerStyle, qrLogoEnabled: logoEnabled } },
  )

  revalidatePath('/dashboard/qr')
  return { success: true, error: undefined }
}
