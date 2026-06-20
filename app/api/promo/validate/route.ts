import { NextRequest } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import { PromoCode } from '@/models/PromoCode'

export async function POST(req: NextRequest) {
  let body: { code: string; context: 'new' | 'active' }

  try {
    body = await req.json()
  } catch {
    return Response.json({ valid: false, reason: 'JSON inválido' }, { status: 400 })
  }

  const { code, context } = body

  if (!code || !context) {
    return Response.json({ valid: false, reason: 'Faltan campos: code, context' }, { status: 400 })
  }
  if (context !== 'new' && context !== 'active') {
    return Response.json({ valid: false, reason: 'context debe ser "new" o "active"' }, { status: 400 })
  }

  await dbConnect()

  const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() })

  if (!promo) {
    return Response.json({ valid: false, reason: 'Código no encontrado' })
  }
  if (!promo.is_active) {
    return Response.json({ valid: false, reason: 'Código inactivo' })
  }
  if (promo.expires_at && new Date() > promo.expires_at) {
    return Response.json({ valid: false, reason: 'Código vencido' })
  }
  if (promo.max_uses !== null && promo.uses_count >= promo.max_uses) {
    return Response.json({ valid: false, reason: 'Código agotado' })
  }
  if (promo.applies_to !== 'both' && promo.applies_to !== context) {
    const label = context === 'new' ? 'nuevas suscripciones' : 'suscripciones activas'
    return Response.json({ valid: false, reason: `Código no aplica a ${label}` })
  }

  return Response.json({
    valid: true,
    discount: {
      code:          promo.code,
      discount_type: promo.discount_type,
      value:         promo.value,
    },
  })
}
