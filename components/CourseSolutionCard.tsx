import Link from 'next/link';
import Image from 'next/image';
import { FaArrowRight } from 'react-icons/fa';
import { useState } from 'react';

interface CourseSolutionCardProps {
  course: {
    _id: string;
    name: string;
    description: string;
    category: string;
    level: string;
    image: string;
  };
}

// Helper function to get image URL
function getImageUrl(image: string | undefined | null): string {
  if (!image) {
    return '/images/course-default.jpg';
  }
  
  // ถ้าเป็น full URL หรือ relative path ที่เริ่มด้วย / ให้ใช้ตามเดิม
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
    return image;
  }
  
  // ถ้าเป็น image ID ให้ใช้ API endpoint
  return `/api/images/${image}`;
}

export default function CourseSolutionCard({ course }: CourseSolutionCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = imageError ? '/images/course-default.jpg' : getImageUrl(course.image);

  return (
    <Link href={`/courses/${course._id}`} className="group">
      <div className="bg-white rounded-lg cursor-pointer flex flex-col h-full border border-gray-100 overflow-hidden course-solution-card-glow">
        {/* Course Image */}
        <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={course.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            onError={() => setImageError(true)}
            unoptimized={imageUrl.startsWith('/api/images/')}
          />
          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {course.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {course.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-6 line-clamp-3 flex-grow leading-relaxed">
            {course.description}
          </p>

          {/* Navigation Arrow */}
          <div className="flex justify-start items-center gap-2 mt-auto group-hover:gap-3 transition-all duration-300">
            <FaArrowRight className="text-gray-500 text-base group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
            <span className="text-sm text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              view course
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

