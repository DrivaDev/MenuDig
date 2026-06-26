'use client'

import { useRef, useEffect, useState } from 'react'
import { useActionState } from 'react'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { createCategory, updateCategory } from '@/actions/categories'
import { createSubcategory, deleteSubcategory } from '@/actions/subcategories'
import type { CreateSubcategoryResult, DeleteSubcategoryResult } from '@/actions/subcategories'

interface Category {
  _id: string
  name: string
  order: number
}

interface SubcategoryItem {
  _id: string
  name: string
}

interface Props {
  mode: 'create' | 'edit'
  category: Category | null
  subcategories?: SubcategoryItem[]
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
  onSubsChanged?: () => void
}

const initialState = { success: false as boolean, error: undefined as string | undefined }

export default function CategoryModal({
  mode,
  category,
  subcategories = [],
  onClose,
  onSuccess,
  onError,
  onSubsChanged,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const action = mode === 'edit' ? updateCategory : createCategory
  const [state, formAction, pending] = useActionState(action, initialState)

  // Subcategory management (edit mode only)
  const [subs, setSubs]                             = useState<SubcategoryItem[]>(subcategories)
  const [newSubName, setNewSubName]                 = useState('')
  const [createSubPending, setCreateSubPending]     = useState(false)
  const [createSubError, setCreateSubError]         = useState<string | null>(null)
  const [deletingId, setDeletingId]                 = useState<string | null>(null)
  const [confirmDeleteSubId, setConfirmDeleteSubId] = useState<string | null>(null)

  useEffect(() => { dialogRef.current?.showModal() }, [])

  useEffect(() => {
    if (state.success) {
      const message = mode === 'create'
        ? 'Categoría creada correctamente.'
        : 'Categoría actualizada correctamente.'
      onSuccess(message)
    } else if (state.error) {
      onError(state.error)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  async function handleCreateSub() {
    if (!newSubName.trim() || !category) return
    setCreateSubPending(true)
    setCreateSubError(null)
    const fd = new FormData()
    fd.append('name', newSubName.trim())
    fd.append('categoryId', category._id)
    const result: CreateSubcategoryResult = await createSubcategory({ success: false }, fd)
    setCreateSubPending(false)
    if (result.success && result.subcategory) {
      setSubs(prev => [...prev, { _id: result.subcategory!._id, name: result.subcategory!.name }])
      setNewSubName('')
      onSubsChanged?.()
    } else {
      setCreateSubError(result.error ?? 'Error al crear la subcategoría.')
    }
  }

  async function handleDeleteSub(subId: string) {
    setDeletingId(subId)
    const fd = new FormData()
    fd.append('subcategoryId', subId)
    const result: DeleteSubcategoryResult = await deleteSubcategory({ success: false }, fd)
    setDeletingId(null)
    setConfirmDeleteSubId(null)
    if (result.success) {
      setSubs(prev => prev.filter(s => s._id !== subId))
      onSubsChanged?.()
    }
  }

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
            {mode === 'create' ? 'Nueva categoría' : 'Editar categoría'}
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
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[70vh]">

          {/* Category name form */}
          <form id="modal-form" action={formAction}>
            {mode === 'edit' && category && (
              <input type="hidden" name="categoryId" value={category._id} />
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-texto" htmlFor="cat-name">
                Nombre <span className="text-brand-danger">*</span>
              </label>
              <input
                id="cat-name"
                type="text"
                name="name"
                defaultValue={category?.name ?? ''}
                placeholder="Ej. Entradas, Principales, Postres"
                className="w-full border border-gray-200 rounded-md px-3 py-3 text-sm font-normal text-brand-texto bg-white placeholder:text-gray-400 focus:outline-none focus:border-brand-principal focus:ring-1 focus:ring-brand-principal transition-colors duration-100 disabled:border-gray-100 disabled:bg-gray-50"
                disabled={pending}
                autoFocus
              />
              {state.error && (
                <p role="alert" className="text-xs text-brand-danger">{state.error}</p>
              )}
            </div>
          </form>

          {/* Subcategory management — edit mode only */}
          {mode === 'edit' && category && (
            <div className="flex flex-col gap-3 pt-2 border-t border-brand-acento">
              <span className="text-sm font-medium text-brand-texto">Subcategorías</span>

              {subs.length > 0 && (
                <ul className="divide-y divide-brand-acento border border-brand-acento rounded-md overflow-hidden">
                  {subs.map(sub => (
                    <li
                      key={sub._id}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-brand-acento/20 transition-colors duration-100"
                    >
                      <span className="text-sm font-normal text-brand-texto">{sub.name}</span>
                      {confirmDeleteSubId !== sub._id ? (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteSubId(sub._id)}
                          aria-label="Eliminar subcategoría"
                          disabled={!!deletingId}
                          className="flex items-center justify-center w-7 h-7 rounded-md border border-brand-danger/30 bg-white text-brand-danger hover:bg-brand-danger/10 disabled:opacity-40 transition-colors duration-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 animate-in fade-in duration-150">
                          <span className="text-xs font-medium text-brand-danger">¿Eliminar?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSub(sub._id)}
                            disabled={deletingId === sub._id}
                            className="text-xs font-medium text-white bg-brand-danger rounded-md px-2 py-1 min-h-[26px] hover:bg-[#B91C1C] disabled:opacity-50 transition-colors"
                          >
                            {deletingId === sub._id ? '...' : 'Sí'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteSubId(null)}
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

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateSub() } }}
                  placeholder="Nueva subcategoría"
                  disabled={createSubPending}
                  className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm font-normal text-brand-texto bg-white placeholder:text-gray-400 focus:outline-none focus:border-brand-principal focus:ring-1 focus:ring-brand-principal transition-colors duration-100 disabled:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={handleCreateSub}
                  disabled={createSubPending || !newSubName.trim()}
                  aria-label="Agregar subcategoría"
                  className="flex items-center justify-center w-10 h-10 bg-brand-principal text-white rounded-md hover:bg-[#C2410C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  {createSubPending
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Plus size={14} />
                  }
                </button>
              </div>
              {createSubError && (
                <p role="alert" className="text-xs text-brand-danger">{createSubError}</p>
              )}
            </div>
          )}
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
            form="modal-form"
            disabled={pending}
            className="bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            {pending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Guardando...
              </span>
            ) : (
              mode === 'create' ? 'Crear categoría' : 'Guardar cambios'
            )}
          </button>
        </div>
      </dialog>
    </>
  )
}
