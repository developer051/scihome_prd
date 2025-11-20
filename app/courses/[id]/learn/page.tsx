'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaBookOpen, 
  FaChevronDown, 
  FaChevronRight, 
  FaYoutube, 
  FaPlayCircle,
  FaCheckCircle,
  FaClock,
  FaBars,
  FaTimes,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import Link from 'next/link';

interface SubLesson {
  title: string;
  description: string;
  order: number;
  duration: string;
  youtubeLink?: string;
}

interface Lesson {
  title: string;
  description: string;
  order: number;
  subLessons: SubLesson[];
  youtubeLink?: string;
}

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
  lessons?: Lesson[];
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string; type: 'lesson' | 'subLesson' } | null>(null);
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
          
          // เลือกวิดีโอแรกถ้ามี
          if (data.lessons && data.lessons.length > 0) {
            const sortedLessons = [...data.lessons].sort((a, b) => a.order - b.order);
            const firstLesson = sortedLessons[0];
            
            // พยายามหาวิดีโอจาก subLesson ก่อน
            if (firstLesson.subLessons && firstLesson.subLessons.length > 0) {
              const sortedSubLessons = [...firstLesson.subLessons].sort((a, b) => a.order - b.order);
              const firstSubLesson = sortedSubLessons.find(sub => sub.youtubeLink);
              if (firstSubLesson?.youtubeLink) {
                setSelectedVideo({
                  videoId: firstSubLesson.youtubeLink,
                  title: firstSubLesson.title,
                  type: 'subLesson'
                });
                return;
              }
            }
            
            // ถ้าไม่มี subLesson ให้ใช้ lesson
            if (firstLesson.youtubeLink) {
              setSelectedVideo({
                videoId: firstLesson.youtubeLink,
                title: firstLesson.title,
                type: 'lesson'
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  const toggleLesson = (lessonIndex: number) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonIndex)) {
      newExpanded.delete(lessonIndex);
    } else {
      newExpanded.add(lessonIndex);
    }
    setExpandedLessons(newExpanded);
  };

  const handleVideoSelect = (videoId: string, title: string, type: 'lesson' | 'subLesson') => {
    setSelectedVideo({ videoId, title, type });
    // Mark as completed when video is selected (you can enhance this with actual completion tracking)
    const lessonKey = `${type}-${videoId}`;
    setCompletedLessons(prev => new Set([...prev, lessonKey]));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getProgressPercentage = () => {
    if (!course?.lessons || course.lessons.length === 0) return 0;
    const totalLessons = course.lessons.reduce((acc, lesson) => {
      return acc + 1 + (lesson.subLessons?.length || 0);
    }, 0);
    return totalLessons > 0 ? Math.round((completedLessons.size / totalLessons) * 100) : 0;
  };

  const extractVideoId = (youtubeLink: string): string => {
    // รองรับทั้ง URL แบบเต็มและ video ID
    if (youtubeLink.includes('youtube.com/watch?v=')) {
      return youtubeLink.split('v=')[1]?.split('&')[0] || youtubeLink;
    } else if (youtubeLink.includes('youtu.be/')) {
      return youtubeLink.split('youtu.be/')[1]?.split('?')[0] || youtubeLink;
    }
    return youtubeLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 animate-pulse">
            <FaBookOpen className="text-white text-2xl" />
          </div>
          <div className="text-xl font-semibold text-gray-700 mb-2">กำลังโหลด...</div>
          <div className="text-sm text-gray-500">กรุณารอสักครู่</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <FaBookOpen className="text-red-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">ไม่พบหลักสูตร</h1>
          <p className="text-gray-600 mb-6">ไม่สามารถโหลดข้อมูลหลักสูตรได้ กรุณาลองใหม่อีกครั้ง</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <FaArrowLeft />
            กลับไปหน้าหลักสูตร
          </Link>
        </div>
      </div>
    );
  }

  const sortedLessons = course.lessons ? [...course.lessons].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-200/40 via-gray-300/40 to-gray-200/40 backdrop-blur-md border-b border-gray-300/30 shadow-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{course.name}</h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {course.category}
                  </span>
                  <span>•</span>
                  <span>{course.level}</span>
                </div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="hidden md:flex items-center gap-4 ml-4">
              <div className="flex items-center gap-2 min-w-[120px]">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 min-w-[35px]">
                  {getProgressPercentage()}%
                </span>
              </div>
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative max-w-[1600px] mx-auto w-full">
        {/* Sidebar - 1/3 width */}
        <div className={`
          absolute lg:relative inset-y-0 left-0 z-30
          w-full lg:w-80 xl:w-96
          bg-white/98 backdrop-blur-sm border-r border-gray-200/50
          overflow-y-auto max-h-[calc(100vh-80px)] lg:max-h-none
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}>
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                  <FaBookOpen className="text-white text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">เนื้อหาหลักสูตร</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sortedLessons.length} บทเรียน
                  </p>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Mobile Progress Bar */}
            <div className="md:hidden mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">ความคืบหน้า</span>
                <span className="text-xs font-bold text-blue-600">{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
            
            {sortedLessons.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FaBookOpen className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-500 font-medium">ยังไม่มีเนื้อหาในหลักสูตรนี้</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedLessons.map((lesson, lessonIndex) => {
                  const isExpanded = expandedLessons.has(lessonIndex);
                  const sortedSubLessons = lesson.subLessons 
                    ? [...lesson.subLessons].sort((a, b) => a.order - b.order)
                    : [];
                  const isLessonCompleted = completedLessons.has(`lesson-${lesson.youtubeLink ? extractVideoId(lesson.youtubeLink) : ''}`);
                  const completedSubLessons = sortedSubLessons.filter(sub => 
                    sub.youtubeLink && completedLessons.has(`subLesson-${extractVideoId(sub.youtubeLink)}`)
                  ).length;
                  const subLessonProgress = sortedSubLessons.length > 0 
                    ? Math.round((completedSubLessons / sortedSubLessons.length) * 100) 
                    : 0;
                  
                  return (
                    <div 
                      key={lessonIndex} 
                      className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Lesson Header */}
                      <div
                        className={`px-4 py-3.5 cursor-pointer transition-all duration-200 ${
                          isExpanded 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => toggleLesson(lessonIndex)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {sortedSubLessons.length > 0 ? (
                              <div className="flex-shrink-0">
                                {isExpanded ? (
                                  <FaChevronDown className="text-blue-600 text-sm" />
                                ) : (
                                  <FaChevronRight className="text-gray-500 text-sm" />
                                )}
                              </div>
                            ) : (
                              <div className="flex-shrink-0 w-4" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 text-sm truncate">
                                  บทที่ {lesson.order}: {lesson.title}
                                </span>
                                {isLessonCompleted && (
                                  <FaCheckCircle className="text-green-500 text-sm flex-shrink-0" />
                                )}
                              </div>
                              {lesson.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">{lesson.description}</p>
                              )}
                              {sortedSubLessons.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden max-w-[120px]">
                                    <div 
                                      className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-300"
                                      style={{ width: `${subLessonProgress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {completedSubLessons}/{sortedSubLessons.length}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {lesson.youtubeLink && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVideoSelect(extractVideoId(lesson.youtubeLink!), lesson.title, 'lesson');
                              }}
                              className={`ml-2 p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                                selectedVideo?.videoId === extractVideoId(lesson.youtubeLink) && selectedVideo?.type === 'lesson'
                                  ? 'bg-red-600 text-white shadow-md'
                                  : 'text-red-600 hover:bg-red-50 hover:shadow-sm'
                              }`}
                              title="ดูวิดีโอ"
                            >
                              <FaYoutube className="text-sm" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* SubLessons */}
                      {isExpanded && sortedSubLessons.length > 0 && (
                        <div className="bg-white">
                          <ul className="divide-y divide-gray-100">
                            {sortedSubLessons.map((subLesson, subIndex) => {
                              const subVideoId = subLesson.youtubeLink ? extractVideoId(subLesson.youtubeLink) : '';
                              const isSubCompleted = completedLessons.has(`subLesson-${subVideoId}`);
                              const isSelected = selectedVideo?.videoId === subVideoId && selectedVideo?.type === 'subLesson';
                              
                              return (
                                <li
                                  key={subIndex}
                                  className={`px-4 py-3 transition-all duration-200 cursor-pointer group ${
                                    isSelected
                                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 shadow-sm'
                                      : 'hover:bg-blue-50/50 border-l-4 border-transparent'
                                  }`}
                                  onClick={() => {
                                    if (subLesson.youtubeLink) {
                                      handleVideoSelect(subVideoId, subLesson.title, 'subLesson');
                                    }
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                      {isSubCompleted ? (
                                        <FaCheckCircle className="text-green-500 text-sm" />
                                      ) : (
                                        <FaPlayCircle className="text-gray-400 text-xs group-hover:text-blue-500 transition-colors" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className={`font-medium text-sm ${
                                          isSelected ? 'text-blue-900' : 'text-gray-800'
                                        }`}>
                                          {subLesson.title}
                                        </span>
                                        {subLesson.youtubeLink && (
                                          <FaYoutube className="text-red-600 text-xs flex-shrink-0" />
                                        )}
                                      </div>
                                      {subLesson.description && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {subLesson.description}
                                        </p>
                                      )}
                                      {subLesson.duration && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                          <FaClock className="text-xs" />
                                          <span>{subLesson.duration}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Video Section - 2/3 width */}
        <div className={`flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center min-h-[400px] lg:min-h-0 transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
          {selectedVideo ? (
            <div className="w-full h-full p-4 sm:p-6 lg:p-8 flex flex-col">
              <div className="w-full flex-1 flex flex-col">
                {/* Video Header */}
                <div className="mb-4 sm:mb-6 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 line-clamp-2">
                      {selectedVideo.title}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <FaYoutube className="text-red-500" />
                        <span>YouTube Video</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={toggleFullscreen}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                    aria-label="Toggle fullscreen"
                  >
                    {isFullscreen ? <FaCompress /> : <FaExpand />}
                  </button>
                </div>
                
                {/* Video Player */}
                <div className="flex-1 flex items-center min-h-0">
                  <div className="relative w-full shadow-2xl rounded-xl overflow-hidden bg-black" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${extractVideoId(selectedVideo.videoId)}?autoplay=1&rel=0&modestbranding=1`}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      style={{ border: 'none' }}
                    />
                  </div>
                </div>
                
                {/* Video Info */}
                <div className="mt-4 sm:mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>กำลังเล่น: {selectedVideo.title}</span>
                    {completedLessons.has(`${selectedVideo.type}-${extractVideoId(selectedVideo.videoId)}`) && (
                      <span className="flex items-center gap-1.5 text-green-400">
                        <FaCheckCircle />
                        <span>เสร็จสิ้น</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 px-4 sm:px-8">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full mb-6 backdrop-blur-sm">
                <FaYoutube className="text-4xl sm:text-5xl opacity-50" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">
                เลือกบทเรียนเพื่อเริ่มดูวิดีโอ
              </h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                คลิกที่บทเรียนจากเมนูด้านซ้ายเพื่อเริ่มเรียน
              </p>
            </div>
          )}
        </div>
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-20"
            onClick={toggleSidebar}
          />
        )}
      </div>
    </div>
  );
}

