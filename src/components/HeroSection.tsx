import InputCard from "./InputCard";

interface HeroSectionProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const HeroSection = ({ onSubmit, isLoading }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12">
      {/* Hero content */}
      <div className="text-center mb-12 space-y-6">
        <h1 
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight animate-fade-in-up"
          style={{ animationDelay: '0s', animationFillMode: 'backwards' }}
        >
          Build something{" "}
          <span className="gradient-text">Lovable</span>
        </h1>
        <p 
          className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto animate-fade-in-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
        >
          Create apps and websites by chatting with AI
        </p>
      </div>

      {/* Input card */}
      <div 
        className="w-full animate-fade-in-up" 
        style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
      >
        <InputCard onSubmit={onSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default HeroSection;
