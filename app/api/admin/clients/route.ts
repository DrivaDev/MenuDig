import { NextRequest } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'

const CLERK_API = 'https://api.clerk.com/v1'
const MAX_LIMIT = 100

interface ClerkUser {
  id: string
  email_addresses: { email_address: string; id: string }[]
}

async function fetchClerkEmails(clerkIds: string[]): Promise<Record<string, string>> {
  if (!clerkIds.length) return {}

  const clerkSecret = process.env.CLERK_SECRET_KEY
  if (!clerkSecret) return {}

  const params = new URLSearchParams()
  clerkIds.forEach(id => params.append('user_id[]', id))
  params.set('limit', String(clerkIds.length))

  const res = await fetch(`${CLERK_API}/users?${params.toString()}`, {
    headers: { Authorization: `Bearer ${clerkSecret}` },
  })

  if (!res.ok) {
    console.error('[admin/clients] Clerk API error:', res.status)
    return {}
  }

  const users: ClerkUser[] = await res.json()
  return Object.fromEntries(
    users.map(u => [u.id, u.email_addresses[0]?.email_address ?? ''])
  )
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-api-secret')
  if (!secret || secret !== process.env.DRIVA_INTERNO_SECRET) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1', 10))
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)))
  const statusFilter = searchParams.get('status') // optional: trial|active|past_due|cancelled

  await dbConnect()

  const filter: Record<string, unknown> = {}
  if (statusFilter) filter['subscriptionStatus'] = statusFilter

  const [total, restaurants] = await Promise.all([
    Restaurant.countDocuments(filter),
    Restaurant.find(filter)
      .select('clerkId name slug subscriptionStatus trialEndsAt subscriptionPeriodEnd createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ])

  const clerkIds = restaurants.map(r => r.clerkId as string)
  const emailMap = await fetchClerkEmails(clerkIds)

  const clients = restaurants.map(r => ({
    clerk_id:               r.clerkId,
    name:                   r.name,
    email:                  emailMap[r.clerkId as string] ?? '',
    slug:                   r.slug,
    subscription_status:    r.subscriptionStatus,
    trial_ends_at:          r.trialEndsAt ?? null,
    subscription_period_end: r.subscriptionPeriodEnd ?? null,
    created_at:             r.createdAt,
  }))

  return Response.json({
    clients,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  })
}
