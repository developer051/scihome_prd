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
import Image from 'next/image';

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

        // Get courses for all sections
        const sectionCoursesMap: Record<string, Course[]> = {};
        
        for (const section of sectionsData) {
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
        
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 lg:pt-24 pb-8 md:pb-12 lg:pb-16">
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
                  className="group relative bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-gray-300 feature-card-glow"
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

      {/* Sections - Glassmorphism Bento Box Grid Design */}
      <section className="py-8 lg:py-12 relative overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 via-pink-50 to-teal-50">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse delay-2000"></div>
            <div className="absolute bottom-40 right-1/3 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-3000"></div>
          </div>
        </div>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 auto-rows-fr">
            {sections
              .sort((a, b) => a.order - b.order)
              .map((section) => {
                const sectionCats = categories.filter((cat) => {
                  const catSectionId = typeof cat.sectionId === 'string' ? cat.sectionId : cat.sectionId._id;
                  return catSectionId === section._id;
                });
                const sectionCoursesList = sectionCourses[section._id] || [];

                // กำหนดขนาดใหญ่สำหรับคอร์สแพทย์และคอร์สวิศวะ (ลดเป็น col-span-2 แต่ row-span-1)
                const isWideCard = section.name === 'คอร์สแพทย์ - วิทย์สุขภาพ' || section.name === 'คอร์สวิศวะ';
                
                // Modern Apple-style Colors with Background Images
                const getModernColor = (name: string) => {
                  if (name === 'คอร์สแพทย์ - วิทย์สุขภาพ') return { 
                    bg: 'bg-teal-50', text: 'text-teal-600', iconBg: 'bg-teal-100', border: 'border-teal-100', hoverBorder: 'border-teal-300',
                    bgGradient: 'from-teal-400/30 via-teal-300/20 to-teal-500/30',
                    pattern: 'radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(13, 148, 136, 0.15) 0%, transparent 50%)',
                    bgImage: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(13, 148, 136, 0.05) 100%)',
                    bgImageUrl: null // สามารถเพิ่ม URL ภาพพื้นหลังได้ที่นี่ เช่น '/images/medical-bg.jpg'
                  };
                  if (name === 'คอร์สวิศวะ') return { 
                    bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100', border: 'border-blue-100', hoverBorder: 'border-blue-300',
                    bgGradient: 'from-blue-400/30 via-blue-300/20 to-blue-500/30',
                    pattern: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(37, 99, 235, 0.15) 0%, transparent 50%)',
                    bgImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                    bgImageUrl: null // เช่น '/images/engineering-bg.jpg'
                  };
                  if (name === 'คอร์ส Upgrade [ม.4, ม.5]' || name.includes('Upgrade') || name.includes('ม.4') || name.includes('ม.5')) return { 
                    bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100', border: 'border-indigo-100', hoverBorder: 'border-indigo-300',
                    bgGradient: 'from-indigo-400/30 via-indigo-300/20 to-indigo-500/30',
                    pattern: 'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(79, 70, 229, 0.15) 0%, transparent 50%)',
                    bgImage: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
                    bgImageUrl: null
                  };
                  if (name === 'TGAT') return { 
                    bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-100', border: 'border-purple-100', hoverBorder: 'border-purple-300',
                    bgGradient: 'from-purple-400/30 via-purple-300/20 to-purple-500/30',
                    pattern: 'radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 60% 60%, rgba(147, 51, 234, 0.15) 0%, transparent 50%)',
                    bgImage: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
                    bgImageUrl: null // เช่น '/images/tgat-bg.jpg'
                  };
                  if (name === 'TPAT') return { 
                    bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-100', border: 'border-orange-100', hoverBorder: 'border-orange-300',
                    bgGradient: 'from-orange-400/30 via-orange-300/20 to-orange-500/30',
                    pattern: 'radial-gradient(circle at 35% 35%, rgba(251, 146, 60, 0.15) 0%, transparent 50%), radial-gradient(circle at 65% 65%, rgba(249, 115, 22, 0.15) 0%, transparent 50%)',
                    bgImage: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
                    bgImageUrl: null // เช่น '/images/tpat-bg.jpg'
                  };
                  if (name === 'A-Level') return { 
                    bg: 'bg-pink-50', text: 'text-pink-600', iconBg: 'bg-pink-100', border: 'border-pink-100', hoverBorder: 'border-pink-300',
                    bgGradient: 'from-pink-400/30 via-pink-300/20 to-pink-500/30',
                    pattern: 'radial-gradient(circle at 30% 70%, rgba(244, 114, 182, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
                    bgImage: 'linear-gradient(135deg, rgba(244, 114, 182, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
                    bgImageUrl: null // เช่น '/images/alevel-bg.jpg'
                  };
                  return { 
                    bg: 'bg-gray-50', text: 'text-gray-600', iconBg: 'bg-gray-100', border: 'border-gray-100', hoverBorder: 'border-gray-300',
                    bgGradient: 'from-gray-400/30 via-gray-300/20 to-gray-500/30',
                    pattern: 'radial-gradient(circle at 50% 50%, rgba(156, 163, 175, 0.15) 0%, transparent 50%)',
                    bgImage: 'linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%)',
                    bgImageUrl: null
                  };
                };

                const colors = getModernColor(section.name);

                return (
                  <Link 
                    href="/courses"
                    key={section._id} 
                    className={`group relative flex flex-col h-full p-5 rounded-3xl transition-all duration-300 ease-out
                      border border-transparent shadow-sm hover:shadow-xl hover:-translate-y-1 section-glow-card overflow-hidden
                      ${isWideCard ? 'lg:col-span-2 lg:row-span-1' : 'lg:col-span-1 lg:row-span-1'}
                    `}
                  >
                    {/* Background Image Layer with Gradient Overlay */}
                    <div 
                      className="absolute inset-0 rounded-3xl bg-white"
                      style={{
                        backgroundImage: colors.bgImageUrl 
                          ? `url(${colors.bgImageUrl}), ${colors.bgImage}, ${colors.pattern}`
                          : `${colors.bgImage}, ${colors.pattern}`,
                        backgroundSize: colors.bgImageUrl ? 'cover, cover, cover' : 'cover, cover',
                        backgroundPosition: 'center, center, center',
                        backgroundBlendMode: colors.bgImageUrl ? 'normal, overlay, normal' : 'overlay, normal',
                      }}
                    >
                      {/* Base Gradient Overlay */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-br ${colors.bgGradient} transition-opacity duration-300 ${colors.bgImageUrl ? 'opacity-70 group-hover:opacity-85' : 'opacity-50 group-hover:opacity-70'}`}
                      ></div>
                      
                      {/* Additional overlay for better text readability when background image exists */}
                      {colors.bgImageUrl && (
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 opacity-50 group-hover:opacity-60 transition-opacity duration-300"></div>
                      )}
                      
                      {/* Decorative Pattern Overlay - Subtle geometric pattern */}
                      <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '50px 50px'
                      }}></div>
                      
                      {/* Animated floating orbs */}
                      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 ${colors.bg}`}></div>
                      <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-xl opacity-15 group-hover:opacity-25 transition-opacity duration-300 ${colors.bg}`}></div>
                    </div>

                    {/* Hover Border Gradient Effect */}
                    <div className={`absolute inset-0 rounded-3xl border-2 ${colors.border} group-hover:${colors.hoverBorder} transition-colors duration-300 pointer-events-none z-10`}></div>
                    
                    {/* Content Layer */}
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Header: Icon & Title */}
                      <div className="flex items-start justify-between mb-4">
                        {!(section.name.includes('ม.4') || section.name.includes('ม.5')) && (
                          <div className={`p-3 rounded-2xl ${colors.iconBg} ${colors.text} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 backdrop-blur-sm bg-opacity-90 shadow-lg`}>
                            <FaBookOpen className="text-xl" />
                          </div>
                        )}
                        
                        {/* Arrow Icon showing on hover */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colors.bg} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 backdrop-blur-sm bg-opacity-90 shadow-lg`}>
                           <FaArrowRight className={`text-sm ${colors.text}`} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight drop-shadow-sm">
                          {section.name}
                        </h3>
                        
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-4 drop-shadow-sm">
                          {section.description || 'หลักสูตรคุณภาพสำหรับนักเรียนทุกคน'}
                        </p>

                        {/* Footer Info: Categories pills */}
                        <div className="mt-auto pt-4 border-t border-white/30 flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {sectionCats.slice(0, 2).map((cat) => (
                              <span 
                                key={cat._id}
                                className={`text-[10px] px-2 py-1 rounded-full font-medium ${colors.bg} ${colors.text} backdrop-blur-sm bg-opacity-80 shadow-sm`}
                              >
                                {cat.name}
                              </span>
                            ))}
                            {sectionCats.length > 2 && (
                              <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${colors.bg} ${colors.text} backdrop-blur-sm bg-opacity-80 shadow-sm`}>
                                +{sectionCats.length - 2}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 text-gray-600 text-xs drop-shadow-sm font-medium">
                            <FaGraduationCap />
                            <span>{sectionCoursesList.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shine Effect on Hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    </div>
                  </Link>
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