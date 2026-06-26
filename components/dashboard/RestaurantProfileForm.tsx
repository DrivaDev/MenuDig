'use client'

import { useState, useEffect, useActionState, useRef } from 'react'
import { Loader2, X } from 'lucide-react'
import { updateRestaurantProfile } from '@/actions/restaurant'
import ImageCropModal from '@/components/ui/ImageCropModal'

interface Props {
  initialName: string
  initialLogoUrl: string
  initialLogoPublicId: string
  initialDescription: string
  initialHeroImageUrl: string
  initialHeroImagePublicId: string
  initialWhatsappUrl: string
  initialInstagramUrl: string
  initialFacebookUrl: string
  initialGoogleMapsUrl: string
  initialWifiName: string
  initialWifiPassword: string
}

const initialState = { success: false as boolean, error: undefined as string | undefined }

async function uploadToCloudinary(file: Blob | File): Promise<{ secure_url: string; public_id: string }> {
  const signRes = await fetch('/api/sign-cloudinary-params', { method: 'POST' })
  if (!signRes.ok) throw new Error('sign-failed')
  const { signature, timestamp, api_key, cloud_name } = await signRes.json()

  const body = new FormData()
  body.append('file', file, 'image.jpg')
  body.append('api_key', api_key)
  body.append('timestamp', String(timestamp))
  body.append('signature', signature)
  body.append('folder', 'menu-digital')

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    { method: 'POST', body },
  )
  if (!uploadRes.ok) throw new Error('upload-failed')
  return uploadRes.json()
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function validateImageFile(file: File): string | null {
  if (file.size > 5 * 1024 * 1024) return 'La imagen supera el límite de 5 MB.'
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Formato no permitido. Usá JPG, PNG o WebP.'
  return null
}

interface CropUploadFieldProps {
  label: string
  hint: string
  aspectRatio: number
  imageUrl: string
  previewVariant: 'circle' | 'banner'
  onImageChange: (url: string, publicId: string) => void
  onRemove: () => void
  disabled: boolean
}

