import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  name: string;
  image: string;
  education: string;
  expertise: string[];
  experience: number;
  achievements: string[];
  bio: string;
  subjects: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>({
  name: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true,
  },
  image: {
    type: String,
    default: '/images/teacher-default.jpg',
  },
  education: {
    type: String,
    required: [true, 'Education background is required'],
  },
  expertise: [{
    type: String,
    required: true,
  }],
  experience: {
    type: Number,
    required: [true, 'Teaching experience is required'],
    min: 0,
  },
  achievements: [{
    type: String,
  }],
  bio: {
    type: String,
    required: [true, 'Teacher bio is required'],
  },
  subjects: [{
    type: String,
    enum: ['คณิตศาสตร์', 'ภาษาอังกฤษ', 'ฟิสิกส์', 'เคมี', 'ชีววิทยา', 'สังคมศึกษา', 'ภาษาไทย'],
  }],
}, {
  timestamps: true,
});

export default mongoose.models.Teacher || mongoose.model<ITeacher>('Teacher', TeacherSchema);
