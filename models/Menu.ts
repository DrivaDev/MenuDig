import { Schema, model, models } from 'mongoose'

const MenuSchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name:         { type: String, required: true },
    startTime:    { type: String, default: null }, // "HH:MM", Argentina UTC-3; null = manual mode
    endTime:      { type: String, default: null }, // "HH:MM", Argentina UTC-3; null = manual mode
    isActive:     { type: Boolean, default: false }, // relevant only in manual mode
    order:        { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Menu = models.Menu || model('Menu', MenuSchema)
