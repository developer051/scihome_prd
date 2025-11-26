'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FaTachometerAlt, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaNewspaper, 
  FaComments, 
  FaUserPlus, 
  FaEnvelope,
  FaBars,
  FaTimes,
  FaFileAlt,
  FaClipboardList,
  FaUsers,
  FaFolder,
  FaTags
} from 'react-icons/fa';
import { useEffect, useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAccess = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userRaw = localStorage.getItem('user');

      if (!isLoggedIn || !userRaw) {
        router.replace('/login');
        setAuthChecked(true);
        return;
      }

      try {
        const user = JSON.parse(userRaw);
        if (user?.role === 'admin') {
          setIsAuthorized(true);
        } else {
          router.replace('/dashboard');
        }
      } catch {
        router.replace('/login');
      } finally {
        setAuthChecked(true);
      }
    };

    checkAccess();
  }, [router]);

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: FaTachometerAlt },
    { name: 'Section', href: '/admin/sections', icon: FaFolder },
    { name: 'Category', href: '/admin/categories', icon: FaTags },
    { name: 'หลักสูตร', href: '/admin/courses', icon: FaGraduationCap },
    { name: 'ข้อสอบ', href: '/admin/exams', icon: FaFileAlt },
    { name: 'ครูผู้สอน', href: '/admin/teachers', icon: FaChalkboardTeacher },
    { name: 'ข่าวสาร', href: '/admin/news', icon: FaNewspaper },
    { name: 'รีวิว', href: '/admin/testimonials', icon: FaComments },
    { name: 'การสมัครเรียน', href: '/admin/registrations', icon: FaUserPlus },
    { name: 'การลงทะเบียนคอร์ส', href: '/admin/enrollments', icon: FaClipboardList },
    { name: 'ผู้ใช้', href: '/admin/users', icon: FaUsers },
    { name: 'ข้อความติดต่อ', href: '/admin/messages', icon: FaEnvelope },
  ];

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">กำลังนำคุณไปยังหน้าที่เหมาะสม...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-600 hover:text-gray-800"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // สำหรับหน้า users ให้ match ทั้ง /admin/users และ /admin/users/[id]
            const isActive = item.href === '/admin/users' 
              ? pathname === item.href || pathname.startsWith('/admin/users/')
              : pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="mr-3" size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="md:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-800"
            >
              <FaBars size={20} />
            </button>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                กลับไปหน้าเว็บไซต์
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
