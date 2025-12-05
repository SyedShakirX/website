const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, hsl(30 100% 96%) 0%, hsl(25 100% 92%) 30%, hsl(280 70% 95%) 70%, hsl(165 60% 92%) 100%)'
        }}
      />
      
      {/* Animated floating orbs */}
      <div 
        className="floating-orb w-96 h-96 animate-float"
        style={{
          background: 'radial-gradient(circle, hsl(15 90% 75% / 0.5) 0%, transparent 70%)',
          top: '10%',
          left: '5%',
        }}
      />
      <div 
        className="floating-orb w-80 h-80 animate-float-delayed"
        style={{
          background: 'radial-gradient(circle, hsl(165 60% 70% / 0.4) 0%, transparent 70%)',
          top: '50%',
          right: '10%',
        }}
      />
      <div 
        className="floating-orb w-72 h-72 animate-float-slow"
        style={{
          background: 'radial-gradient(circle, hsl(280 70% 80% / 0.4) 0%, transparent 70%)',
          bottom: '10%',
          left: '30%',
        }}
      />
      <div 
        className="floating-orb w-64 h-64 animate-float"
        style={{
          background: 'radial-gradient(circle, hsl(45 100% 75% / 0.4) 0%, transparent 70%)',
          top: '30%',
          left: '60%',
          animationDelay: '-2s',
        }}
      />
      <div 
        className="floating-orb w-48 h-48 animate-float-delayed"
        style={{
          background: 'radial-gradient(circle, hsl(200 80% 75% / 0.3) 0%, transparent 70%)',
          bottom: '30%',
          right: '25%',
        }}
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
