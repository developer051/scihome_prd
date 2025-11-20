import mongoose, { Document, Schema } from 'mongoose';

export interface INews extends Document {
  title: string;
  content: string;
  image: string;
  author: string;
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>({
  title: {
    type: String,
    required: [true, 'News title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'News content is required'],
  },
  image: {
    type: String,
    default: '/images/news-default.jpg',
  },
  author: {
    type: String,
    required: [true, 'News author is required'],
    trim: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.News || mongoose.model<INews>('News', NewsSchema);
