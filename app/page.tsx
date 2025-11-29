'use client';

import { useEffect, useState, useRef } from 'react';
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
import StudentAchievementCarousel from '@/components/StudentAchievementCarousel';

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
  sectionId?: string | { _id: string };
  categoryId?: string;
}

interface News {
  _id: string;
  title: string;
  content: string;
  image: string;
  publishedAt: string;
}

interface Section {
  _id: string;
  name: string;
  description: string;
  order: number;
}

interface Category {
  _id: string;
  name: string;
  sectionId: string | Section;
}

interface StudentAchievement {
  _id: string;
  image: string;
  title: string;
  description: string;
  studentName?: string;
  isActive: boolean;
  order: number;
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [allNews, setAllNews] = useState<News[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionCourses, setSectionCourses] = useState<Record<string, Course[]>>({});
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [displayCount, setDisplayCount] = useState(8);
  const [newsDisplayCount, setNewsDisplayCount] = useState(6);
  
  // Typewriter effect states
  const [displayedText1, setDisplayedText1] = useState('');
  const [displayedText2, setDisplayedText2] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  const text1 = 'ปั้นเกรด A';
  const text2 = 'เตรียมสอบติด';
  
  // Ref to store timeout IDs and state for cleanup
  const typewriterStateRef = useRef({
    currentIndex1: 0,
    currentIndex2: 0,
    timeoutId1: null as NodeJS.Timeout | null,
    timeoutId2: null as NodeJS.Timeout | null,
  });

