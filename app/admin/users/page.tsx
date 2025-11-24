'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaTimes } from 'react-icons/fa';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';

interface User {
  _id: string;
  name: string;
  phone: string;
  email: string;
  username: string;
  role?: 'user' | 'admin';
  dateOfBirth: string;
  gradeLevel: string;
  school: string;
  photo: string;
  course: string;
  status: string;
  createdAt: string;
}

interface NewUserForm {
  name: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'admin';
  dateOfBirth: string;
  gradeLevel: string;
  school: string;
  photo: string;
  course: string;
  courseId: string;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const gradeLevels = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6', 'เตรียมสอบเข้า'];
const statusOptions: Array<{ value: 'pending' | 'confirmed' | 'cancelled'; label: string }> = [
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
];
const roleOptions: Array<{ value: 'user' | 'admin'; label: string; description: string }> = [
  { value: 'user', label: 'ผู้เรียน', description: 'เข้าถึงเฉพาะแดชบอร์ดผู้ใช้' },
  { value: 'admin', label: 'ผู้ดูแลระบบ', description: 'เข้าถึงหน้าแอดมินเพื่อจัดการข้อมูล' },
];
const initialFormState: NewUserForm = {
  name: '',
  phone: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'user',
  dateOfBirth: '',
  gradeLevel: 'ม.3',
  school: '',
  photo: '',
  course: '',
  courseId: '',
  message: '',
  status: 'pending',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState<NewUserForm>(initialFormState);

  const columns = useMemo(
    () => [
      {
        key: 'photo',
        label: 'รูปถ่าย',
        render: (value: string, row: User) =>
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
          ),
      },
      {
        key: 'name',
        label: 'ชื่อ-นามสกุล',
      },
      {
        key: 'email',
        label: 'อีเมล',
      },
      {
        key: 'phone',
        label: 'เบอร์โทรศัพท์',
      },
      {
        key: 'username',
        label: 'ชื่อผู้ใช้',
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
        key: 'role',
        label: 'สิทธิ์',
        render: (value: string) => {
          const normalizedRole = value === 'admin' ? 'admin' : 'user';
          return (
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                normalizedRole === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {normalizedRole === 'admin' ? 'ผู้ดูแล' : 'ผู้เรียน'}
            </span>
          );
        },
      },
      {
        key: 'status',
        label: 'สถานะ',
        render: (value: string) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              value === 'confirmed'
                ? 'bg-green-100 text-green-800'
                : value === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {value === 'confirmed' ? 'ยืนยันแล้ว' : value === 'pending' ? 'รอดำเนินการ' : 'ยกเลิก'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: 'วันที่สมัคร',
        render: (value: string) =>
          new Date(value).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
      },
    ],
    []
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/registrations');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (user: User) => {
    router.push(`/admin/users/${user._id}`);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError('');
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setFormError('');
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        dateOfBirth: formData.dateOfBirth,
        gradeLevel: formData.gradeLevel,
        school: formData.school.trim(),
        photo: formData.photo.trim(),
        course: formData.course.trim(),
        courseId: formData.courseId.trim(),
        message: formData.message.trim(),
        status: formData.status,
      };

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถสร้างผู้ใช้ใหม่ได้');
      }

      await fetchUsers();
      resetForm();
      setIsModalOpen(false);
    } catch (error: any) {
      setFormError(error.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
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

  const activeRoleDescription = roleOptions.find((option) => option.value === formData.role)?.description;

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้</h1>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" size={14} />
            เพิ่มผู้ใช้ใหม่
          </button>
        </div>

        <DataTable
          data={users}
          columns={columns}
          onView={handleView}
          title="รายชื่อผู้ใช้ทั้งหมด"
          searchable
          searchPlaceholder="ค้นหาผู้ใช้ (ชื่อ, อีเมล, เบอร์โทร, โรงเรียน)..."
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">เพิ่มผู้ใช้ใหม่</h2>
                <p className="text-sm text-gray-500 mt-1">กรอกข้อมูลให้ครบถ้วนเพื่อสร้างผู้ใช้ใหม่</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="ปิด"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="เช่น สมชาย ใจดี"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="example@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="08xxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้ *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 lowercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="ตัวอักษรเล็ก ตัวเลข หรือ _"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่าน *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันเกิด *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ระดับชั้น *</label>
                  <select
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    {gradeLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">โรงเรียน *</label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">หลักสูตร *</label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="ชื่อหลักสูตรที่ลงทะเบียน"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course ID (ถ้ามี)</label>
                  <input
                    type="text"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="ObjectId หรือรหัสอ้างอิง"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ลิงก์รูปโปรไฟล์</label>
                  <input
                    type="text"
                    name="photo"
                    value={formData.photo}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="เช่น https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">สิทธิ์การใช้งาน *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {activeRoleDescription && <p className="text-xs text-gray-500 mt-1">{activeRoleDescription}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุเพิ่มเติม</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="รายละเอียดอื่น ๆ (ถ้ามี)"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? 'กำลังบันทึก...' : 'บันทึกผู้ใช้'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

