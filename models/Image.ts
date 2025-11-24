import mongoose, { Document, Schema } from 'mongoose';

export interface IImage extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);










