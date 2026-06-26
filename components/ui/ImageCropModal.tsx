'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas')
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('no-ctx'))
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height,
      )
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('no-blob'))),
        'image/jpeg',
        0.92,
      )
    })
    image.addEventListener('error', reject)
    image.src = imageSrc
  })
}

interface Props {
  imageSrc: string
  aspectRatio: number
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

export default function ImageCropModal({ imageSrc, aspectRatio, onConfirm, onCancel }: Props) {
  const [crop, setCrop]                             = useState({ x: 0, y: 0 })
  const [zoom, setZoom]                             = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels]   = useState<Area | null>(null)
  const [processing, setProcessing]                 = useState(false)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      onConfirm(blob)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col gap-4 p-5">
        <h3 className="text-sm font-semibold text-brand-texto">Recortá la imagen</h3>

        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-brand-texto shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-brand-principal"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="px-4 py-2 text-sm font-medium text-brand-texto border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-principal rounded-lg hover:bg-[#C2410C] transition-colors disabled:opacity-50"
          >
            {processing ? 'Procesando...' : 'Confirmar recorte'}
          </button>
        </div>
      </div>
    </div>
  )
}
