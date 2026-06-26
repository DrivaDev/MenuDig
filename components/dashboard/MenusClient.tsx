'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Pencil, Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react'
import MenuModal from './MenuModal'
import { deleteMenu, toggleMenuActive } from '@/actions/menus'

interface MenuData {
  _id: string
  name: string
  startTime: string | null
  endTime: string | null
  isActive: boolean
  order: number
}

interface Props {
  menus: MenuData[]
}

export default function MenusClient({ menus: initialMenus }: Props) {
  const router = useRouter()
  const [menus, setMenus]             = useState<MenuData[]>(initialMenus)
  const [modalOpen, setModalOpen]     = useState(false)
  const [editTarget, setEditTarget]   = useState<MenuData | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId]   = useState<string | null>(null)
  const [, startTransition]           = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => { setMenus(initialMenus) }, [initialMenus]) // eslint-disable-line react-hooks/exhaustive-deps

  const isManualMode = menus.every(m => !m.startTime && !m.endTime)

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  function openCreate() { setEditTarget(null); setModalOpen(true) }
  function openEdit(m: MenuData) { setEditTarget(m); setModalOpen(true) }

  function handleModalSuccess(message: string) {
    setModalOpen(false)
    setEditTarget(null)
    showToast('success', message)
    router.refresh()
  }

  async function handleDelete(menuId: string) {
    setDeletingId(menuId)
    const fd = new FormData()
    fd.append('menuId', menuId)
    const result = await deleteMenu({ success: false }, fd)
    setDeletingId(null)
    setConfirmDeleteId(null)
    if (result.success) {
      showToast('success', 'Menú eliminado.')
      router.refresh()
    } else {
      showToast('error', result.error ?? 'Algo salió mal.')
    }
  }

  function handleToggleActive(menuId: string) {
    const target = menus.find(m => m._id === menuId)
    if (!target) return
    const willBeActive = !target.isActive

    // Optimistic update — no wait for server
    setMenus(prev => prev.map(m => {
      if (m._id === menuId) return { ...m, isActive: willBeActive }
      if (willBeActive) return { ...m, isActive: false } // deactivate others
      return m
    }))

    const fd = new FormData()
    fd.append('menuId', menuId)
    startTransition(async () => {
      const result = await toggleMenuActive({ success: false }, fd)
      if (!result.success) {
        showToast('error', result.error ?? 'No se pudo cambiar el estado.')
        router.refresh() // revert via server state
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 flex-1">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-titulares">Menús</h1>
        <button
          onClick={openCreate}
          disabled={menus.length >= 4}
          className="bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Nuevo menú
        </button>
      </div>

      {/* Info */}
      <div className="text-sm font-normal text-brand-texto bg-brand-acento/30 border border-brand-acento rounded-lg px-4 py-3 space-y-1">
        {menus.length <= 1 ? (
          <p>
            Tu menú <strong>Estándar</strong> muestra todos los platos disponibles. Creá un segundo menú para activar el sistema de múltiples menús con horarios o activación manual.
          </p>
        ) : (
          <>
            <p>Creá hasta 4 menús. Cada plato puede pertenecer a uno o más menús.</p>
            <p>Con horarios → el menú activo cambia automáticamente. Sin horarios → activás manualmente uno a la vez.</p>
          </>
        )}
      </div>

      {/* Limit warning */}
      {menus.length >= 4 && (
        <p className="text-xs text-brand-texto/60">
          Alcanzaste el límite de 4 menús.
        </p>
      )}

      {/* Empty state */}
      {menus.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-brand-acento flex flex-col items-center justify-center py-16 text-center">
          <BookOpen size={32} className="text-brand-acento mb-4" />
          <p className="text-base font-medium text-brand-titulares mb-1">Sin menús todavía</p>
          <p className="text-sm font-normal text-brand-texto mb-6">
            Creá tu primer menú para empezar a organizar los platos por horario.
          </p>
          <button
            onClick={openCreate}
            className="bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 transition-colors duration-150"
          >
            Nuevo menú
          </button>
        </div>
      )}

      {/* Menu list */}
      {menus.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-brand-acento overflow-hidden">
          {menus.map((m, idx) => {
            const hasTime = !!(m.startTime && m.endTime)
            return (
              <div
                key={m._id}
                className={`flex items-center gap-3 px-4 py-4 ${
                  idx < menus.length - 1 ? 'border-b border-brand-acento/40' : ''
                }`}
              >
                {/* Icon */}
                <div className="w-9 h-9 rounded-md bg-brand-fondo border border-brand-acento flex items-center justify-center shrink-0">
                  <BookOpen size={15} className="text-brand-titulares" />
                </div>

                {/* Name + time/mode */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-titulares truncate">{m.name}</p>
                  {hasTime ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock size={11} className="text-brand-texto/50" />
                      <span className="text-xs font-normal text-brand-texto/70">
                        {m.startTime} - {m.endTime}
                      </span>
                      <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        Automático
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-semibold bg-brand-acento text-brand-titulares px-1.5 py-0.5 rounded-full">
                        Manual
                      </span>
                    </div>
                  )}
                </div>

                {/* Manual toggle — only when 2+ menus and all are manual */}
                {menus.length > 1 && isManualMode && (
                  <button
                    onClick={() => handleToggleActive(m._id)}
                    aria-label={m.isActive ? 'Desactivar menú' : 'Activar menú'}
                    className="flex items-center gap-2 shrink-0 group"
                  >
                    {/* Pill switch */}
                    <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      m.isActive ? 'bg-brand-principal' : 'bg-gray-200 group-hover:bg-gray-300'
                    }`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        m.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </span>
                    <span className={`text-xs font-medium w-14 text-left ${
                      m.isActive ? 'text-brand-principal' : 'text-brand-texto/40'
                    }`}>
                      {m.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </button>
                )}

                {/* Actions */}
                {confirmDeleteId !== m._id ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openEdit(m)}
                      aria-label="Editar menú"
                      className="flex items-center justify-center w-8 h-8 rounded-md border border-brand-acento bg-white text-brand-texto hover:bg-brand-fondo transition-colors duration-100"
                    >
                      <Pencil size={13} />
                    </button>
                    {menus.length > 1 && (
                      <button
                        onClick={() => setConfirmDeleteId(m._id)}
                        aria-label="Eliminar menú"
                        className="flex items-center justify-center w-8 h-8 rounded-md border border-brand-danger/30 bg-white text-brand-danger hover:bg-brand-danger/10 transition-colors duration-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 animate-in fade-in duration-150 shrink-0">
                    <span className="text-xs font-medium text-brand-danger">¿Eliminar?</span>
                    <button
                      onClick={() => handleDelete(m._id)}
                      disabled={deletingId === m._id}
                      className="text-xs font-medium text-white bg-brand-danger rounded-md px-2.5 py-1.5 hover:bg-[#B91C1C] disabled:opacity-50 transition-colors"
                    >
                      {deletingId === m._id ? '...' : 'Sí'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs font-medium text-brand-texto hover:underline"
                    >
                      No
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <MenuModal
          mode={editTarget ? 'edit' : 'create'}
          menu={editTarget}
          existingMenus={menus}
          onClose={() => { setModalOpen(false); setEditTarget(null) }}
          onSuccess={handleModalSuccess}
          onError={(msg) => showToast('error', msg)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-xs border ${
            toast.type === 'success' ? 'border-brand-acento' : 'border-brand-danger/30'
          }`}>
            {toast.type === 'success'
              ? <CheckCircle2 size={18} className="text-brand-principal shrink-0" />
              : <XCircle size={18} className="text-brand-danger shrink-0" />
            }
            <p className="text-sm font-medium text-brand-texto">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
