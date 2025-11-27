import mongoose, { Document, Schema } from 'mongoose';

export interface ISubLesson {
  title: string;
  description: string;
  order: number;
  duration: string;
  youtubeLink?: string;
}

export interface ILesson {
  title: string;
  description: string;
  order: number;
  subLessons: ISubLesson[];
  youtubeLink?: string;
}

export interface ICourse extends Document {
  name: string;
  description: string;
  category: string; // Keep for backward compatibility
  level: string; // Keep for backward compatibility
  sectionId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  price: number;
  schedule: string;
  image: string;
  duration: string;
  maxStudents: number;
  isOnline: boolean;
  isOnsite: boolean;
  isActive: boolean;
  endDate?: Date;
  lessons: ILesson[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
  },
  category: {
    type: String,
    required: false,
    enum: ['คณิตศาสตร์', 'ภาษาอังกฤษ', 'ฟิสิกส์', 'เคมี', 'ชีววิทยา', 'สังคมศึกษา', 'ภาษาไทย'],
    default: null,
  },
  level: {
    type: String,
    required: false,
    enum: ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'เตรียมสอบเข้า'],
    default: null,
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: 0,
  },
  schedule: {
    type: String,
    required: [true, 'Course schedule is required'],
  },
  image: {
    type: String,
    default: '/images/course-default.jpg',
  },
  duration: {
    type: String,
    required: [true, 'Course duration is required'],
  },
  maxStudents: {
    type: Number,
    default: 20,
    min: 1,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  isOnsite: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sectionId: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    default: null,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  lessons: {
    type: [{
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        default: '',
      },
      order: {
        type: Number,
        required: true,
        min: 0,
      },
      youtubeLink: {
        type: String,
        default: '',
        trim: true,
      },
      subLessons: {
        type: [{
          title: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            default: '',
          },
          order: {
            type: Number,
            required: true,
            min: 0,
          },
          duration: {
            type: String,
            default: '',
          },
          youtubeLink: {
            type: String,
            default: '',
            trim: true,
          },
        }],
        default: [],
      },
    }],
    default: [],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
