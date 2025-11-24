import RegistrationForm from '@/components/RegistrationForm';
import { FaGraduationCap } from 'react-icons/fa';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-100/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/30">
            <FaGraduationCap className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ลงทะเบียนเรียนคอร์สออนไลน์
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสมัครเรียนกับเรา
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden animate-fade-in-up animation-delay-200">
          <div className="p-6 md:p-10">
            <RegistrationForm />
          </div>
        </div>
      </div>
    </div>
  );
}

