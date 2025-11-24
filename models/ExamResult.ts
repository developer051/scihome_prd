import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IExamResult extends Document {
  studentId: Types.ObjectId;
  examId: Types.ObjectId;
  score: number;
  totalScore: number;
  percentage: number;
  isPassed: boolean;
  answers: (string | string[])[];
  completedAt: Date;
  timeSpent: number; // เวลาที่ใช้ทำข้อสอบ (วินาที)
  createdAt: Date;
  updatedAt: Date;
}

const ExamResultSchema = new Schema<IExamResult>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'StudentManagement',
    required: [true, 'Student ID is required'],
    index: true,
  },
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam ID is required'],
    index: true,
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: 0,
  },
  totalScore: {
    type: Number,
    required: [true, 'Total score is required'],
    min: 1,
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: 0,
    max: 100,
  },
  isPassed: {
    type: Boolean,
    required: [true, 'isPassed is required'],
    default: false,
  },
  answers: {
    type: [Schema.Types.Mixed],
    required: [true, 'Answers are required'],
  },
  completedAt: {
    type: Date,
    default: Date.now,
    required: [true, 'Completed date is required'],
    index: true,
  },
  timeSpent: {
    type: Number,
    required: [true, 'Time spent is required'],
    min: 0,
  },
}, {
  timestamps: true,
});

// เพิ่ม indexes สำหรับการค้นหาที่เร็วขึ้น
ExamResultSchema.index({ studentId: 1, completedAt: -1 }); // Index สำหรับค้นหาตาม student และเรียงตามวันที่
ExamResultSchema.index({ examId: 1, completedAt: -1 }); // Index สำหรับค้นหาตาม exam และเรียงตามวันที่
ExamResultSchema.index({ studentId: 1, examId: 1 }); // Index สำหรับค้นหาตาม student และ exam
ExamResultSchema.index({ completedAt: -1 }); // Index สำหรับเรียงตามวันที่ทำข้อสอบ

// ลบ model ที่ถูก cache ไว้ใน development mode เพื่อให้ใช้ schema ใหม่
if (mongoose.models.ExamResult) {
  delete mongoose.models.ExamResult;
}

export default mongoose.model<IExamResult>('ExamResult', ExamResultSchema, 'examResults');

