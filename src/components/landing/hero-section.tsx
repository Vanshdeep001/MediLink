import { Button } from "@/components/ui/button";
import { AnimatedStethoscope } from "./animated-stethoscope";
import { FadeIn } from "@/components/fade-in";

export function HeroSection() {
  return (
    <section className="container grid lg:grid-cols-2 gap-12 items-center py-24 md:py-32">
      <div className="flex flex-col items-start space-y-6">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter">
            Seamless Healthcare,{" "}
            <span className="text-primary">Instantly Connected.</span>
          </h1>
        </FadeIn>
        <FadeIn delay={200}>
          <p className="max-w-xl text-lg text-muted-foreground">
            MediLink bridges the gap between patients, doctors, pharmacies, and
            emergency services. Get smart, AI-powered insights into your
            healthcare network.
          </p>
        </FadeIn>
        <FadeIn delay={400}>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground rounded-full px-8 py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 glow-accent"
          >
            Get Started
          </Button>
        </FadeIn>
      </div>
      <FadeIn delay={600} className="flex items-center justify-center">
        <AnimatedStethoscope />
      </FadeIn>
    </section>
  );
}
