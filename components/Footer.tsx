import Link from 'next/link';
import Image from 'next/image';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaLine } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <Image 
                src="/scihome.png" 
                alt="ScienceHome" 
                width={120} 
                height={120}
                className="object-contain opacity-70"
              />
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              สถาบันกวดวิชาที่มุ่งมั่นในการพัฒนาการศึกษาและสร้างอนาคตที่ดีให้กับนักเรียนทุกคน
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaLine size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">เมนูหลัก</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  หน้าหลัก
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-gray-300 hover:text-white transition-colors">
                  หลักสูตร
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="text-gray-300 hover:text-white transition-colors">
                  ครูผู้สอน
                </Link>
              </li>
              <li className="relative">
                <div className="relative">
                  <span className="text-gray-300 font-medium relative pl-4 block">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border-l-2 border-b-2 border-gray-400"></span>
                    อื่นๆ
                  </span>
                  <ul className="ml-4 mt-1 space-y-1 relative">
                    {/* เส้นแนวตั้งเชื่อมจาก parent ไปยัง child nodes */}
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400"></span>
                    <li className="relative pl-4">
                      {/* เส้นแนวตั้งสำหรับรายการแรก */}
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400"></span>
                      {/* เส้นแนวนอนเชื่อมไปยังข้อความ */}
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-gray-400"></span>
                      <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm relative z-10 block">
                        เกี่ยวกับเรา
                      </Link>
                    </li>
                    <li className="relative pl-4">
                      {/* เส้นแนวตั้งสำหรับรายการสุดท้าย (สั้นลง) */}
                      <span className="absolute left-0 top-0 h-1/2 w-0.5 bg-gray-400"></span>
                      {/* เส้นแนวนอนเชื่อมไปยังข้อความ */}
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-0.5 bg-gray-400"></span>
                      <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm relative z-10 block">
                        ติดต่อเรา
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ติดต่อเรา</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-blue-400" />
                <span className="text-gray-300 text-sm">
                  123 ถนนการศึกษา เขตการเรียนรู้ กรุงเทพฯ 10110
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhone className="text-blue-400" />
                <span className="text-gray-300 text-sm">02-123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-blue-400" />
                <span className="text-gray-300 text-sm">info@scihome.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-right">
          <p className="text-gray-400 text-sm">
            © 2024 ScienceHome. สงวนลิขสิทธิ์ทุกประการ
          </p>
        </div>
      </div>
    </footer>
  );
}
