import { Button } from "@/components/ui/button";

const Starfield = () => (
  <div className="starfield" aria-hidden="true">
    {Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="stars stars-sm"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 150}s`,
        }}
      />
    ))}
    {Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="stars stars-md"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 100}s`,
        }}
      />
    ))}
     {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="stars stars-lg"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 50}s`,
        }}
      />
    ))}
  </div>
);

export function HeroSection() {
  return (
    <section className="relative container flex flex-col items-center justify-center min-h-screen text-center py-24 md:py-32">
      <Starfield />
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <h1
          className="text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-primary-foreground opacity-0 fade-in glow-effect"
          style={{ fontFamily: "'Orbitron', sans-serif" }}
        >
          MediLink
        </h1>
        
        <div className="text-xl md:text-2xl lg:text-3xl space-y-2 text-foreground/80">
          <p className="opacity-0 slide-in-1">
            Seamless Healthcare.
          </p>
          <p className="font-semibold text-foreground opacity-0 slide-in-2">
            Instantly Connected.
          </p>
          <p className="italic opacity-0 slide-in-3">
            AI-powered. For You.
          </p>
        </div>

        <div className="opacity-0 fade-in-btn">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground rounded-full px-8 py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 btn-glow"
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}
