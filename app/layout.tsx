import type { Metadata } from 'next';
import { Prompt } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactFloatingButton from '@/components/ContactFloatingButton';
import ContactStickySidebar from '@/components/ContactStickySidebar';

const prompt = Prompt({ 
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'สถาบันกวดวิชา ScienceHome',
  description: 'สถาบันกวดวิชาที่มุ่งมั่นในการพัฒนาการศึกษาและสร้างอนาคตที่ดีให้กับนักเรียนทุกคน',
  icons: {
    icon: '/scihome.png',
    shortcut: '/scihome.png',
    apple: '/scihome.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={prompt.className}>
        {/* Background logo layer - ครอบคลุมทั้งหน้า ตำแหน่งล่างขวา */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute bottom-0 right-0 w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px]"
            style={{
              backgroundImage: 'url(/scihome.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'bottom right',
              opacity: 0.2,
            }}
          />
        </div>
        
        <div className="relative z-10">
          <Navbar />
          <main>{children}</main>
          <Footer />
          <ContactFloatingButton />
        </div>
        <ContactStickySidebar />
      </body>
    </html>
  );
}