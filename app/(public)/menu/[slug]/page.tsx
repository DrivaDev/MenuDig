import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant as RestaurantModel } from '@/models/Restaurant'
import { Category as CategoryModel } from '@/models/Category'
import { Dish as DishModel } from '@/models/Dish'
import { Subcategory as SubcategoryModel } from '@/models/Subcategory'
import { Menu as MenuModel } from '@/models/Menu'
import MenuDishesView from '@/components/menu/MenuDishesView'

// On-demand ISR — no revalidate interval (per D-14)
// Revalidation happens via revalidatePath('/menu/' + slug) called by all mutating server actions.

// Return empty array — no paths pre-built at build time.
// dynamicParams = true (default) allows on-demand generation for any slug.
export async function generateStaticParams() {
  return []
}

interface RestaurantData {
  _id: string
  name: string
  slug: string
  logoUrl: string
  description: string
  heroImageUrl: string
  whatsappUrl: string
  instagramUrl: string
  facebookUrl: string
  googleMapsUrl: string
  wifiName: string
  wifiPassword: string
  menuColor: string
  menuBgColor: string
  menuTitleColor: string
  menuTextColor: string
  menuLogoPosition: 'left' | 'center'
  menuLogoSize: 'sm' | 'md' | 'lg'
  menuShowDescription: boolean
}

interface CategoryData {
  _id: string
  name: string
  order: number
}

interface SubcategoryData {
  _id: string
  categoryId: string
  name: string
  order: number
}

interface MenuData {
  _id: string
  startTime: string | null
  endTime: string | null
  isActive: boolean
}

interface DishData {
  _id: string
  categoryId: string
  subcategoryId?: string | null
  name: string
  description: string
  price: number
  imageUrl: string
  allergens: string[]
  tags?: string[]
  menuIds?: string[]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  await dbConnect()
  const restaurant = await RestaurantModel.findOne(
    { slug },
    { name: 1, description: 1, logoUrl: 1 },
  ).lean<Pick<RestaurantData, '_id' | 'name' | 'description' | 'logoUrl'>>()

  if (!restaurant) return { title: 'Menú no encontrado' }

