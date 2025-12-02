'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaBars, FaTimes, FaChevronDown, FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();
  const accountDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอินจาก localStorage
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      
      // ดึงข้อมูลชื่อผู้ใช้จาก localStorage
      if (loggedIn) {
        try {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            // ใช้ nickname ถ้ามี ถ้าไม่มีใช้ name
            const displayName = user.nickname || user.name || 'My account';
            setUserName(displayName);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUserName('My account');
        }
      } else {
        setUserName('My account');
      }
    }
    
    // Cleanup timeout เมื่อ component unmount
    return () => {
      if (accountDropdownTimeoutRef.current) {
        clearTimeout(accountDropdownTimeoutRef.current);
      }
    };
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

  const buttonBase =
    'relative inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold text-white/95 tracking-wide shadow-lg shadow-black/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white active:scale-[0.98] backdrop-blur-xl border border-white/30';

  const buttonVariants = {
    dashboard: `${buttonBase} bg-gradient-to-r from-violet-500/80 via-purple-500/70 to-fuchsia-500/70 hover:from-violet-500/95 hover:via-purple-500/90 hover:to-fuchsia-500/90 focus:ring-purple-200 text-white`,
    logout: `${buttonBase} bg-gradient-to-r from-rose-500/75 via-red-500/70 to-orange-500/70 hover:from-rose-500/95 hover:via-red-500/90 hover:to-orange-500/90 focus:ring-rose-200 text-white`,
    login: `${buttonBase} bg-gradient-to-r from-blue-500/75 via-sky-500/70 to-cyan-500/70 hover:from-blue-500/95 hover:via-sky-500/90 hover:to-cyan-500/90 focus:ring-blue-200 text-white`,
    register: `${buttonBase} bg-gradient-to-r from-emerald-500/75 via-green-500/70 to-lime-500/70 hover:from-emerald-500/95 hover:via-green-500/90 hover:to-lime-500/90 focus:ring-emerald-200 text-white`,
    admin: `${buttonBase} bg-gradient-to-r from-slate-700/80 via-slate-800/70 to-gray-900/70 hover:from-slate-700/95 hover:via-gray-900/90 hover:to-black/90 focus:ring-slate-200 text-white`,
    account: `${buttonBase} bg-gradient-to-r from-indigo-500/80 via-blue-500/70 to-purple-500/70 hover:from-indigo-500/95 hover:via-blue-500/90 hover:to-purple-500/90 focus:ring-indigo-200 text-white`,
  };

  return (
    <nav className="bg-white/98 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-200/60">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
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

            {/* My Account Dropdown */}
            <div 
              className="relative ml-3"
              onMouseEnter={() => {
                if (accountDropdownTimeoutRef.current) {
                  clearTimeout(accountDropdownTimeoutRef.current);
                  accountDropdownTimeoutRef.current = null;
                }
                setIsAccountDropdownOpen(true);
              }}
              onMouseLeave={() => {
                accountDropdownTimeoutRef.current = setTimeout(() => {
                  setIsAccountDropdownOpen(false);
                }, 300); // หน่วงเวลา 300ms ก่อนปิด dropdown
              }}
            >
              <button
                className={`${buttonVariants.account} shadow-indigo-500/20 flex items-center space-x-2`}
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
              >
                <FaUserCircle className="text-base" />
                <span>{userName || 'My account'}</span>
                <FaChevronDown className={`text-xs transition-all duration-300 ${isAccountDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isAccountDropdownOpen && (
                <div 
                  className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/60 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseEnter={() => {
                    if (accountDropdownTimeoutRef.current) {
                      clearTimeout(accountDropdownTimeoutRef.current);
                      accountDropdownTimeoutRef.current = null;
                    }
                  }}
                  onMouseLeave={() => {
                    accountDropdownTimeoutRef.current = setTimeout(() => {
                      setIsAccountDropdownOpen(false);
                    }, 300);
                  }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsAccountDropdownOpen(false)}
                          className={`${buttonVariants.dashboard} ${
                            pathname === '/dashboard'
                              ? 'shadow-purple-500/40'
                              : 'shadow-purple-500/20'
                          }`}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setIsAccountDropdownOpen(false);
                            handleLogout();
                          }}
                          className={`${buttonVariants.logout} shadow-rose-500/20`}
                        >
                          ออกจากระบบ
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className={`${buttonVariants.login} shadow-sky-500/20`}
                      >
                        Login
                      </Link>
                    )}
                    <Link
                      href="/register"
                      onClick={() => setIsAccountDropdownOpen(false)}
                      className={`${buttonVariants.register} shadow-emerald-500/20`}
                    >
                      Register
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setIsAccountDropdownOpen(false)}
                      className={`${buttonVariants.admin} shadow-slate-800/30`}
                    >
                      Admin
                    </Link>
                  </div>
                </div>
              )}
            </div>
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

            {/* Mobile My Account Dropdown */}
            <div className="mt-3">
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 ${
                  isAccountDropdownOpen
                    ? 'text-indigo-600 bg-indigo-50/80 border-l-4 border-indigo-600 shadow-sm'
                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50/80'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FaUserCircle className="text-xl" />
                  <span>{userName || 'My account'}</span>
                </div>
                <FaChevronDown className={`text-xs transition-all duration-300 ${isAccountDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>
              {isAccountDropdownOpen && (
                <div className="mt-1.5 ml-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-2 gap-2">
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/dashboard"
                          className={`text-base ${buttonVariants.dashboard} ${
                            pathname === '/dashboard'
                              ? 'shadow-purple-500/40'
                              : 'shadow-purple-500/20'
                          }`}
                          onClick={() => {
                            setIsOpen(false);
                            setIsAccountDropdownOpen(false);
                          }}
                        >
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            setIsAccountDropdownOpen(false);
                            handleLogout();
                          }}
                          className={`text-base ${buttonVariants.logout} shadow-rose-500/20`}
                        >
                          ออกจากระบบ
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        className={`text-base ${buttonVariants.login} shadow-sky-500/20`}
                        onClick={() => {
                          setIsOpen(false);
                          setIsAccountDropdownOpen(false);
                        }}
                      >
                        Login
                      </Link>
                    )}
                    <Link
                      href="/register"
                      className={`text-base ${buttonVariants.register} shadow-emerald-500/20`}
                      onClick={() => {
                        setIsOpen(false);
                        setIsAccountDropdownOpen(false);
                      }}
                    >
                      Register
                    </Link>
                    <Link
                      href="/admin"
                      className={`text-base ${buttonVariants.admin} shadow-slate-900/30`}
                      onClick={() => {
                        setIsOpen(false);
                        setIsAccountDropdownOpen(false);
                      }}
                    >
                      Admin
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
