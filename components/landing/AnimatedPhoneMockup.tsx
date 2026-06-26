'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { QrCode, Star, Clock } from 'lucide-react'

const INTERVAL_MS = 3000

const CATEGORIES = [
  {
    label: 'Entradas',
    dishes: [
      {
        name: 'Tabla de quesos',
        desc: 'Brie, manchego, frutos secos',
        price: '$5.400',
        img: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=96&h=96&fit=crop&auto=format',
      },
      {
        name: 'Bruschetta classica',
        desc: 'Tomate cherry, albahaca fresca',
        price: '$3.200',
        img: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=96&h=96&fit=crop&auto=format',
      },
      {
        name: 'Carpaccio de ternera',
        desc: 'Rúcula, parmesano, limón',
        price: '$6.800',
        img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=96&h=96&fit=crop&auto=format',
      },
    ],
  },
  {
    label: 'Principales',
    dishes: [
      {
        name: 'Bife de chorizo',
        desc: '300g madurado 30 días, papas rústicas',
        price: '$14.900',
        img: 'https://images.unsplash.com/photo-1558030006-450675393462?w=96&h=96&fit=crop&auto=format',
      },
      {
        name: 'Salmón grillado',
        desc: 'Alcaparras, limón, espárragos',
        price: '$12.400',
        img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=96&h=96&fit=crop&auto=format',
      },
      {
        name: 'Risotto de hongos',
        desc: 'Portobello, trufa negra, parmesano',
        price: '$10.200',
        img: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=96&h=96&fit=crop&auto=format',
      },
    ],
  },
  {
    label: 'Postres',
    dishes: [
      {
        name: 'Flan artesanal',
        desc: 'Dulce de leche y crema batida',
        price: '$3.100',
        img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=96&h=96&fit=crop&auto=format',
      },
      {
        name: 'Tiramisú',
        desc: 'Café, mascarpone, cacao belga',
        price: '$4.200',
        img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=96&h=96&fit=crop&auto=format',
      },
      {
        name: 'Fondant de chocolate',
        desc: 'Tibio, corazón líquido, helado',
        price: '$4.500',
        img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=96&h=96&fit=crop&auto=format',
      },
    ],
  },
]

// Palette — deep forest green + warm gold, nothing from Driva Dev brand
const P = {
  bg: '#F6FAF7',
  headerDeep: '#1A3828',
  gold: '#9A6E00',
  muted: '#6B7280',
  sectionLabel: '#5A8A6A',
  divider: '#E2EDE6',
  pillActiveBg: '#1A3828',
  pillActiveTxt: '#ffffff',
  pillInactiveTxt: 'rgba(26,56,40,0.5)',
  pillInactiveBorder: '#d1d5db',
  barIcon: '#1A3828',
}

