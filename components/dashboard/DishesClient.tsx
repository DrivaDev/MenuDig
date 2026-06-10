'use client'

import { useState, useTransition, useEffect } from 'react'
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
import {
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ImageOff,
  Pencil,
  Trash2,
  GripVertical,
} from 'lucide-react'
import DishModal from './DishModal'
import AvailabilityToggle from './AvailabilityToggle'
import { deleteDish, reorderDishes } from '@/actions/dishes'
import Link from 'next/link'

interface Category {
  _id: string
  name: string
  order: number
}

interface Dish {
  _id: string
  name: string
  description: string
  price: number
  available: boolean
  imageUrl: string
  imagePublicId: string
  categoryId?: string
  allergens: string[]
  tags?: string[]
  subcategoryId?: string | null
  order: number
}

interface SubcategoryItem {
  _id: string
  name: string
}

// ── Sortable dish row ─────────────────────────────────────────────────────────

interface DishRowProps {
  dish: Dish
  subcatName?: string
  onEdit: () => void
  onDeleteRequest: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
  confirmDeleteId: string | null
  deletingId: string | null
  onToggleError: (msg: string) => void
}

function SortableDishRow({
  dish,
  subcatName,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  confirmDeleteId,
  deletingId,
  onToggleError,
}: DishRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: dish._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 border-b border-brand-acento/40 last:border-0 transition-colors duration-100 ${
        isDragging
          ? 'bg-brand-acento/60 shadow-md z-10 relative rounded-md opacity-80'
          : 'bg-white hover:bg-brand-acento/10'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-brand-texto/30 hover:text-brand-texto/60 transition-colors touch-none shrink-0"
        aria-label="Arrastrar para reordenar"
        tabIndex={-1}
      >
        <GripVertical size={15} />
      </button>

      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-md overflow-hidden bg-brand-fondo shrink-0 flex items-center justify-center">
        {dish.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
        ) : (
          <ImageOff size={14} className="text-gray-300" />
        )}
      </div>

      {/* Name + price + subcategory */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-brand-texto truncate">{dish.name}</p>
        <p className="text-xs font-mono text-brand-texto/60">
          {dish.price > 0 ? `$${(dish.price / 100).toLocaleString('es-AR')}` : '—'}
        </p>
        {subcatName && (
          <span className="inline-flex items-center mt-0.5 px-1.5 py-0 rounded text-xs font-normal bg-brand-acento/50 text-brand-titulares">
            {subcatName}
          </span>
        )}
      </div>

      {/* Availability toggle */}
      <AvailabilityToggle dish={dish} onToggleError={onToggleError} />

      {/* Actions */}
      {confirmDeleteId !== dish._id ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            aria-label="Editar plato"
            className="flex items-center justify-center w-8 h-8 rounded-md border border-brand-acento bg-white text-brand-texto hover:bg-brand-fondo transition-colors duration-100"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={onDeleteRequest}
            aria-label="Eliminar plato"
            className="flex items-center justify-center w-8 h-8 rounded-md border border-brand-danger/30 bg-white text-brand-danger hover:bg-brand-danger/10 transition-colors duration-100"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 animate-in fade-in duration-150 shrink-0">
          <span className="text-xs font-medium text-brand-danger">¿Eliminar?</span>
          <button
            onClick={onDeleteConfirm}
            disabled={deletingId === dish._id}
            className="text-xs font-medium text-white bg-brand-danger rounded-md px-2.5 py-1.5 hover:bg-[#B91C1C] disabled:opacity-50 transition-colors"
          >
            {deletingId === dish._id ? '...' : 'Sí'}
          </button>
          <button
            onClick={onDeleteCancel}
            className="text-xs font-medium text-brand-texto hover:underline"
          >
            No
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  dishes: Dish[]
  categories: Category[]
  subcategoriesByCategory: Record<string, SubcategoryItem[]>
}

export default function DishesClient({ dishes: initialDishes, categories, subcategoriesByCategory }: Props) {
  const router = useRouter()

  // Flat lookup: subcategoryId → name
  const subcategoryById: Record<string, string> = {}
  for (const subs of Object.values(subcategoriesByCategory)) {
    for (const sub of subs) subcategoryById[sub._id] = sub.name
  }

  // Group dishes by category, preserving server-side order
  const [dishesByCategory, setDishesByCategory] = useState<Record<string, Dish[]>>(() => {
    const map: Record<string, Dish[]> = {}
    for (const cat of categories) map[cat._id] = []
    for (const dish of initialDishes) {
      const key = dish.categoryId ?? '__none__'
      if (!map[key]) map[key] = []
      map[key].push(dish)
    }
    return map
  })

  // Re-sync when server sends fresh initialDishes after router.refresh()
  useEffect(() => {
    const map: Record<string, Dish[]> = {}
    for (const cat of categories) map[cat._id] = []
    for (const dish of initialDishes) {
      const key = dish.categoryId ?? '__none__'
      if (!map[key]) map[key] = []
      map[key].push(dish)
    }
    setDishesByCategory(map)
  }, [initialDishes]) // eslint-disable-line react-hooks/exhaustive-deps

  const [modalOpen, setModalOpen]             = useState(false)
  const [editTarget, setEditTarget]           = useState<Dish | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId]           = useState<string | null>(null)
  const [, startReorderTransition]            = useTransition()
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const totalDishes = Object.values(dishesByCategory).reduce((sum, arr) => sum + arr.length, 0)

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  function openCreate() { setEditTarget(null); setModalOpen(true) }
  function openEdit(dish: Dish) { setEditTarget(dish); setModalOpen(true) }

  function handleModalSuccess(message: string) {
    setModalOpen(false)
    setEditTarget(null)
    showToast('success', message)
    router.refresh()
  }

  function handleDragEnd(categoryId: string) {
    return (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const catDishes = [...(dishesByCategory[categoryId] ?? [])]
      const oldIndex  = catDishes.findIndex(d => d._id === String(active.id))
      const newIndex  = catDishes.findIndex(d => d._id === String(over.id))
      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(catDishes, oldIndex, newIndex)
      const prev = dishesByCategory

      setDishesByCategory({ ...dishesByCategory, [categoryId]: reordered })

      const fd = new FormData()
      fd.append('orderedIds', JSON.stringify(reordered.map(d => d._id)))

      startReorderTransition(async () => {
        const result = await reorderDishes({ success: false }, fd)
        if (!result.success) {
          setDishesByCategory(prev)
          showToast('error', result.error ?? 'No se pudo reordenar. Intentá de nuevo.')
        }
      })
    }
  }

  async function handleDelete(dishId: string) {
    setDeletingId(dishId)
    const fd = new FormData()
    fd.append('dishId', dishId)
    const result = await deleteDish({ success: false }, fd)
    setDeletingId(null)
    setConfirmDeleteId(null)
    if (result.success) {
      showToast('success', 'Plato eliminado correctamente.')
      router.refresh()
    } else {
      showToast('error', result.error ?? 'Algo salió mal. Intentá de nuevo.')
    }
  }

  return (
    <div className="flex flex-col gap-6 flex-1">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-titulares">Platos</h1>
        <button
          onClick={openCreate}
          disabled={categories.length === 0}
          className="bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          Nuevo plato
        </button>
      </div>

      {/* No categories warning */}
      {categories.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-brand-acento/40 rounded-lg border border-brand-acento">
          <AlertTriangle size={16} className="text-brand-titulares mt-0.5 shrink-0" />
          <p className="text-sm font-normal text-brand-titulares">
            Primero necesitás crear al menos una categoría antes de agregar platos.
            <Link href="/dashboard/categories" className="font-medium underline ml-1">
              Ir a Categorías
            </Link>
          </p>
        </div>
      )}

      {/* Global empty state */}
      {categories.length > 0 && totalDishes === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-brand-acento flex flex-col items-center justify-center py-16 text-center">
          <UtensilsCrossed size={32} className="text-brand-acento mb-4" />
          <p className="text-base font-medium text-brand-titulares mb-1">Sin platos todavía</p>
          <p className="text-sm font-normal text-brand-texto mb-6">
            Agregá tu primer plato para empezar a armar tu menú.
          </p>
          <button
            onClick={openCreate}
            className="bg-brand-principal text-white text-sm font-medium rounded-lg px-4 py-3 min-h-[44px] hover:bg-[#C2410C] focus:outline-none focus:ring-2 focus:ring-brand-principal focus:ring-offset-2 transition-colors duration-150"
          >
            Nuevo plato
          </button>
        </div>
      )}

      {/* Sections per category */}
      {categories.length > 0 && totalDishes > 0 && (
        <div className="flex flex-col gap-4">
          {categories.map(cat => {
            const catDishes = dishesByCategory[cat._id] ?? []
            return (
              <div
                key={cat._id}
                className="bg-white rounded-lg shadow-sm border border-brand-acento overflow-hidden"
              >
                {/* Category header */}
                <div className="flex items-center justify-between px-4 py-3 bg-brand-fondo border-b border-brand-acento">
                  <h2 className="text-sm font-bold text-brand-titulares">{cat.name}</h2>
                  <span className="text-xs font-light text-brand-texto/60">
                    {catDishes.length} {catDishes.length === 1 ? 'plato' : 'platos'}
                  </span>
                </div>

                {catDishes.length === 0 ? (
                  <p className="text-sm text-brand-texto/50 px-4 py-6 text-center">
                    Sin platos en esta categoría.
                  </p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd(cat._id)}
                  >
                    <SortableContext
                      items={catDishes.map(d => d._id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {catDishes.map(dish => (
                        <SortableDishRow
                          key={dish._id}
                          dish={dish}
                          subcatName={dish.subcategoryId ? subcategoryById[dish.subcategoryId] : undefined}
                          onEdit={() => openEdit(dish)}
                          onDeleteRequest={() => setConfirmDeleteId(dish._id)}
                          onDeleteConfirm={() => handleDelete(dish._id)}
                          onDeleteCancel={() => setConfirmDeleteId(null)}
                          confirmDeleteId={confirmDeleteId}
                          deletingId={deletingId}
                          onToggleError={(msg) => showToast('error', msg)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <DishModal
          mode={editTarget ? 'edit' : 'create'}
          dish={editTarget}
          categories={categories}
          subcategoriesByCategory={subcategoriesByCategory}
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
