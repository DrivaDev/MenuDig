import { Schema, model, models } from 'mongoose'

const SubcategorySchema = new Schema(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    categoryId:   { type: Schema.Types.ObjectId, ref: 'Category',   required: true, index: true },
    name:         { type: String, required: true },
    order:        { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Subcategory = models.Subcategory || model('Subcategory', SubcategorySchema)
