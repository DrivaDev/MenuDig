'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Check, Download, Link2, Loader2 } from 'lucide-react'
import { updateQRStyle } from '@/actions/qr'

type DotStyle    = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'
type CornerStyle = 'square' | 'dot' | 'extra-rounded'

// ── QR lib — lazy-loaded in browser only ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedQRLib: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getQRLib(): Promise<any> {
  if (!cachedQRLib) {
    const mod = await import('qr-code-styling')
    cachedQRLib = mod.default
  }
  return cachedQRLib
}

// ── Color presets ─────────────────────────────────────────────────────────────

const FG_PRESETS = [
  { label: 'Negro',   value: '#1C1917' },
  { label: 'Gris',    value: '#374151' },
  { label: 'Azul',    value: '#1E3A5F' },
  { label: 'Naranja', value: '#EA580C' },
  { label: 'Rojo',    value: '#DC2626' },
  { label: 'Verde',   value: '#16A34A' },
  { label: 'Violeta', value: '#7C3AED' },
]

const BG_PRESETS = [
  { label: 'Blanco',       value: '#FFFFFF' },
  { label: 'Crema',        value: '#FFF7ED' },
  { label: 'Gris claro',   value: '#F9FAFB' },
  { label: 'Celeste',      value: '#EFF6FF' },
  { label: 'Verde claro',  value: '#F0FDF4' },
  { label: 'Rosa claro',   value: '#FFF1F2' },
  { label: 'Negro',        value: '#1C1917' },
]

// ── Swatch picker sub-component ───────────────────────────────────────────────

function SwatchPicker({
  label,
  name,
  value,
  onChange,
  presets,
}: {
  label:   string
  name:    string
  value:   string
  onChange: (v: string) => void
  presets: { label: string; value: string }[]
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm font-medium text-brand-texto">{label}</p>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-2 items-center">
        {presets.map(p => (
          <button
            key={p.value}
            type="button"
            title={p.label}
            onClick={() => onChange(p.value)}
            aria-pressed={value === p.value}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-100 ${
              value === p.value
                ? 'border-brand-texto scale-110 shadow-md'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: p.value }}
          />
        ))}
        {/* Custom color picker */}
        <label
          title="Color personalizado"
          className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center cursor-pointer relative overflow-hidden"
        >
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label="Color personalizado"
          />
          <span className="text-gray-400 text-xs font-bold pointer-events-none">+</span>
        </label>
        <div className="w-7 h-7 rounded border border-gray-200 shadow-sm shrink-0" style={{ backgroundColor: value }} />
        <span className="text-xs font-mono text-brand-texto/70">{value.toUpperCase()}</span>
      </div>
    </div>
  )
}

// ── Style option sets ─────────────────────────────────────────────────────────

const DOT_STYLE_OPTIONS: { value: DotStyle; label: string }[] = [
  { value: 'square',         label: 'Cuadrado'  },
  { value: 'dots',           label: 'Círculos'  },
  { value: 'rounded',        label: 'Redondo'   },
  { value: 'classy',         label: 'Clásico'   },
  { value: 'classy-rounded', label: 'Cls. rnd.' },
  { value: 'extra-rounded',  label: 'Extra rnd.'},
]

const CORNER_STYLE_OPTIONS: { value: CornerStyle; label: string }[] = [
  { value: 'square',        label: 'Cuadrado' },
  { value: 'dot',           label: 'Círculo'  },
  { value: 'extra-rounded', label: 'Redondo'  },
]

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  slug:                 string
  menuUrl:              string
  logoUrl?:             string
  initialFgColor:       string
  initialBgColor:       string
  initialDotStyle:      DotStyle
  initialCornerStyle:   CornerStyle
  initialLogoEnabled:   boolean
}

const initialState = { success: false as boolean, error: undefined as string | undefined }

