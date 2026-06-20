import { Schema, model, models } from 'mongoose'

const PromoCodeSchema = new Schema(
  {
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount_type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value:         { type: Number, required: true, min: 0 },
    applies_to:    { type: String, enum: ['new', 'active', 'both'], required: true, default: 'both' },
    max_uses:      { type: Number, default: null },  // null = unlimited
    uses_count:    { type: Number, default: 0 },
    expires_at:    { type: Date,   default: null },
    is_active:     { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const PromoCode = models.PromoCode || model('PromoCode', PromoCodeSchema)
