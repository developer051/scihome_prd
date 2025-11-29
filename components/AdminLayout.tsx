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
  FaTags,
  FaTrophy
} from 'react-icons/fa';
import { useEffect, useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NotificationCounts {
  registrations: number;
  enrollments: number;
  messages: number;
  total: number;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [notifications, setNotifications] = useState<NotificationCounts>({
    registrations: 0,
    enrollments: 0,
    messages: 0,
    total: 0,
  });

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

  // ดึงข้อมูล notifications
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/admin/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // ดึงข้อมูลทันทีเมื่อ authorized และเมื่อเปลี่ยนหน้า
    fetchNotifications();
    
    // อัปเดตทุก 30 วินาที
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [isAuthorized, pathname]);

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: FaTachometerAlt, notificationKey: null },
    { name: 'Section', href: '/admin/sections', icon: FaFolder, notificationKey: null },
    { name: 'Category', href: '/admin/categories', icon: FaTags, notificationKey: null },
    { name: 'หลักสูตร', href: '/admin/courses', icon: FaGraduationCap, notificationKey: null },
    { name: 'ข้อสอบ', href: '/admin/exams', icon: FaFileAlt, notificationKey: null },
    { name: 'ครูผู้สอน', href: '/admin/teachers', icon: FaChalkboardTeacher, notificationKey: null },
    { name: 'ข่าวสาร', href: '/admin/news', icon: FaNewspaper, notificationKey: null },
    { name: 'รีวิว', href: '/admin/testimonials', icon: FaComments, notificationKey: null },
    { name: 'ความสำเร็จนักเรียน', href: '/admin/student-achievements', icon: FaTrophy, notificationKey: null },
    { name: 'การสมัครเรียน', href: '/admin/registrations', icon: FaUserPlus, notificationKey: 'registrations' },
    { name: 'การลงทะเบียนคอร์ส', href: '/admin/enrollments', icon: FaClipboardList, notificationKey: 'enrollments' },
    { name: 'ผู้ใช้', href: '/admin/users', icon: FaUsers, notificationKey: null },
    { name: 'ข้อความติดต่อ', href: '/admin/messages', icon: FaEnvelope, notificationKey: 'messages' },
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
            
            const notificationCount = item.notificationKey 
              ? notifications[item.notificationKey as keyof NotificationCounts] || 0
              : 0;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div className="flex items-center">
                  <Icon className="mr-3" size={16} />
                  {item.name}
                </div>
                {notificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 flex items-center justify-center min-w-[20px] h-5">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
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
