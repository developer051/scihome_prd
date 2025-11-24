'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';

interface ContactMessage {
  _id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
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
      key: 'message',
      label: 'ข้อความ',
      render: (value: string) => value.length > 50 ? value.substring(0, 50) + '...' : value,
    },
    {
      key: 'isRead',
      label: 'สถานะ',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? 'อ่านแล้ว' : 'ยังไม่อ่าน'}
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
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/contact');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (message: ContactMessage) => {
    // TODO: Implement edit functionality
    console.log('Edit message:', message);
  };

  const handleDelete = async (message: ContactMessage) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อความนี้?')) {
      try {
        const response = await fetch(`/api/contact/${message._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchMessages();
        } else {
          alert('เกิดข้อผิดพลาดในการลบข้อความ');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบข้อความ');
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
          <h1 className="text-3xl font-bold text-gray-900">จัดการข้อความติดต่อ</h1>
        </div>

        <DataTable
          data={messages}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          title="รายการข้อความติดต่อ"
        />
      </div>
    </AdminLayout>
  );
}
