import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock } from 'lucide-react'
import { getAllPosts, formatDate } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog — Menú digital para restaurantes | MenuDig',
  description: 'Guías, consejos y estrategias para restaurantes argentinos: menú digital con QR, atención al cliente, tecnología gastronómica y más.',
  alternates: { canonical: 'https://menudig.com.ar/blog' },
  openGraph: {
    title: 'Blog — Menú digital para restaurantes | MenuDig',
    description: 'Guías, consejos y estrategias para restaurantes argentinos: menú digital con QR, atención al cliente, tecnología gastronómica y más.',
    url: 'https://menudig.com.ar/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="min-h-screen bg-brand-fondo flex flex-col">

      <main className="flex-1">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-10">
          <div className="mb-2">
            <Link href="/" className="text-sm font-medium text-brand-texto/60 hover:text-brand-titulares transition-colors">
              ← Volver al inicio
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-titulares mt-4">Blog</h1>
          <p className="mt-3 text-base font-normal text-brand-texto max-w-xl">
            Guías prácticas sobre menú digital, tecnología gastronómica y estrategias para restaurantes en Argentina.
          </p>
        </section>

        {/* ── POST LIST ─────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex flex-col gap-6">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block bg-white rounded-2xl border border-brand-acento p-6 sm:p-8 hover:border-brand-principal transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  {i === 0 && (
                    <span className="text-[11px] font-bold text-brand-principal bg-brand-acento px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Nuevo
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs font-light text-brand-texto/60">
                    <Clock size={11} />
                    {post.readTime} min de lectura · {formatDate(post.date)}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-brand-titulares group-hover:text-brand-principal transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm font-normal text-brand-texto leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand-principal">
                  Leer artículo <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-brand-fondo border-t border-brand-acento/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MenuDig logo" width={18} height={18} className="shrink-0" />
            <span className="text-sm font-bold text-brand-titulares">MenuDig</span>
          </div>
          <div className="flex items-center gap-5 text-xs font-normal text-brand-texto">
            <Link href="/#funciones"   className="hover:text-brand-titulares transition-colors">Funciones</Link>
            <Link href="/#preguntas"   className="hover:text-brand-titulares transition-colors">Preguntas</Link>
            <Link href="/blog"         className="hover:text-brand-titulares transition-colors">Blog</Link>
            <Link href="/sign-up"      className="hover:text-brand-titulares transition-colors">Registro</Link>
          </div>
          <p className="text-xs font-light text-brand-texto">
            Desarrollado por <strong className="font-bold">Driva Dev</strong>
          </p>
        </div>
      </footer>

    </div>
  )
}
