import { NextRequest } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import { PromoCode } from '@/models/PromoCode'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-api-secret')
  if (!secret || secret !== process.env.DRIVA_INTERNO_SECRET) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: {
    code: string
    discount_type: 'percentage' | 'fixed'
    value: number
    applies_to: 'new' | 'active' | 'both'
    max_uses?: number | null
    expires_at?: string | null
    is_active?: boolean
  }

  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { code, discount_type, value, applies_to, max_uses, expires_at, is_active } = body

  if (!code || !discount_type || value === undefined || !applies_to) {
    return Response.json({ error: 'Faltan campos requeridos: code, discount_type, value, applies_to' }, { status: 400 })
  }

  await dbConnect()

  const promo = await PromoCode.findOneAndUpdate(
    { code: code.toUpperCase().trim() },
    {
      $set: {
        discount_type,
        value,
        applies_to,
        max_uses:   max_uses  ?? null,
        expires_at: expires_at ? new Date(expires_at) : null,
        is_active:  is_active !== undefined ? is_active : true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  return Response.json({ ok: true, promo })
}
