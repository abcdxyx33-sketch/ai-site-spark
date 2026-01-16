import { Sparkles } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-bg overflow-hidden">
      {/* Animated background layers */}
      <div 
        className="absolute inset-0 animate-gradient-flow"
        style={{
          background: `linear-gradient(
            135deg,
            hsl(212 80% 59%) 0%,
            hsl(263 74% 67%) 50%,
            hsl(338 82% 60%) 100%
          )`,
          backgroundSize: '400% 400%',
        }}
      />
      
      {/* Floating orbs */}
      <div 
        className="absolute top-1/4 left-1/4 w-[300px] h-[300px] animate-orb-1 opacity-30"
        style={{
          background: 'radial-gradient(circle, white 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] animate-orb-2 opacity-20"
        style={{
          background: 'radial-gradient(circle, white 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="animate-float mb-8">
          <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-glow-lg">
            <Sparkles className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title with shimmer */}
        <h1 
          className="text-5xl md:text-6xl font-bold text-white mb-4 animate-shimmer"
          style={{
            backgroundImage: 'linear-gradient(90deg, white 0%, white 40%, rgba(255,255,255,0.5) 50%, white 60%, white 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          AI Builder
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-white/80 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Create stunning websites with AI
        </p>

        {/* Loading bar */}
        <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full animate-loading-bar"
            onAnimationEnd={onComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
