'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  dateOfBirth: string;
  gradeLevel: string;
  school: string;
  photo: string;
  course: string;
  courseId?: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Enrollment {
  _id: string;
  courseId: {
    _id: string;
    name: string;
    description: string;
    category: string;
    level: string;
    image: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  enrolledAt: string;
  enrollmentDate?: string;
}

interface ExamResult {
  _id: string;
  examId: {
    _id: string;
    title: string;
    courseId: {
      _id: string;
      name: string;
      category: string;
    };
  };
  score: number;
  totalScore: number;
  percentage: number;
  isPassed: boolean;
  completedAt: string;
}

interface EnrollmentData {
  enrollments: Enrollment[];
  total: number;
}

interface ExamResultData {
  examResults: ExamResult[];
  statistics: {
    totalExams: number;
    passedExams: number;
    failedExams: number;
    averagePercentage: number;
  };
  latestExams: ExamResult[];
  total: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [examResultData, setExamResultData] = useState<ExamResultData | null>(null);

  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userId = localStorage.getItem('userId');
      const userData = localStorage.getItem('user');

      if (!isLoggedIn || !userId) {
        router.push('/login');
        return;
      }

      // ตั้งค่าข้อมูลผู้ใช้จาก localStorage ก่อน
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }

      // ดึงข้อมูลล่าสุดจาก API ทั้งหมดพร้อมกัน
      const loadAllData = async () => {
        try {
          setLoading(true);
          setError('');
          
          // รอให้ทุก API call เสร็จก่อน
          await Promise.all([
            fetchUserData(userId),
            fetchEnrollmentData(userId),
            fetchExamResultData(userId)
          ]);
        } catch (error: any) {
          console.error('Error loading data:', error);
          setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        } finally {
          setLoading(false);
        }
      };

      loadAllData();
    }
  }, [router]);

  const fetchUserData = async (userId: string) => {
    try {
      const response = await fetch(`/api/auth/me?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
        return;
      }

      setUser(data.user);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      throw error;
    }
  };

  const fetchEnrollmentData = async (userId: string) => {
    try {
      const response = await fetch(`/api/enrollments/student/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setEnrollmentData(data);
      } else {
        console.error('Error fetching enrollment data:', data.error);
      }
    } catch (error: any) {
      console.error('Error fetching enrollment data:', error);
      // ไม่ throw error เพื่อไม่ให้กระทบการโหลดข้อมูลอื่น
    }
  };

  const fetchExamResultData = async (userId: string) => {
    try {
      const response = await fetch(`/api/exam-results/student/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setExamResultData(data);
      } else {
        console.error('Error fetching exam result data:', data.error);
      }
    } catch (error: any) {
      console.error('Error fetching exam result data:', error);
      // ไม่ throw error เพื่อไม่ให้กระทบการโหลดข้อมูลอื่น
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      router.push('/login');
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

  const getEnrollmentStats = () => {
    if (!enrollmentData) return { pending: 0, confirmed: 0, completed: 0, total: 0 };
    
    const stats = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      total: enrollmentData.total,
    };
    
    enrollmentData.enrollments.forEach((enrollment) => {
      if (enrollment.status === 'pending') stats.pending++;
      else if (enrollment.status === 'confirmed') stats.confirmed++;
      else if (enrollment.status === 'completed') stats.completed++;
    });
    
    return stats;
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

  if (error && !user) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        {/* User Information Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">ข้อมูลส่วนตัว</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user?.photo && (
              <div className="md:col-span-2 flex justify-center md:justify-start">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  <Image
                    src={user.photo.startsWith('/') ? user.photo : `/api/images/${user.photo}`}
                    alt={user.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/default-avatar.png';
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ชื่อ-นามสกุล</label>
              <p className="text-lg text-gray-900">{user?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">อีเมล</label>
              <p className="text-lg text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">เบอร์โทรศัพท์</label>
              <p className="text-lg text-gray-900">{user?.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ชื่อผู้ใช้</label>
              <p className="text-lg text-gray-900">{user?.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">วันเกิด</label>
              <p className="text-lg text-gray-900">
                {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('th-TH') : '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ระดับชั้น</label>
              <p className="text-lg text-gray-900">{user?.gradeLevel}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">โรงเรียน</label>
              <p className="text-lg text-gray-900">{user?.school}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">สถานะ</label>
              {user?.status && getStatusBadge(user.status)}
            </div>
          </div>
        </div>

        {/* ผลการดำเนินการคอร์สเรียน */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">ผลการดำเนินการคอร์สเรียน</h2>
            <Link
              href="/dashboard/enrollments"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {/* สรุปสถานะ */}
          {enrollmentData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {(() => {
                  const stats = getEnrollmentStats();
                  const total = stats.total || 1;
                  return (
                    <>
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="text-sm text-yellow-700 mb-1">รอดำเนินการ</div>
                        <div className="text-3xl font-bold text-yellow-800">{stats.pending}</div>
                        <div className="text-xs text-yellow-600 mt-1">
                          {total > 0 ? Math.round((stats.pending / total) * 100) : 0}% ของทั้งหมด
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="text-sm text-green-700 mb-1">ยืนยันแล้ว</div>
                        <div className="text-3xl font-bold text-green-800">{stats.confirmed}</div>
                        <div className="text-xs text-green-600 mt-1">
                          {total > 0 ? Math.round((stats.confirmed / total) * 100) : 0}% ของทั้งหมด
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="text-sm text-blue-700 mb-1">เสร็จสิ้น</div>
                        <div className="text-3xl font-bold text-blue-800">{stats.completed}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          {total > 0 ? Math.round((stats.completed / total) * 100) : 0}% ของทั้งหมด
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* รายการคอร์สล่าสุด */}
              {enrollmentData.enrollments.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">คอร์สที่ลงทะเบียนล่าสุด</h3>
                  {enrollmentData.enrollments.slice(0, 5).map((enrollment) => (
                    <Link
                      key={enrollment._id}
                      href={`/courses/${enrollment.courseId._id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {enrollment.courseId.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {enrollment.courseId.category} • {enrollment.courseId.level}
                          </p>
                          <div className="text-xs text-gray-500">
                            ลงทะเบียนเมื่อ: {new Date(enrollment.enrolledAt).toLocaleDateString('th-TH')}
                            {enrollment.enrollmentDate && (
                              <> • เริ่มเรียน: {new Date(enrollment.enrollmentDate).toLocaleDateString('th-TH')}</>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(enrollment.status)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>คุณยังไม่ได้ลงทะเบียนคอร์สเรียนใดๆ</p>
                  <Link
                    href="/courses"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ดูคอร์สเรียนทั้งหมด →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* ผลการดำเนินการ mock-exam */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">ผลการดำเนินการ mock-exam</h2>
            <Link
              href="/mock-exam"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              ดูข้อสอบทั้งหมด →
            </Link>
          </div>

          {/* สรุปสถิติ */}
          {examResultData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-blue-700 mb-1">จำนวนข้อสอบที่ทำ</div>
                  <div className="text-3xl font-bold text-blue-800">
                    {examResultData.statistics.totalExams}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">ข้อสอบ</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-purple-700 mb-1">คะแนนเฉลี่ย</div>
                  <div className="text-3xl font-bold text-purple-800">
                    {examResultData.statistics.averagePercentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-purple-600 mt-1">เปอร์เซ็นต์</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-green-700 mb-1">ผ่านเกณฑ์</div>
                  <div className="text-3xl font-bold text-green-800">
                    {examResultData.statistics.passedExams}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    จาก {examResultData.statistics.totalExams} ข้อสอบ
                  </div>
                </div>
              </div>

              {/* รายการข้อสอบล่าสุด */}
              {examResultData.latestExams.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">ข้อสอบที่ทำล่าสุด</h3>
                  {examResultData.latestExams.map((result) => (
                    <Link
                      key={result._id}
                      href={`/mock-exam/${result.examId._id}`}
                      className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {result.examId.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {result.examId.courseId?.category || 'ข้อสอบ'}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-700">
                              คะแนน: <strong>{result.score}/{result.totalScore}</strong>
                            </span>
                            <span className={`font-semibold ${
                              result.percentage >= 80 ? 'text-green-600' :
                              result.percentage >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {result.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            ทำเมื่อ: {new Date(result.completedAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        <div className="ml-4">
                          {result.isPassed ? (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ผ่าน
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ไม่ผ่าน
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>คุณยังไม่ได้ทำข้อสอบใดๆ</p>
                  <Link
                    href="/mock-exam"
                    className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ดูข้อสอบทั้งหมด →
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

