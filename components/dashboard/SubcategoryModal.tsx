'use client'

import { useRef, useEffect, useState } from 'react'
import { useActionState } from 'react'
import { X, Trash2, Plus, Loader2 } from 'lucide-react'
import { createSubcategory, deleteSubcategory } from '@/actions/subcategories'
import type { CreateSubcategoryResult, DeleteSubcategoryResult } from '@/actions/subcategories'

interface SubcategoryItem {
  _id: string
  name: string
}

interface Props {
  categoryId: string
  categoryName: string
  subcategories: SubcategoryItem[]
  onClose: () => void
  onChanged: () => void
}

const initialCreateState: CreateSubcategoryResult = { success: false }
const initialDeleteState: DeleteSubcategoryResult = { success: false }

export default function SubcategoryModal({
  categoryId,
  categoryName,
  subcategories: initialSubs,
  onClose,
  onChanged,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [subs, setSubs]               = useState<SubcategoryItem[]>(initialSubs)
  const [confirmDeleteId, setConfirm] = useState<string | null>(null)
  const [deleting, setDeleting]       = useState(false)
  const [newName, setNewName]         = useState('')
  const [createState, createAction, createPending] = useActionState(createSubcategory, initialCreateState)

  useEffect(() => { dialogRef.current?.showModal() }, [])

  useEffect(() => {
    if (createState.success && createState.subcategory) {
      setSubs(prev => [...prev, createState.subcategory!])
      setNewName('')
      onChanged()
    }
  }, [createState]) // eslint-disable-line react-hooks/exhaustive-deps

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
            Subcategorías — {categoryName}
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
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {subs.length === 0 ? (
            <p className="text-sm text-brand-texto">Sin subcategorías. Agregá la primera abajo.</p>
          ) : (
            <ul className="divide-y divide-brand-acento border border-brand-acento rounded-md overflow-hidden">
              {subs.map(sub => (
                <li key={sub._id} className="flex items-center justify-between px-4 py-3 hover:bg-brand-acento/20 transition-colors duration-100">
                  <span className="text-sm font-normal text-brand-texto">{sub.name}</span>

                  {confirmDeleteId !== sub._id ? (
                    <button
                      onClick={() => setConfirm(sub._id)}
                      aria-label="Eliminar subcategoría"
                      className="flex items-center justify-center w-7 h-7 rounded-md border border-brand-danger/30 bg-white text-brand-danger hover:bg-brand-danger/10 transition-colors duration-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 animate-in fade-in duration-150">
                      <span className="text-xs font-medium text-brand-danger">¿Eliminar?</span>
                      <form
                        action={async (fd) => {
                          setDeleting(true)
                          const result = await deleteSubcategory(initialDeleteState, fd)
                          setDeleting(false)
                          setConfirm(null)
                          if (result.success) {
                            setSubs(prev => prev.filter(s => s._id !== sub._id))
                            onChanged()
                          }
                        }}
                      >
                        <input type="hidden" name="subcategoryId" value={sub._id} />
                        <button
                          type="submit"
                          disabled={deleting}
                          className="text-xs font-medium text-white bg-brand-danger rounded-md px-2 py-1 min-h-[28px] hover:bg-[#B91C1C] disabled:opacity-50 transition-colors duration-100"
                        >
                          {deleting ? '...' : 'Sí'}
                        </button>
                      </form>
                      <button
                        onClick={() => setConfirm(null)}
                        className="text-xs font-medium text-brand-texto hover:underline"
                      >
                        No
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Add new subcategory */}
          <form action={createAction} className="flex gap-2">
            <input type="hidden" name="categoryId" value={categoryId} />
            <input
              type="text"
              name="name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nueva subcategoría"
              disabled={createPending}
              autoFocus
              className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm font-normal text-brand-texto bg-white placeholder:text-gray-400 focus:outline-none focus:border-brand-principal focus:ring-1 focus:ring-brand-principal transition-colors duration-100 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={createPending || !newName.trim()}
              aria-label="Agregar subcategoría"
              className="flex items-center justify-center w-10 h-10 bg-brand-principal text-white rounded-md hover:bg-[#C2410C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {createPending
                ? <Loader2 size={14} className="animate-spin" />
                : <Plus size={14} />
              }
            </button>
          </form>
          {createState.error && (
            <p role="alert" className="text-xs text-brand-danger">{createState.error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-acento flex justify-end">
          <button
            onClick={onClose}
            className="border border-brand-principal text-brand-principal bg-transparent text-sm font-medium rounded-lg px-4 py-2 min-h-[40px] hover:bg-brand-fondo transition-colors duration-150"
          >
            Listo
          </button>
        </div>
      </dialog>
    </>
  )
}
