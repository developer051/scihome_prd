'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  gradeLevel: string;
  school: string;
  photo?: string;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  price: number;
  schedule: string;
  image: string;
  duration: string;
  isOnline: boolean;
  isOnsite: boolean;
}

interface Enrollment {
  _id: string;
  studentId: Student;
  courseId: Course;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  enrolledAt: string;
  enrollmentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface EnrollmentResponse {
  student: Student;
  enrollments: Enrollment[];
  total: number;
}

export default function StudentEnrollmentsPage() {
  const router = useRouter();
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userId = localStorage.getItem('userId');

      if (!isLoggedIn || !userId) {
        router.push('/login');
        return;
      }

      fetchEnrollments(userId);
    }
  }, [router, statusFilter]);

  const fetchEnrollments = async (studentId: string) => {
    try {
      setLoading(true);
      const url = statusFilter === 'all'
        ? `/api/enrollments/student/${studentId}`
        : `/api/enrollments/student/${studentId}?status=${statusFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        setLoading(false);
        return;
      }

      setEnrollmentData(data);
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      pending: { text: 'รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { text: 'ยืนยันแล้ว', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
      completed: { text: 'เสร็จสิ้น', color: 'bg-blue-100 text-blue-800' },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error && !enrollmentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            กลับไปหน้า Login
          </button>
        </div>
      </div>
    );
  }

  const filteredEnrollments = enrollmentData?.enrollments || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">คอร์สเรียนที่ลงทะเบียน</h1>
              <p className="text-gray-600 mt-2">
                สวัสดี, {enrollmentData?.student?.name || 'นักเรียน'}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                กลับไปแดชบอร์ด
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex space-x-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ทั้งหมด ({enrollmentData?.total || 0})
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

        {/* Enrollments List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {statusFilter === 'all'
                  ? 'คุณยังไม่ได้ลงทะเบียนคอร์สเรียนใดๆ'
                  : `ไม่พบคอร์สเรียนที่มีสถานะ "${statusFilter}"`}
              </p>
              {statusFilter === 'all' && (
                <Link
                  href="/courses"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ดูคอร์สเรียนทั้งหมด
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrollments.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {enrollment.courseId.image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={enrollment.courseId.image.startsWith('/') 
                          ? enrollment.courseId.image 
                          : `/api/images/${enrollment.courseId.image}`}
                        alt={enrollment.courseId.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/course-default.jpg';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {enrollment.courseId.name}
                      </h3>
                      {getStatusBadge(enrollment.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {enrollment.courseId.category} • {enrollment.courseId.level}
                    </p>
                    
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {enrollment.courseId.description}
                    </p>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>💰 {enrollment.courseId.price.toLocaleString('th-TH')} บาท</span>
                      <span>⏱️ {enrollment.courseId.duration}</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      <p>ลงทะเบียนเมื่อ: {new Date(enrollment.enrolledAt).toLocaleDateString('th-TH')}</p>
                      {enrollment.enrollmentDate && (
                        <p>เริ่มเรียน: {new Date(enrollment.enrollmentDate).toLocaleDateString('th-TH')}</p>
                      )}
                    </div>
                    
                    {enrollment.notes && (
                      <div className="mb-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                        <strong>หมายเหตุ:</strong> {enrollment.notes}
                      </div>
                    )}
                    
                    <Link
                      href={`/courses/${enrollment.courseId._id}`}
                      className="mt-3 block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

