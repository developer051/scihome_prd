import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
  sectionId: mongoose.Types.ObjectId;
  order: number;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  sectionId: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section ID is required'],
  },
  order: {
    type: Number,
    required: [true, 'Category order is required'],
    min: 0,
  },
  endDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);








