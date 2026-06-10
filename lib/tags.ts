export const TAGS = [
  { key: 'apto_diabeticos',   label: 'Apto diabéticos',   type: 'suitable' as const },
  { key: 'apto_hipertensos',  label: 'Apto hipertensos',  type: 'suitable' as const },
  { key: 'apto_celiacs',      label: 'Apto celíacos',     type: 'suitable' as const },
  { key: 'apto_veganos',      label: 'Vegano',            type: 'suitable' as const },
  { key: 'apto_vegetarianos', label: 'Vegetariano',       type: 'suitable' as const },
  { key: 'sin_lactosa',       label: 'Sin lactosa',       type: 'suitable' as const },
  { key: 'organico',          label: 'Orgánico',          type: 'warning' as const },
  { key: 'picante',           label: 'Picante',           type: 'warning' as const },
  { key: 'muy_picante',       label: 'Muy picante',       type: 'warning' as const },
] as const

export type TagKey = typeof TAGS[number]['key']
