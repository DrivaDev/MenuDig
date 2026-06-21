import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowRight, Clock, ArrowLeft } from 'lucide-react'
import { getAllPosts, getPostBySlug, formatDate } from '@/lib/blog'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Artículo no encontrado' }

  const url = `https://menudig.com.ar/blog/${post.slug}`
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: 'article',
      locale: 'es_AR',
      siteName: 'MenuDig',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const allPosts = getAllPosts()
  const related = allPosts.filter(p => p.slug !== post.slug).slice(0, 2)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'es-AR',
    url: `https://menudig.com.ar/blog/${post.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'MenuDig',
      url: 'https://menudig.com.ar',
      logo: { '@type': 'ImageObject', url: 'https://menudig.com.ar/logo.svg' },
    },
    keywords: post.keywords.join(', '),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MenuDig',    item: 'https://menudig.com.ar' },
      { '@type': 'ListItem', position: 2, name: 'Blog',       item: 'https://menudig.com.ar/blog' },
      { '@type': 'ListItem', position: 3, name: post.title,   item: `https://menudig.com.ar/blog/${post.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-brand-fondo flex flex-col">

        {/* ── NAV ───────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-brand-fondo/95 backdrop-blur-sm border-b border-brand-acento">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="MenuDig logo" width={24} height={24} className="shrink-0" />
              <span className="text-base font-bold text-brand-titulares tracking-tight">MenuDig</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="text-sm font-medium text-brand-texto hover:text-brand-titulares transition-colors">
                Ingresar
              </Link>
              <Link href="/sign-up" className="bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#C2410C] transition-colors">
                Empezar gratis
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">

          {/* ── ARTICLE ───────────────────────────────────────────────── */}
          <article className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-16">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-normal text-brand-texto/50 mb-6">
              <Link href="/" className="hover:text-brand-titulares transition-colors">MenuDig</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-brand-titulares transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-brand-texto/70 truncate">{post.title}</span>
            </nav>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center gap-1.5 text-xs font-light text-brand-texto/60">
                <Clock size={11} />
                {post.readTime} min de lectura
              </span>
              <span className="text-brand-texto/30">·</span>
              <time dateTime={post.date} className="text-xs font-light text-brand-texto/60">
                {formatDate(post.date)}
              </time>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-titulares leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-base font-normal text-brand-texto/80 leading-relaxed border-l-4 border-brand-principal pl-4 mb-10">
              {post.excerpt}
            </p>

            {/* Content */}
            <div className="prose-menudig">
              {post.content}
            </div>

            {/* Back */}
            <div className="mt-12 pt-8 border-t border-brand-acento/60">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-texto hover:text-brand-titulares transition-colors"
              >
                <ArrowLeft size={14} />
                Ver todos los artículos
              </Link>
            </div>
          </article>

          {/* ── CTA ───────────────────────────────────────────────────── */}
          <section className="bg-brand-principal">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
              <p className="text-lg font-bold text-white mb-2">¿Listo para digitalizar tu menú?</p>
              <p className="text-sm font-normal text-white/80 mb-6">14 días gratis, sin tarjeta. Tu menú listo en minutos.</p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-white text-brand-principal text-sm font-bold rounded-xl px-7 py-3.5 hover:bg-brand-fondo transition-colors"
              >
                Crear mi menú gratis <ArrowRight size={14} />
              </Link>
            </div>
          </section>

          {/* ── RELATED POSTS ─────────────────────────────────────────── */}
          {related.length > 0 && (
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
              <h2 className="text-xl font-bold text-brand-titulares mb-6">Más artículos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {related.map(r => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group block bg-white rounded-2xl border border-brand-acento p-6 hover:border-brand-principal transition-colors"
                  >
                    <span className="text-xs font-light text-brand-texto/50">{formatDate(r.date)}</span>
                    <h3 className="mt-2 text-base font-bold text-brand-titulares group-hover:text-brand-principal transition-colors leading-snug">
                      {r.title}
                    </h3>
                    <p className="mt-1.5 text-sm font-normal text-brand-texto/70 line-clamp-2">{r.excerpt}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </main>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <footer className="bg-brand-fondo border-t border-brand-acento/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="MenuDig logo" width={18} height={18} className="shrink-0" />
              <span className="text-sm font-bold text-brand-titulares">MenuDig</span>
            </div>
            <div className="flex items-center gap-5 text-xs font-normal text-brand-texto">
              <Link href="/#funciones"  className="hover:text-brand-titulares transition-colors">Funciones</Link>
              <Link href="/#preguntas"  className="hover:text-brand-titulares transition-colors">Preguntas</Link>
              <Link href="/blog"        className="hover:text-brand-titulares transition-colors">Blog</Link>
              <Link href="/sign-up"     className="hover:text-brand-titulares transition-colors">Registro</Link>
            </div>
            <p className="text-xs font-light text-brand-texto">
              Desarrollado por <strong className="font-bold">Driva Dev</strong>
            </p>
          </div>
        </footer>

      </div>
    </>
  )
}
