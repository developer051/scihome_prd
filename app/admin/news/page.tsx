'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';

interface News {
  _id: string;
  title: string;
  content: string;
  image: string;
  author: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const columns = [
    {
      key: 'title',
      label: 'หัวข้อ',
    },
    {
      key: 'author',
      label: 'ผู้เขียน',
    },
    {
      key: 'isPublished',
      label: 'สถานะ',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? 'เผยแพร่แล้ว' : 'รอเผยแพร่'}
        </span>
      ),
    },
    {
      key: 'publishedAt',
      label: 'วันที่เผยแพร่',
      render: (value: string) => value ? new Date(value).toLocaleDateString('th-TH') : '-',
    },
    {
      key: 'createdAt',
      label: 'วันที่สร้าง',
      render: (value: string) => new Date(value).toLocaleDateString('th-TH'),
    },
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news?all=true');
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (newsItem: News) => {
    // TODO: Implement edit functionality
    console.log('Edit news:', newsItem);
  };

  const handleDelete = async (newsItem: News) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข่าวสารนี้?')) {
      try {
        const response = await fetch(`/api/news/${newsItem._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchNews();
        } else {
          alert('เกิดข้อผิดพลาดในการลบข่าวสาร');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบข่าวสาร');
      }
    }
  };

  const handleSeedNews = async () => {
    if (confirm('คุณต้องการเพิ่มข่าวสาร Mock-up 4 ข่าวหรือไม่?')) {
      setSeeding(true);
      try {
        const response = await fetch('/api/news/seed', {
          method: 'POST',
        });
        if (response.ok) {
          const data = await response.json();
          alert(`เพิ่มข่าวสำเร็จ: ${data.message}`);
          fetchNews();
        } else {
          const error = await response.json();
          alert(`เกิดข้อผิดพลาด: ${error.error || 'ไม่สามารถเพิ่มข่าวได้'}`);
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการเพิ่มข่าวสาร');
      } finally {
        setSeeding(false);
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
          <h1 className="text-3xl font-bold text-gray-900">จัดการข่าวสาร</h1>
          <div className="flex gap-3">
            <button
              onClick={handleSeedNews}
              disabled={seeding}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seeding ? 'กำลังเพิ่ม...' : 'เพิ่ม Mock-up ข่าวสาร'}
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              เพิ่มข่าวสาร
            </button>
          </div>
        </div>

        <DataTable
          data={news}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          title="รายการข่าวสาร"
        />
      </div>
    </AdminLayout>
  );
}
