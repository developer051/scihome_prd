'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอินจาก localStorage
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    }
  }, [pathname]); // อัปเดตเมื่อ pathname เปลี่ยน

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      setIsLoggedIn(false);
      router.push('/login');
    }
  };

  const navItems = [
    { name: 'หน้าหลัก', href: '/' },
    { name: 'หลักสูตร', href: '/courses' },
    { name: 'Mock-exam', href: '/mock-exam' },
    { name: 'ครูผู้สอน', href: '/teachers' },
  ];

  const dropdownItems = [
    { name: 'เกี่ยวกับเรา', href: '/about' },
    { name: 'ติดต่อเรา', href: '/contact' },
  ];

  return (
    <nav className="bg-white/98 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Image
                src="/scihome.png"
                alt="ScienceHome"
                width={100}
                height={100}
                className="h-full w-auto object-contain drop-shadow-sm"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-5 py-2.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 shadow-sm'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/80'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
            
            {/* Dropdown Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                className={`relative px-5 py-2.5 rounded-xl text-base font-medium transition-all duration-200 flex items-center space-x-1.5 ${
                  pathname === '/about' || pathname === '/contact'
                    ? 'text-blue-600 bg-blue-50/80 shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/80'
                }`}
              >
                <span>อื่นๆ</span>
                <FaChevronDown className={`text-xs transition-all duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/60 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {dropdownItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-4 py-2.5 mx-2 rounded-lg text-base font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-blue-600 bg-blue-50 shadow-sm'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`ml-3 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === '/dashboard'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-3 bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 active:bg-red-800 transition-all duration-200"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="ml-3 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-all duration-200"
              >
                Login
              </Link>
            )}

            <Link
              href="/register"
              className="ml-3 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800 transition-all duration-200"
            >
              Register
            </Link>

            <Link
              href="/admin"
              className="ml-3 bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 active:bg-gray-900 transition-all duration-200"
            >
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-gray-100/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 active:scale-95"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <FaTimes size={22} className="transform transition-transform duration-300" />
              ) : (
                <FaBars size={22} className="transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-3 pt-3 pb-5 space-y-1.5 bg-white/98 backdrop-blur-sm border-t border-gray-200/60">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/80'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            
            {/* Mobile Dropdown */}
            <div>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 ${
                  pathname === '/about' || pathname === '/contact'
                    ? 'text-blue-600 bg-blue-50/80 border-l-4 border-blue-600 shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/80'
                }`}
              >
                <span>อื่นๆ</span>
                <FaChevronDown className={`text-xs transition-all duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="mt-1.5 ml-4 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {dropdownItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                          isActive
                            ? 'text-blue-600 bg-blue-50/80 border-l-4 border-blue-600 shadow-sm'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/80'
                        }`}
                        onClick={() => {
                          setIsOpen(false);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block mt-3 mx-2 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 text-center ${
                    pathname === '/dashboard'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full mt-3 mx-2 bg-red-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-red-700 active:bg-red-800 transition-all duration-200 text-center"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block mt-3 mx-2 bg-blue-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 text-center"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}

            <Link
              href="/register"
              className="block mt-3 mx-2 bg-green-600 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-green-700 active:bg-green-800 transition-all duration-200 text-center"
              onClick={() => setIsOpen(false)}
            >
              Register
            </Link>

            <Link
              href="/admin"
              className="block mt-3 mx-2 bg-gray-700 text-white px-4 py-3 rounded-lg text-base font-medium hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 text-center"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
