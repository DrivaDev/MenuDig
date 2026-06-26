import { auth } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'
import { cancelPreapproval } from '@/lib/mpApi'

const BASE = process.env.NEXT_PUBLIC_APP_URL
const DASH = `${BASE}/dashboard/suscripcion`

export async function POST() {
  const { userId } = await auth()
  if (!userId) return Response.redirect(`${BASE}/sign-in`, 303)

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId })
  if (!restaurant) return Response.redirect(DASH, 303)

  const preapprovalId = restaurant.subscriptionId

  try {
    if (preapprovalId) {
      await cancelPreapproval(preapprovalId)
    }

    await Restaurant.updateOne(
      { clerkId: userId },
      { $set: { subscriptionStatus: 'cancelled', subscriptionId: '' } },
    )

    return Response.redirect(`${DASH}?cancelled=1`, 303)
  } catch (err) {
    console.error('[subscription/cancel]', err)
    return Response.redirect(`${DASH}?error=cancel`, 303)
  }
}
