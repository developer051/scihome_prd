'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaGraduationCap, FaComment, FaCalendarAlt, FaSchool, FaImage, FaLock, FaUserCircle, FaExclamationTriangle, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

interface RegistrationFormProps {
  courseName?: string;
  courseId?: string;
}

interface Course {
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  level?: string;
}

const gradeLevels = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'เตรียมสอบเข้า'];

export default function RegistrationForm({ courseName, courseId }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gradeLevel: '',
    school: '',
    photo: '',
    course: courseName || '',
    message: '',
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  // ตรวจสอบความตรงกันของรหัสผ่าน
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setPasswordError('รหัสผ่านไม่ตรงกัน');
      } else {
        setPasswordError('');
      }
    } else if (formData.confirmPassword && !formData.password) {
      setPasswordError('');
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ตรวจสอบประเภทไฟล์
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF, WEBP)');
        return;
      }

      // ตรวจสอบขนาดไฟล์ (สูงสุด 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setUploadError('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }

      setPhotoFile(file);
      setUploadError('');

      // สร้าง preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ตรวจสอบความตรงกันของรหัสผ่านก่อนส่ง
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }
    
    setIsSubmitting(true);
    setUploadError('');
    setPasswordError('');

    try {
      let photoUrl = '';

      // อัปโหลดรูปภาพถ้ามี
      if (photoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', photoFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          setUploadError(uploadError.error || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
          setIsSubmitting(false);
          return;
        }

        const uploadData = await uploadResponse.json();
        photoUrl = uploadData.url;
      }

      // ส่งข้อมูลลงทะเบียน
      // ลบ confirmPassword ออกก่อนส่ง
      const { confirmPassword, ...formDataWithoutConfirm } = formData;
      
      const registrationData = {
        ...formDataWithoutConfirm,
        photo: photoUrl,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : '',
        courseId: courseId || '', // เพิ่ม courseId ถ้ามี
      };

      console.log('Sending registration data:', { ...registrationData, password: '***' });

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Registration successful:', responseData);
        setIsSubmitted(true);
        setFormData({
          name: '',
          phone: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          dateOfBirth: '',
          gradeLevel: '',
          school: '',
          photo: '',
          course: courseName || '',
          message: '',
        });
        setPhotoFile(null);
        setPhotoPreview('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setPasswordError('');
      } else {
        console.error('Registration failed:', responseData);
        alert(responseData.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert('เกิดข้อผิดพลาดในการส่งข้อมูล: ' + (error.message || 'กรุณาลองใหม่อีกครั้ง'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-8 md:p-12 text-center shadow-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-lg shadow-green-500/30 animate-fade-in-up">
          <span className="text-white text-4xl font-bold">✓</span>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 animate-fade-in-up animation-delay-200">
          ส่งข้อมูลสำเร็จ!
        </h3>
        <p className="text-gray-600 text-lg animate-fade-in-up animation-delay-400">
          ขอบคุณสำหรับการสมัครเรียน เราจะติดต่อกลับไปในเร็วๆ นี้
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <div className="space-y-5">
        <div className="flex items-center mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
          <h2 className="text-xl font-bold text-gray-900">ข้อมูลส่วนตัว</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaUser className="inline mr-2 text-blue-600" />
              ชื่อ-นามสกุล *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="กรุณากรอกชื่อ-นามสกุล"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaPhone className="inline mr-2 text-blue-600" />
              เบอร์โทรศัพท์ *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="กรุณากรอกเบอร์โทรศัพท์"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaEnvelope className="inline mr-2 text-blue-600" />
            อีเมล *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
            placeholder="กรุณากรอกอีเมล"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaCalendarAlt className="inline mr-2 text-blue-600" />
            วันเดือนปีเกิด *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
          />
        </div>
      </div>

      {/* Account Information Section */}
      <div className="space-y-5 pt-6 border-t border-gray-200 bg-orange-50/50 rounded-xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">ข้อมูลบัญชีผู้ใช้</h2>
            <p className="text-sm text-gray-500 mt-0.5">ใช้สำหรับเข้าสู่ระบบเรียนออนไลน์</p>
          </div>
        </div>

        {/* Simple Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-5">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <span className="font-semibold">กรุณาจดจำข้อมูลนี้ให้ดี</span> - ชื่อผู้ใช้และรหัสผ่านจะใช้สำหรับเข้าสู่ระบบเรียนออนไลน์ กรุณาเก็บรักษาไว้อย่างปลอดภัย
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaUserCircle className="inline mr-2 text-blue-600" />
              ชื่อผู้ใช้ (Username) *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={30}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="กรุณากรอกชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaLock className="inline mr-2 text-blue-600" />
              รหัสผ่าน (Password) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
                placeholder="กรุณากรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaLock className="inline mr-2 text-blue-600" />
            ยืนยันรหัสผ่าน (Confirm Password) *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 bg-white ${
                passwordError 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 hover:border-red-400' 
                  : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300'
              }`}
              placeholder="กรุณากรอกรหัสผ่านอีกครั้งเพื่อยืนยัน"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
              aria-label={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showConfirmPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
            </button>
          </div>
          {passwordError && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
              {passwordError}
            </p>
          )}
          {!passwordError && formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="mt-2 text-sm text-green-600 flex items-center">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
              รหัสผ่านตรงกัน
            </p>
          )}
        </div>
      </div>

      {/* Education Information Section */}
      <div className="space-y-5 pt-6 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
          <h2 className="text-xl font-bold text-gray-900">ข้อมูลการศึกษา</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaGraduationCap className="inline mr-2 text-blue-600" />
              ระดับชั้น *
            </label>
            <select
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 appearance-none cursor-pointer"
            >
              <option value="">เลือกระดับชั้น</option>
              {gradeLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaSchool className="inline mr-2 text-blue-600" />
              โรงเรียน *
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="กรุณากรอกชื่อโรงเรียน"
            />
          </div>
        </div>
      </div>

      {/* Course & Additional Information Section */}
      <div className="space-y-5 pt-6 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
          <h2 className="text-xl font-bold text-gray-900">ข้อมูลเพิ่มเติม</h2>
        </div>

        {!courseName && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaGraduationCap className="inline mr-2 text-blue-600" />
              หลักสูตรที่สนใจ *
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              list="courses-list"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300"
              placeholder="กรุณากรอกหลักสูตรที่สนใจ"
            />
            <datalist id="courses-list">
              {courses.map((course) => (
                <option key={course._id || course.name} value={course.name}>
                  {course.name}
                </option>
              ))}
            </datalist>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaImage className="inline mr-2 text-blue-600" />
            รูปถ่าย
          </label>
          <div className="relative">
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handlePhotoChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {uploadError && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
              {uploadError}
            </p>
          )}
          {photoPreview && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">ตัวอย่างรูปภาพ:</p>
              <img
                src={photoPreview}
                alt="Preview"
                className="max-w-xs max-h-48 rounded-lg border-2 border-gray-300 shadow-md"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaComment className="inline mr-2 text-blue-600" />
            ข้อความเพิ่มเติม
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 resize-none"
            placeholder="กรุณากรอกข้อความเพิ่มเติม (ถ้ามี)"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังส่งข้อมูล...
            </span>
          ) : (
            'สมัครเรียน'
          )}
        </button>
      </div>
    </form>
  );
}
