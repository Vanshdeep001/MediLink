
import { FeaturesSection } from '@/components/landing/features-section';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { ImpactSection } from '@/components/landing/impact-section';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ImpactSection />
      </main>
      <Footer />
    </div>
  );
}
