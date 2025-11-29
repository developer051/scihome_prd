'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import CourseContentExpander from '@/components/CourseContentExpander';
import LessonForm from '@/components/LessonForm';
import SubLessonForm from '@/components/SubLessonForm';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaCopy, FaUsers } from 'react-icons/fa';
import { ILesson, ISubLesson } from '@/models/Course';

interface Course {
  _id: string;
  name: string;
  description: string;
  category?: string; // Keep for backward compatibility but not displayed
  level?: string; // Keep for backward compatibility but not displayed
  sectionId?: string | { _id: string; name: string };
  categoryId?: string | { _id: string; name: string; sectionId?: string | { _id: string; name: string } };
  price: number;
  schedule: string;
  image: string;
  duration: string;
  maxStudents: number;
  isOnline: boolean;
  isOnsite: boolean;
  isActive?: boolean;
  endDate?: string;
  lessons?: ILesson[];
  createdAt: string;
}

type Column<T = Course> = {
  key: keyof T | string;
  label: string;
  render?: (value: any, course?: T) => React.ReactNode;
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showSubLessonForm, setShowSubLessonForm] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<string>('');
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(-1);
  const [currentSubLessonIndex, setCurrentSubLessonIndex] = useState<number>(-1);
  const [editingLesson, setEditingLesson] = useState<ILesson | null>(null);
  const [editingSubLesson, setEditingSubLesson] = useState<ISubLesson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [isDisabling, setIsDisabling] = useState(false);
  const [copyingCourseId, setCopyingCourseId] = useState<string | null>(null);
  const [enrollmentCounts, setEnrollmentCounts] = useState<Record<string, number>>({});
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCourseName, setSelectedCourseName] = useState<string>('');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const columns: Column<Course>[] = [
    {
      key: 'name',
      label: 'ชื่อหลักสูตร',
    },
    {
      key: 'sectionId',
      label: 'Section',
      render: (value: any) => {
        if (!value) return '-';
        if (typeof value === 'object' && value.name) return value.name;
        return '-';
      },
    },
    {
      key: 'categoryId',
      label: 'Category',
      render: (value: any) => {
        if (!value) return '-';
        if (typeof value === 'object' && value.name) return value.name;
        return '-';
      },
    },
    {
      key: 'price',
      label: 'ราคา',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      key: 'maxStudents',
      label: 'จำนวนนักเรียน',
      render: (value: number) => `${value} คน`,
    },
    {
      key: 'enrollmentCount',
      label: 'ผู้ลงทะเบียน',
      render: (value: any, course?: Course) => {
        if (!course) return '-';
        const count = enrollmentCounts[course._id] || 0;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewEnrollments(course._id, course.name);
              }}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
              title="ดูรายชื่อผู้ลงทะเบียน"
            >
              <FaUsers className="text-blue-600" size={16} />
              <span className="font-medium text-gray-900">{count}</span>
              <span className="text-gray-500 text-sm">คน</span>
            </button>
          </div>
        );
      },
    },
    {
      key: 'isOnline',
      label: 'ออนไลน์',
      render: (value: boolean) => value ? '✓' : '✗',
    },
    {
      key: 'isOnsite',
      label: 'ออนไซต์',
      render: (value: boolean) => value ? '✓' : '✗',
    },
    {
      key: 'isActive',
      label: 'สถานะ',
      render: (value: boolean) => value !== false ? (
        <span className="text-green-600 font-medium">ใช้งาน</span>
      ) : (
        <span className="text-red-600 font-medium">ยกเลิกแล้ว</span>
      ),
    },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      fetchEnrollmentCounts();
    }
  }, [courses]);

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');
      const response = await fetch('/api/courses?populate=true');
      const data = await response.json();
      console.log('Courses fetched:', data.length);
      setCourses(data);
      
      // ตรวจสอบว่ามีหลักสูตรที่ยังไม่มี lessons หรือไม่
      const coursesWithoutLessons = data.filter((course: Course) => !course.lessons || course.lessons.length === 0);
      console.log(`Courses without lessons: ${coursesWithoutLessons.length}`);
      
      if (coursesWithoutLessons.length > 0) {
        console.log('Seeding lessons data...');
        // Seed lessons data สำหรับหลักสูตรที่ยังไม่มี
        try {
          const seedResponse = await fetch('/api/courses/seed-lessons', { method: 'POST' });
          const seedData = await seedResponse.json();
          console.log('Seed response:', seedData);
          
          if (!seedResponse.ok) {
            console.error('Seed failed:', seedData);
          } else {
            console.log('Seed successful, refreshing courses...');
            // ดึงข้อมูลใหม่หลังจาก seed
            const refreshResponse = await fetch('/api/courses');
            const refreshData = await refreshResponse.json();
            console.log('Courses refreshed:', refreshData.length);
            setCourses(refreshData);
          }
        } catch (seedError) {
          console.error('Error seeding lessons:', seedError);
        }
      } else {
        console.log('All courses already have lessons');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentCounts = async () => {
    try {
      const counts: Record<string, number> = {};
      
      // ดึงจำนวน enrollment ของทุกคอร์สพร้อมกัน
      const promises = courses.map(async (course) => {
        try {
          const response = await fetch(`/api/enrollments/course/${course._id}`);
          if (response.ok) {
            const data = await response.json();
            counts[course._id] = data.total || 0;
          } else {
            counts[course._id] = 0;
          }
        } catch (error) {
          console.error(`Error fetching enrollment count for course ${course._id}:`, error);
          counts[course._id] = 0;
        }
      });
      
      await Promise.all(promises);
      setEnrollmentCounts(counts);
    } catch (error) {
      console.error('Error fetching enrollment counts:', error);
    }
  };

  const handleViewEnrollments = async (courseId: string, courseName: string) => {
    setSelectedCourseId(courseId);
    setSelectedCourseName(courseName);
    setShowEnrollmentModal(true);
    setLoadingEnrollments(true);
    
    try {
      const response = await fetch(`/api/enrollments/course/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.enrollments || []);
      } else {
        console.error('Error fetching enrollments:', response.statusText);
        setEnrollments([]);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleCloseEnrollmentModal = () => {
    setShowEnrollmentModal(false);
    setSelectedCourseId(null);
    setSelectedCourseName('');
    setEnrollments([]);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = async (course: Course) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบหลักสูตรนี้?')) {
      try {
        const response = await fetch(`/api/courses/${course._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchCourses();
        } else {
          alert('เกิดข้อผิดพลาดในการลบหลักสูตร');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบหลักสูตร');
      }
    }
  };

  const handleCopy = async (course: Course) => {
    if (!confirm(`คุณต้องการคัดลอกหลักสูตร "${course.name}" หรือไม่?`)) {
      return;
    }

    setCopyingCourseId(course._id);
    try {
      // ดึงข้อมูล course พร้อม lessons และ subLessons จาก API
      const response = await fetch(`/api/courses/${course._id}`);
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลหลักสูตรได้');
      }

      const courseData = await response.json();
      
      // สร้างข้อมูล course ใหม่โดย copy ข้อมูลทั้งหมด
      const newCourseData = {
        name: `สำเนา - ${course.name}`,
        description: course.description,
        sectionId: typeof course.sectionId === 'object' && course.sectionId?._id 
          ? course.sectionId._id 
          : course.sectionId || null,
        categoryId: typeof course.categoryId === 'object' && course.categoryId?._id 
          ? course.categoryId._id 
          : course.categoryId || null,
        price: course.price,
        schedule: course.schedule,
        image: course.image,
        duration: course.duration,
        maxStudents: course.maxStudents,
        isOnline: course.isOnline,
        isOnsite: course.isOnsite,
        isActive: true, // ตั้งค่าเป็น active สำหรับ course ใหม่
        endDate: course.endDate || null,
        lessons: courseData.lessons ? courseData.lessons.map((lesson: ILesson) => ({
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          youtubeLink: lesson.youtubeLink || '',
          subLessons: lesson.subLessons ? lesson.subLessons.map((subLesson: ISubLesson) => ({
            title: subLesson.title,
            description: subLesson.description,
            order: subLesson.order,
            duration: subLesson.duration,
            youtubeLink: subLesson.youtubeLink || '',
          })) : [],
        })) : [],
      };

      // สร้าง course ใหม่
      const createResponse = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourseData),
      });

      if (createResponse.ok) {
        alert('คัดลอกหลักสูตรสำเร็จ');
        fetchCourses();
      } else {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'เกิดข้อผิดพลาดในการคัดลอกหลักสูตร');
      }
    } catch (error: any) {
      console.error('Error copying course:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในการคัดลอกหลักสูตร');
    } finally {
      setCopyingCourseId(null);
    }
  };

  const handleSelectCourse = (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleSelectAll = () => {
    const filteredCourses = courses.filter((course) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      if (course.name.toLowerCase().includes(searchLower) || 
          course.description.toLowerCase().includes(searchLower)) {
        return true;
      }
      const sectionName = typeof course.sectionId === 'object' && course.sectionId?.name 
        ? course.sectionId.name 
        : '';
      if (sectionName.toLowerCase().includes(searchLower)) {
        return true;
      }
      const categoryName = typeof course.categoryId === 'object' && course.categoryId?.name 
        ? course.categoryId.name 
        : '';
      if (categoryName.toLowerCase().includes(searchLower)) {
        return true;
      }
      return false;
    });

    if (selectedCourses.size === filteredCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(filteredCourses.map(c => c._id)));
    }
  };

  const handleBulkDisable = async () => {
    if (selectedCourses.size === 0) {
      alert('กรุณาเลือกหลักสูตรที่ต้องการยกเลิกการใช้งาน');
      return;
    }

    if (!confirm(`คุณแน่ใจหรือไม่ที่จะยกเลิกการใช้งานหลักสูตร ${selectedCourses.size} รายการ?`)) {
      return;
    }

    setIsDisabling(true);
    try {
      const promises = Array.from(selectedCourses).map(courseId =>
        fetch(`/api/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isActive: false }),
        })
      );

      const results = await Promise.allSettled(promises);
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok));

      if (failed.length > 0) {
        alert(`เกิดข้อผิดพลาดในการยกเลิกการใช้งาน ${failed.length} รายการ`);
      } else {
        alert(`ยกเลิกการใช้งานหลักสูตร ${selectedCourses.size} รายการสำเร็จ`);
        setSelectedCourses(new Set());
        fetchCourses();
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการยกเลิกการใช้งานหลักสูตร');
    } finally {
      setIsDisabling(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingCourse ? `/api/courses/${editingCourse._id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingCourse(null);
        fetchCourses();
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const toggleRow = (courseId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedRows(newExpanded);
  };

  const handleAddLesson = (courseId: string) => {
    setCurrentCourseId(courseId);
    setEditingLesson(null);
    setCurrentLessonIndex(-1);
    setShowLessonForm(true);
  };

  const handleEditLesson = (courseId: string, lessonIndex: number, lesson: ILesson) => {
    setCurrentCourseId(courseId);
    setEditingLesson(lesson);
    setCurrentLessonIndex(lessonIndex);
    setShowLessonForm(true);
  };

  const handleDeleteLesson = async (courseId: string, lessonIndex: number) => {
    try {
      const course = courses.find(c => c._id === courseId);
      if (!course) return;

      const updatedLessons = [...(course.lessons || [])];
      updatedLessons.splice(lessonIndex, 1);

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessons: updatedLessons }),
      });

      if (response.ok) {
        fetchCourses();
      } else {
        alert('เกิดข้อผิดพลาดในการลบบทเรียน');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบบทเรียน');
    }
  };

  const handleAddSubLesson = (courseId: string, lessonIndex: number) => {
    setCurrentCourseId(courseId);
    setCurrentLessonIndex(lessonIndex);
    setEditingSubLesson(null);
    setCurrentSubLessonIndex(-1);
    setShowSubLessonForm(true);
  };

  const handleEditSubLesson = (courseId: string, lessonIndex: number, subLessonIndex: number, subLesson: ISubLesson) => {
    setCurrentCourseId(courseId);
    setCurrentLessonIndex(lessonIndex);
    setEditingSubLesson(subLesson);
    setCurrentSubLessonIndex(subLessonIndex);
    setShowSubLessonForm(true);
  };

  const handleDeleteSubLesson = async (courseId: string, lessonIndex: number, subLessonIndex: number) => {
    try {
      const course = courses.find(c => c._id === courseId);
      if (!course || !course.lessons) return;

      const updatedLessons = [...course.lessons];
      updatedLessons[lessonIndex] = {
        ...updatedLessons[lessonIndex],
        subLessons: updatedLessons[lessonIndex].subLessons.filter((_, i) => i !== subLessonIndex),
      };

      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessons: updatedLessons }),
      });

      if (response.ok) {
        fetchCourses();
      } else {
        alert('เกิดข้อผิดพลาดในการลบบทเรียนย่อย');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการลบบทเรียนย่อย');
    }
  };

  const handleLessonSubmit = async (lesson: ILesson) => {
    try {
      setIsUpdating(true);
      const course = courses.find(c => c._id === currentCourseId);
      if (!course) {
        setIsUpdating(false);
        return;
      }

      const updatedLessons = [...(course.lessons || [])];
      
      if (currentLessonIndex >= 0) {
        // Edit existing lesson
        updatedLessons[currentLessonIndex] = lesson;
      } else {
        // Add new lesson
        updatedLessons.push(lesson);
      }

      const response = await fetch(`/api/courses/${currentCourseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessons: updatedLessons }),
      });

      if (response.ok) {
        setShowLessonForm(false);
        setEditingLesson(null);
        setCurrentCourseId('');
        setCurrentLessonIndex(-1);
        await fetchCourses();
        alert('บันทึกบทเรียนสำเร็จ');
      } else {
        const errorData = await response.json();
        alert('เกิดข้อผิดพลาดในการบันทึกบทเรียน: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting lesson:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกบทเรียน');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubLessonSubmit = async (subLesson: ISubLesson) => {
    try {
      setIsUpdating(true);
      const course = courses.find(c => c._id === currentCourseId);
      if (!course || !course.lessons || currentLessonIndex < 0) {
        setIsUpdating(false);
        return;
      }

      const updatedLessons = [...course.lessons];
      const updatedSubLessons = [...updatedLessons[currentLessonIndex].subLessons];
      
      if (currentSubLessonIndex >= 0) {
        // Edit existing sublesson
        updatedSubLessons[currentSubLessonIndex] = subLesson;
      } else {
        // Add new sublesson
        updatedSubLessons.push(subLesson);
      }

      updatedLessons[currentLessonIndex] = {
        ...updatedLessons[currentLessonIndex],
        subLessons: updatedSubLessons,
      };

      const response = await fetch(`/api/courses/${currentCourseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessons: updatedLessons }),
      });

      if (response.ok) {
        setShowSubLessonForm(false);
        setEditingSubLesson(null);
        setCurrentCourseId('');
        setCurrentLessonIndex(-1);
        setCurrentSubLessonIndex(-1);
        await fetchCourses();
        alert('บันทึกบทเรียนย่อยสำเร็จ');
      } else {
        const errorData = await response.json();
        alert('เกิดข้อผิดพลาดในการบันทึกบทเรียนย่อย: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting sublesson:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกบทเรียนย่อย');
    } finally {
      setIsUpdating(false);
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
          <h1 className="text-3xl font-bold text-gray-900">จัดการหลักสูตร</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            เพิ่มหลักสูตร
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">รายการหลักสูตร</h3>
            {selectedCourses.size > 0 && (
              <button
                onClick={handleBulkDisable}
                disabled={isDisabling}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDisabling ? 'กำลังดำเนินการ...' : `ยกเลิกการใช้งาน (${selectedCourses.size})`}
              </button>
            )}
          </div>

          <div className="px-6 py-4 border-b border-gray-200 flex gap-4 items-center">
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedCourses.size > 0 && selectedCourses.size === courses.filter((course) => {
                        if (!searchTerm) return true;
                        const searchLower = searchTerm.toLowerCase();
                        if (course.name.toLowerCase().includes(searchLower) || 
                            course.description.toLowerCase().includes(searchLower)) {
                          return true;
                        }
                        const sectionName = typeof course.sectionId === 'object' && course.sectionId?.name 
                          ? course.sectionId.name 
                          : '';
                        if (sectionName.toLowerCase().includes(searchLower)) {
                          return true;
                        }
                        const categoryName = typeof course.categoryId === 'object' && course.categoryId?.name 
                          ? course.categoryId.name 
                          : '';
                        if (categoryName.toLowerCase().includes(searchLower)) {
                          return true;
                        }
                        return false;
                      }).length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การดำเนินการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses
                  .filter((course) => {
                    if (!searchTerm) return true;
                    const searchLower = searchTerm.toLowerCase();
                    // Search in name and description
                    if (course.name.toLowerCase().includes(searchLower) || 
                        course.description.toLowerCase().includes(searchLower)) {
                      return true;
                    }
                    // Search in section name
                    const sectionName = typeof course.sectionId === 'object' && course.sectionId?.name 
                      ? course.sectionId.name 
                      : '';
                    if (sectionName.toLowerCase().includes(searchLower)) {
                      return true;
                    }
                    // Search in category name
                    const categoryName = typeof course.categoryId === 'object' && course.categoryId?.name 
                      ? course.categoryId.name 
                      : '';
                    if (categoryName.toLowerCase().includes(searchLower)) {
                      return true;
                    }
                    return false;
                  })
                  .map((course) => {
                  const isExpanded = expandedRows.has(course._id);
                  return (
                    <React.Fragment key={course._id}>
                      <tr className={`hover:bg-gray-50 ${course.isActive === false ? 'opacity-50 bg-gray-100' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCourses.has(course._id)}
                            onChange={() => handleSelectCourse(course._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleRow(course._id)}
                            className="text-gray-400 hover:text-gray-600"
                            title={isExpanded ? 'ย่อ' : 'ขยาย'}
                          >
                            {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                          </button>
                        </td>
                        {columns.map((column) => {
                          const value = course[column.key as keyof Course];
                          return (
                            <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {column.render 
                                ? column.render(value, course) 
                                : Array.isArray(value) 
                                  ? `${value.length} รายการ` 
                                  : typeof value === 'object' && value !== null
                                    ? JSON.stringify(value)
                                    : String(value ?? '')}
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleCopy(course)}
                              disabled={copyingCourseId === course._id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="คัดลอก"
                            >
                              <FaCopy size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(course)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="แก้ไข"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(course)}
                              className="text-red-600 hover:text-red-900"
                              title="ลบ"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${course._id}-expanded`}>
                          <td colSpan={columns.length + 3} className="p-0 border-t-0 bg-gray-50">
                            <CourseContentExpander
                              courseId={course._id}
                              lessons={course.lessons || []}
                              onAddLesson={() => handleAddLesson(course._id)}
                              onEditLesson={(lessonIndex, lesson) => handleEditLesson(course._id, lessonIndex, lesson)}
                              onDeleteLesson={(lessonIndex) => handleDeleteLesson(course._id, lessonIndex)}
                              onAddSubLesson={(lessonIndex) => handleAddSubLesson(course._id, lessonIndex)}
                              onEditSubLesson={(lessonIndex, subLessonIndex, subLesson) => handleEditSubLesson(course._id, lessonIndex, subLessonIndex, subLesson)}
                              onDeleteSubLesson={(lessonIndex, subLessonIndex) => handleDeleteSubLesson(course._id, lessonIndex, subLessonIndex)}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Course Form Modal */}
        {showForm && (
          <CourseForm
            course={editingCourse}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}

        {/* Lesson Form Modal */}
        {showLessonForm && (
          <LessonForm
            lesson={editingLesson}
            existingLessons={courses.find(c => c._id === currentCourseId)?.lessons || []}
            onSubmit={handleLessonSubmit}
            onClose={() => {
              if (!isUpdating) {
                setShowLessonForm(false);
                setEditingLesson(null);
                setCurrentCourseId('');
                setCurrentLessonIndex(-1);
              }
            }}
            isSubmitting={isUpdating}
          />
        )}

        {/* SubLesson Form Modal */}
        {showSubLessonForm && (
          <SubLessonForm
            subLesson={editingSubLesson}
            existingSubLessons={
              courses.find(c => c._id === currentCourseId)?.lessons?.[currentLessonIndex]?.subLessons || []
            }
            onSubmit={handleSubLessonSubmit}
            onClose={() => {
              if (!isUpdating) {
                setShowSubLessonForm(false);
                setEditingSubLesson(null);
                setCurrentCourseId('');
                setCurrentLessonIndex(-1);
                setCurrentSubLessonIndex(-1);
              }
            }}
            isSubmitting={isUpdating}
          />
        )}

        {/* Enrollment Modal */}
        {showEnrollmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseEnrollmentModal}>
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">รายชื่อผู้ลงทะเบียน</h2>
                  <p className="text-sm text-gray-600 mt-1">หลักสูตร: {selectedCourseName}</p>
                </div>
                <button
                  onClick={handleCloseEnrollmentModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {loadingEnrollments ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-12">
                  <FaUsers className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 text-lg">ยังไม่มีผู้ลงทะเบียนในหลักสูตรนี้</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      ทั้งหมด <span className="font-semibold text-gray-900">{enrollments.length}</span> คน
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ลำดับ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ชื่อ-นามสกุล
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            สถานะ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            วันที่ลงทะเบียน
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {enrollments.map((enrollment: any, index: number) => {
                          const student = enrollment.studentId;
                          const statusColors: Record<string, string> = {
                            pending: 'bg-yellow-100 text-yellow-800',
                            confirmed: 'bg-green-100 text-green-800',
                            cancelled: 'bg-red-100 text-red-800',
                            completed: 'bg-blue-100 text-blue-800',
                          };
                          const statusLabels: Record<string, string> = {
                            pending: 'รอดำเนินการ',
                            confirmed: 'ยืนยันแล้ว',
                            cancelled: 'ยกเลิก',
                            completed: 'เสร็จสิ้น',
                          };
                          return (
                            <tr key={enrollment._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {student?.photo ? (
                                    <img
                                      src={student.photo}
                                      alt={student?.name || ''}
                                      className="h-10 w-10 rounded-full mr-3 object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                                      <FaUsers className="text-gray-600" size={20} />
                                    </div>
                                  )}
                                  <div className="text-sm font-medium text-gray-900">
                                    {student?.name || '-'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    statusColors[enrollment.status] || 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {statusLabels[enrollment.status] || enrollment.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {enrollment.enrolledAt
                                  ? new Date(enrollment.enrolledAt).toLocaleDateString('th-TH', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })
                                  : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Course Form Component
function CourseForm({ course, onSubmit, onClose }: {
  course: Course | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    description: course?.description || '',
    sectionId: typeof course?.sectionId === 'object' && course?.sectionId?._id 
      ? course.sectionId._id 
      : course?.sectionId || '',
    categoryId: typeof course?.categoryId === 'object' && course?.categoryId?._id 
      ? course.categoryId._id 
      : course?.categoryId || '',
    price: course?.price || 0,
    schedule: course?.schedule || '',
    image: course?.image || '',
    duration: course?.duration || '',
    maxStudents: course?.maxStudents || 20,
    isOnline: course?.isOnline || false,
    isOnsite: course?.isOnsite || true,
    endDate: course?.endDate ? new Date(course.endDate).toISOString().split('T')[0] : '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(course?.image || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsRes, categoriesRes] = await Promise.all([
          fetch('/api/sections'),
          fetch('/api/categories'),
        ]);
        const [sectionsData, categoriesData] = await Promise.all([
          sectionsRes.json(),
          categoriesRes.json(),
        ]);
        setSections(sectionsData);
        setCategoryList(categoriesData);
      } catch (error) {
        console.error('Error fetching sections/categories:', error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const filteredCategories = formData.sectionId
    ? categoryList.filter((cat) => 
        typeof cat.sectionId === 'string' 
          ? cat.sectionId === formData.sectionId 
          : cat.sectionId._id === formData.sectionId
      )
    : categoryList;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF, WEBP)');
      return;
    }

    // ตรวจสอบขนาดไฟล์ (สูงสุด 7MB)
    const maxSize = 7 * 1024 * 1024; // 7MB
    if (file.size > maxSize) {
      setUploadError('ขนาดไฟล์ต้องไม่เกิน 7MB');
      return;
    }

    setImageFile(file);
    setUploadError('');

    // สร้าง preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // อัปโหลดไฟล์ทันที
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadErrorData = await uploadResponse.json();
        throw new Error(uploadErrorData.error || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      }

      const uploadData = await uploadResponse.json();
      setFormData({
        ...formData,
        image: uploadData.url,
      });
      setImagePreview(uploadData.url);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      setImageFile(null);
      setImagePreview(course?.image || '');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      sectionId: formData.sectionId || null,
      categoryId: formData.categoryId || null,
    };
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {course ? 'แก้ไขหลักสูตร' : 'เพิ่มหลักสูตรใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อหลักสูตร *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                name="sectionId"
                value={typeof formData.sectionId === 'string' ? formData.sectionId : ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingData}
              >
                <option value="">เลือก Section (ไม่บังคับ)</option>
                {sections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="categoryId"
              value={typeof formData.categoryId === 'string' ? formData.categoryId : ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingData || !formData.sectionId}
            >
              <option value="">เลือก Category (ไม่บังคับ)</option>
              {filteredCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ราคา *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ระยะเวลาเรียน *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                placeholder="เช่น 3 เดือน"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                วันสิ้นสุดคอร์ส
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ตารางเรียน *
              </label>
              <input
                type="text"
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                required
                placeholder="เช่น จันทร์-พุธ 18:00-20:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                จำนวนนักเรียนสูงสุด
              </label>
              <input
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รูปภาพ
            </label>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              disabled={uploading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && (
              <p className="mt-2 text-sm text-blue-600">กำลังอัปโหลดรูปภาพ...</p>
            )}
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">ตัวอย่างรูปภาพ:</p>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-xs max-h-48 rounded-lg border-2 border-gray-300 shadow-md"
                />
              </div>
            )}
          </div>

          <div className="flex items-end space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isOnline"
                checked={formData.isOnline}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">ออนไลน์</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isOnsite"
                checked={formData.isOnsite}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">ออนไซต์</span>
            </label>
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
              {course ? 'อัปเดต' : 'สร้าง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
