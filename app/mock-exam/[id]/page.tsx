'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaClock, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';

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
  questions: Question[];
  isActive: boolean;
}

export default function MockExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(string | string[])[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setExam(data);
          setTimeLeft(data.duration * 60); // แปลงนาทีเป็นวินาที
          setAnswers(new Array(data.questions.length).fill(''));
        } else {
          router.push('/mock-exam');
        }
      } catch (error) {
        console.error('Error fetching exam:', error);
        router.push('/mock-exam');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchExam();
    }
  }, [params.id, router]);

  // Timer effect
  useEffect(() => {
    if (!isExamStarted || isSubmitted || timeLeft <= 0 || !exam) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, isSubmitted, timeLeft, exam]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    if (isSubmitted || !exam) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (exam && currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!exam) return 0;
    let score = 0;
    exam.questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (Array.isArray(q.correctAnswer)) {
        if (Array.isArray(userAnswer) && 
            userAnswer.length === q.correctAnswer.length &&
            userAnswer.every((ans, i) => ans === q.correctAnswer[i])) {
          score += q.points;
        }
      } else {
        if (userAnswer === q.correctAnswer) {
          score += q.points;
        }
      }
    });
    return score;
  };

  // บันทึกผลการสอบเมื่อ showResults เป็น true
  useEffect(() => {
    const saveExamResult = async () => {
      if (!showResults || !exam || isSaving) return;
      
      const score = calculateScore();
      const percentage = exam.totalScore > 0 ? (score / exam.totalScore) * 100 : 0;
      const isPassed = exam.passingScore ? score >= exam.passingScore : percentage >= 50;
      const timeSpent = startTime > 0 ? Math.floor((Date.now() - startTime) / 1000) : 0;
      
      // ดึง userId จาก localStorage
      if (typeof window !== 'undefined') {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found');
          return;
        }
        
        try {
          setIsSaving(true);
          const response = await fetch('/api/exam-results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studentId: userId,
              examId: exam._id,
              score: score,
              totalScore: exam.totalScore,
              percentage: percentage,
              isPassed: isPassed,
              answers: answers,
              timeSpent: timeSpent,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error saving exam result:', errorData);
          }
        } catch (error) {
          console.error('Error saving exam result:', error);
        } finally {
          setIsSaving(false);
        }
      }
    };
    
    saveExamResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResults]);

  const getTimeColor = () => {
    if (timeLeft <= 60) return 'text-red-600';
    if (timeLeft <= 300) return 'text-orange-600';
    return 'text-blue-600';
  };

  const isAnswerCorrect = (questionIndex: number) => {
    if (!exam) return false;
    const q = exam.questions[questionIndex];
    const userAnswer = answers[questionIndex];
    
    if (Array.isArray(q.correctAnswer)) {
      return Array.isArray(userAnswer) && 
             userAnswer.length === q.correctAnswer.length &&
             userAnswer.every((ans, i) => ans === q.correctAnswer[i]);
    }
    return userAnswer === q.correctAnswer;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="bg-gray-200 h-8 w-64 rounded mb-4 mx-auto"></div>
          <div className="bg-gray-200 h-96 w-full max-w-4xl rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ไม่พบข้อสอบ</h1>
          <Link
            href="/mock-exam"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            กลับไปหน้ารายการข้อสอบ
          </Link>
        </div>
      </div>
    );
  }

  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <Link
              href="/mock-exam"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
            >
              <FaArrowLeft className="mr-2" />
              กลับไปหน้ารายการข้อสอบ
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {exam.title}
              </h1>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">รายละเอียดข้อสอบ</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-blue-600 mr-3" />
                    <span>จำนวนข้อ: <strong>{exam.questions.length} ข้อ</strong></span>
                  </li>
                  <li className="flex items-center">
                    <FaClock className="text-blue-600 mr-3" />
                    <span>เวลาในการทำข้อสอบ: <strong>{exam.duration} นาที</strong></span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-blue-600 mr-3" />
                    <span>คะแนนเต็ม: <strong>{exam.totalScore} คะแนน</strong></span>
                  </li>
                  {exam.passingScore && (
                    <li className="flex items-center">
                      <FaCheckCircle className="text-blue-600 mr-3" />
                      <span>คะแนนผ่าน: <strong>{exam.passingScore} คะแนน</strong></span>
                    </li>
                  )}
                  {exam.courseId && (
                    <li className="flex items-center">
                      <FaCheckCircle className="text-blue-600 mr-3" />
                      <span>วิชา: <strong>{exam.courseId.category} - {exam.courseId.level}</strong></span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">คำอธิบาย</h3>
                <p className="text-gray-700">{exam.description}</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-gray-700">
                  <strong>คำเตือน:</strong> เมื่อเริ่มทำข้อสอบแล้ว ระบบจะจับเวลาโดยอัตโนมัติ 
                  หากหมดเวลาจะส่งข้อสอบอัตโนมัติ
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setIsExamStarted(true);
                  setStartTime(Date.now());
                }}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                เริ่มทำข้อสอบ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = exam.totalScore > 0 ? (score / exam.totalScore) * 100 : 0;
    const isPassed = exam.passingScore ? score >= exam.passingScore : percentage >= 50;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                ผลการสอบ
              </h1>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className={`bg-gradient-to-br rounded-xl p-8 mb-8 ${
              isPassed ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'
            }`}>
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {score}/{exam.totalScore}
                </div>
                <div className="text-2xl font-semibold text-gray-700 mb-4">
                  คะแนน: {percentage.toFixed(1)}%
                </div>
                <div className={`text-xl font-semibold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {isPassed ? '🎉 ผ่านเกณฑ์!' : '❌ ไม่ผ่านเกณฑ์'}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">สรุปคำตอบ</h2>
              {exam.questions.map((q, index) => {
                const isCorrect = isAnswerCorrect(index);
                const userAnswer = answers[index];
                return (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-6 ${
                      isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start mb-4">
                      {isCorrect ? (
                        <FaCheckCircle className="text-green-600 text-2xl mr-3 mt-1" />
                      ) : (
                        <FaTimesCircle className="text-red-600 text-2xl mr-3 mt-1" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-2">
                          ข้อ {index + 1}: {q.questionText}
                        </div>
                        {q.questionType === 'multiple-choice' && q.options && (
                          <div className="space-y-2 mt-4">
                            {q.options.map((option, optIndex) => {
                              const optionLetter = String.fromCharCode(65 + optIndex);
                              const isCorrectOption = option === q.correctAnswer;
                              const isUserOption = option === userAnswer;
                              let label = '';
                              if (isCorrectOption) {
                                label = '✓ คำตอบที่ถูกต้อง';
                              } else if (isUserOption) {
                                label = '✗ คำตอบที่คุณเลือก';
                              }
                              return (
                                <div
                                  key={optIndex}
                                  className={`p-3 rounded ${
                                    isCorrectOption
                                      ? 'bg-green-200 border-2 border-green-500'
                                      : isUserOption
                                      ? 'bg-red-200 border-2 border-red-500'
                                      : 'bg-gray-100'
                                  }`}
                                >
                                  <span className="font-medium">
                                    {optionLetter}. {option}
                                  </span>
                                  {label && (
                                    <span className={`ml-2 font-semibold ${
                                      isCorrectOption ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                      {label}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {q.explanation && (
                          <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                            <p className="text-sm text-gray-700">
                              <strong>คำอธิบาย:</strong> {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center space-x-4">
              <Link
                href="/mock-exam"
                className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 hover:shadow-lg"
              >
                กลับไปหน้ารายการข้อสอบ
              </Link>
              <button
                onClick={() => {
                  setIsExamStarted(false);
                  setIsSubmitted(false);
                  setShowResults(false);
                  setCurrentQuestion(0);
                  setAnswers(new Array(exam.questions.length).fill(''));
                  setTimeLeft(exam.duration * 60);
                  setStartTime(0);
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
              >
                ทำข้อสอบอีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = exam.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Timer */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {exam.title}
              </h1>
              <p className="text-gray-600 mt-1">
                ข้อ {currentQuestion + 1} จาก {exam.questions.length}
              </p>
            </div>
            <div className={`flex items-center gap-3 text-2xl font-bold ${getTimeColor()}`}>
              <FaClock />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">คำถาม</h3>
              <div className="grid grid-cols-5 lg:grid-cols-2 gap-2">
                {exam.questions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(index)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                      currentQuestion === index
                        ? 'bg-blue-600 text-white scale-110'
                        : answers[index] && answers[index] !== ''
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>กำลังทำ</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>ตอบแล้ว</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
                  ข้อ {currentQuestion + 1}: {currentQ.questionText}
                </h2>

                {currentQ.questionType === 'multiple-choice' && currentQ.options && (
                  <div className="space-y-4">
                    {currentQ.options.map((option, index) => {
                      const optionLetter = String.fromCharCode(65 + index);
                      const isSelected = answers[currentQuestion] === option;
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={isSubmitted}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                          } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className="font-semibold text-gray-700">
                            {optionLetter}. {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQ.questionType === 'true-false' && (
                  <div className="space-y-4">
                    {['จริง', 'เท็จ'].map((option, index) => {
                      const isSelected = answers[currentQuestion] === option;
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={isSubmitted}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                          } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className="font-semibold text-gray-700">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                    currentQuestion === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← ก่อนหน้า
                </button>

                <div className="text-sm text-gray-600">
                  ตอบแล้ว {answers.filter((a) => a && a !== '').length} / {exam.questions.length} ข้อ
                </div>

                {currentQuestion === exam.questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitted}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    ส่งคำตอบ
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200"
                  >
                    ถัดไป →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

