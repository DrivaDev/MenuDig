'use client'

import { useActionState, useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { updateMenuLayout } from '@/actions/menuColor'

type LogoPosition = 'left' | 'center'
type LogoSize     = 'sm' | 'md' | 'lg'

const SIZE_PREVIEW: Record<LogoSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
}

// ── Live preview ──────────────────────────────────────────────────────────────

function HeaderPreview({
  position,
  logoSize,
  showDescription,
}: {
  position: LogoPosition
  logoSize: LogoSize
  showDescription: boolean
}) {
  const isCenter = position === 'center'
  const circleSize = SIZE_PREVIEW[logoSize]

  return (
    <div
      className={`p-4 bg-brand-fondo rounded-lg border border-brand-acento/60 flex flex-col gap-2.5 min-h-[80px] ${
        isCenter ? 'items-center text-center' : 'items-start'
      }`}
    >
      <div
        className={`${circleSize} rounded-full bg-brand-acento border-2 border-brand-principal/30 shrink-0`}
      />
      <div className={`flex flex-col gap-1.5 ${isCenter ? 'items-center' : 'items-start'}`}>
        <div className="h-3 bg-brand-titulares/40 rounded w-28" />
        {showDescription && <div className="h-2 bg-brand-texto/25 rounded w-44" />}
      </div>
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

interface Props {
  initialLogoPosition:    LogoPosition
  initialLogoSize:        LogoSize
  initialShowDescription: boolean
}

const initialState = { success: false as boolean, error: undefined as string | undefined }

export default function MenuLayoutForm({
  initialLogoPosition,
  initialLogoSize,
  initialShowDescription,
}: Props) {
  const [state, formAction, pending] = useActionState(updateMenuLayout, initialState)
  const [position, setPosition]           = useState<LogoPosition>(initialLogoPosition)
  const [logoSize, setLogoSize]           = useState<LogoSize>(initialLogoSize)
  const [showDescription, setShowDescription] = useState(initialShowDescription)
  const [successMsg, setSuccessMsg]       = useState<string | null>(null)

  useEffect(() => {
    if (state.success) {
      setSuccessMsg('Layout actualizado.')
      const t = setTimeout(() => setSuccessMsg(null), 3000)
      return () => clearTimeout(t)
    }
  }, [state])

  return (
    <form action={formAction} className="flex flex-col gap-7">

      {/* Hidden inputs */}
      <input type="hidden" name="menuLogoPosition"    value={position} />
      <input type="hidden" name="menuLogoSize"        value={logoSize} />
      <input type="hidden" name="menuShowDescription" value={String(showDescription)} />

      {/* Live preview */}
      <HeaderPreview
        position={position}
        logoSize={logoSize}
        showDescription={showDescription}
      />

      {/* Logo position */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-brand-texto">Posición del logo</p>
        <div className="flex gap-3">
          {(['left', 'center'] as LogoPosition[]).map(pos => (
            <button
              key={pos}
              type="button"
              onClick={() => setPosition(pos)}
              aria-pressed={position === pos}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-100 ${
                position === pos
                  ? 'border-brand-principal bg-brand-acento/30'
                  : 'border-brand-acento bg-white hover:border-brand-principal/40'
              }`}
            >
              {/* Mini layout icon */}
              <div
                className={`w-full h-10 rounded-lg bg-brand-fondo border border-brand-acento/50 flex items-center gap-1.5 ${
                  pos === 'center' ? 'justify-center' : 'justify-start px-2'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-brand-acento border border-brand-principal/30 shrink-0" />
                <div className="h-1.5 bg-brand-titulares/30 rounded w-10" />
              </div>
              <span className="text-xs font-medium text-brand-texto">
                {pos === 'left' ? 'Izquierda' : 'Centro'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo size */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-brand-texto">Tamaño del logo</p>
        <div className="flex gap-3">
          {(['sm', 'md', 'lg'] as LogoSize[]).map(size => (
            <button
              key={size}
              type="button"
              onClick={() => setLogoSize(size)}
              aria-pressed={logoSize === size}
              className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all duration-100 ${
                logoSize === size
                  ? 'border-brand-principal bg-brand-acento/30'
                  : 'border-brand-acento bg-white hover:border-brand-principal/40'
              }`}
            >
              <div
                className={`${SIZE_PREVIEW[size]} rounded-full bg-brand-acento border border-brand-principal/30`}
              />
              <span className="text-xs font-medium text-brand-texto">
                {size === 'sm' ? 'Pequeño' : size === 'md' ? 'Mediano' : 'Grande'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Show description toggle */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-texto">Mostrar descripción</p>
          <p className="text-xs font-light text-brand-texto/60 mt-0.5">
            Texto descriptivo bajo el nombre del restaurante
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={showDescription}
          onClick={() => setShowDescription(v => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 ${
            showDescription ? 'bg-brand-principal' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
              showDescription ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Feedback */}
      {successMsg && (
        <div className="rounded-md bg-brand-acento/30 border border-brand-acento px-4 py-3">
          <p className="text-sm font-medium text-brand-titulares">{successMsg}</p>
        </div>
      )}
      {state.error && (
        <div className="rounded-md bg-brand-danger/10 border border-brand-danger/30 px-4 py-3">
          <p className="text-sm font-medium text-brand-danger">{state.error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-brand-principal text-white text-sm font-medium rounded-lg px-6 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Guardando...
            </span>
          ) : (
            'Guardar layout'
          )}
        </button>
      </div>

    </form>
  )
}
