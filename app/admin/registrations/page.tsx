'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';

interface Registration {
  _id: string;
  name: string;
  phone: string;
  email: string;
  username: string;
  dateOfBirth: string;
  gradeLevel: string;
  school: string;
  photo: string;
  course: string;
  courseId?: string;
  allowedCourses?: string[]; // Array of course IDs that the student can enroll in
  message: string;
  status: string;
  createdAt: string;
}

interface Course {
  _id: string;
  name: string;
}

const gradeLevels = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'เตรียมสอบเข้า'];

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  const columns = [
    {
      key: 'photo',
      label: 'รูปถ่าย',
      render: (value: string, row: Registration) => (
        value ? (
          <img
            src={value}
            alt={row.name}
            className="w-12 h-12 object-cover rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/student-default.jpg';
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
            <span className="text-xs">ไม่มีรูป</span>
          </div>
        )
      ),
    },
    {
      key: 'name',
      label: 'ชื่อ-นามสกุล',
    },
    {
      key: 'phone',
      label: 'เบอร์โทรศัพท์',
    },
    {
      key: 'email',
      label: 'อีเมล',
    },
    {
      key: 'username',
      label: 'ชื่อผู้ใช้',
    },
    {
      key: 'dateOfBirth',
      label: 'วันเดือนปีเกิด',
      render: (value: string) => value ? new Date(value).toLocaleDateString('th-TH') : '-',
    },
    {
      key: 'gradeLevel',
      label: 'ระดับชั้น',
    },
    {
      key: 'school',
      label: 'โรงเรียน',
    },
    {
      key: 'course',
      label: 'หลักสูตร',
    },
    {
      key: 'message',
      label: 'ข้อความเพิ่มเติม',
      render: (value: string) => value ? (
        <span className="max-w-xs truncate block" title={value}>
          {value.length > 50 ? `${value.substring(0, 50)}...` : value}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      key: 'status',
      label: 'สถานะ',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'confirmed' ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value === 'confirmed' ? 'ยืนยันแล้ว' :
           value === 'pending' ? 'รอดำเนินการ' : 'ยกเลิก'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'วันที่สมัคร',
      render: (value: string) => new Date(value).toLocaleDateString('th-TH'),
    },
  ];

  useEffect(() => {
    fetchRegistrations();
    fetchCourses();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/registrations');
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleEdit = (registration: Registration) => {
    setEditingRegistration(registration);
    setShowForm(true);
  };

  const handleDelete = async (registration: Registration) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบการสมัครเรียนนี้?')) {
      try {
        const response = await fetch(`/api/registrations/${registration._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchRegistrations();
        } else {
          alert('เกิดข้อผิดพลาดในการลบการสมัครเรียน');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบการสมัครเรียน');
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = `/api/registrations/${editingRegistration?._id}`;
      const method = 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingRegistration(null);
        fetchRegistrations();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRegistration(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-48 rounded mb-4"></div>
          <div className="bg-gray-200 h-96 w-full rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">จัดการการสมัครเรียน</h1>
        </div>

        <DataTable
          data={registrations}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          title="รายการสมัครเรียน"
        />

        {/* Registration Edit Modal */}
        {showForm && editingRegistration && (
          <RegistrationEditForm
            registration={editingRegistration}
            courses={courses}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Registration Edit Form Component
function RegistrationEditForm({ registration, courses, onSubmit, onClose }: {
  registration: Registration;
  courses: Course[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: registration.name || '',
    phone: registration.phone || '',
    email: registration.email || '',
    username: registration.username || '',
    password: '',
    dateOfBirth: registration.dateOfBirth ? new Date(registration.dateOfBirth).toISOString().split('T')[0] : '',
    gradeLevel: registration.gradeLevel || '',
    school: registration.school || '',
    photo: registration.photo || '',
    course: registration.course || '',
    allowedCourses: registration.allowedCourses || [],
    message: registration.message || '',
    status: registration.status || 'pending',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(registration.photo || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCourseCheckboxChange = (courseId: string, checked: boolean) => {
    setFormData((prev) => {
      const currentCourses = prev.allowedCourses || [];
      if (checked) {
        // เพิ่ม course ID ถ้ายังไม่มี
        if (!currentCourses.includes(courseId)) {
          return {
            ...prev,
            allowedCourses: [...currentCourses, courseId],
          };
        }
      } else {
        // ลบ course ID
        return {
          ...prev,
          allowedCourses: currentCourses.filter((id) => id !== courseId),
        };
      }
      return prev;
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    // อัปโหลดไฟล์ทันที
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadErrorData = await uploadResponse.json();
        throw new Error(uploadErrorData.error || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      }

      const uploadData = await uploadResponse.json();
      setFormData({
        ...formData,
        photo: uploadData.url,
      });
      setPhotoPreview(uploadData.url);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      setPhotoFile(null);
      setPhotoPreview(registration.photo || '');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ถ้าไม่มีการเปลี่ยน password ให้ไม่ส่ง password ไป
    const { password, ...submitData } = formData;
    const finalData = password ? { ...submitData, password } : submitData;
    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          แก้ไขข้อมูลการสมัครเรียน
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ-นามสกุล *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์ *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อผู้ใช้ *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันเดือนปีเกิด *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ระดับชั้น *
              </label>
              <select
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">เลือกระดับชั้น</option>
                {gradeLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              โรงเรียน *
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หลักสูตร *
              </label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">เลือกหลักสูตร</option>
                {courses.map((course) => (
                  <option key={course._id} value={course.name}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">รอดำเนินการ</option>
                <option value="confirmed">ยืนยันแล้ว</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รูปถ่าย
            </label>
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handlePhotoChange}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && (
              <p className="mt-2 text-sm text-blue-600">กำลังอัปโหลดรูปภาพ...</p>
            )}
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
            {photoPreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">ตัวอย่างรูปภาพ:</p>
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="max-w-xs max-h-48 rounded-lg border-2 border-gray-300 shadow-md"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ข้อความเพิ่มเติม
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              อัปเดต
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
