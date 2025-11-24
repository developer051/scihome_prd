import mongoose, { Document, Schema } from 'mongoose';

export interface IRegistration extends Document {
  name: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  role: 'user' | 'admin';
  dateOfBirth: Date;
  gradeLevel: string;
  school: string;
  photo: string;
  course: string;
  courseId?: string;
  allowedCourses?: string[]; // Array of course IDs that the student can enroll in
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Name must not exceed 100 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(value: string) {
        // รองรับรูปแบบเบอร์โทรศัพท์ไทย: 9-10 หลัก, อาจมี - หรือ space
        const cleaned = value.replace(/[\s\-]/g, '');
        return /^[0-9]{9,10}$/.test(cleaned);
      },
      message: 'Please enter a valid phone number (9-10 digits)',
    },
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true, // เพิ่ม unique constraint สำหรับ email
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    maxlength: [100, 'Email must not exceed 100 characters'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must not exceed 30 characters'],
    match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // ไม่ให้ส่ง password กลับมาโดยอัตโนมัติ
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Role must be either user or admin',
    },
    default: 'user',
    lowercase: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value: Date) {
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        const monthDiff = today.getMonth() - value.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < value.getDate())) {
          return age - 1 >= 5 && age - 1 <= 100; // อายุระหว่าง 5-100 ปี
        }
        return age >= 5 && age <= 100;
      },
      message: 'Date of birth must be valid and age must be between 5 and 100 years',
    },
  },
  gradeLevel: {
    type: String,
    required: [true, 'Grade level is required'],
    enum: {
      values: ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'เตรียมสอบเข้า'],
      message: 'Grade level must be one of: ม.1, ม.2, ม.3, ม.4, ม.5, ม.6, เตรียมสอบเข้า',
    },
  },
  school: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
    maxlength: [200, 'School name must not exceed 200 characters'],
  },
  photo: {
    type: String,
    default: '',
    validate: {
      validator: function(value: any) {
        // ถ้าไม่มีรูปหรือเป็น empty string, null, undefined ก็ไม่เป็นไร
        if (!value || value === '' || value === null || value === undefined) {
          return true;
        }
        
        // แปลงเป็น string ก่อนตรวจสอบ
        const strValue = String(value).trim();
        if (strValue === '') {
          return true;
        }
        
        // รองรับ relative path ที่เป็น API endpoint (/api/images/{id})
        // MongoDB ObjectId เป็น 24 ตัวอักษร hexadecimal (0-9, a-f)
        // รองรับทั้ง ObjectId และรูปแบบอื่นๆ ที่อาจมี รวมถึง query string
        const apiImagePattern = /^\/api\/images\/[a-zA-Z0-9_-]+(\?.*)?$/;
        if (apiImagePattern.test(strValue)) {
          return true;
        }
        
        // รองรับ data URL (base64 images)
        const dataUrlPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
        if (dataUrlPattern.test(strValue)) {
          return true;
        }
        
        // รองรับ full URL ที่เป็นรูปภาพ
        // รูปแบบ 1: URL ที่ลงท้ายด้วยนามสกุลไฟล์รูปภาพ
        const fullUrlPattern1 = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
        if (fullUrlPattern1.test(strValue)) {
          return true;
        }
        
        // รูปแบบ 2: URL ที่มีนามสกุลไฟล์รูปภาพใน path
        const fullUrlPattern2 = /^https?:\/\/.+\/([^\/]+\.(jpg|jpeg|png|gif|webp))(\?.*)?$/i;
        if (fullUrlPattern2.test(strValue)) {
          return true;
        }
        
        // รูปแบบ 3: URL ที่ไม่มีนามสกุลไฟล์แต่เป็น image service (เช่น Cloudinary, Imgur)
        const fullUrlPattern3 = /^https?:\/\/[^\s]+$/i;
        if (fullUrlPattern3.test(strValue)) {
          return true;
        }
        
        // ถ้าไม่ผ่านเงื่อนไขใดๆ ให้ return false
        return false;
      },
      message: 'Photo URL must be a valid image URL (relative path /api/images/... or full URL) or empty',
    },
  },
  course: {
    type: String,
    required: [true, 'Course selection is required'],
    trim: true,
    maxlength: [200, 'Course name must not exceed 200 characters'],
  },
  courseId: {
    type: String,
    trim: true,
    default: '',
  },
  allowedCourses: {
    type: [String],
    default: [],
    validate: {
      validator: function(value: string[]) {
        // อนุญาตให้เป็น array ว่างหรือ array ที่มี course IDs
        return Array.isArray(value);
      },
      message: 'Allowed courses must be an array of course IDs',
    },
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message must not exceed 1000 characters'],
    default: '',
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'cancelled'],
      message: 'Status must be one of: pending, confirmed, cancelled',
    },
    default: 'pending',
    index: true, // เพิ่ม index สำหรับการค้นหาตาม status
  },
}, {
  timestamps: true,
});

// เพิ่ม indexes สำหรับการค้นหาที่เร็วขึ้น
// หมายเหตุ: email และ username มี unique: true ใน field definition แล้ว ไม่ต้องสร้าง index ซ้ำ
RegistrationSchema.index({ status: 1, createdAt: -1 }); // Index สำหรับค้นหาตาม status และเรียงตามวันที่
RegistrationSchema.index({ course: 1 }); // Index สำหรับค้นหาตาม course
RegistrationSchema.index({ courseId: 1 }); // Index สำหรับค้นหาตาม courseId
RegistrationSchema.index({ createdAt: -1 }); // Index สำหรับเรียงตามวันที่สร้าง
RegistrationSchema.index({ phone: 1 }); // Index สำหรับค้นหาตามเบอร์โทรศัพท์

// ลบ model ที่ถูก cache ไว้ใน development mode เพื่อให้ใช้ schema ใหม่
if (mongoose.models.StudentManagement) {
  delete mongoose.models.StudentManagement;
}

export default mongoose.model<IRegistration>('StudentManagement', RegistrationSchema, 'studentmanagement');
