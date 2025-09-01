import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative container flex flex-col justify-center min-h-screen text-left py-24 md:py-32">
      <div 
        className="absolute inset-0 bg-grid-pattern opacity-10"
        style={{
          maskImage: 'radial-gradient(circle at center, white 0%, transparent 70%)'
        }}
      ></div>
      
      <div className="relative z-10">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold font-headline tracking-tighter">
          <span className="block text-white">SMART</span>
          <span className="block text-primary">RURAL</span>
          <span className="block text-white">CARE</span>
        </h1>
        
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          Still waiting hours for healthcare? <br/>
          <span className="font-bold text-foreground">No, seriously.</span> Get instant access to doctors, medicines, and emergency services.
        </p>

        <div className="mt-10 flex items-center gap-4">
          <Button size="lg" className="rounded-full shadow-lg text-lg px-8 py-6 bg-primary hover:bg-primary/90">
            <Play className="mr-2 h-5 w-5 fill-current" />
            Get Started Now
          </Button>
          <Button size="lg" variant="outline" className="rounded-full text-lg px-8 py-6 border-2 border-muted-foreground/50 hover:bg-muted/50 hover:border-foreground">
            Watch Demo
          </Button>
        </div>
      </div>

      <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
    </section>
  );
}
