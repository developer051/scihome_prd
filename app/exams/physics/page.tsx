'use client';

import { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: 'วัตถุเคลื่อนที่ด้วยความเร็วคงที่ 10 m/s เป็นเวลา 5 วินาที ระยะทางที่วัตถุเคลื่อนที่ได้เป็นเท่าใด?',
    options: ['50 m', '15 m', '2 m', '5 m'],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: 'แรงที่กระทำต่อวัตถุมวล 5 kg ให้เกิดความเร่ง 2 m/s² มีค่าเท่าใด?',
    options: ['10 N', '7 N', '2.5 N', '3 N'],
    correctAnswer: 0,
  },
  {
    id: 3,
    question: 'พลังงานศักย์โน้มถ่วงของวัตถุมวล 2 kg ที่สูงจากพื้นดิน 10 m (g = 10 m/s²) มีค่าเท่าใด?',
    options: ['20 J', '200 J', '100 J', '10 J'],
    correctAnswer: 1,
  },
  {
    id: 4,
    question: 'เมื่อแสงผ่านจากอากาศเข้าสู่น้ำ ความเร็วของแสงจะเกิดอะไรขึ้น?',
    options: ['เพิ่มขึ้น', 'ลดลง', 'คงที่', 'ขึ้นอยู่กับความยาวคลื่น'],
    correctAnswer: 1,
  },
  {
    id: 5,
    question: 'กระแสไฟฟ้า 2 A ไหลผ่านตัวต้านทาน 10 Ω เป็นเวลา 5 วินาที พลังงานที่ใช้ไปเป็นเท่าใด?',
    options: ['100 J', '200 J', '50 J', '20 J'],
    correctAnswer: 1,
  },
  {
    id: 6,
    question: 'คลื่นเสียงมีความถี่ 500 Hz และความยาวคลื่น 0.68 m ความเร็วของคลื่นเสียงเป็นเท่าใด?',
    options: ['340 m/s', '500 m/s', '680 m/s', '250 m/s'],
    correctAnswer: 0,
  },
  {
    id: 7,
    question: 'วัตถุที่อุณหภูมิ 100°C ถูกนำไปใส่ในน้ำ 0°C 1 kg (ความจุความร้อนจำเพาะน้ำ = 4200 J/kg·K) ถ้าน้ำได้รับความร้อน 42000 J อุณหภูมิสุดท้ายของน้ำเป็นเท่าใด?',
    options: ['10°C', '20°C', '30°C', '40°C'],
    correctAnswer: 0,
  },
  {
    id: 8,
    question: 'แรงลัพธ์ที่กระทำต่อวัตถุที่อยู่นิ่งมีค่าเท่าใด?',
    options: ['มากกว่าศูนย์', 'เท่ากับศูนย์', 'น้อยกว่าศูนย์', 'ไม่สามารถบอกได้'],
    correctAnswer: 1,
  },
  {
    id: 9,
    question: 'เมื่อประจุไฟฟ้า +2 C และ -3 C อยู่ห่างกัน 2 m แรงระหว่างประจุเป็นเท่าใด? (k = 9×10⁹ N·m²/C²)',
    options: ['-1.35×10¹⁰ N', '1.35×10¹⁰ N', '-2.7×10¹⁰ N', '2.7×10¹⁰ N'],
    correctAnswer: 0,
  },
  {
    id: 10,
    question: 'วัตถุเคลื่อนที่ด้วยความเร็วเริ่มต้น 20 m/s และความเร่ง -5 m/s² วัตถุจะหยุดนิ่งเมื่อเวลาผ่านไปกี่วินาที?',
    options: ['4 s', '5 s', '10 s', '15 s'],
    correctAnswer: 0,
  },
];

export default function PhysicsExamPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(10).fill(-1));
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isExamStarted || isSubmitted || timeLeft <= 0) return;

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
  }, [isExamStarted, isSubmitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isSubmitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
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
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const getTimeColor = () => {
    if (timeLeft <= 60) return 'text-red-600';
    if (timeLeft <= 300) return 'text-orange-600';
    return 'text-blue-600';
  };

  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                ข้อสอบวิชา Physics
              </h1>
              <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-6 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">รายละเอียดข้อสอบ</h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-blue-600 mr-3" />
                    <span>จำนวนข้อ: <strong>10 ข้อ</strong></span>
                  </li>
                  <li className="flex items-center">
                    <FaClock className="text-blue-600 mr-3" />
                    <span>เวลาในการทำข้อสอบ: <strong>15 นาที</strong></span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-blue-600 mr-3" />
                    <span>ประเภท: <strong>เลือกคำตอบ (4 ตัวเลือก)</strong></span>
                  </li>
                </ul>
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
                onClick={() => setIsExamStarted(true)}
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
    const percentage = (score / questions.length) * 100;

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

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 mb-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-2">{score}/{questions.length}</div>
                <div className="text-2xl font-semibold text-gray-700 mb-4">
                  คะแนน: {percentage.toFixed(0)}%
                </div>
                <div className={`text-xl font-semibold ${percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {percentage >= 70 ? 'ยอดเยี่ยม!' : percentage >= 50 ? 'ดีมาก!' : 'ต้องฝึกฝนเพิ่มเติม'}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">สรุปคำตอบ</h2>
              {questions.map((q, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer === q.correctAnswer;
                return (
                  <div
                    key={q.id}
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
                          ข้อ {q.id}: {q.question}
                        </div>
                        <div className="space-y-2 mt-4">
                          {q.options.map((option, optIndex) => {
                            let label = '';
                            if (optIndex === q.correctAnswer) {
                              label = '✓ คำตอบที่ถูกต้อง';
                            } else if (optIndex === userAnswer) {
                              label = '✗ คำตอบที่คุณเลือก';
                            }
                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded ${
                                  optIndex === q.correctAnswer
                                    ? 'bg-green-200 border-2 border-green-500'
                                    : optIndex === userAnswer
                                    ? 'bg-red-200 border-2 border-red-500'
                                    : 'bg-gray-100'
                                }`}
                              >
                                <span className="font-medium">
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </span>
                                {label && (
                                  <span className={`ml-2 font-semibold ${
                                    optIndex === q.correctAnswer ? 'text-green-700' : 'text-red-700'
                                  }`}>
                                    {label}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setIsExamStarted(false);
                  setIsSubmitted(false);
                  setShowResults(false);
                  setCurrentQuestion(0);
                  setAnswers(new Array(10).fill(-1));
                  setTimeLeft(15 * 60);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Timer */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                ข้อสอบวิชา Physics
              </h1>
              <p className="text-gray-600 mt-1">
                ข้อ {currentQuestion + 1} จาก {questions.length}
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
                {questions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => handleQuestionClick(index)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                      currentQuestion === index
                        ? 'bg-blue-600 text-white scale-110'
                        : answers[index] !== -1
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {q.id}
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
                  ข้อ {questions[currentQuestion].id}: {questions[currentQuestion].question}
                </h2>

                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        answers[currentQuestion] === index
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                      } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="font-semibold text-gray-700">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </button>
                  ))}
                </div>
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
                  ตอบแล้ว {answers.filter((a) => a !== -1).length} / {questions.length} ข้อ
                </div>

                {currentQuestion === questions.length - 1 ? (
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

