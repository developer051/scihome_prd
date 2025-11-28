'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import CourseCard from '@/components/CourseCard';

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
  sectionId?: string;
  categoryId?: string;
}

interface Section {
  _id: string;
  name: string;
  description: string;
  order: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, sectionsRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/sections'),
        ]);

        const [coursesData, sectionsData] = await Promise.all([
          coursesRes.json(),
          sectionsRes.json(),
        ]);

        const sortedSections = sectionsData.sort((a: Section, b: Section) => a.order - b.order);
        setSections(sortedSections);

        // Map courses to include sectionName
        const coursesWithSectionName = coursesData.map((course: Course) => {
          const section = sortedSections.find((s: Section) => {
            const courseSectionId = typeof course.sectionId === 'string' ? course.sectionId : course.sectionId?._id;
            return s._id === courseSectionId;
          });
          return {
            ...course,
            sectionName: section?.name,
          };
        });

        setCourses(coursesWithSectionName);
        setFilteredCourses(coursesWithSectionName);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSection) {
      filtered = filtered.filter((course) => course.sectionId === selectedSection);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedSection]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-right mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">หลักสูตรทั้งหมด</h1>
          <p className="text-xl text-gray-600">
            เลือกหลักสูตรที่เหมาะสมกับความต้องการของคุณ
          </p>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            พบ {filteredCourses.length} หลักสูตร
            {(searchTerm || selectedSection) && ' จากทั้งหมด ' + courses.length + ' หลักสูตร'}
          </p>
        </div>

        {/* Main Content: Filters Sidebar + Courses Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaFilter className="text-blue-600" />
                ตัวกรอง
              </h2>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ค้นหา
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาหลักสูตร..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Section Filter */}
                <section>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมวดหมู่
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSection('')}
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                        selectedSection === ''
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ทุกหมวดหมู่
                    </button>
                    {sections.map((section) => (
                      <button
                        key={section._id}
                        onClick={() => setSelectedSection(section._id)}
                        className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                          selectedSection === section._id
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {section.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Clear Filters */}
                {(searchTerm || selectedSection) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSection('');
                    }}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <FaFilter className="mx-auto text-gray-400 text-6xl mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่พบหลักสูตร</h3>
                <p className="text-gray-600 mb-4">
                  ลองเปลี่ยนคำค้นหาหรือตัวกรองดูครับ
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSection('');
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
