import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  studentName: string;
  message: string;
  image: string;
  course: string;
  rating: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>({
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Testimonial message is required'],
  },
  image: {
    type: String,
    default: '/images/student-default.jpg',
  },
  course: {
    type: String,
    required: [true, 'Course name is required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
