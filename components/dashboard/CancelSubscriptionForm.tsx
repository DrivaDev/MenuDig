'use client'

import { useState } from 'react'

export function CancelSubscriptionForm() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border border-gray-200 text-brand-texto text-sm font-medium rounded-lg px-6 py-3 min-h-[44px] hover:bg-gray-50 transition-colors"
      >
        Cancelar suscripción
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 mx-4 max-w-sm w-full">
            <h2 className="text-lg font-semibold text-brand-titulares mb-2">
              Cancelar suscripción
            </h2>
            <p className="text-sm text-brand-texto mb-6">
              ¿Seguro que querés cancelar? Perderás el acceso al panel de administración.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 border border-gray-200 text-brand-texto text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
              <form action="/api/subscription/cancel" method="POST" className="flex-1">
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-red-700 transition-colors"
                >
                  Sí, cancelar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
