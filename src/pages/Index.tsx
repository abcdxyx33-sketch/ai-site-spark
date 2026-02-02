import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundGradient from "@/components/BackgroundGradient";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Workspace from "@/components/Workspace";
import ErrorNotification from "@/components/ErrorNotification";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProject } from "@/hooks/useUserProject";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { project, isLoading: projectLoading, saveProject, deleteProject } = useUserProject();
  
  const [showSplash, setShowSplash] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Load project data when available
  useEffect(() => {
    if (project?.html_code) {
      setGeneratedCode(project.html_code);
    }
  }, [project]);

  // Handle splash completion
  const handleSplashComplete = () => {
    setTimeout(() => setShowSplash(false), 300);
  };

  // Generate website with AI
  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
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
        // Save to database
        await saveProject(data.html, prompt);
        toast.success("Website generated successfully!");
      } else {
        throw new Error("No HTML received from AI");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate website. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewProject = async () => {
    try {
      await deleteProject();
      setGeneratedCode(null);
      setError(null);
      toast.success("Started a new project!");
    } catch {
      // Error already handled in hook
    }
  };

  const handleCodeChange = async (newCode: string) => {
    setGeneratedCode(newCode);
    try {
      await saveProject(newCode);
    } catch {
      // Error already handled in hook
    }
  };

  // Show loading while checking auth
  if (authLoading || projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect will happen in useEffect if not logged in
  if (!user) {
    return null;
  }

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
            isLoading={isGenerating} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;
