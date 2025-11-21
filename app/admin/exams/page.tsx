'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface Question {
  questionText: string;
  questionType: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

interface Exam {
  _id: string;
  title: string;
  courseId: {
    _id: string;
    name: string;
    category: string;
    level: string;
  };
  description: string;
  questions: Question[];
  duration: number;
  totalScore: number;
  passingScore?: number;
  isActive: boolean;
  createdAt: string;
}

interface Course {
  _id: string;
  name: string;
  category: string;
  level: string;
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const columns = [
    {
      key: 'title',
      label: 'ชื่อข้อสอบ',
    },
    {
      key: 'courseId',
      label: 'รายวิชา',
      render: (value: any) => {
        if (typeof value === 'object' && value !== null) {
          return `${value.name} (${value.category} - ${value.level})`;
        }
        return '-';
      },
    },
    {
      key: 'questions',
      label: 'จำนวนข้อ',
      render: (value: Question[]) => `${value?.length || 0} ข้อ`,
    },
    {
      key: 'totalScore',
      label: 'คะแนนเต็ม',
      render: (value: number) => `${value} คะแนน`,
    },
    {
      key: 'duration',
      label: 'เวลา (นาที)',
      render: (value: number) => `${value} นาที`,
    },
    {
      key: 'isActive',
      label: 'สถานะ',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        </span>
      ),
    },
  ];

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams');
      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setShowForm(true);
  };

  const handleDelete = async (exam: Exam) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อสอบนี้?')) {
      try {
        const response = await fetch(`/api/exams/${exam._id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchExams();
        } else {
          alert('เกิดข้อผิดพลาดในการลบข้อสอบ');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบข้อสอบ');
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingExam ? `/api/exams/${editingExam._id}` : '/api/exams';
      const method = editingExam ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingExam(null);
        fetchExams();
      } else {
        const error = await response.json();
        alert(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExam(null);
  };

  const handleSeedPhysics = async () => {
    if (confirm('คุณต้องการสร้างข้อสอบ Physics 10 ข้อ (เวลา 15 นาที) หรือไม่?')) {
      setIsSeeding(true);
      try {
        const response = await fetch('/api/exams/seed/physics', {
          method: 'POST',
        });
        const data = await response.json();
        if (response.ok) {
          alert('สร้างข้อสอบ Physics สำเร็จแล้ว!');
          fetchExams();
        } else {
          alert(`เกิดข้อผิดพลาด: ${data.error || 'ไม่ทราบสาเหตุ'}`);
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการสร้างข้อสอบ');
        console.error('Error seeding physics exam:', error);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleSeedBiology = async () => {
    if (confirm('คุณต้องการสร้างข้อสอบชีววิทยา ม.6 เข้มข้น 10 ข้อ (เวลา 15 นาที) หรือไม่?')) {
      setIsSeeding(true);
      try {
        const response = await fetch('/api/exams/seed/biology', {
          method: 'POST',
        });
        const data = await response.json();
        if (response.ok) {
          alert('สร้างข้อสอบชีววิทยา ม.6 เข้มข้น สำเร็จแล้ว!');
          fetchExams();
        } else {
          alert(`เกิดข้อผิดพลาด: ${data.error || 'ไม่ทราบสาเหตุ'}`);
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการสร้างข้อสอบ');
        console.error('Error seeding biology exam:', error);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleSeedChemistry = async () => {
    if (confirm('คุณต้องการสร้าง Mock Exam วิชาเคมี 10 ข้อ (เวลา 10 นาที / 10 คะแนน) หรือไม่?')) {
      setIsSeeding(true);
      try {
        const response = await fetch('/api/exams/seed/chemistry', {
          method: 'POST',
        });
        const data = await response.json();
        if (response.ok) {
          alert('สร้าง Mock Exam วิชาเคมี สำเร็จแล้ว!');
          fetchExams();
        } else {
          alert(`เกิดข้อผิดพลาด: ${data.error || 'ไม่ทราบสาเหตุ'}`);
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการสร้างข้อสอบ');
        console.error('Error seeding chemistry exam:', error);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-48 rounded mb-4"></div>
          <div className="bg-gray-200 h-96 w-full rounded"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">จัดการข้อสอบ</h1>
          <div className="flex gap-3">
            <button
              onClick={handleSeedPhysics}
              disabled={isSeeding}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors inline-flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSeeding ? 'กำลังสร้าง...' : 'Seed ข้อสอบ Physics'}
            </button>
            <button
              onClick={handleSeedBiology}
              disabled={isSeeding}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors inline-flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSeeding ? 'กำลังสร้าง...' : 'Seed ข้อสอบชีววิทยา ม.6'}
            </button>
            <button
              onClick={handleSeedChemistry}
              disabled={isSeeding}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors inline-flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSeeding ? 'กำลังสร้าง...' : 'Seed Mock Exam เคมี'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <FaPlus className="mr-2" />
              เพิ่มข้อสอบ
            </button>
          </div>
        </div>

        <DataTable
          data={exams}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          title="รายการข้อสอบ"
        />

        {/* Exam Form Modal */}
        {showForm && (
          <ExamForm
            exam={editingExam}
            courses={courses}
            onSubmit={handleFormSubmit}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Exam Form Component
function ExamForm({ exam, courses, onSubmit, onClose }: {
  exam: Exam | null;
  courses: Course[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: exam?.title || '',
    courseId: typeof exam?.courseId === 'object' && exam?.courseId?._id 
      ? exam.courseId._id 
      : typeof exam?.courseId === 'string' 
        ? exam.courseId 
        : '',
    description: exam?.description || '',
    duration: exam?.duration || 60,
    passingScore: exam?.passingScore || '',
    isActive: exam?.isActive !== undefined ? exam.isActive : true,
    questions: exam?.questions || [
      {
        questionText: '',
        questionType: 'multiple-choice' as const,
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
        explanation: '',
      },
    ],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? (value === '' ? '' : Number(value)) : value,
    });
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...formData.questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = ['', '', '', ''];
    }
    updatedQuestions[questionIndex].options![optionIndex] = value;
    setFormData({
      ...formData,
      questions: updatedQuestions,
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: '',
          questionType: 'multiple-choice',
          options: ['', '', '', ''],
          correctAnswer: '',
          points: 1,
          explanation: '',
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      const updatedQuestions = formData.questions.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        questions: updatedQuestions,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate questions
    const validQuestions = formData.questions.filter(q => q.questionText.trim() !== '');
    if (validQuestions.length === 0) {
      alert('กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ');
      return;
    }

    // Clean up questions - remove empty options for multiple-choice
    const cleanedQuestions = validQuestions.map(q => {
      if (q.questionType === 'multiple-choice' && q.options) {
        const cleanedOptions = q.options.filter(opt => opt.trim() !== '');
        return {
          ...q,
          options: cleanedOptions.length > 0 ? cleanedOptions : undefined,
        };
      }
      return q;
    });

    const submitData = {
      ...formData,
      questions: cleanedQuestions,
      passingScore: formData.passingScore === '' ? undefined : Number(formData.passingScore),
    };

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {exam ? 'แก้ไขข้อสอบ' : 'เพิ่มข้อสอบใหม่'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อข้อสอบ *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายวิชา *
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">เลือกรายวิชา</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.category} - {course.level})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียด *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เวลาทำข้อสอบ (นาที) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คะแนนผ่าน (ไม่บังคับ)
              </label>
              <input
                type="number"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">เปิดใช้งาน</span>
              </label>
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">คำถาม</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
              >
                + เพิ่มคำถาม
              </button>
            </div>

            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">คำถามที่ {qIndex + 1}</h4>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ลบ
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        คำถาม *
                      </label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                        required
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ประเภทคำถาม *
                        </label>
                        <select
                          value={question.questionType}
                          onChange={(e) => {
                            const newType = e.target.value as 'multiple-choice' | 'true-false' | 'short-answer';
                            handleQuestionChange(qIndex, 'questionType', newType);
                            if (newType === 'multiple-choice' && !question.options) {
                              handleQuestionChange(qIndex, 'options', ['', '', '', '']);
                            }
                            if (newType !== 'multiple-choice') {
                              handleQuestionChange(qIndex, 'options', undefined);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="multiple-choice">ตัวเลือก</option>
                          <option value="true-false">ถูก/ผิด</option>
                          <option value="short-answer">ข้อความสั้น</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          คะแนน *
                        </label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => handleQuestionChange(qIndex, 'points', Number(e.target.value))}
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {question.questionType === 'multiple-choice' && question.options && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ตัวเลือก *
                        </label>
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="mb-2 flex items-center">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctAnswer === option}
                              onChange={() => handleQuestionChange(qIndex, 'correctAnswer', option)}
                              className="mr-2"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                              placeholder={`ตัวเลือก ${optIndex + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {question.questionType === 'true-false' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          คำตอบที่ถูกต้อง *
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`tf-${qIndex}`}
                              value="true"
                              checked={question.correctAnswer === 'true'}
                              onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                              className="mr-2"
                            />
                            <span>ถูก</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={`tf-${qIndex}`}
                              value="false"
                              checked={question.correctAnswer === 'false'}
                              onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                              className="mr-2"
                            />
                            <span>ผิด</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {question.questionType === 'short-answer' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          คำตอบที่ถูกต้อง *
                        </label>
                        <input
                          type="text"
                          value={typeof question.correctAnswer === 'string' ? question.correctAnswer : ''}
                          onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        คำอธิบาย (ไม่บังคับ)
                      </label>
                      <textarea
                        value={question.explanation || ''}
                        onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {exam ? 'อัปเดต' : 'สร้าง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

