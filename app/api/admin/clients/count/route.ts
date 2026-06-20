import { NextRequest } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-api-secret')
  if (!secret || secret !== process.env.DRIVA_INTERNO_SECRET) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  await dbConnect()

  const [total, byStatus] = await Promise.all([
    Restaurant.countDocuments(),
    Restaurant.aggregate([
      { $group: { _id: '$subscriptionStatus', count: { $sum: 1 } } },
    ]),
  ])

  const by_status: Record<string, number> = {
    trial: 0, active: 0, past_due: 0, cancelled: 0,
  }
  for (const row of byStatus) {
    by_status[row._id as string] = row.count as number
  }

  return Response.json({ total, by_status })
}
