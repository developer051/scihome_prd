'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';

interface Testimonial {
  _id: string;
  studentName: string;
  message: string;
  image: string;
  course: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      key: 'studentName',
      label: 'ชื่อนักเรียน',
    },
    {
      key: 'course',
      label: 'หลักสูตร',
    },
    {
      key: 'rating',
      label: 'คะแนน',
      render: (value: number) => `${value}/5`,
    },
    {
      key: 'isApproved',
      label: 'สถานะ',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? 'อนุมัติแล้ว' : 'รออนุมัติ'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'วันที่ส่ง',
      render: (value: string) => new Date(value).toLocaleDateString('th-TH'),
    },
  ];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials');
      const data = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    // TODO: Implement edit functionality
    console.log('Edit testimonial:', testimonial);
  };

  const handleDelete = async (testimonial: Testimonial) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?')) {
      try {
        const response = await fetch(`/api/testimonials/${testimonial._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchTestimonials();
        } else {
          alert('เกิดข้อผิดพลาดในการลบรีวิว');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบรีวิว');
      }
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

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">จัดการรีวิว</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            เพิ่มรีวิว
          </button>
        </div>

        <DataTable
          data={testimonials}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          title="รายการรีวิว"
        />
      </div>
    </AdminLayout>
  );
}
