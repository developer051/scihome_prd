'use client';

import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaLine } from 'react-icons/fa';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      title: 'ที่อยู่',
      details: [
        '123 ถนนการศึกษา',
        'เขตการเรียนรู้',
        'กรุงเทพฯ 10110'
      ],
    },
    {
      icon: FaPhone,
      title: 'เบอร์โทรศัพท์',
      details: [
        '02-123-4567',
        '081-234-5678'
      ],
    },
    {
      icon: FaEnvelope,
      title: 'อีเมล',
      details: [
        'info@scihome.com',
        'support@scihome.com'
      ],
    },
    {
      icon: FaClock,
      title: 'เวลาทำการ',
      details: [
        'จันทร์ - ศุกร์: 08:00 - 20:00',
        'เสาร์ - อาทิตย์: 09:00 - 18:00'
      ],
    },
  ];

  const socialMedia = [
    {
      icon: FaFacebook,
      name: 'Facebook',
      url: '#',
      color: 'text-blue-600',
    },
    {
      icon: FaLine,
      name: 'LINE',
      url: '#',
      color: 'text-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Clean & Simple */}
      <section className="relative bg-gradient-to-br from-white via-blue-50/30 to-white border-b border-gray-200 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in-up">
              ติดต่อเรา
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
              เราพร้อมให้คำปรึกษาและตอบคำถามทุกข้อสงสัย
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">ข้อมูลติดต่อ</h2>
              
              <div className="space-y-8 mb-8">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                        <Icon className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {info.title}
                        </h3>
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-gray-600 text-sm leading-relaxed">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ติดตามเรา</h3>
                <div className="flex space-x-4">
                  {socialMedia.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.url}
                        className={`${social.color} hover:opacity-80 transition-opacity`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon size={32} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">ส่งข้อความถึงเรา</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">แผนที่</h2>
            <p className="text-gray-600">
              ตำแหน่งที่ตั้งของสถาบัน
            </p>
          </div>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <FaMapMarkerAlt className="text-gray-400 text-6xl mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Google Maps จะแสดงที่นี่</p>
              <p className="text-gray-500 text-sm">
                (ต้องเพิ่ม Google Maps API Key เพื่อแสดงแผนที่จริง)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
