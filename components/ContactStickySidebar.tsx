'use client';

import { FaFacebook, FaLine, FaPhone } from 'react-icons/fa';

export default function ContactStickySidebar() {
  const facebookUrl = 'https://www.facebook.com/scihomechonburi';
  const lineUrl = 'https://line.me/ti/p/~yourlineid'; // แก้ไข URL ตามต้องการ
  const phoneNumber = '038123456'; // แก้ไขเบอร์โทรศัพท์ตามต้องการ

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div 
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[100] pointer-events-none"
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="flex flex-col gap-3 md:gap-4 p-1.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-l-2xl shadow-2xl border-l-2 border-y-2 border-gray-200 pointer-events-auto">
        {/* Facebook Button */}
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-12 h-12 md:w-14 md:h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 hover:shadow-xl"
          aria-label="Facebook"
        >
          <FaFacebook className="w-5 h-5 md:w-6 md:h-6" />
          <span className="absolute right-full mr-3 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Facebook
          </span>
        </a>

        {/* LINE Button */}
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-12 h-12 md:w-14 md:h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 hover:shadow-xl"
          aria-label="LINE"
        >
          <FaLine className="w-5 h-5 md:w-6 md:h-6" />
          <span className="absolute right-full mr-3 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            LINE
          </span>
        </a>

        {/* Call Button */}
        <button
          onClick={handleCall}
          className="group relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 hover:scale-110 hover:shadow-xl"
          aria-label="โทรศัพท์"
        >
          <FaPhone className="w-4 h-4 md:w-5 md:h-5" />
          <span className="absolute right-full mr-3 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            โทรศัพท์
          </span>
        </button>
      </div>
    </div>
  );
}