export function AnimatedPhoneMockup() {
  const [catIndex, setCatIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCatIndex(prev => (prev + 1) % CATEGORIES.length)
    }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const cat = CATEGORIES[catIndex]

  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px] shrink-0 select-none">

      {/* Badge top-right */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="absolute -right-12 top-14 z-20 bg-white rounded-2xl border border-gray-200 shadow-lg px-3 py-2 flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
        <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">Menú actualizado</span>
      </motion.div>

      {/* Badge bottom-left */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute -left-12 bottom-32 z-20 bg-white rounded-2xl border border-gray-200 shadow-lg px-3 py-2 flex items-center gap-2"
      >
        <QrCode size={13} style={{ color: P.headerDeep }} className="shrink-0" />
        <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">Sin descargas</span>
      </motion.div>

      {/* Side buttons */}
      <div className="absolute left-[-4px] top-[88px]  w-[4px] h-7 bg-gray-700 rounded-l-sm" />
      <div className="absolute left-[-4px] top-[124px] w-[4px] h-7 bg-gray-700 rounded-l-sm" />
      <div className="absolute right-[-4px] top-[108px] w-[4px] h-11 bg-gray-700 rounded-r-sm" />

      {/* Phone shell */}
      <div className="bg-gray-900 rounded-[3rem] p-[11px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/5">

        {/* Screen */}
        <div
          className="rounded-[2.4rem] overflow-hidden relative"
          style={{ height: '572px', backgroundColor: P.bg }}
        >

          {/* Status bar */}
          <div className="grid grid-cols-3 items-center px-5 pt-3 pb-1">
            <span className="text-[11px] font-bold" style={{ color: P.headerDeep }}>9:41</span>
            <div className="w-[76px] h-[22px] bg-gray-900 rounded-full mx-auto" />
            <div className="flex justify-end items-center gap-[5px]">
              <div className="flex items-end gap-[2px] h-[10px]">
                {[4, 6, 8, 10].map((h, i) => (
                  <div key={i} className="w-[3px] rounded-sm" style={{ height: `${h}px`, backgroundColor: P.barIcon }} />
                ))}
              </div>
              <div className="flex items-center gap-[2px]">
                <div className="w-[18px] h-[10px] rounded-[3px] border relative" style={{ borderColor: `${P.barIcon}99` }}>
                  <div className="absolute inset-[2px] rounded-[1px]" style={{ backgroundColor: P.barIcon, right: '4px' }} />
                </div>
                <div className="w-[2px] h-[5px] rounded-r-sm" style={{ backgroundColor: `${P.barIcon}80` }} />
              </div>
            </div>
          </div>

          {/* Cover photo */}
          <div className="relative w-full overflow-hidden" style={{ height: '68px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=320&h=80&fit=crop&auto=format&q=80"
              alt="El Jardín"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(26,56,40,0.1) 0%, rgba(26,56,40,0.45) 100%)' }}
            />
          </div>

          {/* Restaurant header */}
          <div className="px-4 pt-2.5 pb-2" style={{ borderBottom: `1px solid ${P.divider}` }}>
            <div className="flex items-center gap-2.5">
              {/* Logo */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2"
                style={{ backgroundColor: P.headerDeep, borderColor: '#C8E6D0' }}
              >
                <span className="text-[12px] font-bold text-white tracking-tight">EJ</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold leading-tight" style={{ color: P.headerDeep }}>El Jardín</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={8} fill={P.gold} color={P.gold} />
                  <span className="text-[9px] font-semibold" style={{ color: P.gold }}>4.8</span>
                  <span className="text-[9px]" style={{ color: P.muted }}>· Palermo, CABA</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={8} className="text-green-500" />
                <span className="text-[8px] font-semibold text-green-500">Abierto</span>
              </div>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 px-4 py-2" style={{ borderBottom: `1px solid ${P.divider}` }}>
            {CATEGORIES.map((c, i) => (
              <motion.span
                key={c.label}
                animate={i === catIndex
                  ? { backgroundColor: P.pillActiveBg, color: P.pillActiveTxt }
                  : { backgroundColor: 'transparent', color: P.pillInactiveTxt }
                }
                transition={{ duration: 0.3 }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                style={{ borderColor: i === catIndex ? 'transparent' : P.pillInactiveBorder, whiteSpace: 'nowrap' }}
              >
                {c.label}
              </motion.span>
            ))}
          </div>

          {/* Section label */}
          <div className="px-4 pt-2.5 pb-1">
            <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: P.sectionLabel }}>
              {cat.label}
            </p>
          </div>

          {/* Dishes */}
          <AnimatePresence mode="wait">
            <motion.div
              key={catIndex}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.32, ease: 'easeInOut' }}
            >
              {cat.dishes.map((d, i) => (
                <motion.div
                  key={d.name}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.28 }}
                  className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderBottom: i < cat.dishes.length - 1 ? `1px solid ${P.divider}` : 'none' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.img}
                    alt={d.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                    style={{ backgroundColor: P.divider }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: P.headerDeep }}>{d.name}</p>
                    <p className="text-[9px] mt-0.5 truncate" style={{ color: P.muted }}>{d.desc}</p>
                    <p className="text-[12px] font-bold mt-0.5" style={{ color: P.gold }}>{d.price}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Bottom home indicator */}
          <div
            className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-2 flex justify-center"
            style={{ borderTop: `1px solid ${P.divider}`, backgroundColor: P.bg }}
          >
            <div className="w-24 h-1 rounded-full" style={{ backgroundColor: '#C8D8CC' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
