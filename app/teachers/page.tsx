'use client';

import { useEffect, useState } from 'react';
import { 
  FaSearch, 
  FaFilter
} from 'react-icons/fa';
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
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const subjects = [
    'คณิตศาสตร์',
    'ภาษาอังกฤษ',
    'ฟิสิกส์',
    'เคมี',
    'ชีววิทยา',
    'สังคมศึกษา',
    'ภาษาไทย',
  ];

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await fetch('/api/teachers');
        const data = await response.json();
        setTeachers(data);
        setFilteredTeachers(data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  useEffect(() => {
    let filtered = teachers;

    if (searchTerm) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.education.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.expertise.some(skill => 
            skill.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter((teacher) => 
        teacher.subjects.includes(selectedSubject)
      );
    }

    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, selectedSubject]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Clean & Simple */}
      <section className="relative bg-gradient-to-br from-white via-blue-50/30 to-white border-b border-gray-200 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex justify-end">
            <div className="max-w-3xl text-right">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight animate-fade-in-up">
                ครูผู้สอน
                <br />
                <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                  คุณภาพสูง
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed animate-fade-in-up animation-delay-400">
                ทีมครูผู้สอนที่มีประสบการณ์และความเชี่ยวชาญในแต่ละวิชา พร้อมมุ่งมั่นในการพัฒนาการศึกษาและสร้างอนาคตที่ดีให้กับนักเรียนทุกคน
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                ครูผู้สอนทั้งหมด
              </h2>
              <p className="text-gray-600">
                ทีมครูผู้สอนที่มีประสบการณ์และความเชี่ยวชาญในแต่ละวิชา
              </p>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาครูผู้สอน"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <div className="relative md:w-64">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">ทุกวิชา</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            พบ {filteredTeachers.length} ครูผู้สอน
            {filteredTeachers.length > 0 && ` (แสดง 1-${filteredTeachers.length})`}
          </div>

          {/* Teachers Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
              ))}
            </div>
          ) : filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map((teacher) => (
                <TeacherCard key={teacher._id} teacher={teacher} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">ไม่พบครูผู้สอนที่ค้นหา</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('');
                }}
                className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                ล้างการค้นหา
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