  const title = `Menú de ${restaurant.name}`
  const description = restaurant.description
    ? `${restaurant.description} · Ver menú completo en menudig.com.ar`
    : `Consultá el menú completo de ${restaurant.name} desde tu celular, sin descargar nada.`
  const url = `https://menudig.com.ar/menu/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'es_AR',
      siteName: 'MenuDig',
      images: restaurant.logoUrl
        ? [{ url: restaurant.logoUrl, width: 400, height: 400, alt: `Logo de ${restaurant.name}` }]
        : [{ url: 'https://menudig.com.ar/opengraph-image.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: restaurant.logoUrl ? 'summary' : 'summary_large_image',
      title,
      description,
      images: [restaurant.logoUrl || 'https://menudig.com.ar/opengraph-image.png'],
    },
  }
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // CRITICAL: await params before accessing slug (Next.js 15+ requirement)
  const { slug } = await params

  await dbConnect()

  // Public route — do NOT call auth() here. Join via slug → restaurant._id.
  const restaurant = await RestaurantModel.findOne({ slug }).lean<RestaurantData>()
  if (!restaurant) notFound()

  const [categories, dishes, subcategories, menus] = await Promise.all([
    CategoryModel.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean<CategoryData[]>(),
    DishModel.find({ restaurantId: restaurant._id, available: true }).sort({ order: 1, createdAt: 1 }).lean<DishData[]>(),
    SubcategoryModel.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean<SubcategoryData[]>(),
    MenuModel.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean<MenuData[]>(),
  ])

  // Group dishes by categoryId — server-side, no client round-trip (per D-16)
  const dishesByCategory: Record<string, DishData[]> = {}
  for (const dish of dishes) {
    const key = String(dish.categoryId)
    if (!dishesByCategory[key]) dishesByCategory[key] = []
    dishesByCategory[key].push(dish)
  }

  // Group subcategories by categoryId
  const subcatsByCategory: Record<string, SubcategoryData[]> = {}
  for (const sub of subcategories) {
    const key = String(sub.categoryId)
    if (!subcatsByCategory[key]) subcatsByCategory[key] = []
    subcatsByCategory[key].push(sub)
  }

  // Serialize to plain JSON — removes Mongoose ObjectId instances (per project pattern)
  const serializedCategories: CategoryData[] = JSON.parse(JSON.stringify(categories))
  const serializedDishesByCategory: Record<string, DishData[]> = JSON.parse(JSON.stringify(dishesByCategory))
  const serializedSubcatsByCategory: Record<string, SubcategoryData[]> = JSON.parse(JSON.stringify(subcatsByCategory))
  const serializedRestaurant: RestaurantData = JSON.parse(JSON.stringify(restaurant))
  const serializedMenus: MenuData[] = JSON.parse(JSON.stringify(menus))

  // Build theme CSS — overrides brand tokens so all Tailwind brand classes reflect custom palette
  const menuColor      = serializedRestaurant.menuColor      || '#EA580C'
  const menuBgColor    = serializedRestaurant.menuBgColor    || '#FFF7ED'
  const menuTitleColor = serializedRestaurant.menuTitleColor || '#9A3412'
  const menuTextColor  = serializedRestaurant.menuTextColor  || '#1C1917'
  const themeCSS = `.menu-theme{--color-brand-principal:${menuColor};--color-brand-fondo:${menuBgColor};--color-brand-titulares:${menuTitleColor};--color-brand-texto:${menuTextColor};}`

  // Layout settings
  const logoPosition    = serializedRestaurant.menuLogoPosition    ?? 'left'
  const logoSize        = serializedRestaurant.menuLogoSize        ?? 'md'
  const showDescription = serializedRestaurant.menuShowDescription ?? true

  const logoSizeClass: Record<string, string> = { sm: 'w-14 h-14', md: 'w-20 h-20', lg: 'w-28 h-28' }
  const logoSizePx:    Record<string, number> = { sm: 56, md: 80, lg: 112 }
  const headerAlign = logoPosition === 'center' ? 'items-center text-center' : 'items-start'

  // All categories with at least one available dish (used for JSON-LD only)
  const allPopulatedCategories = serializedCategories.filter(
    cat => (serializedDishesByCategory[cat._id] ?? []).length > 0
  )

  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: serializedRestaurant.name,
    ...(serializedRestaurant.description && { description: serializedRestaurant.description }),
    url: `https://menudig.com.ar/menu/${serializedRestaurant.slug}`,
    ...(serializedRestaurant.logoUrl && { image: serializedRestaurant.logoUrl }),
    hasMenu: {
      '@type': 'Menu',
      name: `Menú de ${serializedRestaurant.name}`,
      hasMenuSection: allPopulatedCategories.map(cat => ({
        '@type': 'MenuSection',
        name: cat.name,
        hasMenuItem: (serializedDishesByCategory[cat._id] ?? []).map(dish => ({
          '@type': 'MenuItem',
          name: dish.name,
          ...(dish.description && { description: dish.description }),
          ...(dish.imageUrl && { image: dish.imageUrl }),
          ...(dish.price > 0 && {
            offers: {
              '@type': 'Offer',
              price: (dish.price / 100).toFixed(2),
              priceCurrency: 'ARS',
            },
          }),
        })),
      })),
    },
  }

  // Header top padding to reserve space for the logo overlapping from hero
  const heroPaddingTop: Record<string, string> = { sm: 'pt-7', md: 'pt-10', lg: 'pt-14' }
  const hasHero = !!serializedRestaurant.heroImageUrl
  const hasLogo = !!serializedRestaurant.logoUrl

  // Logo alignment inside hero
  const logoHeroAlign = logoPosition === 'center'
    ? 'left-1/2 -translate-x-1/2 translate-y-1/2'
    : 'left-4 sm:left-8 translate-y-1/2'

  return (
    <>
    {/* Inject per-restaurant CSS variable overrides — no client JS needed */}
    {/* eslint-disable-next-line react/no-danger */}
    <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
    />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'MenuDig', item: 'https://menudig.com.ar' },
          { '@type': 'ListItem', position: 2, name: serializedRestaurant.name, item: `https://menudig.com.ar/menu/${serializedRestaurant.slug}` },
        ],
      }) }}
    />
    <div className="menu-theme min-h-screen bg-brand-fondo">

      {/* Hero — full viewport width, outside max-width container.
          No overflow-hidden so the logo can peek below the bottom edge. */}
      {hasHero && (
        <div className="relative w-full h-52 sm:h-72">
          <Image
            src={serializedRestaurant.heroImageUrl}
            alt={`Imagen de ${serializedRestaurant.name}`}
            fill
            className="object-cover"
            priority
          />
          {/* Side gradients */}
          <div className="absolute inset-y-0 left-0 w-10" style={{ background: `linear-gradient(to right, ${menuBgColor}, transparent)` }} />
          <div className="absolute inset-y-0 right-0 w-10" style={{ background: `linear-gradient(to left, ${menuBgColor}, transparent)` }} />
          {/* Bottom gradient — kept shallow so photo is still visible behind logo */}
          <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: `linear-gradient(to top, ${menuBgColor}, transparent)` }} />

          {/* Logo incrustado — sits on the hero bottom edge, half inside half outside */}
          {hasLogo && (
            <div className={`absolute bottom-0 z-10 ${logoHeroAlign}`}>
              <Image
                src={serializedRestaurant.logoUrl}
                alt={`Logo de ${serializedRestaurant.name}`}
                width={logoSizePx[logoSize]}
                height={logoSizePx[logoSize]}
                className={`${logoSizeClass[logoSize]} rounded-full object-cover ring-4 ring-brand-fondo border border-brand-acento shadow-xl`}
              />
            </div>
          )}
        </div>
      )}

      {/* Max-width container — responsive centering */}
      <div className="sm:max-w-lg md:max-w-2xl sm:mx-auto">

        {/* Restaurant header */}
        <header className={`bg-brand-fondo px-4 pb-6 sm:px-8 sm:pb-8 flex flex-col gap-3 ${headerAlign} ${
          hasHero && hasLogo ? heroPaddingTop[logoSize]
          : hasHero           ? 'pt-6'
          : 'pt-8 sm:pt-10'
        }`}>

          {/* Logo rendered here only when no hero — hero case renders it inside the hero div */}
          {!hasHero && hasLogo && (
            <Image
              src={serializedRestaurant.logoUrl}
              alt={`Logo de ${serializedRestaurant.name}`}
              width={logoSizePx[logoSize]}
              height={logoSizePx[logoSize]}
              className={`${logoSizeClass[logoSize]} rounded-full object-cover ring-2 ring-brand-acento shrink-0`}
            />
          )}

          <h1 className="text-2xl font-bold text-brand-titulares leading-tight mt-2">
            {serializedRestaurant.name}
          </h1>
          {showDescription && serializedRestaurant.description && (
            <p className="text-sm font-normal text-brand-texto leading-normal max-w-prose">
              {serializedRestaurant.description}
            </p>
          )}

          {/* Social links — icons use menuColor, smaller + more spaced */}
          {(serializedRestaurant.whatsappUrl || serializedRestaurant.instagramUrl || serializedRestaurant.facebookUrl || serializedRestaurant.googleMapsUrl) && (
            <div className={`flex gap-6 mt-1 ${logoPosition === 'center' ? 'justify-center' : ''}`}>
              {serializedRestaurant.whatsappUrl && (
                <a href={serializedRestaurant.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: menuColor }} xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              )}
              {serializedRestaurant.instagramUrl && (
                <a href={serializedRestaurant.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: menuColor }} xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              )}
              {serializedRestaurant.facebookUrl && (
                <a href={serializedRestaurant.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: menuColor }} xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {serializedRestaurant.googleMapsUrl && (
                <a href={serializedRestaurant.googleMapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Ubicación en Google Maps">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ fill: menuColor }} xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C7.802 0 4 3.403 4 7.602 4 11.8 7.469 16.812 12 24c4.531-7.188 8-12.2 8-16.398C20 3.403 16.199 0 12 0zm0 11a3 3 0 110-6 3 3 0 010 6z"/>
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* WiFi — icon inherits text color */}
          {serializedRestaurant.wifiName && serializedRestaurant.wifiPassword && (
            <div className={`flex items-center gap-3 mt-1 ${logoPosition === 'center' ? 'self-center' : ''}`}>
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 text-brand-texto" fill="none" stroke="currentColor" strokeWidth={2} xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm font-medium text-brand-texto">
                {serializedRestaurant.wifiName}
                <span className="mx-2 text-brand-texto/40">|</span>
                {serializedRestaurant.wifiPassword}
              </p>
            </div>
          )}
        </header>

        {/* Dish display — client island handles active menu filtering + minute-level switching */}
        <MenuDishesView
          menus={serializedMenus}
          categories={serializedCategories}
          subcategoriesByCategory={serializedSubcatsByCategory}
          dishesByCategory={serializedDishesByCategory}
          menuColor={menuColor}
        />

        {/* Footer */}
        <footer className="mt-8 pb-16 px-4 text-center border-t border-gray-100">
          <p className="text-sm font-normal text-brand-texto mt-6">
            Menú creado con{' '}
            <a
              href="https://menudig.com.ar"
              className="font-medium text-brand-titulares hover:underline"
            >
              MenuDig
            </a>
          </p>
        </footer>

      </div>
    </div>
    </>
  )
}
