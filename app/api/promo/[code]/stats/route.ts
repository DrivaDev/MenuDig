import { NextRequest } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import { PromoCode } from '@/models/PromoCode'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const secret = req.headers.get('x-api-secret')
  if (!secret || secret !== process.env.DRIVA_INTERNO_SECRET) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { code } = await params

  await dbConnect()

  const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() })
    .select('code uses_count max_uses is_active expires_at discount_type value applies_to')
    .lean()

  if (!promo) {
    return Response.json({ error: 'Código no encontrado' }, { status: 404 })
  }

  return Response.json({
    code:       promo.code,
    uses:       promo.uses_count,
    max_uses:   promo.max_uses ?? null,
    remaining:  promo.max_uses !== null ? Math.max(0, promo.max_uses - promo.uses_count) : null,
    is_active:  promo.is_active,
    expires_at: promo.expires_at ?? null,
    discount_type: promo.discount_type,
    value:      promo.value,
    applies_to: promo.applies_to,
  })
}
