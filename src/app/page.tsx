
import { FeaturesSection } from '@/components/landing/features-section';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { ProblemSolutionSection } from '@/components/landing/problem-solution-section';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ProblemSolutionSection />
      </main>
      <Footer />
    </div>
  );
}
