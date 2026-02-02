import InputCard from "./InputCard";

interface HeroSectionProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const HeroSection = ({ onSubmit, isLoading }: HeroSectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12">
      {/* Hero content */}
      <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6">
        <h1 
          className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight animate-fade-in-up leading-tight"
          style={{ animationDelay: '0s', animationFillMode: 'backwards' }}
        >
          Builds Something{" "}
          <span className="gradient-text">Creative</span>
        </h1>
        <p 
          className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-md sm:max-w-xl mx-auto animate-fade-in-up px-2"
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
