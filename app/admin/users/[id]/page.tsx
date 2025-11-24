'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { 
  FaArrowLeft, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaGraduationCap, 
  FaSchool, 
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartLine,
  FaBook,
  FaFileAlt
} from 'react-icons/fa';

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

interface Enrollment {
  _id: string;
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
}

interface ExamResult {
  _id: string;
  examId: {
    _id: string;
    title: string;
    description: string;
    courseId?: {
      _id: string;
      name: string;
    };
    duration: number;
    totalScore: number;
    passingScore?: number;
  };
  score: number;
  totalScore: number;
  percentage: number;
  isPassed: boolean;
  completedAt: string;
  timeSpent: number;
}

interface UserStats {
  totalEnrollments: number;
  confirmedEnrollments: number;
  totalExams: number;
  passedExams: number;
  averageScore: number;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalEnrollments: 0,
    confirmedEnrollments: 0,
    totalExams: 0,
    passedExams: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // ดึงข้อมูล user, enrollments, และ exam results พร้อมกัน
      const [userRes, enrollmentsRes, examResultsRes] = await Promise.all([
        fetch(`/api/registrations/${userId}`),
        fetch(`/api/enrollments/student/${userId}`),
        fetch(`/api/exam-results/student/${userId}`),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        setEnrollments(enrollmentsData.enrollments || []);
      }

      if (examResultsRes.ok) {
        const examResultsData = await examResultsRes.json();
        setExamResults(examResultsData.examResults || []);
        
        // คำนวณสถิติ
        const totalExams = examResultsData.examResults?.length || 0;
        const passedExams = examResultsData.examResults?.filter((r: ExamResult) => r.isPassed).length || 0;
        const averageScore = totalExams > 0
          ? examResultsData.examResults.reduce((sum: number, r: ExamResult) => sum + r.percentage, 0) / totalExams
          : 0;

        setStats(prev => ({
          ...prev,
          totalExams,
          passedExams,
          averageScore: Math.round(averageScore * 100) / 100,
        }));
      }

      // คำนวณสถิติ enrollments
      if (enrollmentsRes.ok) {
        const enrollmentsData = await enrollmentsRes.json();
        const enrollmentsList = enrollmentsData.enrollments || [];
        const confirmedEnrollments = enrollmentsList.filter((e: Enrollment) => e.status === 'confirmed').length;
        
        setStats(prev => ({
          ...prev,
          totalEnrollments: enrollmentsList.length,
          confirmedEnrollments,
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    }
    return `${minutes} นาที ${secs} วินาที`;
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

  if (!user) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">ไม่พบข้อมูลผู้ใช้</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            กลับไปหน้ารายชื่อผู้ใช้
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/users')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            กลับไปหน้ารายชื่อผู้ใช้
          </button>
          <h1 className="text-3xl font-bold text-gray-900">รายละเอียดผู้ใช้</h1>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <FaBook className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">คอร์สที่ลงทะเบียน</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</p>
                <p className="text-xs text-gray-500">ยืนยันแล้ว: {stats.confirmedEnrollments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <FaFileAlt className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">ข้อสอบที่ทำ</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
                <p className="text-xs text-gray-500">ผ่าน: {stats.passedExams}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <FaChartLine className="text-purple-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageScore > 0 ? `${stats.averageScore}%` : '-'}
                </p>
                <p className="text-xs text-gray-500">จากข้อสอบทั้งหมด</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <FaCheckCircle className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">อัตราการผ่าน</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalExams > 0 
                    ? `${Math.round((stats.passedExams / stats.totalExams) * 100)}%` 
                    : '-'}
                </p>
                <p className="text-xs text-gray-500">จากข้อสอบทั้งหมด</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaUser className="mr-2 text-blue-600" />
                ข้อมูลส่วนตัว
              </h2>
              
              <div className="flex justify-center mb-4">
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-32 h-32 object-cover rounded-full border-4 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/student-default.jpg';
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                    <FaUser size={48} />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaUser className="mr-2" />
                    ชื่อ-นามสกุล
                  </p>
                  <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaEnvelope className="mr-2" />
                    อีเมล
                  </p>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaPhone className="mr-2" />
                    เบอร์โทรศัพท์
                  </p>
                  <p className="text-gray-900">{user.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaUser className="mr-2" />
                    ชื่อผู้ใช้
                  </p>
                  <p className="text-gray-900">{user.username}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaGraduationCap className="mr-2" />
                    ระดับชั้น
                  </p>
                  <p className="text-gray-900">{user.gradeLevel}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaSchool className="mr-2" />
                    โรงเรียน
                  </p>
                  <p className="text-gray-900">{user.school}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    วันเกิด
                  </p>
                  <p className="text-gray-900">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('th-TH') : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">สถานะ</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'confirmed' ? 'ยืนยันแล้ว' :
                     user.status === 'pending' ? 'รอดำเนินการ' : 'ยกเลิก'}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    วันที่สมัคร
                  </p>
                  <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollments and Exam Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrollments Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaBook className="mr-2 text-blue-600" />
                คอร์สที่ลงทะเบียน ({enrollments.length})
              </h2>

              {enrollments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ยังไม่มีการลงทะเบียนคอร์ส</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{enrollment.courseId.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {enrollment.courseId.category} - {enrollment.courseId.level}
                          </p>
                          {enrollment.courseId.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {enrollment.courseId.description}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          enrollment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          enrollment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {enrollment.status === 'confirmed' ? 'ยืนยันแล้ว' :
                           enrollment.status === 'pending' ? 'รอดำเนินการ' :
                           enrollment.status === 'cancelled' ? 'ยกเลิก' : 'เสร็จสิ้น'}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <FaCalendarAlt className="mr-1" />
                        <span>ลงทะเบียน: {formatDate(enrollment.enrolledAt)}</span>
                        {enrollment.enrollmentDate && (
                          <>
                            <span className="mx-2">•</span>
                            <span>เริ่มเรียน: {new Date(enrollment.enrollmentDate).toLocaleDateString('th-TH')}</span>
                          </>
                        )}
                      </div>
                      {enrollment.notes && (
                        <p className="text-xs text-gray-500 mt-2">หมายเหตุ: {enrollment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Exam Results Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FaFileAlt className="mr-2 text-green-600" />
                ผลการสอบ Mock Exam ({examResults.length})
              </h2>

              {examResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ยังไม่มีการทำข้อสอบ</p>
              ) : (
                <div className="space-y-4">
                  {examResults.map((result) => (
                    <div
                      key={result._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{result.examId.title}</h3>
                          {result.examId.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {result.examId.description}
                            </p>
                          )}
                          {result.examId.courseId && (
                            <p className="text-xs text-gray-500 mt-1">
                              วิชา: {result.examId.courseId.name}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {result.isPassed ? (
                            <FaCheckCircle className="text-green-600" size={20} />
                          ) : (
                            <FaTimesCircle className="text-red-600" size={20} />
                          )}
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            result.isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result.isPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-600">คะแนน</p>
                          <p className="text-lg font-bold text-gray-900">
                            {result.score} / {result.totalScore}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">เปอร์เซ็นต์</p>
                          <p className="text-lg font-bold text-gray-900">{result.percentage}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 flex items-center">
                            <FaClock className="mr-1" />
                            เวลาที่ใช้
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatTime(result.timeSpent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">วันที่ทำ</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(result.completedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

