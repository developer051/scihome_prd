import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

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

export default function CourseSolutionCard({ course }: CourseSolutionCardProps) {
  return (
    <Link href={`/courses/${course._id}`} className="group">
      <div className="bg-white rounded-lg cursor-pointer flex flex-col h-full border border-gray-100 overflow-hidden course-solution-card-glow">
        {/* Course Image */}
        {course.image && (
          <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
            <img
              src={course.image}
              alt={course.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                {course.category}
              </span>
            </div>
          </div>
        )}

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