export default function QRCustomizer({
  slug,
  menuUrl,
  logoUrl,
  initialFgColor,
  initialBgColor,
  initialDotStyle,
  initialCornerStyle,
  initialLogoEnabled,
}: Props) {
  const [state, formAction, pending] = useActionState(updateQRStyle, initialState)

  const [fgColor,      setFgColor]      = useState(initialFgColor)
  const [bgColor,      setBgColor]      = useState(initialBgColor)
  const [dotStyle,     setDotStyle]     = useState<DotStyle>(initialDotStyle)
  const [cornerStyle,  setCornerStyle]  = useState<CornerStyle>(initialCornerStyle)
  const [logoEnabled,  setLogoEnabled]  = useState(initialLogoEnabled)
  const [copied,       setCopied]       = useState(false)
  const [successMsg,   setSuccessMsg]   = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrRef = useRef<any>(null)

  // Render / update QR whenever any option changes
  useEffect(() => {
    let cancelled = false

    const options = {
      width:  224,
      height: 224,
      data:   menuUrl,
      dotsOptions:          { type: dotStyle,    color: fgColor },
      backgroundOptions:    { color: bgColor },
      cornersSquareOptions: { type: cornerStyle },
      cornersDotOptions:    { type: cornerStyle === 'dot' ? 'dot' : 'square' },
      ...(logoEnabled && logoUrl
        ? { image: logoUrl, imageOptions: { crossOrigin: 'anonymous', margin: 8 } }
        : {}),
      qrOptions: { errorCorrectionLevel: logoEnabled && logoUrl ? 'H' : 'M' },
    }

    getQRLib().then(QRCodeStyling => {
      if (cancelled || !containerRef.current) return
      if (!qrRef.current) {
        containerRef.current.innerHTML = ''
        qrRef.current = new QRCodeStyling(options)
        qrRef.current.append(containerRef.current)
      } else {
        qrRef.current.update(options)
      }
    })

    return () => { cancelled = true }
  }, [menuUrl, fgColor, bgColor, dotStyle, cornerStyle, logoEnabled, logoUrl])

  useEffect(() => {
    if (state.success) {
      setSuccessMsg('QR actualizado.')
      const t = setTimeout(() => setSuccessMsg(null), 3000)
      return () => clearTimeout(t)
    }
  }, [state])

  function handleDownload() {
    qrRef.current?.download({ name: `qr-${slug}`, extension: 'png' })
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(menuUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

      {/* ── Preview card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-brand-acento p-6 flex flex-col items-center gap-4">
        <h2 className="text-base font-bold text-brand-titulares self-start">Tu QR</h2>

        {/* QR canvas */}
        <div className="p-3 border border-brand-acento rounded-lg" style={{ backgroundColor: bgColor }}>
          <div
            ref={containerRef}
            className="w-[224px] h-[224px] flex items-center justify-center"
          />
        </div>

        {/* Menu URL — copy on click */}
        <button
          type="button"
          onClick={handleCopy}
          title="Copiar link del menú"
          className="w-full flex items-center gap-2 bg-brand-fondo rounded-md px-4 py-3 hover:bg-brand-acento/40 transition-colors duration-150 group"
        >
          {copied
            ? <Check size={14} className="text-brand-principal shrink-0" />
            : <Link2 size={14} className="text-brand-texto/50 group-hover:text-brand-principal shrink-0 transition-colors" />
          }
          <span className="font-mono text-xs text-brand-texto truncate">{menuUrl}</span>
        </button>

        {/* Download */}
        <button
          type="button"
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 border border-brand-principal text-brand-principal text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-brand-fondo focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 transition-colors duration-150"
        >
          <Download size={15} />
          Descargar QR
        </button>

        {/* View menu */}
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 transition-colors duration-150"
        >
          Ver mi menú
        </a>
      </div>

      {/* ── Customization form ────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-brand-acento p-6">
        <h2 className="text-base font-bold text-brand-titulares mb-1">Personalizar QR</h2>
        <p className="text-sm font-normal text-brand-texto mb-5">
          Los cambios se reflejan en la vista previa en tiempo real.
        </p>

        <form action={formAction} className="flex flex-col gap-7">
          {/* Hidden fields */}
          <input type="hidden" name="qrDotStyle"    value={dotStyle} />
          <input type="hidden" name="qrCornerStyle" value={cornerStyle} />
          <input type="hidden" name="qrLogoEnabled" value={String(logoEnabled)} />

          {/* FG color */}
          <SwatchPicker
            label="Color del QR"
            name="qrFgColor"
            value={fgColor}
            onChange={setFgColor}
            presets={FG_PRESETS}
          />

          {/* BG color */}
          <SwatchPicker
            label="Color de fondo"
            name="qrBgColor"
            value={bgColor}
            onChange={setBgColor}
            presets={BG_PRESETS}
          />

          {/* Dot style */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-brand-texto">Estilo de puntos</p>
            <div className="grid grid-cols-3 gap-2">
              {DOT_STYLE_OPTIONS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setDotStyle(s.value)}
                  aria-pressed={dotStyle === s.value}
                  className={`py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all duration-100 ${
                    dotStyle === s.value
                      ? 'border-brand-principal bg-brand-acento/30 text-brand-titulares'
                      : 'border-brand-acento bg-white text-brand-texto hover:border-brand-principal/40'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Corner style */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-brand-texto">Estilo de esquinas</p>
            <div className="flex gap-2">
              {CORNER_STYLE_OPTIONS.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setCornerStyle(s.value)}
                  aria-pressed={cornerStyle === s.value}
                  className={`flex-1 py-2 px-1 rounded-lg border-2 text-xs font-medium transition-all duration-100 ${
                    cornerStyle === s.value
                      ? 'border-brand-principal bg-brand-acento/30 text-brand-titulares'
                      : 'border-brand-acento bg-white text-brand-texto hover:border-brand-principal/40'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logo toggle — only if restaurant has a logo */}
          {logoUrl && (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-brand-texto">Logo en el QR</p>
                <p className="text-xs font-light text-brand-texto/60 mt-0.5">
                  Incrusta tu logo en el centro del código
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={logoEnabled}
                onClick={() => setLogoEnabled(v => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 ${
                  logoEnabled ? 'bg-brand-principal' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                    logoEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

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
                'Guardar QR'
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
