'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';

interface StudentAchievement {
  _id: string;
  image: string;
  title: string;
  description: string;
  studentName?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function AdminStudentAchievementsPage() {
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<StudentAchievement | null>(null);

  const columns = [
    {
      key: 'image',
      label: 'รูปภาพ',
      render: (value: string) => (
        <img src={value} alt="Achievement" className="w-16 h-16 object-cover rounded" />
      ),
    },
    {
      key: 'title',
      label: 'หัวข้อ',
    },
    {
      key: 'studentName',
      label: 'ชื่อนักเรียน',
      render: (value: string) => value || '-',
    },
    {
      key: 'order',
      label: 'ลำดับ',
    },
    {
      key: 'isActive',
      label: 'สถานะ',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'แสดง' : 'ซ่อน'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'วันที่สร้าง',
      render: (value: string) => new Date(value).toLocaleDateString('th-TH'),
    },
  ];

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      // สำหรับ admin ให้แสดงทั้งหมด (ไม่ filter isActive)
      const response = await fetch('/api/student-achievements?all=true');
      const data = await response.json();
      setAchievements(data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (achievement: StudentAchievement) => {
    setEditingAchievement(achievement);
    setShowForm(true);
  };

  const handleDelete = async (achievement: StudentAchievement) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบความสำเร็จนี้?')) {
      try {
        const response = await fetch(`/api/student-achievements/${achievement._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchAchievements();
        } else {
          alert('เกิดข้อผิดพลาดในการลบ');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบ');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingAchievement) {
        // Update
        const response = await fetch(`/api/student-achievements/${editingAchievement._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('เกิดข้อผิดพลาดในการอัปเดต');
        }
      } else {
        // Create
        const response = await fetch('/api/student-achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('เกิดข้อผิดพลาดในการสร้าง');
        }
      }
      fetchAchievements();
      setShowForm(false);
      setEditingAchievement(null);
    } catch (error: any) {
      alert(error.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAchievement(null);
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
          <h1 className="text-3xl font-bold text-gray-900">จัดการความสำเร็จของนักเรียน</h1>
          <button
            onClick={() => {
              setEditingAchievement(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            เพิ่มความสำเร็จใหม่
          </button>
        </div>

        <DataTable
          data={achievements}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          title="รายการความสำเร็จของนักเรียน"
        />

        {showForm && (
          <AchievementForm
            achievement={editingAchievement}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Achievement Form Component
function AchievementForm({ achievement, onSubmit, onClose }: {
  achievement: StudentAchievement | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    image: achievement?.image || '',
    title: achievement?.title || '',
    description: achievement?.description || '',
    studentName: achievement?.studentName || '',
    isActive: achievement?.isActive !== undefined ? achievement.isActive : true,
    order: achievement?.order || 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(achievement?.image || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF, WEBP)');
      return;
    }

    // ตรวจสอบขนาดไฟล์ (สูงสุด 7MB)
    const maxSize = 7 * 1024 * 1024; // 7MB
    if (file.size > maxSize) {
      setUploadError('ขนาดไฟล์ต้องไม่เกิน 7MB');
      return;
    }

    setImageFile(file);
    setUploadError('');

    // สร้าง preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
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
        image: uploadData.url,
      });
      setImagePreview(uploadData.url);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      setImageFile(null);
      setImagePreview(achievement?.image || '');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      order: parseInt(formData.order.toString()) || 0,
    };
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {achievement ? 'แก้ไขความสำเร็จ' : 'เพิ่มความสำเร็จใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รูปภาพ *
            </label>
            {imagePreview && (
              <div className="mb-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border border-gray-300"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {uploading && <p className="text-sm text-blue-600 mt-1">กำลังอัปโหลด...</p>}
            {uploadError && <p className="text-sm text-red-600 mt-1">{uploadError}</p>}
            {!formData.image && !uploading && (
              <p className="text-sm text-gray-500 mt-1">กรุณาอัปโหลดรูปภาพ</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หัวข้อ *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบาย *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อนักเรียน (ไม่บังคับ)
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ลำดับการแสดงผล
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                แสดงในหน้าแรก
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!formData.image || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {achievement ? 'บันทึกการแก้ไข' : 'เพิ่มความสำเร็จ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

