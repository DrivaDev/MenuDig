'use client'

import { useRef, useEffect, useState } from 'react'
import { useActionState } from 'react'
import { X, Loader2, Clock } from 'lucide-react'
import { createMenu, updateMenu } from '@/actions/menus'

interface MenuData {
  _id: string
  name: string
  startTime: string | null
  endTime: string | null
}

interface Props {
  mode: 'create' | 'edit'
  menu: MenuData | null
  existingMenus: MenuData[]
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

const initialState = { success: false as boolean, error: undefined as string | undefined }

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function isValidTime(t: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(t)) return false
  const [h, m] = t.split(':').map(Number)
  return h >= 0 && h <= 23 && m >= 0 && m <= 59
}

// Auto-formats raw keystrokes into HH:MM
function formatTimeInput(raw: string, prev: string): string {
  // Allow clearing
  if (raw.length < prev.length) return raw

  const digits = raw.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  return digits.slice(0, 2) + ':' + digits.slice(2, 4)
}

export default function MenuModal({ mode, menu, existingMenus, onClose, onSuccess, onError }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const action = mode === 'edit' ? updateMenu : createMenu
  const [state, formAction, pending] = useActionState(action, initialState)

  const [name, setName]           = useState(menu?.name ?? '')
  const [startTime, setStartTime] = useState(menu?.startTime ?? '')
  const [endTime, setEndTime]     = useState(menu?.endTime ?? '')
  const [clientError, setClientError] = useState<string | null>(null)

  useEffect(() => { dialogRef.current?.showModal() }, [])

  useEffect(() => {
    if (state.success) {
      onSuccess(mode === 'create' ? 'Menú creado correctamente.' : 'Menú actualizado correctamente.')
    } else if (state.error) {
      onError(state.error)
    }
  }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTimeChange(
    e: React.ChangeEvent<HTMLInputElement>,
    prev: string,
    set: (v: string) => void
  ) {
    set(formatTimeInput(e.target.value, prev))
  }

  function validate(): boolean {
    setClientError(null)
    if (!name.trim()) { setClientError('El nombre del menú es obligatorio.'); return false }

    const hasStart = startTime.trim() !== ''
    const hasEnd   = endTime.trim() !== ''

    if (hasStart !== hasEnd) {
      setClientError('Ingresá tanto la hora de inicio como la de fin, o dejá ambas vacías.')
      return false
    }
    if (hasStart && hasEnd) {
      if (!isValidTime(startTime)) { setClientError('Hora de inicio inválida. Usá el formato HH:MM (ej. 09:00).'); return false }
      if (!isValidTime(endTime))   { setClientError('Hora de fin inválida. Usá el formato HH:MM (ej. 14:30).'); return false }
      const s = timeToMinutes(startTime)
      const e = timeToMinutes(endTime)
      if (s >= e) { setClientError('El horario de inicio debe ser anterior al de fin.'); return false }
      const others = existingMenus.filter(m => m._id !== menu?._id)
      for (const other of others) {
        if (!other.startTime || !other.endTime) continue
        const os = timeToMinutes(other.startTime)
        const oe = timeToMinutes(other.endTime)
        if (s < oe && os < e) {
          setClientError(`El horario se superpone con "${other.name}".`)
          return false
        }
      }
    }
    return true
  }

  function handleSubmit(formData: FormData) {
    if (!validate()) return
    formAction(formData)
  }

  const isAutomatic = isValidTime(startTime) && isValidTime(endTime)
  const inputClass = 'w-full border border-gray-200 rounded-md px-3 py-3 text-sm font-mono text-brand-texto bg-white placeholder:text-gray-300 focus:outline-none focus:border-brand-principal focus:ring-1 focus:ring-brand-principal transition-colors duration-100 disabled:bg-gray-50'

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 m-0 p-0 bg-white rounded-lg shadow-sm w-full max-w-md border border-brand-acento outline-none"
        onClose={onClose}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-acento">
          <h2 className="text-base font-bold text-brand-titulares">
            {mode === 'create' ? 'Nuevo menú' : 'Editar menú'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex items-center justify-center w-8 h-8 rounded-md text-brand-texto hover:bg-brand-fondo transition-colors duration-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <form id="menu-modal-form" action={handleSubmit} className="space-y-4">
            {mode === 'edit' && menu && (
              <input type="hidden" name="menuId" value={menu._id} />
            )}
            <input type="hidden" name="startTime" value={startTime} />
            <input type="hidden" name="endTime"   value={endTime} />

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-texto" htmlFor="menu-name">
                Nombre del menú <span className="text-brand-danger">*</span>
              </label>
              <input
                id="menu-name"
                type="text"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej. Desayuno"
                disabled={pending}
                autoFocus
                className="w-full border border-gray-200 rounded-md px-3 py-3 text-sm font-normal text-brand-texto bg-white placeholder:text-gray-400 focus:outline-none focus:border-brand-principal focus:ring-1 focus:ring-brand-principal transition-colors duration-100 disabled:bg-gray-50"
              />
            </div>

            {/* Time range */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-brand-texto/60" />
                <span className="text-sm font-medium text-brand-texto">Horario (opcional)</span>
              </div>
              <p className="text-xs font-light text-brand-texto">
                Con horario: el menú se activa automáticamente. Sin horario: lo activás manualmente.
              </p>

              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-medium text-brand-texto/60" htmlFor="menu-start">Desde</label>
                  <input
                    id="menu-start"
                    type="text"
                    inputMode="numeric"
                    value={startTime}
                    onChange={e => handleTimeChange(e, startTime, setStartTime)}
                    placeholder="09:00"
                    maxLength={5}
                    disabled={pending}
                    className={inputClass}
                  />
                </div>
                <span className="text-brand-texto/40 text-sm mt-5">-</span>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-medium text-brand-texto/60" htmlFor="menu-end">Hasta</label>
                  <input
                    id="menu-end"
                    type="text"
                    inputMode="numeric"
                    value={endTime}
                    onChange={e => handleTimeChange(e, endTime, setEndTime)}
                    placeholder="12:00"
                    maxLength={5}
                    disabled={pending}
                    className={inputClass}
                  />
                </div>
              </div>

              {isAutomatic ? (
                <p className="text-xs text-brand-principal font-medium">
                  Modo automático: activo de {startTime} a {endTime}
                </p>
              ) : (
                <p className="text-xs text-brand-texto/50">
                  Modo manual: activarás este menú desde el panel.
                </p>
              )}
            </div>

            {(clientError || (state.error && !state.success)) && (
              <p role="alert" className="text-xs text-brand-danger">
                {clientError || state.error}
              </p>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-acento flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="border border-brand-principal text-brand-principal bg-transparent text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-brand-fondo focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="menu-modal-form"
            disabled={pending}
            className="bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Guardando...
              </span>
            ) : (
              mode === 'create' ? 'Crear menú' : 'Guardar cambios'
            )}
          </button>
        </div>
      </dialog>
    </>
  )
}
