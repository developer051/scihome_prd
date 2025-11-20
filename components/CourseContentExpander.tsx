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
      <div className="px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">เนื้อหาหลักสูตร</h3>
          <button
            onClick={onAddLesson}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center text-sm"
          >
            <FaPlus className="mr-1.5" size={12} />
            เพิ่มบทเรียน
          </button>
        </div>

        {sortedLessons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>ยังไม่มีบทเรียนในหลักสูตรนี้</p>
            <button
              onClick={onAddLesson}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              คลิกเพื่อเพิ่มบทเรียนแรก
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedLessons.map((lesson, lessonIndex) => {
              const isExpanded = expandedLessons.has(lessonIndex);
              const sortedSubLessons = [...lesson.subLessons].sort((a, b) => a.order - b.order);

              return (
                <div key={lessonIndex} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Lesson Header */}
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                    onClick={() => toggleLesson(lessonIndex)}
                  >
                    <div className="flex items-center flex-1">
                      <span className="text-gray-400 mr-3">
                        {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900">
                            บทที่ {lesson.order}: {lesson.title}
                          </span>
                          {lesson.youtubeLink && (
                            <a
                              href={`https://www.youtube.com/watch?v=${lesson.youtubeLink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                              title="ดูวิดีโอ"
                            >
                              <FaYoutube className="mr-1" />
                              ดูวิดีโอ
                            </a>
                          )}
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{lesson.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {sortedSubLessons.length} บทเรียนย่อย
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onAddSubLesson(lessonIndex)}
                        className="text-green-600 hover:text-green-800 p-1.5 rounded hover:bg-green-50"
                        title="เพิ่มบทเรียนย่อย"
                      >
                        <FaPlus size={14} />
                      </button>
                      <button
                        onClick={() => onEditLesson(lessonIndex, lesson)}
                        className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded hover:bg-indigo-50"
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
                        className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50"
                        title="ลบบทเรียน"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>

                  {/* SubLessons */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      {sortedSubLessons.length === 0 ? (
                        <div className="px-8 py-4 text-center text-sm text-gray-500">
                          <p>ยังไม่มีบทเรียนย่อย</p>
                          <button
                            onClick={() => onAddSubLesson(lessonIndex)}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            คลิกเพื่อเพิ่มบทเรียนย่อย
                          </button>
                        </div>
                      ) : (
                        <div className="px-4 py-2 space-y-1">
                          {sortedSubLessons.map((subLesson, subLessonIndex) => {
                            const subKey = `${lessonIndex}-${subLessonIndex}`;
                            const isSubExpanded = expandedSubLessons.has(subKey);

                            return (
                              <div
                                key={subLessonIndex}
                                className="bg-white border border-gray-200 rounded-md overflow-hidden"
                              >
                                <div
                                  className="px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                                  onClick={() => toggleSubLesson(lessonIndex, subLessonIndex)}
                                >
                                  <div className="flex items-center flex-1">
                                    <span className="text-gray-400 mr-2">
                                      {isSubExpanded ? <FaChevronUp size={12} /> : <FaChevronRight size={12} />}
                                    </span>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-medium text-gray-800">
                                          {subLesson.order}. {subLesson.title}
                                        </span>
                                        {subLesson.duration && (
                                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {subLesson.duration}
                                          </span>
                                        )}
                                        {subLesson.youtubeLink && (
                                          <a
                                            href={`https://www.youtube.com/watch?v=${subLesson.youtubeLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                                            title="ดูวิดีโอ"
                                          >
                                            <FaYoutube className="mr-1" />
                                            ดูวิดีโอ
                                          </a>
                                        )}
                                      </div>
                                      {subLesson.description && (
                                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                                          {subLesson.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1 ml-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => onEditSubLesson(lessonIndex, subLessonIndex, subLesson)}
                                      className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50"
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
                                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                      title="ลบบทเรียนย่อย"
                                    >
                                      <FaTrash size={12} />
                                    </button>
                                  </div>
                                </div>

                                {/* SubLesson Details */}
                                {isSubExpanded && subLesson.description && (
                                  <div className="px-8 py-2 bg-white border-t border-gray-100">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
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

