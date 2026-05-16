'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Tag, CheckCircle2, XCircle, GripVertical, Pencil, Trash2 } from 'lucide-react'
import CategoryModal from './CategoryModal'
import { deleteCategory, reorderCategories } from '@/actions/categories'

interface Category {
  _id: string
  name: string
  order: number
}

// ── Sortable row ──────────────────────────────────────────────────────────────

interface RowProps {
  cat: Category
  onEdit: () => void
  confirmDeleteId: string | null
  setConfirmDeleteId: (id: string | null) => void
  deletePending: boolean
  setDeletePending: (v: boolean) => void
  showToast: (type: 'success' | 'error', msg: string) => void
  onDeleted: () => void
}

function SortableCategoryRow({
  cat,
  onEdit,
  confirmDeleteId,
  setConfirmDeleteId,
  deletePending,
  setDeletePending,
  showToast,
  onDeleted,
}: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between px-6 py-4 transition-colors duration-100 ${
        isDragging
          ? 'bg-brand-acento/60 shadow-md z-10 relative rounded-md'
          : 'hover:bg-brand-acento/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-brand-texto/40 hover:text-brand-texto/70 transition-colors touch-none"
          aria-label="Arrastrar para reordenar"
          tabIndex={-1}
        >
          <GripVertical size={16} />
        </button>
        <span className="text-sm font-normal text-brand-texto">{cat.name}</span>
      </div>

      <div className="flex items-center gap-2">
        {confirmDeleteId !== cat._id ? (
          <>
            <button
              onClick={onEdit}
              aria-label="Editar categoría"
              className="flex items-center justify-center w-8 h-8 rounded-md border border-brand-acento bg-white text-brand-texto hover:bg-brand-fondo transition-colors duration-100"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setConfirmDeleteId(cat._id)}
              aria-label="Eliminar categoría"
              className="flex items-center justify-center w-8 h-8 rounded-md border border-brand-danger/30 bg-white text-brand-danger hover:bg-brand-danger/10 transition-colors duration-100"
            >
              <Trash2 size={14} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 animate-in fade-in duration-150">
            <span className="text-xs font-medium text-brand-danger">¿Eliminar?</span>
            <form
              action={async (fd) => {
                setDeletePending(true)
                const result = await deleteCategory({ success: false }, fd)
                setDeletePending(false)
                setConfirmDeleteId(null)
                if (result.success) {
                  showToast('success', 'Categoría eliminada correctamente.')
                  onDeleted()
                } else {
                  showToast('error', result.error ?? 'Algo salió mal. Intentá de nuevo.')
                }
              }}
            >
              <input type="hidden" name="categoryId" value={cat._id} />
              <button
                type="submit"
                disabled={deletePending}
                className="text-xs font-medium text-white bg-brand-danger rounded-md px-3 py-1.5 min-h-[32px] hover:bg-[#B91C1C] disabled:opacity-50 transition-colors duration-100"
              >
                {deletePending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </form>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="text-xs font-medium text-brand-texto hover:underline"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </li>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  categories: Category[]
}

export default function CategoriesClient({ categories: initialCategories }: Props) {
  const router = useRouter()
  const [categories, setCategories]             = useState<Category[]>(initialCategories)
  const [modalOpen, setModalOpen]               = useState(false)
  const [editTarget, setEditTarget]             = useState<Category | null>(null)
  const [confirmDeleteId, setConfirmDeleteId]   = useState<string | null>(null)
  const [deletePending, setDeletePending]       = useState(false)
  const [, startReorderTransition]              = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  function openCreate() { setEditTarget(null); setModalOpen(true) }
  function openEdit(cat: Category) { setEditTarget(cat); setModalOpen(true) }

  function handleModalSuccess(message: string) {
    setModalOpen(false)
    setEditTarget(null)
    showToast('success', message)
    router.refresh()
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const prev = categories
    const oldIndex = categories.findIndex(c => c._id === String(active.id))
    const newIndex  = categories.findIndex(c => c._id === String(over.id))
    const reordered = arrayMove(categories, oldIndex, newIndex)
    setCategories(reordered)

    const fd = new FormData()
    fd.append('orderedIds', JSON.stringify(reordered.map(c => c._id)))

    startReorderTransition(async () => {
      const result = await reorderCategories({ success: false }, fd)
      if (!result.success) {
        setCategories(prev)
        showToast('error', result.error ?? 'No se pudo reordenar. Intentá de nuevo.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 flex-1">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-titulares">Categorías</h1>
        <button
          onClick={openCreate}
          className="bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 transition-colors duration-150"
        >
          Nueva categoría
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border border-brand-acento overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-t border-brand-acento">
            <Tag size={32} className="text-brand-acento mb-4" />
            <p className="text-base font-medium text-brand-titulares mb-1">Sin categorías todavía</p>
            <p className="text-sm font-normal text-brand-texto mb-6">
              Creá tu primera categoría para organizar tu menú.
            </p>
            <button
              onClick={openCreate}
              className="bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 transition-colors duration-150"
            >
              Nueva categoría
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map(c => c._id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-brand-acento">
                {categories.map(cat => (
                  <SortableCategoryRow
                    key={cat._id}
                    cat={cat}
                    onEdit={() => openEdit(cat)}
                    confirmDeleteId={confirmDeleteId}
                    setConfirmDeleteId={setConfirmDeleteId}
                    deletePending={deletePending}
                    setDeletePending={setDeletePending}
                    showToast={showToast}
                    onDeleted={() => router.refresh()}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <CategoryModal
          mode={editTarget ? 'edit' : 'create'}
          category={editTarget}
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
