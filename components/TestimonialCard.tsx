import { FaStar } from 'react-icons/fa';

interface TestimonialCardProps {
  testimonial: {
    _id: string;
    studentName: string;
    message: string;
    image: string;
    course: string;
    rating: number;
  };
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <img
          src={testimonial.image}
          alt={testimonial.studentName}
          className="w-12 h-12 rounded-full object-contain bg-gray-100 mr-4"
        />
        <div>
          <h4 className="font-semibold text-gray-900">{testimonial.studentName}</h4>
          <p className="text-sm text-gray-600">{testimonial.course}</p>
        </div>
      </div>

      <div className="flex items-center mb-3">
        {renderStars(testimonial.rating)}
        <span className="ml-2 text-sm text-gray-600">({testimonial.rating}/5)</span>
      </div>

      <blockquote className="text-gray-700 italic">
        "{testimonial.message}"
      </blockquote>
    </div>
  );
}
