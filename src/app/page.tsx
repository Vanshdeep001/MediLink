import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { HeroSection } from '@/components/landing/hero-section';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
