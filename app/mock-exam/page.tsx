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
  };
  duration: number;
  totalScore: number;
  passingScore?: number;
  questions: any[];
  isActive: boolean;
  createdAt: string;
}

export default function MockExamPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'คณิตศาสตร์',
    'ภาษาอังกฤษ',
    'ฟิสิกส์',
    'เคมี',
    'ชีววิทยา',
    'สังคมศึกษา',
    'ภาษาไทย',
  ];

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('/api/exams');
        const data = await response.json();
        // กรองเฉพาะข้อสอบที่ active
        const activeExams = data.filter((exam: Exam) => exam.isActive);
        setExams(activeExams);
        setFilteredExams(activeExams);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
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

    if (selectedCategory) {
      filtered = filtered.filter((exam) => exam.courseId?.category === selectedCategory);
    }

    setFilteredExams(filtered);
  }, [exams, searchTerm, selectedCategory]);

  // นับจำนวนข้อสอบในแต่ละวิชา
  const getCategoryCount = (category: string) => {
    return exams.filter((exam) => exam.courseId?.category === category).length;
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex justify-end">
            <div className="max-w-3xl text-right">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up animation-delay-200">
                Mock Exam
                <br />
                <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent animate-fade-in-up animation-delay-400">
                  ทดสอบความรู้
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up animation-delay-600">
                เลือกข้อสอบที่ต้องการทำเพื่อทดสอบความรู้ของคุณ
                <br />
                เตรียมความพร้อมสำหรับการสอบจริง
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Exams Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Categories Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">เลือกตามวิชา</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* All Categories Button */}
              <button
                onClick={() => setSelectedCategory('')}
                className={`bg-white rounded-lg border-2 p-3 text-left transition-all duration-200 category-card-glow ${
                  selectedCategory === ''
                    ? 'border-blue-600 bg-blue-50 selected'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">ทั้งหมด</span>
                  <span className={`text-base font-bold ${
                    selectedCategory === '' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {exams.length}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">ข้อสอบทั้งหมด</div>
              </button>

              {/* Category Cards */}
              {categories.map((category) => {
                const count = getCategoryCount(category);
                const hasExams = count > 0;
                const isSelected = selectedCategory === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`bg-white rounded-lg border-2 p-3 text-left transition-all duration-200 category-card-glow ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 selected'
                        : hasExams
                        ? 'border-gray-200 hover:border-blue-300'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${
                        isSelected ? 'text-blue-600' : hasExams ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {category}
                      </span>
                      <span className={`text-base font-bold ${
                        isSelected ? 'text-blue-600' : hasExams ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {count}
                      </span>
                    </div>
                    <div className={`text-[10px] ${
                      isSelected ? 'text-blue-600' : hasExams ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {hasExams ? 'ข้อสอบ' : 'ยังไม่มีข้อสอบ'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          {selectedCategory && (
            <div className="mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาข้อสอบในหมวดหมู่นี้..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          <div className="mb-4 text-sm text-gray-600">
            พบ {filteredExams.length} ข้อสอบ
            {(searchTerm || selectedCategory) && ` จากทั้งหมด ${exams.length} ข้อสอบ`}
          </div>

          {/* Exams Grid */}
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
                  setSelectedCategory('');
                }}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
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

