'use client'

import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Tag, X } from 'lucide-react'
import { redeemPromoCode, type RedeemState } from '@/actions/promoCode'

const BASE_PRICE = 20000
const initialState: RedeemState = { success: false }

function calcPrice(discount_type?: string, value?: number): number {
  if (!discount_type || value == null) return BASE_PRICE
  if (discount_type === 'percentage') return Math.max(0, Math.round(BASE_PRICE * (1 - value / 100)))
  return Math.max(0, BASE_PRICE - value)
}

function formatARS(n: number) {
  return `$${n.toLocaleString('es-AR')}`
}

export function SubscribeModal() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(redeemPromoCode, initialState)
  const router = useRouter()

  function handleClose() {
    setOpen(false)
    if (state.is_free) router.refresh()
  }

  const showConfirm = state.success && state.is_free
  const discountedPrice = calcPrice(state.discount_type, state.value)
  const hasDiscount = state.success && !state.is_free

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-brand-principal text-white text-sm font-semibold rounded-lg px-6 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 transition-colors"
      >
        Suscribirme — $20.000/mes
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 mx-4 max-w-sm w-full">
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold text-brand-titulares mb-1">
              Plan Mensual
            </h2>
            <div className="flex items-baseline gap-2 mb-5">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-bold text-brand-principal">
                    {formatARS(discountedPrice)}<span className="text-sm font-normal text-brand-texto">/mes</span>
                  </span>
                  <span className="text-base line-through text-gray-400">
                    {formatARS(BASE_PRICE)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-brand-principal">
                  $20.000<span className="text-sm font-normal text-brand-texto">/mes</span>
                </span>
              )}
            </div>

            {/* Promo code */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-brand-titulares" />
                <span className="text-sm font-medium text-brand-titulares">
                  Código de descuento
                </span>
              </div>

              <form action={formAction} className="flex items-start gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    name="code"
                    type="text"
                    placeholder="CÓDIGO"
                    disabled={pending || state.success}
                    className="border border-gray-200 rounded-md px-3 py-2 text-sm font-mono uppercase placeholder:normal-case focus:outline-none focus:border-brand-principal focus:ring-1 focus:ring-brand-principal disabled:bg-gray-50 w-full"
                  />
                  {state.error && (
                    <p className="text-xs text-red-600">{state.error}</p>
                  )}
                  {state.success && state.message && (
                    <p className="text-xs text-green-700 font-medium">{state.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={pending || state.success}
                  className="shrink-0 flex items-center gap-1.5 bg-brand-principal text-white text-sm font-medium rounded-lg px-3 py-2 hover:bg-[#C2410C] disabled:opacity-50 transition-colors"
                >
                  {pending && <Loader2 size={12} className="animate-spin" />}
                  Aplicar
                </button>
              </form>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {showConfirm ? (
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full bg-brand-principal text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-[#C2410C] transition-colors"
                >
                  Confirmar
                </button>
              ) : (
                <form action="/api/subscription/create" method="POST">
                  <button
                    type="submit"
                    className="w-full bg-brand-principal text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-[#C2410C] transition-colors"
                  >
                    Continuar a Mercado Pago
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="w-full border border-gray-200 text-brand-texto text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
