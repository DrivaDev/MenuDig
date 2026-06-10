import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { dbConnect } from '@/lib/dbConnect'
import { Restaurant as RestaurantModel } from '@/models/Restaurant'
import { Category as CategoryModel } from '@/models/Category'
import { Dish as DishModel } from '@/models/Dish'
import { Subcategory as SubcategoryModel } from '@/models/Subcategory'
import { MenuCategoryNav } from '@/components/menu/MenuCategoryNav'
import { DishRow } from '@/components/menu/DishRow'

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
      ...(restaurant.logoUrl && {
        images: [{ url: restaurant.logoUrl, width: 400, height: 400, alt: `Logo de ${restaurant.name}` }],
      }),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      ...(restaurant.logoUrl && { images: [restaurant.logoUrl] }),
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

  const [categories, dishes, subcategories] = await Promise.all([
    CategoryModel.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean<CategoryData[]>(),
    DishModel.find({ restaurantId: restaurant._id, available: true }).sort({ order: 1, createdAt: 1 }).lean<DishData[]>(),
    SubcategoryModel.find({ restaurantId: restaurant._id }).sort({ order: 1 }).lean<SubcategoryData[]>(),
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

  // Filter out categories with no available dishes
  const populatedCategories = serializedCategories.filter(
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
      hasMenuSection: populatedCategories.map(cat => ({
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
      {/* Max-width container — responsive centering */}
      <div className="sm:max-w-lg md:max-w-2xl sm:mx-auto">

        {/* Restaurant header */}
        <header className={`bg-brand-fondo px-4 py-8 sm:px-8 sm:py-10 flex flex-col gap-3 ${headerAlign}`}>
          {serializedRestaurant.logoUrl && (
            <Image
              src={serializedRestaurant.logoUrl}
              alt={`Logo de ${serializedRestaurant.name}`}
              width={logoSizePx[logoSize]}
              height={logoSizePx[logoSize]}
              className={`${logoSizeClass[logoSize]} rounded-full object-cover border border-brand-acento`}
            />
          )}
          <h1 className="text-2xl font-bold text-brand-titulares leading-tight">
            {serializedRestaurant.name}
          </h1>
          {showDescription && serializedRestaurant.description && (
            <p className="text-sm font-normal text-brand-texto leading-normal max-w-prose">
              {serializedRestaurant.description}
            </p>
          )}
        </header>

        {/* Sticky category tab bar — client island (only 'use client' component on page) */}
        {populatedCategories.length > 0 && (
          <MenuCategoryNav
            categories={populatedCategories.map(c => ({ _id: c._id, name: c.name }))}
            menuColor={serializedRestaurant.menuColor ?? '#EA580C'}
          />
        )}

        {/* Category sections */}
        <main>
          {populatedCategories.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-base font-normal text-brand-texto">Sin categorías disponibles</p>
              <p className="text-sm font-normal text-brand-texto mt-2">
                Este restaurante aún no ha publicado su menú.
              </p>
            </div>
          ) : (
            populatedCategories.map(cat => {
              const catDishes  = serializedDishesByCategory[cat._id] ?? []
              const catSubcats = serializedSubcatsByCategory[cat._id] ?? []
              const hasSubcats = catSubcats.length > 0

              const noSubcatDishes = hasSubcats
                ? catDishes.filter(d => !d.subcategoryId)
                : catDishes

              const dishesBySubcat: Record<string, DishData[]> = {}
              if (hasSubcats) {
                for (const sub of catSubcats) {
                  dishesBySubcat[sub._id] = catDishes.filter(
                    d => d.subcategoryId && String(d.subcategoryId) === sub._id
                  )
                }
              }

              return (
                <section
                  key={cat._id}
                  id={`category-${cat._id}`}
                  className="scroll-mt-12"
                >
                  <div className="px-4 py-3 bg-brand-fondo border-b border-gray-100">
                    <h2 className="text-lg font-bold text-brand-titulares leading-tight">
                      {cat.name}
                    </h2>
                  </div>

                  {/* Dishes without a subcategory */}
                  {noSubcatDishes.map(dish => (
                    <DishRow key={dish._id} dish={dish} />
                  ))}

                  {/* Subcategory groups */}
                  {hasSubcats && catSubcats.map(sub => {
                    const subDishes = dishesBySubcat[sub._id] ?? []
                    if (subDishes.length === 0) return null
                    return (
                      <div key={sub._id}>
                        <div className="px-4 py-2 bg-brand-fondo/60 border-b border-gray-100">
                          <h3 className="text-sm font-medium text-brand-titulares/70 uppercase tracking-wide">
                            {sub.name}
                          </h3>
                        </div>
                        {subDishes.map(dish => (
                          <DishRow key={dish._id} dish={dish} />
                        ))}
                      </div>
                    )
                  })}
                </section>
              )
            })
          )}
        </main>

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
