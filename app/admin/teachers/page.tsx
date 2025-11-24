'use client';

import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import { FaPlus } from 'react-icons/fa';

interface Teacher {
  _id: string;
  name: string;
  image: string;
  education: string;
  expertise: string[];
  experience: number;
  achievements: string[];
  bio: string;
  subjects: string[];
  createdAt: string;
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const columns = [
    {
      key: 'name',
      label: 'ชื่อ',
    },
    {
      key: 'education',
      label: 'วุฒิการศึกษา',
    },
    {
      key: 'experience',
      label: 'ประสบการณ์',
      render: (value: number) => `${value} ปี`,
    },
    {
      key: 'subjects',
      label: 'วิชาที่สอน',
      render: (value: string[]) => value.join(', '),
    },
    {
      key: 'expertise',
      label: 'ความเชี่ยวชาญ',
      render: (value: string[]) => value.slice(0, 2).join(', ') + (value.length > 2 ? '...' : ''),
    },
  ];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleDelete = async (teacher: Teacher) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบครูผู้สอนคนนี้?')) {
      try {
        const response = await fetch(`/api/teachers/${teacher._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchTeachers();
        } else {
          alert('เกิดข้อผิดพลาดในการลบครูผู้สอน');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบครูผู้สอน');
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingTeacher ? `/api/teachers/${editingTeacher._id}` : '/api/teachers';
      const method = editingTeacher ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingTeacher(null);
        fetchTeachers();
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTeacher(null);
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
          <h1 className="text-3xl font-bold text-gray-900">จัดการครูผู้สอน</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <FaPlus className="mr-2" />
            เพิ่มครูผู้สอน
          </button>
        </div>

        <DataTable
          data={teachers}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          title="รายการครูผู้สอน"
        />

        {/* Teacher Form Modal */}
        {showForm && (
          <TeacherForm
            teacher={editingTeacher}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Teacher Form Component
function TeacherForm({ teacher, onSubmit, onClose }: {
  teacher: Teacher | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: teacher?.name || '',
    image: teacher?.image || '',
    education: teacher?.education || '',
    expertise: teacher?.expertise || [],
    experience: teacher?.experience || 0,
    achievements: teacher?.achievements || [],
    bio: teacher?.bio || '',
    subjects: teacher?.subjects || [],
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(teacher?.image || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (teacher?.image) {
      setImagePreview(teacher.image);
    }
  }, [teacher]);

  const subjects = [
    'คณิตศาสตร์',
    'ภาษาอังกฤษ',
    'ฟิสิกส์',
    'เคมี',
    'ชีววิทยา',
    'สังคมศึกษา',
    'ภาษาไทย',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0,
    });
  };

  const handleSubjectChange = (subject: string) => {
    const currentSubjects = Array.isArray(formData.subjects) ? formData.subjects : [];
    setFormData({
      ...formData,
      subjects: currentSubjects.includes(subject)
        ? currentSubjects.filter(s => s !== subject)
        : [...currentSubjects, subject],
    });
  };

  const handleAddExpertise = () => {
    const currentExpertise = Array.isArray(formData.expertise) ? formData.expertise : [];
    if (expertiseInput.trim() && !currentExpertise.includes(expertiseInput.trim())) {
      setFormData({
        ...formData,
        expertise: [...currentExpertise, expertiseInput.trim()],
      });
      setExpertiseInput('');
    }
  };

  const handleRemoveExpertise = (index: number) => {
    const currentExpertise = Array.isArray(formData.expertise) ? formData.expertise : [];
    setFormData({
      ...formData,
      expertise: currentExpertise.filter((_, i) => i !== index),
    });
  };

  const handleAddAchievement = () => {
    const currentAchievements = Array.isArray(formData.achievements) ? formData.achievements : [];
    if (achievementInput.trim() && !currentAchievements.includes(achievementInput.trim())) {
      setFormData({
        ...formData,
        achievements: [...currentAchievements, achievementInput.trim()],
      });
      setAchievementInput('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    const currentAchievements = Array.isArray(formData.achievements) ? formData.achievements : [];
    setFormData({
      ...formData,
      achievements: currentAchievements.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // ตรวจสอบขนาดไฟล์ (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    setUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
      }

      const data = await response.json();
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: data.url,
      }));
      setImagePreview(data.url);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
      
      // Reset file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {teacher ? 'แก้ไขข้อมูลครูผู้สอน' : 'เพิ่มครูผู้สอนใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ-นามสกุล * 
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
                วุฒิการศึกษา *
              </label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
                placeholder="เช่น ปริญญาตรี วิทยาศาสตร์"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประสบการณ์ (ปี) *
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleNumberChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รูปภาพ
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {uploading && (
                <p className="mt-1 text-sm text-blue-600">กำลังอัปโหลด...</p>
              )}
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-contain bg-gray-100 rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ประวัติย่อ *
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วิชาที่สอน *
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <label key={subject} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={Array.isArray(formData.subjects) && formData.subjects.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ความเชี่ยวชาญ *
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExpertise();
                  }
                }}
                placeholder="เพิ่มความเชี่ยวชาญ"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddExpertise}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                เพิ่ม
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(formData.expertise) && formData.expertise.map((exp, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {exp}
                  <button
                    type="button"
                    onClick={() => handleRemoveExpertise(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ผลงาน/รางวัล
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAchievement();
                  }
                }}
                placeholder="เพิ่มผลงาน/รางวัล"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddAchievement}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                เพิ่ม
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(formData.achievements) && formData.achievements.map((achievement, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {achievement}
                  <button
                    type="button"
                    onClick={() => handleRemoveAchievement(index)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
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
              {teacher ? 'อัปเดต' : 'สร้าง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
