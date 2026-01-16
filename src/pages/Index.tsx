import { useState } from "react";
import BackgroundGradient from "@/components/BackgroundGradient";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Workspace from "@/components/Workspace";
import ErrorNotification from "@/components/ErrorNotification";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle splash completion
  const handleSplashComplete = () => {
    setTimeout(() => setShowSplash(false), 300);
  };

  // Generate website with AI
  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-website', {
        body: { prompt },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.html) {
        setGeneratedCode(data.html);
        toast.success("Website generated successfully!");
      } else {
        throw new Error("No HTML received from AI");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate website. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProject = () => {
    setGeneratedCode(null);
    setError(null);
  };

  const handleCodeChange = (newCode: string) => {
    setGeneratedCode(newCode);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="relative min-h-screen grain-overlay">
      <BackgroundGradient />
      
      <div className="relative z-10">
        <Navbar />
        
        {error && (
          <ErrorNotification 
            message={error} 
            onDismiss={() => setError(null)} 
          />
        )}

        {generatedCode ? (
          <Workspace 
            code={generatedCode} 
            onCodeChange={handleCodeChange}
            onNewProject={handleNewProject}
          />
        ) : (
          <HeroSection 
            onSubmit={handleGenerate} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;
