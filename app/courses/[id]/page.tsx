'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaClock, FaUsers, FaMapMarkerAlt, FaLaptop, FaArrowLeft, FaBookOpen, FaYoutube, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

interface SubLesson {
  title: string;
  description: string;
  order: number;
  duration: string;
  youtubeLink?: string;
}

interface Lesson {
  title: string;
  description: string;
  order: number;
  subLessons: SubLesson[];
  youtubeLink?: string;
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
  maxStudents: number;
  isOnline: boolean;
  isOnsite: boolean;
  lessons?: Lesson[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; videoId: string | null; title: string }>({
    isOpen: false,
    videoId: null,
    title: '',
  });

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอินจาก localStorage
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentUserId = localStorage.getItem('userId');
        setIsAuthenticated(!!(user && isLoggedIn));
        setUserId(currentUserId);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      if (!isAuthenticated || !userId || !params.id) {
        return;
      }

      try {
        const response = await fetch(`/api/enrollments?studentId=${userId}&courseId=${params.id}`);
        if (response.ok) {
          const enrollments = await response.json();
          // ตรวจสอบว่ามี enrollment ที่ status เป็น 'confirmed' หรือไม่
          const confirmedEnrollment = enrollments.find((e: any) => e.status === 'confirmed');
          if (confirmedEnrollment) {
            setEnrollmentStatus('confirmed');
          } else if (enrollments.length > 0) {
            // มี enrollment แต่ยังไม่ confirmed
            setEnrollmentStatus(enrollments[0].status);
          } else {
            setEnrollmentStatus(null);
          }
        }
      } catch (error) {
        console.error('Error fetching enrollment status:', error);
      }
    };

    if (isAuthenticated && userId && params.id) {
      fetchEnrollmentStatus();
    }
  }, [isAuthenticated, userId, params.id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      alert('กรุณาเข้าสู่ระบบก่อนสมัครเรียน');
      return;
    }

    if (!course) {
      alert('ไม่พบข้อมูลคอร์ส');
      return;
    }

    // ดึงข้อมูลผู้ใช้จาก localStorage
    if (typeof window === 'undefined') {
      return;
    }

    const userData = localStorage.getItem('user');
    const userId = localStorage.getItem('userId');

    if (!userData || !userId) {
      alert('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบอีกครั้ง');
      return;
    }

    try {
      setIsEnrolling(true);

      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          courseId: course._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('สมัครเรียนสำเร็จ! ข้อมูลของคุณถูกส่งไปยัง admin เพื่อรอการอนุมัติ');
        // รีเฟรชสถานะ enrollment
        const enrollmentResponse = await fetch(`/api/enrollments?studentId=${userId}&courseId=${course._id}`);
        if (enrollmentResponse.ok) {
          const enrollments = await enrollmentResponse.json();
          if (enrollments.length > 0) {
            setEnrollmentStatus(enrollments[0].status);
          }
        }
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการสมัครเรียน กรุณาลองใหม่อีกครั้ง');
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-32 rounded mb-4"></div>
            <div className="bg-gray-200 h-96 w-full rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-gray-200 h-64 w-full rounded mb-4"></div>
              </div>
              <div className="bg-gray-200 h-96 w-full rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบหลักสูตร</h1>
          <Link
            href="/courses"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            กลับไปหน้าหลักสูตร
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/courses"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          กลับไปหน้าหลักสูตร
        </Link>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative">
            <img
              src={course.image}
              alt={course.name}
              className="w-full h-64 md:h-96 object-cover bg-gray-100"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {course.category}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {course.level}
              </span>
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.name}</h1>
            <div className="flex items-center justify-between mb-6">
              <div className="text-3xl font-bold text-blue-600">
                ฿{course.price.toLocaleString()}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">ระยะเวลาเรียน</div>
                <div className="font-semibold">{course.duration}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">รายละเอียดหลักสูตร</h2>
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">ข้อมูลหลักสูตร</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaClock className="text-blue-500 mr-3" />
                  <span className="font-medium">ระยะเวลาเรียน:</span>
                  <span className="ml-2">{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <FaUsers className="text-blue-500 mr-3" />
                  <span className="font-medium">จำนวนนักเรียนสูงสุด:</span>
                  <span className="ml-2">{course.maxStudents} คน</span>
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-3">📅</span>
                  <span className="font-medium">ตารางเรียน:</span>
                  <span className="ml-2">{course.schedule}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">รูปแบบการเรียน:</span>
                  <div className="ml-2 flex space-x-4">
                    {course.isOnline && (
                      <div className="flex items-center text-green-600">
                        <FaLaptop className="mr-1" />
                        <span>ออนไลน์</span>
                      </div>
                    )}
                    {course.isOnsite && (
                      <div className="flex items-center text-orange-600">
                        <FaMapMarkerAlt className="mr-1" />
                        <span>ออนไซต์</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Curriculum */}
            {course.lessons && course.lessons.length > 0 && (
              <div id="lessons" className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FaBookOpen className="mr-2 text-blue-600" />
                  เนื้อหาหลักสูตร
                </h2>
                <div className="space-y-4">
                  {course.lessons
                    .sort((a, b) => a.order - b.order)
                    .map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                บทที่ {lesson.order}: {lesson.title}
                              </h3>
                            </div>
                            {lesson.youtubeLink && (
                              <button
                                onClick={() => setVideoModal({
                                  isOpen: true,
                                  videoId: lesson.youtubeLink || null,
                                  title: lesson.title,
                                })}
                                className="ml-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                              >
                                <FaYoutube className="mr-1.5" />
                                ดูวิดีโอ
                              </button>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                          )}
                        </div>
                        {lesson.subLessons && lesson.subLessons.length > 0 && (
                          <div className="p-4 bg-white">
                            <ul className="space-y-2">
                              {lesson.subLessons
                                .sort((a, b) => a.order - b.order)
                                .map((subLesson, subIndex) => (
                                  <li key={subIndex} className="flex items-start">
                                    <span className="text-blue-600 mr-2 mt-1">•</span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-gray-800 font-medium">
                                          {subLesson.title}
                                        </span>
                                        {subLesson.youtubeLink && (
                                          <button
                                            onClick={() => setVideoModal({
                                              isOpen: true,
                                              videoId: subLesson.youtubeLink || null,
                                              title: subLesson.title,
                                            })}
                                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                                          >
                                            <FaYoutube className="mr-1" />
                                            ดูวิดีโอ
                                          </button>
                                        )}
                                      </div>
                                      {subLesson.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {subLesson.description}
                                        </p>
                                      )}
                                      {subLesson.duration && (
                                        <span className="text-xs text-gray-500 ml-2">
                                          ({subLesson.duration})
                                        </span>
                                      )}
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Registration Form or Enroll Button */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">สมัครเรียน</h2>
              {isAuthenticated ? (
                enrollmentStatus === 'confirmed' ? (
                  <Link
                    href={`/courses/${params.id}/learn`}
                    className="block w-full bg-gradient-to-r from-green-600 via-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:via-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                  >
                    เข้าสู่บทเรียน
                  </Link>
                ) : enrollmentStatus === 'pending' ? (
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-yellow-500 via-yellow-500 to-yellow-600 text-white py-4 px-6 rounded-xl font-semibold text-lg opacity-75 cursor-not-allowed"
                  >
                    รอการอนุมัติ
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:via-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isEnrolling ? 'กำลังสมัครเรียน...' : 'Enroll Course'}
                  </button>
                )
              ) : (
                <Link
                  href="/register"
                  className="block w-full bg-gradient-to-r from-green-600 via-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-700 hover:via-green-700 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 text-center"
                >
                  Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {videoModal.isOpen && videoModal.videoId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setVideoModal({ isOpen: false, videoId: null, title: '' })}
        >
          <div
            className="bg-white rounded-lg w-full max-w-4xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{videoModal.title}</h3>
              <button
                onClick={() => setVideoModal({ isOpen: false, videoId: null, title: '' })}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${videoModal.videoId}?autoplay=1`}
                  title={videoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
