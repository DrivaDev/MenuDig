import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant } from '@/models/Restaurant'
import QRCustomizer from '@/components/dashboard/QRCustomizer'

export default async function QRPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  await dbConnect()
  const restaurant = await Restaurant.findOne({ clerkId: userId }).lean<{
    _id: string
    name: string
    slug: string
    slugConfirmed: boolean
    logoUrl: string
    qrFgColor: string
    qrBgColor: string
    qrDotStyle: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'
    qrCornerStyle: 'square' | 'dot' | 'extra-rounded'
    qrLogoEnabled: boolean
  }>()

  if (!restaurant || !restaurant.slugConfirmed) {
    redirect('/dashboard')
  }

  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'https://menudig.com.ar'
  const menuUrl = `${appUrl}/menu/${restaurant.slug}`

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-titulares mb-1">Mi QR</h1>
        <p className="text-sm font-normal text-brand-texto">
          Personalizá y descargá tu código QR.
        </p>
      </div>

      <QRCustomizer
        slug={restaurant.slug}
        menuUrl={menuUrl}
        logoUrl={restaurant.logoUrl || undefined}
        initialFgColor={restaurant.qrFgColor       ?? '#1C1917'}
        initialBgColor={restaurant.qrBgColor       ?? '#FFFFFF'}
        initialDotStyle={restaurant.qrDotStyle     ?? 'square'}
        initialCornerStyle={restaurant.qrCornerStyle ?? 'square'}
        initialLogoEnabled={restaurant.qrLogoEnabled ?? false}
      />
    </div>
  )
}
