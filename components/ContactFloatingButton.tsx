'use client';

import { useState, useEffect } from 'react';
import { FaFacebook, FaLine, FaCommentDots } from 'react-icons/fa';

export default function ContactFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
          setScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // ตั้งค่า scroll position เริ่มต้น
    if (typeof window !== 'undefined') {
      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const facebookUrl = 'https://www.facebook.com/scihomechonburi';
  const lineUrl = 'https://line.me/ti/p/~yourlineid'; // แก้ไข URL ตามต้องการ

  return (
    <div 
      className="fixed bottom-6 right-6 z-50"
      style={{
        transform: `translateY(-${scrollY}px)`,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Social Media Icons */}
      {isOpen && (
        <div className="mb-4 flex flex-col gap-4 animate-fade-in">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 hover:shadow-xl"
            aria-label="Facebook"
          >
            <FaFacebook size={44} />
          </a>
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 hover:shadow-xl"
            aria-label="LINE"
          >
            <FaLine size={44} />
          </a>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="ติดต่อเรา"
      >
        {isOpen ? (
          <span className="text-4xl font-bold">×</span>
        ) : (
          <FaCommentDots size={44} />
        )}
      </button>
    </div>
  );
}

