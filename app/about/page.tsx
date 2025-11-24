'use client';

import Image from 'next/image';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaTrophy, 
  FaHeart, 
  FaLightbulb, 
  FaBullseye
} from 'react-icons/fa';

export default function AboutPage() {
  const values = [
    {
      icon: FaGraduationCap,
      title: 'คุณภาพการศึกษา',
      description: 'มุ่งมั่นในการให้การศึกษาที่มีคุณภาพสูงสุด เพื่อพัฒนาศักยภาพของนักเรียนทุกคน',
    },
    {
      icon: FaUsers,
      title: 'การดูแลใกล้ชิด',
      description: 'จำกัดจำนวนนักเรียนต่อห้องเพื่อให้ครูสามารถดูแลและให้คำปรึกษาได้อย่างใกล้ชิด',
    },
    {
      icon: FaTrophy,
      title: 'ผลลัพธ์ที่พิสูจน์ได้',
      description: 'นักเรียนของเรามีอัตราการสอบติดมหาวิทยาลัยและได้เกรดที่ดีขึ้นอย่างเห็นได้ชัด',
    },
    {
      icon: FaHeart,
      title: 'ความใส่ใจ',
      description: 'ใส่ใจในความต้องการและปัญหาของนักเรียนแต่ละคน เพื่อให้การเรียนมีประสิทธิภาพสูงสุด',
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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up">
              เกี่ยวกับเรา
              <br />
              <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                SciHome
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up animation-delay-400">
              สถาบันกวดวิชาที่มุ่งมั่นในการพัฒนาการศึกษาและสร้างอนาคตที่ดีให้กับนักเรียนทุกคน
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced Design */}
      <section className="py-8 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden -mt-8">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 hover:border-blue-300"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/0 group-hover:from-blue-50/50 group-hover:to-blue-100/30 rounded-xl transition-all duration-300"></div>
                  
                  <div className="relative z-10">
                    {/* Icon with animated background */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/30">
                      <Icon className="text-white text-xl" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center group-hover:text-blue-600 transition-colors duration-300">
                      {value.title}
                    </h3>
                    
                    <p className="text-gray-600 text-xs leading-relaxed text-center">
                      {value.description}
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

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-6">
                <FaBullseye className="text-blue-600 text-3xl mr-4" />
                <h2 className="text-3xl font-bold text-gray-900">วิสัยทัศน์</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                เป็นสถาบันกวดวิชาชั้นนำที่มุ่งมั่นในการพัฒนาการศึกษาไทย 
                และสร้างบุคลากรที่มีคุณภาพเพื่อขับเคลื่อนประเทศชาติให้ก้าวหน้า
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center mb-6">
                <FaLightbulb className="text-yellow-500 text-3xl mr-4" />
                <h2 className="text-3xl font-bold text-gray-900">พันธกิจ</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                ให้การศึกษาที่มีคุณภาพสูงสุด พัฒนาศักยภาพของนักเรียน 
                และสร้างแรงบันดาลใจในการเรียนรู้เพื่อให้บรรลุเป้าหมายที่ตั้งไว้
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ประวัติความเป็นมา
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-lg">
                SciHome ก่อตั้งขึ้นในปี 2014 โดยกลุ่มครูผู้สอนที่มีประสบการณ์และความเชี่ยวชาญ
                ในการสอนวิชาต่างๆ เริ่มต้นจากความตั้งใจที่จะช่วยให้นักเรียนมีผลการเรียนที่ดีขึ้น
                และสามารถสอบติดมหาวิทยาลัยที่ต้องการได้
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                ตลอดระยะเวลา 10 ปีที่ผ่านมา เราได้พัฒนาหลักสูตรและวิธีการสอนอย่างต่อเนื่อง
                เพื่อให้เหมาะสมกับความต้องการของนักเรียนในแต่ละยุคสมัย
                และได้สร้างความสำเร็จให้กับนักเรียนมากกว่า 500 คน
              </p>
              <p className="text-gray-700 leading-relaxed text-lg">
                ปัจจุบัน SciHome เป็นสถาบันกวดวิชาที่ได้รับการยอมรับจากนักเรียนและผู้ปกครอง
                ด้วยระบบการเรียนการสอนที่มีคุณภาพ ครูผู้สอนที่มีประสบการณ์
                และบรรยากาศการเรียนที่เอื้อต่อการเรียนรู้
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ค่านิยมของเรา
            </h2>
            <p className="text-xl text-gray-600">
              หลักการที่เรายึดถือในการดำเนินงาน
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Icon className="text-blue-600 text-3xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Campus Environment */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              บรรยากาศสถาบัน
            </h2>
            <p className="text-xl text-gray-600">
              สถานที่เรียนที่เอื้อต่อการเรียนรู้
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative rounded-lg h-64 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
                alt="ห้องเรียน 1"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="relative rounded-lg h-64 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=600&fit=crop"
                alt="ห้องเรียน 2"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="relative rounded-lg h-64 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop"
                alt="ห้องเรียน 3"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="relative rounded-lg h-64 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"
                alt="ห้องสมุด"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="relative rounded-lg h-64 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&h=600&fit=crop"
                alt="พื้นที่พักผ่อน"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="relative rounded-lg h-64 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
              <Image
                src="https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop"
                alt="อาคารสถาบัน"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            พร้อมเป็นส่วนหนึ่งของครอบครัว SciHome แล้วหรือยัง?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            มาร่วมเดินทางสู่ความสำเร็จทางการศึกษากับเรา
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/courses"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ดูหลักสูตร
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              ติดต่อเรา
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}