'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface StudentAchievement {
  _id: string;
  image: string;
  title: string;
  description: string;
  studentName?: string;
}

interface StudentAchievementCarouselProps {
  achievements: StudentAchievement[];
}

export default function StudentAchievementCarousel({ achievements }: StudentAchievementCarouselProps) {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <div className="relative pt-8 pb-16 bg-gradient-to-b from-white via-gray-50/30 to-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-right">
            เด็กเก่งบ้านนักวิทย์
          </h2>
          <p className="text-gray-600 text-right">
            ผลงานและความสำเร็จของนักเรียนที่เรียนกับเรา
          </p>
        </div>

        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={10}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={achievements.length > 3}
            className="pb-12"
          >
            {achievements.map((achievement) => (
              <SwiperSlide key={achievement._id}>
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                  <div className="relative w-full h-64 bg-gray-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={achievement.image}
                      alt={achievement.title}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {achievement.title}
                    </h3>
                    {achievement.studentName && (
                      <p className="text-sm text-blue-600 font-medium mb-2">
                        {achievement.studentName}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button
            className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors -translate-x-4 md:-translate-x-6"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="text-gray-700 text-lg" />
          </button>
          <button
            className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors translate-x-4 md:translate-x-6"
            aria-label="Next slide"
          >
            <FaChevronRight className="text-gray-700 text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}