  // Typewriter effect for hero text with loop (no deletion, only forward typing)
  useEffect(() => {
    const state = typewriterStateRef.current;
    
    const clearTimeouts = () => {
      if (state.timeoutId1) {
        clearTimeout(state.timeoutId1);
        state.timeoutId1 = null;
      }
      if (state.timeoutId2) {
        clearTimeout(state.timeoutId2);
        state.timeoutId2 = null;
      }
    };
    
    const typeText1 = () => {
      if (state.currentIndex1 < text1.length) {
        // Typing text1
        setDisplayedText1(text1.slice(0, state.currentIndex1 + 1));
        state.currentIndex1++;
        state.timeoutId1 = setTimeout(typeText1, 100); // 100ms per character
      } else {
        // Finished typing text1, start typing text2
        setTimeout(() => {
          const typeText2 = () => {
            if (state.currentIndex2 < text2.length) {
              setDisplayedText2(text2.slice(0, state.currentIndex2 + 1));
              state.currentIndex2++;
              state.timeoutId2 = setTimeout(typeText2, 100); // 100ms per character
            } else {
              // Finished typing both texts, wait then restart
              setIsTyping(false);
              setTimeout(() => {
                // Reset and restart typing
                state.currentIndex1 = 0;
                state.currentIndex2 = 0;
                setDisplayedText1('');
                setDisplayedText2('');
                setIsTyping(true);
                setTimeout(() => {
                  typeText1();
                }, 500); // Wait before restarting
              }, 2000); // Wait 2 seconds before restarting
            }
          };
          typeText2();
        }, 300);
      }
    };
    
    // Start typing after component mounts
    const startDelay = setTimeout(() => {
      typeText1();
    }, 500);
    
    return () => {
      clearTimeout(startDelay);
      clearTimeouts();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, newsRes, sectionsRes, categoriesRes, achievementsRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/news'),
          fetch('/api/sections'),
          fetch('/api/categories'),
          fetch('/api/student-achievements'),
        ]);

        const [coursesData, newsData, sectionsData, categoriesData, achievementsData] = await Promise.all([
          coursesRes.json(),
          newsRes.json(),
          sectionsRes.json(),
          categoriesRes.json(),
          achievementsRes.json(),
        ]);

        setAllCourses(coursesData);
        setCourses(coursesData.slice(0, 4));
        setAllNews(newsData);
        setNews(newsData.slice(0, 6));
        setSections(sectionsData);
        setCategories(categoriesData);
        setAchievements(achievementsData);

        // Get courses for sections 1, 2, 3
        const targetSections = sectionsData.filter((s: Section) => s.order <= 3);
        const sectionCoursesMap: Record<string, Course[]> = {};
        
        for (const section of targetSections) {
          const sectionCats = categoriesData.filter((cat: Category) => {
            const catSectionId = typeof cat.sectionId === 'string' ? cat.sectionId : cat.sectionId._id;
            return catSectionId === section._id;
          });
          
          const sectionCoursesList = coursesData.filter((course: Course) => {
            const courseSectionId = typeof course.sectionId === 'string' 
              ? course.sectionId 
              : (course.sectionId && typeof course.sectionId === 'object' ? course.sectionId._id : undefined);
            if (courseSectionId === section._id) return true;
            return sectionCats.some((cat: Category) => cat._id === course.categoryId);
          });
          
          sectionCoursesMap[section._id] = sectionCoursesList.slice(0, 6); // Limit to 6 courses per section
        }
        
        setSectionCourses(sectionCoursesMap);
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
        
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="inline-block">
                  {displayedText1}
                  {displayedText1 !== text1 && <span className="animate-pulse">|</span>}
                </span>
                <br />
                <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent inline-block min-h-[1.2em]">
                  {displayedText1 === text1 ? (
                    <>
                      {displayedText2}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </>
                  ) : (
                    <span className="invisible">{text2}</span>
                  )}
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
      <section className="py-4 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden -mt-8">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-gray-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-gray-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-gray-300"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 to-gray-100/0 group-hover:from-gray-50/50 group-hover:to-gray-100/30 rounded-xl transition-all duration-300"></div>
                  
                  <div className="relative z-10">
                    {/* Icon with animated background */}
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-gray-500/30">
                      <Icon className="text-white text-xl" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center group-hover:text-gray-600 transition-colors duration-300">
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

      {/* Sections 1, 2, 3 - Compact Glow Card Design */}
      <section className="py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {sections
              .filter((section) => section.order <= 3)
              .sort((a, b) => a.order - b.order)
              .map((section, index) => {
                const sectionCats = categories.filter((cat) => {
                  const catSectionId = typeof cat.sectionId === 'string' ? cat.sectionId : cat.sectionId._id;
                  return catSectionId === section._id;
                });
                const sectionCoursesList = sectionCourses[section._id] || [];

                // เลือกสี glow card ตามลำดับ section
                const glowCardClass = 
                  index === 0 ? 'section-glow-card-blue' :
                  index === 1 ? 'section-glow-card-purple' :
                  'section-glow-card-teal';

                const glowColor = 
                  index === 0 ? 'blue' :
                  index === 1 ? 'purple' :
                  'teal';

                return (
                  <div key={section._id} className={`${glowCardClass} flex flex-col h-full`}>
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Image Placeholder or Icon */}
                      <div className={`relative h-40 overflow-hidden ${
                        glowColor === 'blue' 
                          ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700' 
                          : glowColor === 'purple'
                          ? 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700'
                          : 'bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700'
                      }`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaBookOpen className="text-white text-5xl opacity-20" />
                        </div>
                        {/* Decorative pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-4 left-4 w-20 h-20 border-2 border-white rounded-full"></div>
                          <div className="absolute bottom-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col p-5">
                        {/* Header */}
                        <div className="mb-3">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                            {section.name}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                            {section.description || 'หลักสูตรคุณภาพสำหรับนักเรียนทุกคน'}
                          </p>
                        </div>

                        {/* Categories */}
                        {sectionCats.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {sectionCats.slice(0, 2).map((cat) => (
                              <span
                                key={cat._id}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  glowColor === 'blue'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : glowColor === 'purple'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                                }`}
                              >
                                {cat.name}
                              </span>
                            ))}
                            {sectionCats.length > 2 && (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                glowColor === 'blue'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : glowColor === 'purple'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-teal-50 text-teal-700 border border-teal-200'
                              }`}>
                                +{sectionCats.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Course Count */}
                        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                          <FaGraduationCap className="text-gray-400 text-sm" />
                          <span>{sectionCoursesList.length} หลักสูตร</span>
                        </div>

                        {/* Footer Link */}
                        <div className="mt-auto pt-3 border-t border-gray-100">
                          <Link
                            href="/courses"
                            className={`group inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                              glowColor === 'blue' 
                                ? 'text-blue-600 hover:text-blue-700' 
                                : glowColor === 'purple'
                                ? 'text-purple-600 hover:text-purple-700'
                                : 'text-teal-600 hover:text-teal-700'
                            }`}
                          >
                            ดูหลักสูตรทั้งหมด
                            <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Student Achievements Carousel Section */}
      {achievements.length > 0 && (
        <StudentAchievementCarousel achievements={achievements} />
      )}

      {/* News Section */}
      <section className="pt-4 pb-16 bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-right mb-12">
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