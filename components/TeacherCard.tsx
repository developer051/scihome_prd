import { FaGraduationCap, FaAward, FaChalkboardTeacher } from 'react-icons/fa';

interface TeacherCardProps {
  teacher: {
    _id: string;
    name: string;
    image: string;
    education: string;
    expertise: string[];
    experience: number;
    achievements: string[];
    bio: string;
    subjects: string[];
  };
}

export default function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md shadow-blue-500/50 overflow-hidden hover:shadow-xl hover:shadow-blue-500/70 transition-all duration-300 border border-blue-200/50 group">
      <div className="relative overflow-hidden">
        <img
          src={teacher.image}
          alt={teacher.name}
          className="w-full h-64 object-contain bg-gray-100 transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">{teacher.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{teacher.education}</p>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <FaChalkboardTeacher className="mr-2 text-blue-500" />
            <span>ประสบการณ์ {teacher.experience} ปี</span>
          </div>
          
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">วิชาที่สอน:</h4>
            <div className="flex flex-wrap gap-1">
              {teacher.subjects.map((subject, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">ความเชี่ยวชาญ:</h4>
            <div className="flex flex-wrap gap-1">
              {teacher.expertise.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {teacher.expertise.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{teacher.expertise.length - 3} อื่นๆ
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {teacher.bio}
        </p>

        {teacher.achievements.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <FaAward className="mr-2 text-yellow-500" />
              <span className="font-medium">ผลงานเด่น</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              {teacher.achievements.slice(0, 2).map((achievement, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-1">•</span>
                  <span className="line-clamp-2">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
