'use client';

import { useEffect, useState } from 'react';
import { FaSearch, FaFilter, FaClock, FaFileAlt, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

interface Exam {
  _id: string;
  title: string;
  description: string;
  courseId: {
    _id: string;
    name: string;
    category: string;
    level: string;
    sectionId?: string | { _id: string; name: string };
    categoryId?: string | { _id: string; name: string; sectionId?: string | { _id: string; name: string } };
  };
  duration: number;
  totalScore: number;
  passingScore?: number;
  questions: any[];
  isActive: boolean;
  createdAt: string;
}

interface Section {
  _id: string;
  name: string;
  description: string;
  order: number;
}

export default function MockExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, sectionsRes] = await Promise.all([
          fetch('/api/exams'),
          fetch('/api/sections'),
        ]);

        const [examsData, sectionsData] = await Promise.all([
          examsRes.json(),
          sectionsRes.json(),
        ]);

        const sortedSections = sectionsData.sort((a: Section, b: Section) => a.order - b.order);
        setSections(sortedSections);

        // กรองเฉพาะข้อสอบที่ active
        const activeExams = examsData.filter((exam: Exam) => exam.isActive);
        setExams(activeExams);
        setFilteredExams(activeExams);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = exams;

    if (searchTerm) {
      filtered = filtered.filter(
        (exam) =>
          exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.courseId?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSection) {
      filtered = filtered.filter((exam) => {
        const courseSectionId = typeof exam.courseId?.sectionId === 'string' 
          ? exam.courseId.sectionId 
          : exam.courseId?.sectionId?._id;
        const categorySectionId = typeof exam.courseId?.categoryId === 'object' && exam.courseId.categoryId
          ? (typeof exam.courseId.categoryId.sectionId === 'string'
              ? exam.courseId.categoryId.sectionId
              : exam.courseId.categoryId.sectionId?._id)
          : null;
        return courseSectionId === selectedSection || categorySectionId === selectedSection;
      });
    }

    setFilteredExams(filtered);
  }, [exams, searchTerm, selectedSection]);

  // นับจำนวนข้อสอบในแต่ละ section
  const getSectionCount = (sectionId: string) => {
    return exams.filter((exam) => {
      const courseSectionId = typeof exam.courseId?.sectionId === 'string' 
        ? exam.courseId.sectionId 
        : exam.courseId?.sectionId?._id;
      const categorySectionId = typeof exam.courseId?.categoryId === 'object' && exam.courseId.categoryId
        ? (typeof exam.courseId.categoryId.sectionId === 'string'
            ? exam.courseId.categoryId.sectionId
            : exam.courseId.categoryId.sectionId?._id)
        : null;
      return courseSectionId === sectionId || categorySectionId === sectionId;
    }).length;
  };

  // Category icons และ colors
  const categoryIcons: { [key: string]: string } = {
    'คณิตศาสตร์': '📐',
    'ภาษาอังกฤษ': '🔤',
    'ฟิสิกส์': '⚛️',
    'เคมี': '🧪',
    'ชีววิทยา': '🔬',
    'สังคมศึกษา': '📚',
    'ภาษาไทย': '✍️',
  };

  const categoryGradients: { [key: string]: string } = {
    'คณิตศาสตร์': 'from-purple-50 to-purple-100',
    'ภาษาอังกฤษ': 'from-blue-50 to-blue-100',
    'ฟิสิกส์': 'from-orange-50 to-orange-100',
    'เคมี': 'from-green-50 to-green-100',
    'ชีววิทยา': 'from-emerald-50 to-emerald-100',
    'สังคมศึกษา': 'from-amber-50 to-amber-100',
    'ภาษาไทย': 'from-rose-50 to-rose-100',
  };

  const categoryBadgeColors: { [key: string]: string } = {
    'คณิตศาสตร์': 'bg-purple-600',
    'ภาษาอังกฤษ': 'bg-blue-600',
    'ฟิสิกส์': 'bg-orange-600',
    'เคมี': 'bg-green-600',
    'ชีววิทยา': 'bg-emerald-600',
    'สังคมศึกษา': 'bg-amber-600',
    'ภาษาไทย': 'bg-rose-600',
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || '📝';
  };

  const getCategoryGradient = (category: string) => {
    return categoryGradients[category] || 'from-blue-50 to-blue-100';
  };

  const getCategoryBadgeColor = (category: string) => {
    return categoryBadgeColors[category] || 'bg-blue-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Matching Homepage Style */}
      <section className="relative bg-gradient-to-br from-white via-blue-50/30 to-white border-b border-gray-200 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5">
          <div className="flex justify-end">
            <div className="max-w-3xl text-right">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 leading-tight animate-fade-in-up animation-delay-200">
                Mock Exam
                <br />
                <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent animate-fade-in-up animation-delay-400">
                  ทดสอบความรู้
                </span>
              </h1>
              
              <p className="text-base md:text-lg text-gray-600 mb-0 leading-relaxed animate-fade-in-up animation-delay-600">
                เลือกข้อสอบที่ต้องการทำเพื่อทดสอบความรู้ของคุณ
                <br />
                เตรียมความพร้อมสำหรับการสอบจริง
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exams Section */}
      <section className="pt-6 pb-16 bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Content: Filters Sidebar + Exams Grid */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Categories Sidebar */}
            <div className="lg:w-56 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sticky top-6">
                <div className="space-y-3">
                  {/* Section Filter */}
                  <section>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      หมวดหมู่
                    </label>
                    <div className="space-y-1">
                      <button
                        onClick={() => setSelectedSection('')}
                        className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200 font-medium ${
                          selectedSection === ''
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 transform scale-[1.02]'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {selectedSection === '' && (
                            <span className="w-1 h-1 bg-white rounded-full"></span>
                          )}
                          ทุกหมวดหมู่
                        </span>
                      </button>
                      {sections.map((section) => {
                        const count = getSectionCount(section._id);
                        const hasExams = count > 0;
                        const isSelected = selectedSection === section._id;
                        
                        return (
                          <button
                            key={section._id}
                            onClick={() => setSelectedSection(section._id)}
                            className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200 font-medium ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 transform scale-[1.02]'
                                : hasExams
                                ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-gray-200'
                                : 'bg-gray-50 text-gray-400 border border-gray-200 opacity-60 cursor-not-allowed'
                            }`}
                            disabled={!hasExams}
                          >
                            <span className="flex items-center gap-1.5">
                              {isSelected && (
                                <span className="w-1 h-1 bg-white rounded-full"></span>
                              )}
                              {section.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Clear Filters */}
                  {(searchTerm || selectedSection) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedSection('');
                      }}
                      className="w-full px-2.5 py-1.5 text-xs bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      ล้างตัวกรอง
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Exams Grid */}
            <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
              ))}
            </div>
          ) : filteredExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <Link key={exam._id} href={`/mock-exam/${exam._id}`} className="group">
                  <div className="bg-white rounded-lg cursor-pointer flex flex-col h-full border border-gray-100 overflow-hidden course-solution-card-glow">
                    {/* Exam Header */}
                    <div className={`relative bg-gradient-to-br ${getCategoryGradient(exam.courseId?.category || '')} p-6 border-b border-gray-100 overflow-hidden`}>
                      {/* Decorative background pattern */}
                      <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
                        <div className="text-[12rem] transform rotate-12 translate-x-12 -translate-y-12 transition-transform duration-300 ease-in-out group-hover:rotate-24">
                          {getCategoryIcon(exam.courseId?.category || '')}
                        </div>
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`${getCategoryBadgeColor(exam.courseId?.category || '')} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5`}>
                            <span className="text-sm">{getCategoryIcon(exam.courseId?.category || '')}</span>
                            <span>{exam.courseId?.category || 'ข้อสอบ'}</span>
                          </div>
                          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                            <div className="text-7xl">
                              {getCategoryIcon(exam.courseId?.category || '')}
                            </div>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {exam.title}
                        </h3>
                        {exam.courseId && (
                          <p className="text-sm text-gray-600">
                            {exam.courseId.level}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow leading-relaxed">
                        {exam.description}
                      </p>

                      {/* Exam Details */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-700">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                            <FaClock className="text-blue-600 text-sm" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">เวลาในการทำ</div>
                            <div className="text-sm font-semibold">{exam.duration} นาที</div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                            <FaFileAlt className="text-purple-600 text-sm" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">จำนวนข้อ</div>
                            <div className="text-sm font-semibold">{exam.questions?.length || 0} ข้อ</div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                            <FaGraduationCap className="text-green-600 text-sm" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">คะแนนเต็ม</div>
                            <div className="text-sm font-semibold">{exam.totalScore} คะแนน</div>
                          </div>
                        </div>
                        {exam.passingScore && (
                          <div className="flex items-center text-gray-700">
                            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mr-3">
                              <FaGraduationCap className="text-amber-600 text-sm" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">คะแนนผ่าน</div>
                              <div className="text-sm font-semibold">{exam.passingScore} คะแนน</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Navigation Arrow */}
                      <div className="flex justify-start items-center gap-2 mt-auto group-hover:gap-3 transition-all duration-300">
                        <FaArrowRight className="text-gray-500 text-base group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                        <span className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                          เริ่มทำข้อสอบ
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FaFilter className="mx-auto text-gray-400 text-4xl mb-4" />
              <p className="text-gray-600 mb-4">ไม่พบข้อสอบที่ค้นหา</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSection('');
                }}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                ล้างการค้นหา
              </button>
            </div>
          )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

