'use client';

import { useEffect, useState } from 'react';
import TeacherCard from '@/components/TeacherCard';

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
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchTeachers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Clean & Simple */}
      <section className="relative bg-gradient-to-br from-white via-blue-50/30 to-white border-b border-gray-200 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex justify-end">
            <div className="max-w-3xl text-right">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 leading-tight animate-fade-in-up">
                ครูผู้สอน
                <br />
                <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                  คุณภาพสูง
                </span>
              </h1>
              
              <p className="text-base md:text-lg text-gray-600 mb-0 leading-relaxed animate-fade-in-up animation-delay-400">
                ทีมครูผู้สอนที่มีประสบการณ์และความเชี่ยวชาญในแต่ละวิชา พร้อมมุ่งมั่นในการพัฒนาการศึกษาและสร้างอนาคตที่ดีให้กับนักเรียนทุกคน
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Teachers Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
              ))}
            </div>
          ) : teachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <TeacherCard key={teacher._id} teacher={teacher} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">ไม่พบครูผู้สอน</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
