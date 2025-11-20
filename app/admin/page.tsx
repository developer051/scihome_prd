'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { FaGraduationCap, FaChalkboardTeacher, FaNewspaper, FaComments, FaUserPlus, FaEnvelope } from 'react-icons/fa';

interface Stats {
  courses: number;
  teachers: number;
  news: number;
  testimonials: number;
  registrations: number;
  messages: number;
}

interface RecentRegistration {
  _id: string;
  name: string;
  course: string;
  createdAt: string;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    courses: 0,
    teachers: 0,
    news: 0,
    testimonials: 0,
    registrations: 0,
    messages: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          coursesRes,
          teachersRes,
          newsRes,
          testimonialsRes,
          registrationsRes,
          messagesRes,
        ] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/teachers'),
          fetch('/api/news'),
          fetch('/api/testimonials'),
          fetch('/api/registrations'),
          fetch('/api/contact'),
        ]);

        const [
          courses,
          teachers,
          news,
          testimonials,
          registrations,
          messages,
        ] = await Promise.all([
          coursesRes.json(),
          teachersRes.json(),
          newsRes.json(),
          testimonialsRes.json(),
          registrationsRes.json(),
          messagesRes.json(),
        ]);

        setStats({
          courses: courses.length,
          teachers: teachers.length,
          news: news.length,
          testimonials: testimonials.length,
          registrations: registrations.length,
          messages: messages.length,
        });

        setRecentRegistrations(registrations.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'หลักสูตร',
      value: stats.courses,
      icon: FaGraduationCap,
      color: 'bg-blue-500',
      href: '/admin/courses',
    },
    {
      title: 'ครูผู้สอน',
      value: stats.teachers,
      icon: FaChalkboardTeacher,
      color: 'bg-green-500',
      href: '/admin/teachers',
    },
    {
      title: 'ข่าวสาร',
      value: stats.news,
      icon: FaNewspaper,
      color: 'bg-yellow-500',
      href: '/admin/news',
    },
    {
      title: 'รีวิว',
      value: stats.testimonials,
      icon: FaComments,
      color: 'bg-purple-500',
      href: '/admin/testimonials',
    },
    {
      title: 'การสมัครเรียน',
      value: stats.registrations,
      icon: FaUserPlus,
      color: 'bg-red-500',
      href: '/admin/registrations',
    },
    {
      title: 'ข้อความติดต่อ',
      value: stats.messages,
      icon: FaEnvelope,
      color: 'bg-indigo-500',
      href: '/admin/messages',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-96 rounded-lg"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <a
                key={index}
                href={stat.href}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg mr-4`}>
                    <Icon className="text-white text-2xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">การสมัครเรียนล่าสุด</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    หลักสูตร
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่สมัคร
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRegistrations.map((registration) => (
                  <tr key={registration._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {registration.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          registration.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : registration.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {registration.status === 'confirmed'
                          ? 'ยืนยันแล้ว'
                          : registration.status === 'pending'
                          ? 'รอดำเนินการ'
                          : 'ยกเลิก'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <a
              href="/admin/registrations"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ดูทั้งหมด →
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
