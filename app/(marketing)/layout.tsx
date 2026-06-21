import Link from 'next/link'
import Image from 'next/image'
import type { ReactNode } from 'react'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 bg-brand-fondo/95 backdrop-blur-sm border-b border-brand-acento">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MenuDig logo" width={24} height={24} className="shrink-0" />
            <span className="text-base font-bold text-brand-titulares tracking-tight">MenuDig</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-brand-texto">
            <a href="/#funciones"   className="hover:text-brand-titulares transition-colors">Funciones</a>
            <a href="/#comparacion" className="hover:text-brand-titulares transition-colors">Comparación</a>
            <a href="/#preguntas"   className="hover:text-brand-titulares transition-colors">Preguntas</a>
            <Link href="/blog"      className="hover:text-brand-titulares transition-colors">Blog</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-brand-texto hover:text-brand-titulares transition-colors"
            >
              Ingresar
            </Link>
            <Link
              href="/sign-up"
              className="bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-[#C2410C] transition-colors"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>
      {children}
    </>
  )
}
