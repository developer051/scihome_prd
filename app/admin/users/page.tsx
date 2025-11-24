'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';

interface User {
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
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    {
      key: 'photo',
      label: 'รูปถ่าย',
      render: (value: string, row: User) => (
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
      render: (value: string) => new Date(value).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้</h1>
        </div>

        <DataTable
          data={users}
          columns={columns}
          onView={handleView}
          title="รายชื่อผู้ใช้ทั้งหมด"
          searchable={true}
          searchPlaceholder="ค้นหาผู้ใช้ (ชื่อ, อีเมล, เบอร์โทร, โรงเรียน)..."
        />
      </div>
    </AdminLayout>
  );
}

