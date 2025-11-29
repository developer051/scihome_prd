import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentAchievement extends Document {
  image: string;
  title: string;
  description: string;
  studentName?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentAchievementSchema = new Schema<IStudentAchievement>({
  image: {
    type: String,
    required: [true, 'Image is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  studentName: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.StudentAchievement || mongoose.model<IStudentAchievement>('StudentAchievement', StudentAchievementSchema);


