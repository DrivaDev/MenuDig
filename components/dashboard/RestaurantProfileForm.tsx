'use client'

import { useState, useEffect, useActionState } from 'react'
import { Loader2, X } from 'lucide-react'
import { updateRestaurantProfile } from '@/actions/restaurant'

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

async function uploadToCloudinary(file: File): Promise<{ secure_url: string; public_id: string }> {
  const signRes = await fetch('/api/sign-cloudinary-params', { method: 'POST' })
  if (!signRes.ok) throw new Error('sign-failed')
  const { signature, timestamp, api_key, cloud_name } = await signRes.json()

  const body = new FormData()
  body.append('file', file)
  body.append('api_key', api_key)
  body.append('timestamp', String(timestamp))
  body.append('signature', signature)
  body.append('folder', 'menu-digital')

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    { method: 'POST', body }
  )
  if (!uploadRes.ok) throw new Error('upload-failed')
  return uploadRes.json()
}

function ImageUploadField({
  label,
  hint,
  imageUrl,
  onImageChange,
  onRemove,
  disabled,
}: {
  label: string
  hint: string
  imageUrl: string
  onImageChange: (url: string, publicId: string) => void
  onRemove: () => void
  disabled: boolean
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen supera el límite de 5 MB.')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('Formato no permitido. Usá JPG, PNG o WebP.')
      return
    }
    setIsUploading(true)
    setUploadError(null)
    try {
      const data = await uploadToCloudinary(file)
      onImageChange(data.secure_url, data.public_id)
    } catch {
      setUploadError('No pudimos subir la imagen. Verificá tu conexión e intentá de nuevo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-brand-texto">{label}</span>
      {imageUrl && (
        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-brand-acento bg-brand-fondo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            aria-label="Eliminar imagen"
            className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-brand-danger/10 hover:border-brand-danger/50 transition-colors duration-100 disabled:opacity-50"
          >
            <X size={12} className="text-brand-texto" />
          </button>
        </div>
      )}
      <input
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
        <p className="text-xs text-brand-danger" role="alert">{uploadError}</p>
      )}
    </div>
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
      <input type="hidden" name="logoUrl"            value={logoUrl} />
      <input type="hidden" name="logoPublicId"       value={logoPublicId} />
      <input type="hidden" name="clearLogo"          value={clearLogo ? 'true' : 'false'} />
      <input type="hidden" name="heroImageUrl"       value={heroImageUrl} />
      <input type="hidden" name="heroImagePublicId"  value={heroImagePublicId} />
      <input type="hidden" name="clearHeroImage"     value={clearHeroImage ? 'true' : 'false'} />

      {/* Restaurant name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-brand-texto" htmlFor="restaurant-name">
          Nombre del restaurante <span className="text-brand-danger">*</span>
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

      {/* Logo upload */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-brand-texto">Logo del restaurante</span>
        {logoUrl && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-brand-acento bg-brand-fondo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="Logo actual" className="w-full h-full object-contain p-1" />
            <button
              type="button"
              onClick={() => { setLogoUrl(''); setLogoPublicId(''); setClearLogo(true) }}
              disabled={pending}
              aria-label="Eliminar logo"
              className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-brand-danger/10 hover:border-brand-danger/50 transition-colors duration-100 disabled:opacity-50"
            >
              <X size={10} className="text-brand-texto" />
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return
            try {
              const data = await uploadToCloudinary(file)
              setLogoUrl(data.secure_url)
              setLogoPublicId(data.public_id)
              setClearLogo(false)
            } catch { /* handled inline */ }
          }}
          disabled={pending}
          className="block w-full text-sm text-brand-texto file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-brand-acento file:text-sm file:font-medium file:text-brand-titulares file:bg-brand-fondo file:cursor-pointer hover:file:bg-brand-acento/40 transition-colors duration-100 disabled:opacity-50"
        />
        <p className="text-xs font-light text-brand-texto">JPG, PNG o WebP. Máximo 5 MB. Se mostrará como logo en tu menú.</p>
      </div>

      {/* Hero image upload */}
      <ImageUploadField
        label="Imagen de portada (hero)"
        hint="JPG, PNG o WebP. Máximo 5 MB. Se muestra como banner en la parte superior del menú."
        imageUrl={heroImageUrl}
        onImageChange={(url, pid) => { setHeroImageUrl(url); setHeroImagePublicId(pid); setClearHeroImage(false) }}
        onRemove={() => { setHeroImageUrl(''); setHeroImagePublicId(''); setClearHeroImage(true) }}
        disabled={pending}
      />

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-normal text-brand-texto" htmlFor="restaurant-description">
          Descripción <span className="text-sm font-normal text-brand-texto">(opcional)</span>
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
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-brand-texto" htmlFor="whatsapp-url">WhatsApp</label>
          <input
            id="whatsapp-url"
            type="url"
            name="whatsappUrl"
            defaultValue={initialWhatsappUrl}
            placeholder="https://wa.me/5491112345678"
            disabled={pending}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-brand-texto" htmlFor="instagram-url">Instagram</label>
          <input
            id="instagram-url"
            type="url"
            name="instagramUrl"
            defaultValue={initialInstagramUrl}
            placeholder="https://instagram.com/turestaurante"
            disabled={pending}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-brand-texto" htmlFor="facebook-url">Facebook</label>
          <input
            id="facebook-url"
            type="url"
            name="facebookUrl"
            defaultValue={initialFacebookUrl}
            placeholder="https://facebook.com/turestaurante"
            disabled={pending}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-brand-texto" htmlFor="maps-url">Google Maps</label>
          <input
            id="maps-url"
            type="url"
            name="googleMapsUrl"
            defaultValue={initialGoogleMapsUrl}
            placeholder="https://maps.google.com/..."
            disabled={pending}
            className={inputClass}
          />
        </div>
      </div>

      {/* WiFi */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-brand-texto">WiFi</span>
        <div className="flex gap-3">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-medium text-brand-texto" htmlFor="wifi-name">Red</label>
            <input
              id="wifi-name"
              type="text"
              name="wifiName"
              defaultValue={initialWifiName}
              placeholder="Nombre de la red"
              disabled={pending}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-medium text-brand-texto" htmlFor="wifi-password">Contraseña</label>
            <input
              id="wifi-password"
              type="text"
              name="wifiPassword"
              defaultValue={initialWifiPassword}
              placeholder="Contraseña"
              disabled={pending}
              className={inputClass}
            />
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
        <div className="rounded-md bg-brand-danger/10 border border-brand-danger/30 px-4 py-3">
          <p className="text-sm font-medium text-brand-danger" role="alert">{state.error}</p>
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
