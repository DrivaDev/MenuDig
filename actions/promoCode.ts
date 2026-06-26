'use server'

import { auth } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'
import { PromoCode } from '@/models/PromoCode'

export type RedeemState = {
  success: boolean
  error?: string
  message?: string
  discount_type?: 'percentage' | 'fixed'
  value?: number
  is_free?: boolean
}

export async function redeemPromoCode(
  _prevState: RedeemState,
  formData: FormData,
): Promise<RedeemState> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'No autorizado.' }

  const code = formData.get('code')?.toString().trim().toUpperCase()
  if (!code) return { success: false, error: 'Ingresá un código de descuento.' }

  await dbConnect()

  const promo = await PromoCode.findOne({ code, is_active: true })
  if (!promo) return { success: false, error: 'Código inválido o desactivado.' }
  if (promo.expires_at && new Date(promo.expires_at) < new Date())
    return { success: false, error: 'Este código ya venció.' }
  if (promo.max_uses != null && promo.uses_count >= promo.max_uses)
    return { success: false, error: 'Este código ya alcanzó el límite de usos.' }

  const restaurant = await Restaurant.findOne({ clerkId: userId })
  if (!restaurant) return { success: false, error: 'Restaurante no encontrado.' }

  const is_free =
    promo.discount_type === 'percentage' && promo.value >= 100

  // For 100% off: activate subscription directly
  if (is_free) {
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)
    await Restaurant.updateOne(
      { clerkId: userId },
      {
        $set: {
          subscriptionStatus: 'active',
          subscriptionPeriodEnd: periodEnd,
          subscriptionId: '',
          pendingPromo: { codeId: null, code: '', discount_type: null, value: null },
        },
      },
    )
  } else {
    // Store pending promo for MP checkout to use
    await Restaurant.updateOne(
      { clerkId: userId },
      {
        $set: {
          pendingPromo: {
            codeId: promo._id,
            code: promo.code,
            discount_type: promo.discount_type,
            value: promo.value,
          },
        },
      },
    )
  }

  await PromoCode.updateOne({ _id: promo._id }, { $inc: { uses_count: 1 } })

  const discountLabel =
    promo.discount_type === 'percentage'
      ? `${promo.value}% de descuento`
      : `$${promo.value.toLocaleString('es-AR')} de descuento`

  return {
    success: true,
    discount_type: promo.discount_type,
    value: promo.value,
    is_free,
    message: is_free
      ? '¡Código aplicado! Tu suscripción está activa.'
      : `¡Código aplicado! ${discountLabel} en tu próximo cobro.`,
  }
}
