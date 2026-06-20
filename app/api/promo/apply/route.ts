import { NextRequest } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import { PromoCode } from '@/models/PromoCode'
import { Restaurant } from '@/models/Restaurant'

const BASE_PLAN_PRICE = 20000 // ARS
const MP_API = 'https://api.mercadopago.com'

function calcFinalPrice(basePrice: number, discountType: 'percentage' | 'fixed', value: number): number {
  if (discountType === 'percentage') {
    return Math.max(0, Math.round(basePrice * (1 - value / 100)))
  }
  return Math.max(0, basePrice - value)
}

export async function POST(req: NextRequest) {
  let body: { code: string; user_id: string; plan_id: string; context: 'new' | 'active' }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { code, user_id, context } = body

  if (!code || !user_id || !context) {
    return Response.json({ error: 'Faltan campos: code, user_id, context' }, { status: 400 })
  }
  if (context !== 'new' && context !== 'active') {
    return Response.json({ error: 'context debe ser "new" o "active"' }, { status: 400 })
  }

  await dbConnect()

  // ── Validate promo (same rules as /validate) ──────────────────────────────
  const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() })

  if (!promo)              return Response.json({ error: 'Código no encontrado' },        { status: 404 })
  if (!promo.is_active)    return Response.json({ error: 'Código inactivo' },             { status: 422 })
  if (promo.expires_at && new Date() > promo.expires_at) {
    return Response.json({ error: 'Código vencido' }, { status: 422 })
  }
  if (promo.max_uses !== null && promo.uses_count >= promo.max_uses) {
    return Response.json({ error: 'Código agotado' }, { status: 422 })
  }
  if (promo.applies_to !== 'both' && promo.applies_to !== context) {
    const label = context === 'new' ? 'nuevas suscripciones' : 'suscripciones activas'
    return Response.json({ error: `Código no aplica a ${label}` }, { status: 422 })
  }

  // ── Find restaurant ───────────────────────────────────────────────────────
  const restaurant = await Restaurant.findOne({ clerkId: user_id })
  if (!restaurant) return Response.json({ error: 'Usuario no encontrado' }, { status: 404 })

  // ── Atomic increment — prevents race condition on max_uses ────────────────
  const incrementCondition: Record<string, unknown> = {
    code: promo.code,
    is_active: true,
  }
  if (promo.max_uses !== null) {
    incrementCondition['$expr'] = { $lt: ['$uses_count', '$max_uses'] }
  }

  const updated = await PromoCode.findOneAndUpdate(
    incrementCondition,
    { $inc: { uses_count: 1 } },
    { new: true },
  )

  if (!updated) {
    return Response.json({ error: 'Código agotado o inactivado' }, { status: 409 })
  }

  const finalPrice = calcFinalPrice(BASE_PLAN_PRICE, promo.discount_type, promo.value)

  // ── Apply by context ──────────────────────────────────────────────────────
  if (context === 'new') {
    // Store pending promo; consumed by /api/subscription/create at checkout
    await Restaurant.updateOne(
      { clerkId: user_id },
      {
        $set: {
          'pendingPromo.codeId':        promo._id,
          'pendingPromo.code':          promo.code,
          'pendingPromo.discount_type': promo.discount_type,
          'pendingPromo.value':         promo.value,
        },
      },
    )
  } else {
    // context === 'active': update existing MP preapproval price
    if (!restaurant.subscriptionId) {
      // Rollback the counter increment
      await PromoCode.updateOne({ _id: promo._id }, { $inc: { uses_count: -1 } })
      return Response.json({ error: 'No hay suscripción activa' }, { status: 422 })
    }

    const accessToken = process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      await PromoCode.updateOne({ _id: promo._id }, { $inc: { uses_count: -1 } })
      return Response.json({ error: 'Configuración incompleta: MP_ACCESS_TOKEN falta' }, { status: 500 })
    }

    const mpRes = await fetch(`${MP_API}/preapproval/${restaurant.subscriptionId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auto_recurring: { transaction_amount: finalPrice },
      }),
    })

    if (!mpRes.ok) {
      const mpBody = await mpRes.text()
      console.error('[promo/apply] MP PATCH error:', mpRes.status, mpBody)
      // Rollback counter
      await PromoCode.updateOne({ _id: promo._id }, { $inc: { uses_count: -1 } })
      return Response.json({ error: `Error Mercado Pago (${mpRes.status})` }, { status: 502 })
    }
  }

  return Response.json({
    ok: true,
    code:             promo.code,
    discount_type:    promo.discount_type,
    value:            promo.value,
    base_price:       BASE_PLAN_PRICE,
    final_price:      finalPrice,
    discount_applied: BASE_PLAN_PRICE - finalPrice,
  })
}
