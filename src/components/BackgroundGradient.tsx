const BackgroundGradient = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient layer */}
      <div 
        className="absolute inset-0 animate-gradient-flow"
        style={{
          background: `linear-gradient(
            135deg,
            hsl(212 80% 59% / 0.3) 0%,
            hsl(263 74% 67% / 0.3) 35%,
            hsl(338 82% 60% / 0.3) 65%,
            hsl(212 80% 59% / 0.3) 100%
          )`,
          backgroundSize: '400% 400%',
        }}
      />
      
      {/* Second flowing gradient layer */}
      <div 
        className="absolute inset-0 animate-gradient-flow"
        style={{
          background: `linear-gradient(
            -45deg,
            hsl(338 82% 60% / 0.2) 0%,
            hsl(263 74% 67% / 0.25) 50%,
            hsl(212 80% 59% / 0.2) 100%
          )`,
          backgroundSize: '300% 300%',
          animationDuration: '25s',
          animationDirection: 'reverse',
        }}
      />
      
      {/* Third subtle layer */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse at 30% 20%,
            hsl(212 80% 59% / 0.15) 0%,
            transparent 50%
          ), radial-gradient(
            ellipse at 70% 80%,
            hsl(338 82% 60% / 0.15) 0%,
            transparent 50%
          )`,
        }}
      />

      {/* Floating orb 1 - Blue */}
      <div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] animate-orb-1"
        style={{
          background: 'radial-gradient(circle, hsl(212 80% 59% / 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      
      {/* Floating orb 2 - Purple */}
      <div 
        className="absolute top-1/2 right-1/4 w-[600px] h-[600px] animate-orb-2"
        style={{
          background: 'radial-gradient(circle, hsl(263 74% 67% / 0.35) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      
      {/* Floating orb 3 - Pink */}
      <div 
        className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] animate-orb-3"
        style={{
          background: 'radial-gradient(circle, hsl(338 82% 60% / 0.3) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />

      {/* White overlay for softening */}
      <div className="absolute inset-0 bg-white/60" />
    </div>
  );
};

export default BackgroundGradient;
