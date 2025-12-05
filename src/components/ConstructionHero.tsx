import { HardHat, Wrench, Cone } from "lucide-react";

const ConstructionHero = () => {
  return (
    <section className="relative py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        {/* Construction Logo */}
        <div className="relative inline-flex items-center justify-center mb-8 animate-slide-up">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full scale-150" />
            
            {/* Main icon container */}
            <div className="relative bg-gradient-to-br from-primary to-coral p-6 md:p-8 rounded-3xl shadow-glow-lg construction-bounce">
              <HardHat className="w-16 h-16 md:w-24 md:h-24 text-primary-foreground" strokeWidth={1.5} />
            </div>
            
            {/* Floating tools */}
            <div className="absolute -left-4 -bottom-2 bg-sunny p-3 rounded-xl shadow-lg wiggle" style={{ animationDelay: '0.2s' }}>
              <Wrench className="w-6 h-6 text-foreground/80" />
            </div>
            <div className="absolute -right-4 -bottom-2 bg-mint p-3 rounded-xl shadow-lg wiggle" style={{ animationDelay: '0.5s' }}>
              <Cone className="w-6 h-6 text-foreground/80" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-slide-up stagger-1">
          <span className="text-gradient">Website Under</span>
          <br />
          <span className="text-foreground">Construction</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up stagger-2">
          We're building something amazing! While you wait, enjoy some classic games below 🎮
        </p>

        {/* Decorative dots */}
        <div className="flex justify-center gap-2 mt-8 animate-slide-up stagger-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/60"
              style={{
                animation: 'float 2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ConstructionHero;
