import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  questionText: string;
  questionType: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[]; // สำหรับ multiple-choice
  correctAnswer: string | string[]; // สำหรับ multiple-choice และ true-false จะเป็น string, สำหรับ short-answer อาจเป็น array
  points: number;
  explanation?: string;
}

export interface IExam extends Document {
  title: string;
  courseId: mongoose.Types.ObjectId;
  description: string;
  questions: IQuestion[];
  duration: number; // เวลาในการทำข้อสอบ (นาที)
  totalScore: number; // คะแนนเต็ม
  passingScore?: number; // คะแนนผ่าน
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
  },
  questionType: {
    type: String,
    required: [true, 'Question type is required'],
    enum: ['multiple-choice', 'true-false', 'short-answer'],
  },
  options: {
    type: [String],
    required: function(this: IQuestion) {
      return this.questionType === 'multiple-choice';
    },
  },
  correctAnswer: {
    type: Schema.Types.Mixed,
    required: [true, 'Correct answer is required'],
  },
  points: {
    type: Number,
    required: [true, 'Points is required'],
    min: 1,
    default: 1,
  },
  explanation: {
    type: String,
  },
}, { _id: false });

const ExamSchema = new Schema<IExam>({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
  },
  description: {
    type: String,
    required: [true, 'Exam description is required'],
  },
  questions: {
    type: [QuestionSchema],
    required: [true, 'Questions are required'],
    validate: {
      validator: function(questions: IQuestion[]) {
        return questions.length > 0;
      },
      message: 'Exam must have at least one question',
    },
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: 1,
  },
  totalScore: {
    type: Number,
    required: [true, 'Total score is required'],
    min: 1,
  },
  passingScore: {
    type: Number,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Calculate totalScore from questions if not provided
ExamSchema.pre('save', function(next) {
  if (this.isModified('questions') && this.questions.length > 0) {
    this.totalScore = this.questions.reduce((sum, q) => sum + q.points, 0);
  }
  next();
});

export default mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);








