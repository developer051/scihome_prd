'use client';

import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaPlus, FaEdit, FaTrash, FaChevronRight, FaYoutube } from 'react-icons/fa';
import { ILesson, ISubLesson } from '@/models/Course';

interface CourseContentExpanderProps {
  courseId: string;
  lessons: ILesson[];
  onAddLesson: () => void;
  onEditLesson: (lessonIndex: number, lesson: ILesson) => void;
  onDeleteLesson: (lessonIndex: number) => void;
  onAddSubLesson: (lessonIndex: number) => void;
  onEditSubLesson: (lessonIndex: number, subLessonIndex: number, subLesson: ISubLesson) => void;
  onDeleteSubLesson: (lessonIndex: number, subLessonIndex: number) => void;
}

export default function CourseContentExpander({
  courseId,
  lessons,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onAddSubLesson,
  onEditSubLesson,
  onDeleteSubLesson,
}: CourseContentExpanderProps) {
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(new Set());
  const [expandedSubLessons, setExpandedSubLessons] = useState<Set<string>>(new Set());

  const toggleLesson = (index: number) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLessons(newExpanded);
  };

  const toggleSubLesson = (lessonIndex: number, subLessonIndex: number) => {
    const key = `${lessonIndex}-${subLessonIndex}`;
    const newExpanded = new Set(expandedSubLessons);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubLessons(newExpanded);
  };

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="bg-gray-50 border-t border-gray-200">
      <div className="px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md mr-3">
              <FaBookOpen className="text-white text-lg" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">เนื้อหาหลักสูตร</h3>
          </div>
          <button
            onClick={onAddLesson}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center text-sm font-semibold"
          >
            <FaPlus className="mr-2" size={14} />
            เพิ่มบทเรียน
          </button>
        </div>

        {sortedLessons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FaBookOpen className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-600 font-medium mb-2">ยังไม่มีบทเรียนในหลักสูตรนี้</p>
            <button
              onClick={onAddLesson}
              className="mt-2 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
            >
              คลิกเพื่อเพิ่มบทเรียนแรก
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLessons.map((lesson, lessonIndex) => {
              const isExpanded = expandedLessons.has(lessonIndex);
              const sortedSubLessons = [...lesson.subLessons].sort((a, b) => a.order - b.order);

              return (
                <div 
                  key={lessonIndex} 
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:border-blue-300 group"
                >
                  {/* Lesson Header */}
                  <div
                    className="px-6 py-4 cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white transition-all duration-300 flex items-center justify-between"
                    onClick={() => toggleLesson(lessonIndex)}
                  >
                    <div className="flex items-center flex-1">
                      <span className="text-gray-400 mr-4 hover:text-blue-600 transition-colors flex-shrink-0">
                        {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors">
                            บทที่ {lesson.order}: {lesson.title}
                          </span>
                          {lesson.youtubeLink && (
                            <a
                              href={`https://www.youtube.com/watch?v=${lesson.youtubeLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-100"
                              title="ดูวิดีโอ"
                            >
                              <FaYoutube className="mr-1.5" />
                              ดูวิดีโอ
                            </a>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{lesson.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1.5 font-medium">
                          {sortedSubLessons.length} บทเรียนย่อย
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onAddSubLesson(lessonIndex)}
                        className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition-all duration-200 transform hover:scale-110"
                        title="เพิ่มบทเรียนย่อย"
                      >
                        <FaPlus size={14} />
                      </button>
                      <button
                        onClick={() => onEditLesson(lessonIndex, lesson)}
                        className="text-indigo-600 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110"
                        title="แก้ไขบทเรียน"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('คุณแน่ใจหรือไม่ที่จะลบบทเรียนนี้?')) {
                            onDeleteLesson(lessonIndex);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 transform hover:scale-110"
                        title="ลบบทเรียน"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* SubLessons */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 animate-in slide-in-from-top-2 duration-300">
                      {sortedSubLessons.length === 0 ? (
                        <div className="px-8 py-6 text-center bg-white m-4 rounded-lg border-2 border-dashed border-gray-300">
                          <p className="text-sm text-gray-500 mb-2">ยังไม่มีบทเรียนย่อย</p>
                          <button
                            onClick={() => onAddSubLesson(lessonIndex)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
                          >
                            คลิกเพื่อเพิ่มบทเรียนย่อย
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 py-4 space-y-2">
                          {sortedSubLessons.map((subLesson, subLessonIndex) => {
                            const subKey = `${lessonIndex}-${subLessonIndex}`;
                            const isSubExpanded = expandedSubLessons.has(subKey);

                            return (
                              <div
                                key={subLessonIndex}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                              >
                                <div
                                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                                  onClick={() => toggleSubLesson(lessonIndex, subLessonIndex)}
                                >
                                  <div className="flex items-center flex-1 min-w-0">
                                    <span className="text-gray-400 mr-3 flex-shrink-0">
                                      {isSubExpanded ? <FaChevronUp size={14} /> : <FaChevronRight size={14} />}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                          <span className="text-blue-600 text-xs font-bold">{subLesson.order}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800">
                                          {subLesson.title}
                                        </span>
                                        {subLesson.duration && (
                                          <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                                            {subLesson.duration}
                                          </span>
                                        )}
                                        {subLesson.youtubeLink && (
                                          <a
                                            href={`https://www.youtube.com/watch?v=${subLesson.youtubeLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-100"
                                            title="ดูวิดีโอ"
                                          >
                                            <FaYoutube className="mr-1" />
                                            ดูวิดีโอ
                                          </a>
                                        )}
                                      </div>
                                      {subLesson.description && (
                                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-1">
                                          {subLesson.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 ml-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => onEditSubLesson(lessonIndex, subLessonIndex, subLesson)}
                                      className="text-indigo-600 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-indigo-50 transition-all duration-200 transform hover:scale-110"
                                      title="แก้ไขบทเรียนย่อย"
                                    >
                                      <FaEdit size={12} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm('คุณแน่ใจหรือไม่ที่จะลบบทเรียนย่อยนี้?')) {
                                          onDeleteSubLesson(lessonIndex, subLessonIndex);
                                        }
                                      }}
                                      className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-all duration-200 transform hover:scale-110"
                                      title="ลบบทเรียนย่อย"
                                    >
                                      <FaTrash size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* SubLesson Details */}
                                {isSubExpanded && subLesson.description && (
                                  <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                      {subLesson.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

