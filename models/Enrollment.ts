import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  enrolledAt: Date;
  enrollmentDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'StudentManagement',
    required: [true, 'Student ID is required'],
    index: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
    index: true,
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'cancelled', 'completed'],
      message: 'Status must be one of: pending, confirmed, cancelled, completed',
    },
    default: 'pending',
    index: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
    required: [true, 'Enrollment date is required'],
  },
  enrollmentDate: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes must not exceed 1000 characters'],
    default: '',
  },
}, {
  timestamps: true,
});

// เพิ่ม unique compound index เพื่อป้องกันการลงทะเบียนซ้ำ (student + course)
EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// เพิ่ม indexes สำหรับการค้นหาที่เร็วขึ้น
EnrollmentSchema.index({ status: 1, enrolledAt: -1 }); // Index สำหรับค้นหาตาม status และเรียงตามวันที่
EnrollmentSchema.index({ enrolledAt: -1 }); // Index สำหรับเรียงตามวันที่ลงทะเบียน
EnrollmentSchema.index({ courseId: 1, status: 1 }); // Index สำหรับค้นหาตาม course และ status
EnrollmentSchema.index({ studentId: 1, status: 1 }); // Index สำหรับค้นหาตาม student และ status

// ลบ model ที่ถูก cache ไว้ใน development mode เพื่อให้ใช้ schema ใหม่
if (mongoose.models.Enrollment) {
  delete mongoose.models.Enrollment;
}

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema, 'enrollments');

