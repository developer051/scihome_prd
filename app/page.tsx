'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FaArrowRight, 
  FaStar, 
  FaUsers, 
  FaGraduationCap, 
  FaTrophy, 
  FaClock, 
  FaSearch, 
  FaFilter,
  FaBookOpen,
  FaAward
} from 'react-icons/fa';
import CourseCard from '@/components/CourseCard';
import CourseSolutionCard from '@/components/CourseSolutionCard';
import TestimonialCard from '@/components/TestimonialCard';

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
}

interface Testimonial {
  _id: string;
  studentName: string;
  message: string;
  image: string;
  course: string;
  rating: number;
}

interface News {
  _id: string;
  title: string;
  content: string;
  image: string;
  publishedAt: string;
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [allNews, setAllNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [displayCount, setDisplayCount] = useState(8);
  const [newsDisplayCount, setNewsDisplayCount] = useState(6);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, testimonialsRes, newsRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/testimonials'),
          fetch('/api/news'),
        ]);

        const [coursesData, testimonialsData, newsData] = await Promise.all([
          coursesRes.json(),
          testimonialsRes.json(),
          newsRes.json(),
        ]);

        setAllCourses(coursesData);
        setCourses(coursesData.slice(0, 4));
        setTestimonials(testimonialsData.slice(0, 3));
        setAllNews(newsData);
        setNews(newsData.slice(0, 6));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter courses based on search and category
  useEffect(() => {
    let filtered = allCourses;

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((course) => course.category === selectedCategory);
    }

    setFilteredCourses(filtered);
    // Reset display count when filter changes
    const newDisplayCount = 8;
    setDisplayCount(newDisplayCount);
    setCourses(filtered.slice(0, newDisplayCount));
  }, [allCourses, searchTerm, selectedCategory]);

  // Update displayed courses when displayCount changes
  useEffect(() => {
    setCourses(filteredCourses.slice(0, displayCount));
  }, [displayCount, filteredCourses]);

  // Update displayed news when newsDisplayCount changes
  useEffect(() => {
    setNews(allNews.slice(0, newsDisplayCount));
  }, [newsDisplayCount, allNews]);

  const categories = Array.from(new Set(allCourses.map((course) => course.category)));

  const features = [
    {
      icon: FaGraduationCap,
      title: 'ครูผู้สอนคุณภาพ',
      description: 'ทีมครูผู้สอนที่มีประสบการณ์และความเชี่ยวชาญในแต่ละวิชา',
    },
    {
      icon: FaUsers,
      title: 'กลุ่มเรียนเล็ก',
      description: 'จำกัดจำนวนนักเรียนต่อห้องเพื่อการดูแลอย่างใกล้ชิด',
    },
    {
      icon: FaTrophy,
      title: 'ผลลัพธ์ที่พิสูจน์ได้',
      description: 'นักเรียนของเรามีอัตราการสอบติดมหาวิทยาลัยสูง',
    },
    {
      icon: FaClock,
      title: 'เวลาเรียนยืดหยุ่น',
      description: 'มีทั้งรูปแบบออนไลน์และออนไซต์ให้เลือกตามความสะดวก',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Clean & Simple */}
      <section className="relative bg-gradient-to-br from-white via-blue-50/30 to-white border-b border-gray-200 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 lg:py-48">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up">
                ปั้นเกรด A
                <br />
                <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                  เตรียมสอบติด
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up animation-delay-400">
                สถาบันกวดวิชาที่มุ่งมั่นในการพัฒนาการศึกษาและสร้างอนาคตที่ดีให้กับนักเรียนทุกคน
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-teal-500 hover:text-teal-600 transition-all duration-300 hover:shadow-md hover:scale-105 card-glow-animated"
                >
                  ทดลองเรียนฟรี
                </Link>
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-blue-500 hover:text-blue-600 transition-all duration-300 hover:shadow-md hover:scale-105 card-glow-blue gap-2"
                >
                  Register
                  <FaArrowRight className="animate-arrow-slide" />
                </Link>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="relative animate-fade-in-up animation-delay-400">
              <div className="relative w-full h-full flex items-center justify-center bg-transparent">
                <img
                  src="/grouptran.png"
                  alt="กลุ่มนักเรียน"
                  className="w-full h-auto object-contain scale-110"
                  style={{ mixBlendMode: 'normal' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced Design */}
      <section className="py-8 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden -mt-8">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-blue-300"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/0 group-hover:from-blue-50/50 group-hover:to-blue-100/30 rounded-xl transition-all duration-300"></div>
                  
                  <div className="relative z-10">
                    {/* Icon with animated background */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/30">
                      <Icon className="text-white text-xl" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 text-xs leading-relaxed text-center">
                      {feature.description}
                    </p>
                  </div>

                  {/* Decorative corner element */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                หลักสูตรยอดนิยม
              </h2>
              <p className="text-gray-600">
                หลักสูตรที่ได้รับความนิยมจากนักเรียนและผู้ปกครอง
              </p>
            </div>
            <Link
              href="/courses"
              className="text-blue-600 hover:text-blue-700 font-medium mt-4 md:mt-0"
            >
              ดูหลักสูตรทั้งหมด →
            </Link>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาหลักสูตร"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <div className="relative md:w-64">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">ทั้งหมด</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-600">
            พบ {filteredCourses.length} หลักสูตร
            {courses.length > 0 && ` (แสดง 1-${courses.length})`}
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseSolutionCard key={course._id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">ไม่พบหลักสูตรที่ค้นหา</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                ล้างการค้นหา
              </button>
            </div>
          )}

          {/* Show More Button */}
          {!loading && courses.length < filteredCourses.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setDisplayCount(displayCount + 15)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                แสดงอีก 15 รายการ
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              รีวิวจากนักเรียน
            </h2>
            <p className="text-gray-600">
              ความประทับใจจากนักเรียนที่เรียนกับเรา
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial._id} testimonial={testimonial} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ข่าวสารและกิจกรรม
            </h2>
            <p className="text-gray-600">
              อัปเดตข่าวสารและกิจกรรมล่าสุด
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.map((item) => (
                <Link
                  key={item._id}
                  href={`/news/${item._id}`}
                  className="group bg-white rounded-lg overflow-hidden border border-gray-200 news-card-glow flex flex-col h-full"
                >
                  <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {item.content}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {new Date(item.publishedAt).toLocaleDateString('th-TH')}
                    </p>
                    <div className="flex justify-start items-center gap-2 mt-auto group-hover:gap-3 transition-all duration-300">
                      <FaArrowRight className="text-gray-500 text-base group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
                      <span className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                        อ่านเพิ่มเติม
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && news.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">ยังไม่มีข่าวสาร</p>
            </div>
          )}

          {/* Show More News Button */}
          {!loading && news.length < allNews.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setNewsDisplayCount(newsDisplayCount + 6)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                แสดงอีก 6 รายการ
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}