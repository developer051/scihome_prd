'use client';

import { useState } from 'react';
import { ISubLesson } from '@/models/Course';

interface SubLessonFormProps {
  subLesson: ISubLesson | null;
  existingSubLessons: ISubLesson[];
  onSubmit: (subLesson: ISubLesson) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

export default function SubLessonForm({
  subLesson,
  existingSubLessons,
  onSubmit,
  onClose,
  isSubmitting = false,
}: SubLessonFormProps) {
  const [formData, setFormData] = useState({
    title: subLesson?.title || '',
    description: subLesson?.description || '',
    order: subLesson?.order || existingSubLessons.length + 1,
    duration: subLesson?.duration || '',
    youtubeLink: subLesson?.youtubeLink || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'order' ? parseInt(value) || 0 : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subLessonData: any = {
      title: formData.title,
      description: formData.description,
      order: formData.order,
      duration: formData.duration,
    };
    
    // Include youtubeLink if provided (even if empty string)
    if (formData.youtubeLink !== undefined && formData.youtubeLink !== null) {
      subLessonData.youtubeLink = formData.youtubeLink.trim() || '';
    }
    
    onSubmit(subLessonData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {subLesson ? 'แก้ไขบทเรียนย่อย' : 'เพิ่มบทเรียนย่อยใหม่'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อบทเรียนย่อย *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น 1.1 การบวกและการลบ"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ลำดับ *
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ระยะเวลา
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น 2 ชั่วโมง"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="อธิบายรายละเอียดของบทเรียนย่อยนี้..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video ID
            </label>
            <input
              type="text"
              name="youtubeLink"
              value={formData.youtubeLink}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น dQw4w9WgXcQ"
            />
            <p className="mt-1 text-xs text-gray-500">
              ใส่แค่ Video ID จาก YouTube (ไม่ต้องใส่ URL เต็ม)
            </p>
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'กำลังบันทึก...' : (subLesson ? 'อัปเดต' : 'สร้าง')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

