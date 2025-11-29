import RegistrationForm from '@/components/RegistrationForm';
import { FaGraduationCap, FaRocket } from 'react-icons/fa';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white relative overflow-hidden">
      {/* Animated background elements - สีสันที่ทันสมัยสำหรับวัยมัธยมปลาย */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-100/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        {/* Header Section - ปรับให้ดูทันสมัยและน่าสนใจ */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
          {/* Icon with modern gradient */}
          <div className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/40 transform hover:scale-105 transition-transform duration-300 relative">
            <FaGraduationCap className="text-white text-4xl md:text-5xl relative z-10" />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
          </div>
          
          {/* Title with gradient text */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            ลงทะเบียนเรียนคอร์สออนไลน์
          </h1>
          
          {/* Subtitle with emoji and modern styling */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <FaRocket className="text-blue-500 text-xl animate-bounce" />
            <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto font-medium">
              เริ่มต้นเส้นทางการเรียนรู้ของคุณที่นี่
            </p>
          </div>
          
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสมัครเรียนกับเรา
          </p>
        </div>

        {/* Form Card - ปรับให้ดูทันสมัยและมี depth */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden animate-fade-in-up animation-delay-200 transform hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
          {/* Decorative top border */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          
          <div className="p-6 md:p-8 lg:p-10">
            <RegistrationForm />
          </div>
        </div>
      </div>
    </div>
  );
}