function CropUploadField({
  label, hint, aspectRatio, imageUrl, previewVariant, onImageChange, onRemove, disabled,
}: CropUploadFieldProps) {
  const inputRef                                      = useRef<HTMLInputElement>(null)
  const [pendingSrc, setPendingSrc]                   = useState<string | null>(null)
  const [isUploading, setIsUploading]                 = useState(false)
  const [uploadError, setUploadError]                 = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { setUploadError(err); return }
    setUploadError(null)
    const dataUrl = await readFileAsDataUrl(file)
    setPendingSrc(dataUrl)
    // reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleCropConfirm(blob: Blob) {
    setIsUploading(true)
    setPendingSrc(null)
    try {
      const data = await uploadToCloudinary(blob)
      onImageChange(data.secure_url, data.public_id)
    } catch {
      setUploadError('No pudimos subir la imagen. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      {pendingSrc && (
        <ImageCropModal
          imageSrc={pendingSrc}
          aspectRatio={aspectRatio}
          onConfirm={handleCropConfirm}
          onCancel={() => setPendingSrc(null)}
        />
      )}

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-brand-texto">{label}</span>

        {imageUrl && (
          <div className={`relative overflow-hidden border border-brand-acento bg-brand-fondo ${previewVariant === 'circle' ? 'w-24 h-24 rounded-full' : 'w-full h-32 rounded-lg'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={onRemove}
              disabled={disabled}
              aria-label="Eliminar imagen"
              className="absolute top-1.5 right-1.5 flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
            >
              <X size={10} className="text-brand-texto" />
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading || disabled}
          className="block w-full text-sm text-brand-texto file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-brand-acento file:text-sm file:font-medium file:text-brand-titulares file:bg-brand-fondo file:cursor-pointer hover:file:bg-brand-acento/40 transition-colors duration-100 disabled:opacity-50"
        />
        <p className="text-xs font-light text-brand-texto">{hint}</p>

        {isUploading && (
          <div className="flex items-center gap-2 text-xs text-brand-texto">
            <Loader2 size={12} className="animate-spin text-brand-principal" />
            Subiendo imagen...
          </div>
        )}
        {uploadError && (
          <p className="text-xs text-red-500" role="alert">{uploadError}</p>
        )}
      </div>
    </>
  )
}

export default function RestaurantProfileForm({
  initialName,
  initialLogoUrl,
  initialLogoPublicId,
  initialDescription,
  initialHeroImageUrl,
  initialHeroImagePublicId,
  initialWhatsappUrl,
  initialInstagramUrl,
  initialFacebookUrl,
  initialGoogleMapsUrl,
  initialWifiName,
  initialWifiPassword,
}: Props) {
  const [state, formAction, pending] = useActionState(updateRestaurantProfile, initialState)

  const [logoUrl, setLogoUrl]           = useState(initialLogoUrl)
  const [logoPublicId, setLogoPublicId] = useState(initialLogoPublicId)
  const [clearLogo, setClearLogo]       = useState(false)

  const [heroImageUrl, setHeroImageUrl]           = useState(initialHeroImageUrl)
  const [heroImagePublicId, setHeroImagePublicId] = useState(initialHeroImagePublicId)
  const [clearHeroImage, setClearHeroImage]       = useState(false)

  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (state.success) {
      setSuccessMsg('Perfil actualizado correctamente.')
      const t = setTimeout(() => setSuccessMsg(null), 4000)
      return () => clearTimeout(t)
    }
  }, [state])

  const inputClass =
    'w-full border border-gray-200 rounded-md px-3 py-3 text-sm font-normal text-brand-texto bg-white placeholder:text-gray-400 focus:outline-none focus:border-brand-principal focus:ring-1 focus:ring-brand-principal transition-colors duration-100 disabled:border-gray-100 disabled:bg-gray-50'

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* Hidden image fields */}
      <input type="hidden" name="logoUrl"           value={logoUrl} />
      <input type="hidden" name="logoPublicId"      value={logoPublicId} />
      <input type="hidden" name="clearLogo"         value={clearLogo ? 'true' : 'false'} />
      <input type="hidden" name="heroImageUrl"      value={heroImageUrl} />
      <input type="hidden" name="heroImagePublicId" value={heroImagePublicId} />
      <input type="hidden" name="clearHeroImage"    value={clearHeroImage ? 'true' : 'false'} />

      {/* Restaurant name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-brand-texto" htmlFor="restaurant-name">
          Nombre del restaurante <span className="text-red-500">*</span>
        </label>
        <input
          id="restaurant-name"
          type="text"
          name="name"
          defaultValue={initialName}
          placeholder="Ej. La Trattoria"
          disabled={pending}
          className={inputClass}
        />
      </div>

      {/* Logo */}
      <CropUploadField
        label="Logo del restaurante"
        hint="JPG, PNG o WebP · Máx 5 MB · Se mostrará como logo circular en tu menú."
        aspectRatio={1}
        imageUrl={logoUrl}
        previewVariant="circle"
        onImageChange={(url, pid) => { setLogoUrl(url); setLogoPublicId(pid); setClearLogo(false) }}
        onRemove={() => { setLogoUrl(''); setLogoPublicId(''); setClearLogo(true) }}
        disabled={pending}
      />

      {/* Hero image */}
      <CropUploadField
        label="Imagen de portada (hero)"
        hint="JPG, PNG o WebP · Máx 5 MB · Se muestra como banner en la parte superior del menú."
        aspectRatio={16 / 9}
        imageUrl={heroImageUrl}
        previewVariant="banner"
        onImageChange={(url, pid) => { setHeroImageUrl(url); setHeroImagePublicId(pid); setClearHeroImage(false) }}
        onRemove={() => { setHeroImageUrl(''); setHeroImagePublicId(''); setClearHeroImage(true) }}
        disabled={pending}
      />

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-normal text-brand-texto" htmlFor="restaurant-description">
          Descripción <span className="text-sm text-brand-texto/60">(opcional)</span>
        </label>
        <textarea
          id="restaurant-description"
          name="description"
          defaultValue={initialDescription}
          placeholder="Ej. Cocina italiana casera en el corazón de Palermo..."
          maxLength={200}
          rows={3}
          disabled={pending}
          className={`${inputClass} resize-none`}
        />
        <p className="text-sm font-normal text-brand-texto">Máximo 200 caracteres.</p>
      </div>

      {/* Social links */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-brand-texto">Redes sociales y contacto</span>
        {[
          { id: 'whatsapp-url',  name: 'whatsappUrl',   label: 'WhatsApp',    placeholder: 'https://wa.me/5491112345678',         defaultValue: initialWhatsappUrl  },
          { id: 'instagram-url', name: 'instagramUrl',  label: 'Instagram',   placeholder: 'https://instagram.com/turestaurante', defaultValue: initialInstagramUrl },
          { id: 'facebook-url',  name: 'facebookUrl',   label: 'Facebook',    placeholder: 'https://facebook.com/turestaurante',  defaultValue: initialFacebookUrl  },
          { id: 'maps-url',      name: 'googleMapsUrl', label: 'Google Maps', placeholder: 'https://maps.google.com/...',          defaultValue: initialGoogleMapsUrl },
        ].map(f => (
          <div key={f.id} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-texto" htmlFor={f.id}>{f.label}</label>
            <input id={f.id} type="url" name={f.name} defaultValue={f.defaultValue} placeholder={f.placeholder} disabled={pending} className={inputClass} />
          </div>
        ))}
      </div>

      {/* WiFi */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-brand-texto">WiFi</span>
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium text-brand-texto" htmlFor="wifi-name">Red</label>
            <input id="wifi-name" type="text" name="wifiName" defaultValue={initialWifiName} placeholder="Nombre de la red" disabled={pending} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium text-brand-texto" htmlFor="wifi-password">Contraseña</label>
            <input id="wifi-password" type="text" name="wifiPassword" defaultValue={initialWifiPassword} placeholder="Contraseña" disabled={pending} className={inputClass} />
          </div>
        </div>
        <p className="text-xs font-light text-brand-texto">Si completás ambos campos, se mostrará en el menú.</p>
      </div>

      {/* Feedback banners */}
      {successMsg && (
        <div className="rounded-md bg-brand-acento/30 border border-brand-acento px-4 py-3">
          <p className="text-sm font-medium text-brand-titulares">{successMsg}</p>
        </div>
      )}
      {state.error && !state.success && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm font-medium text-red-600" role="alert">{state.error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end pt-2">
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
            'Guardar cambios'
          )}
        </button>
      </div>
    </form>
  )
}
