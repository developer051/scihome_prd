'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import CourseContentExpander from '@/components/CourseContentExpander';
import LessonForm from '@/components/LessonForm';
import SubLessonForm from '@/components/SubLessonForm';
import { FaPlus, FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { ILesson, ISubLesson } from '@/models/Course';

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
  lessons?: ILesson[];
  createdAt: string;
}

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

  const columns = [
    {
      key: 'name',
      label: 'ชื่อหลักสูตร',
    },
    {
      key: 'category',
      label: 'หมวดหมู่',
    },
    {
      key: 'level',
      label: 'ระดับชั้น',
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
      key: 'isOnline',
      label: 'ออนไลน์',
      render: (value: boolean) => value ? '✓' : '✗',
    },
    {
      key: 'isOnsite',
      label: 'ออนไซต์',
      render: (value: boolean) => value ? '✓' : '✗',
    },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');
      const response = await fetch('/api/courses');
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
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">รายการหลักสูตร</h3>
          </div>

          <div className="px-6 py-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                  .filter((course) =>
                    columns.some((column) => {
                      const value = course[column.key as keyof Course];
                      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
                    })
                  )
                  .map((course) => {
                  const isExpanded = expandedRows.has(course._id);
                  return (
                    <React.Fragment key={course._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleRow(course._id)}
                            className="text-gray-400 hover:text-gray-600"
                            title={isExpanded ? 'ย่อ' : 'ขยาย'}
                          >
                            {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                          </button>
                        </td>
                        {columns.map((column) => (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {column.render ? column.render(course[column.key as keyof Course], course) : course[column.key as keyof Course]}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
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
                          <td colSpan={columns.length + 2} className="p-0 border-t-0 bg-gray-50">
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
    category: course?.category || '',
    level: course?.level || '',
    price: course?.price || 0,
    schedule: course?.schedule || '',
    image: course?.image || '',
    duration: course?.duration || '',
    maxStudents: course?.maxStudents || 20,
    isOnline: course?.isOnline || false,
    isOnsite: course?.isOnsite || true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(course?.image || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const categories = [
    'คณิตศาสตร์',
    'ภาษาอังกฤษ',
    'ฟิสิกส์',
    'เคมี',
    'ชีววิทยา',
    'สังคมศึกษา',
    'ภาษาไทย',
  ];

  const levels = [
    'ม.1',
    'ม.2',
    'ม.3',
    'ม.4',
    'ม.5',
    'ม.6',
    'เตรียมสอบเข้า',
  ];

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

    // ตรวจสอบขนาดไฟล์ (สูงสุด 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('ขนาดไฟล์ต้องไม่เกิน 5MB');
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
    onSubmit(formData);
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
                หมวดหมู่ *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
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
                ระดับชั้น *
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">เลือกระดับชั้น</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
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

          <div className="flex items-center space-x-4">
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
