'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';

interface Enrollment {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    username: string;
    gradeLevel: string;
    school: string;
    photo?: string;
  };
  courseId: {
    _id: string;
    name: string;
    description: string;
    category: string;
    level: string;
    price: number;
    schedule: string;
    image: string;
    duration: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  enrolledAt: string;
  enrollmentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const columns = [
    {
      key: 'studentId',
      label: 'นักเรียน',
      render: (value: any) => (
        <div className="flex items-center space-x-2">
          {value?.photo ? (
            <img
              src={value.photo}
              alt={value.name}
              className="w-10 h-10 object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/student-default.jpg';
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
              <span className="text-xs">ไม่มีรูป</span>
            </div>
          )}
          <div>
            <div className="font-medium">{value?.name || '-'}</div>
            <div className="text-xs text-gray-500">{value?.email || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'courseId',
      label: 'คอร์ส',
      render: (value: any) => (
        <div>
          <div className="font-medium">{value?.name || '-'}</div>
          <div className="text-xs text-gray-500">{value?.category || ''} - {value?.level || ''}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'สถานะ',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'confirmed' ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {value === 'confirmed' ? 'ยืนยันแล้ว' :
           value === 'pending' ? 'รอดำเนินการ' :
           value === 'cancelled' ? 'ยกเลิก' : 'เสร็จสิ้น'}
        </span>
      ),
    },
    {
      key: 'enrolledAt',
      label: 'วันที่ลงทะเบียน',
      render: (value: string) => value ? new Date(value).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : '-',
    },
    {
      key: 'enrollmentDate',
      label: 'วันที่เริ่มเรียน',
      render: (value: string) => value ? new Date(value).toLocaleDateString('th-TH') : '-',
    },
    {
      key: 'notes',
      label: 'หมายเหตุ',
      render: (value: string) => value ? (
        <span className="max-w-xs truncate block" title={value}>
          {value.length > 30 ? `${value.substring(0, 30)}...` : value}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
  ];

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/enrollments' 
        : `/api/enrollments?status=${statusFilter}`;
      const response = await fetch(url);
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setShowForm(true);
  };

  const handleDelete = async (enrollment: Enrollment) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบการลงทะเบียนนี้?')) {
      try {
        const response = await fetch(`/api/enrollments/${enrollment._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchEnrollments();
        } else {
          alert('เกิดข้อผิดพลาดในการลบการลงทะเบียน');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบการลงทะเบียน');
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = `/api/enrollments/${editingEnrollment?._id}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingEnrollment(null);
        fetchEnrollments();
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
    setEditingEnrollment(null);
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
          <h1 className="text-3xl font-bold text-gray-900">จัดการการลงทะเบียนคอร์ส</h1>
        </div>

        {/* Status Filter */}
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            รอดำเนินการ
          </button>
          <button
            onClick={() => setStatusFilter('confirmed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'confirmed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ยืนยันแล้ว
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ยกเลิก
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            เสร็จสิ้น
          </button>
        </div>

        <DataTable
          data={enrollments}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          title="รายการลงทะเบียนคอร์ส"
        />

        {/* Enrollment Edit Modal */}
        {showForm && editingEnrollment && (
          <EnrollmentEditForm
            enrollment={editingEnrollment}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Enrollment Edit Form Component
function EnrollmentEditForm({ enrollment, onSubmit, onClose }: {
  enrollment: Enrollment;
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    status: enrollment.status || 'pending',
    enrollmentDate: enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toISOString().split('T')[0] : '',
    notes: enrollment.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          แก้ไขข้อมูลการลงทะเบียน
        </h2>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">นักเรียน</p>
              <p className="font-medium">{enrollment.studentId?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">คอร์ส</p>
              <p className="font-medium">{enrollment.courseId?.name || '-'}</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <option value="completed">เสร็จสิ้น</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              วันที่เริ่มเรียน
            </label>
            <input
              type="date"
              name="enrollmentDate"
              value={formData.enrollmentDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมายเหตุ
            </label>
            <textarea
              name="notes"
              value={formData.notes}
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

