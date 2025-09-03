import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
