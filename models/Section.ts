import mongoose, { Document, Schema } from 'mongoose';

export interface ISection extends Document {
  name: string;
  description: string;
  order: number;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<ISection>({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    required: [true, 'Section order is required'],
    min: 0,
  },
  endDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Section || mongoose.model<ISection>('Section', SectionSchema);







