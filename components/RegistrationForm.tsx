'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaGraduationCap, FaComment, FaCalendarAlt, FaSchool, FaImage, FaLock, FaUserCircle, FaExclamationTriangle, FaKey, FaEye, FaEyeSlash, FaRocket } from 'react-icons/fa';

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
    nickname: '',
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
          nickname: '',
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
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full mb-6 shadow-2xl shadow-green-500/40 animate-fade-in-up transform hover:scale-110 transition-transform duration-300">
            <span className="text-white text-5xl md:text-6xl font-bold">✓</span>
          </div>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 animate-fade-in-up animation-delay-200">
            ส่งข้อมูลสำเร็จ! 🎉
          </h3>
          <p className="text-gray-700 text-base md:text-lg font-medium animate-fade-in-up animation-delay-400 leading-relaxed">
            ขอบคุณสำหรับการสมัครเรียน เราจะติดต่อกลับไปในเร็วๆ นี้
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/30"></div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            ข้อมูลส่วนตัว
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
              <FaUser className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
              <span>ชื่อ-นามสกุล <span className="text-blue-600">*</span></span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md"
              placeholder="กรุณากรอกชื่อ-นามสกุล"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
              <FaUser className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
              <span>ชื่อเล่น</span>
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md"
              placeholder="กรุณากรอกชื่อเล่น (ถ้ามี)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
              <FaPhone className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
              <span>เบอร์โทรศัพท์ <span className="text-blue-600">*</span></span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md"
              placeholder="กรุณากรอกเบอร์โทรศัพท์"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
              <FaEnvelope className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
              <span>อีเมล <span className="text-blue-600">*</span></span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md"
              placeholder="กรุณากรอกอีเมล"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
            <span>วันเดือนปีเกิด <span className="text-blue-600">*</span></span>
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      {/* Account Information Section */}
      <div className="space-y-6 pt-8 border-t-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-blue-50/30 rounded-2xl p-6 md:p-8 shadow-inner">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/30"></div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              ข้อมูลบัญชีผู้ใช้
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-medium">ใช้สำหรับเข้าสู่ระบบเรียนออนไลน์</p>
          </div>
        </div>

        {/* Modern Notice Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-xl p-4 md:p-5 mb-6 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <FaExclamationTriangle className="text-white text-sm" />
              </div>
            </div>
            <div>
              <p className="text-sm md:text-base text-gray-800 leading-relaxed">
                <span className="font-bold text-blue-700">💡 กรุณาจดจำข้อมูลนี้ให้ดี</span> - ชื่อผู้ใช้และรหัสผ่านจะใช้สำหรับเข้าสู่ระบบเรียนออนไลน์ กรุณาเก็บรักษาไว้อย่างปลอดภัย
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
              <FaUserCircle className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
              <span>ชื่อผู้ใช้ (Username) <span className="text-blue-600">*</span></span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={30}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md"
              placeholder="กรุณากรอกชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
              <FaLock className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
              <span>รหัสผ่าน (Password) <span className="text-blue-600">*</span></span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md"
                placeholder="กรุณากรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors duration-200 p-1 rounded-lg hover:bg-blue-50"
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
              >
                {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
            <FaLock className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
            <span>ยืนยันรหัสผ่าน (Confirm Password) <span className="text-blue-600">*</span></span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className={`w-full px-4 py-3.5 pr-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 bg-white shadow-sm hover:shadow-md ${
                passwordError 
                  ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500 hover:border-red-400' 
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-green-300 focus:ring-green-500/50 focus:border-green-500 hover:border-green-400'
                  : 'border-gray-200 focus:ring-blue-500/50 focus:border-blue-500 hover:border-blue-300'
              }`}
              placeholder="กรุณากรอกรหัสผ่านอีกครั้งเพื่อยืนยัน"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none transition-colors duration-200 p-1 rounded-lg hover:bg-blue-50"
              aria-label={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
            >
              {showConfirmPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
            </button>
          </div>
          {passwordError && (
            <p className="mt-2.5 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-red-100 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              </span>
              <span className="font-medium">{passwordError}</span>
            </p>
          )}
          {!passwordError && formData.confirmPassword && formData.password === formData.confirmPassword && (
            <p className="mt-2.5 text-sm text-green-600 flex items-center gap-2 animate-fade-in">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </span>
              <span className="font-medium">✓ รหัสผ่านตรงกัน</span>
            </p>
          )}
        </div>
      </div>

      {/* Education Information Section */}
      <div className="space-y-6 pt-8 border-t-2 border-blue-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/30"></div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            ข้อมูลการศึกษา
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
              <FaGraduationCap className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
              <span>ระดับชั้น <span className="text-blue-600">*</span></span>
            </label>
            <select
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.75rem_center] bg-no-repeat pr-10"
            >
              <option value="">เลือกระดับชั้น</option>
              {gradeLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
              <FaSchool className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
              <span>โรงเรียน <span className="text-blue-600">*</span></span>
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md"
              placeholder="กรุณากรอกชื่อโรงเรียน"
            />
          </div>
        </div>
      </div>

      {/* Course & Additional Information Section */}
      <div className="space-y-6 pt-8 border-t-2 border-blue-200">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1.5 h-10 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/30"></div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            ข้อมูลเพิ่มเติม
          </h2>
        </div>

        {!courseName && (
          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
              <FaGraduationCap className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
              <span>หลักสูตรที่สนใจ <span className="text-blue-600">*</span></span>
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
              list="courses-list"
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md"
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

        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
            <FaImage className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
            <span>รูปถ่าย</span>
          </label>
          <div className="relative">
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handlePhotoChange}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 shadow-sm hover:shadow-md cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-blue-600 file:text-white hover:file:from-blue-600 hover:file:to-blue-700 file:transition-all file:duration-300 file:shadow-md"
            />
          </div>
          {uploadError && (
            <p className="mt-2.5 text-sm text-red-600 flex items-center gap-2 animate-fade-in">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-red-100 rounded-full">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              </span>
              <span className="font-medium">{uploadError}</span>
            </p>
          )}
          {photoPreview && (
            <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 shadow-md">
              <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaImage className="text-blue-500" />
                ตัวอย่างรูปภาพ:
              </p>
              <img
                src={photoPreview}
                alt="Preview"
                className="max-w-xs max-h-48 rounded-xl border-2 border-blue-300 shadow-lg object-cover"
              />
            </div>
          )}
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-gray-800 mb-2.5 flex items-center gap-2">
            <FaComment className="text-blue-600 group-focus-within:text-blue-500 transition-colors" />
            <span>ข้อความเพิ่มเติม</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 bg-white hover:border-blue-300 resize-none shadow-sm hover:shadow-md"
            placeholder="กรุณากรอกข้อความเพิ่มเติม (ถ้ามี)"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white py-4 md:py-5 px-6 rounded-2xl font-bold text-base md:text-lg hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group"
        >
          {/* Animated background gradient */}
          <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          
          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>กำลังส่งข้อมูล...</span>
              </>
            ) : (
              <>
                <FaRocket className="text-lg animate-bounce" />
                <span>สมัครเรียน</span>
              </>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
