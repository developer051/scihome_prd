import Link from 'next/link';
import { FaClock, FaUsers, FaMapMarkerAlt, FaLaptop } from 'react-icons/fa';

interface CourseCardProps {
  course: {
    _id: string;
    name: string;
    description: string;
    category: string;
    level: string;
    price: number;
    schedule: string;
    image: string;
    duration: string;
    maxStudents: number;
    isOnline: boolean;
    isOnsite: boolean;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden course-card-glow flex flex-col h-full">
      <div className="relative overflow-hidden">
        <img
          src={course.image}
          alt={course.name}
          className="w-full h-48 object-cover bg-gray-100 transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {course.category}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {course.level}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col h-full">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {course.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <FaClock className="mr-2 text-blue-500" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaUsers className="mr-2 text-blue-500" />
            <span>สูงสุด {course.maxStudents} คน</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2 text-blue-500">📅</span>
            <span>{course.schedule}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            {course.isOnline && (
              <div className="flex items-center mr-4">
                <FaLaptop className="mr-1 text-green-500" />
                <span>ออนไลน์</span>
              </div>
            )}
            {course.isOnsite && (
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-1 text-orange-500" />
                <span>ออนไซต์</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4">
          <div className="text-2xl font-bold text-blue-600">
            ฿{course.price.toLocaleString()}
          </div>
          <Link
            href={`/courses/${course._id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </div>
  );
}
