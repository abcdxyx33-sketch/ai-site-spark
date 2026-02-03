import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackgroundGradient from "@/components/BackgroundGradient";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Workspace from "@/components/Workspace";
import ProjectSelector from "@/components/ProjectSelector";
import ErrorNotification from "@/components/ErrorNotification";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProjects } from "@/hooks/useUserProjects";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { 
    projects, 
    currentProject, 
    currentProjectId,
    isLoading: projectLoading, 
    createProject, 
    updateProject,
    deleteProject,
    selectProject,
    startNewProject 
  } = useUserProjects();
  
  const [showSplash, setShowSplash] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

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
        // Create a new project with the generated code
        await createProject(data.html, prompt);
        setIsCreatingNew(false);
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

  const handleNewProject = () => {
    setIsCreatingNew(true);
    startNewProject();
    setError(null);
  };

  const handleCodeChange = async (newCode: string) => {
    if (currentProjectId) {
      try {
        await updateProject(currentProjectId, newCode);
      } catch {
        // Error already handled in hook
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      toast.success("Project deleted!");
    } catch {
      // Error already handled in hook
    }
  };

  const handleSelectProject = (projectId: string) => {
    setIsCreatingNew(false);
    selectProject(projectId);
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

  // Determine what to show: workspace with current project or hero section for new project
  const showWorkspace = currentProject && !isCreatingNew;

  return (
    <div className="relative min-h-screen grain-overlay">
      <BackgroundGradient />
      
      <div className="relative z-10">
        <Navbar>
          {projects.length > 0 && (
            <ProjectSelector
              projects={projects}
              currentProjectId={isCreatingNew ? null : currentProjectId}
              onSelect={handleSelectProject}
              onNew={handleNewProject}
              onDelete={handleDeleteProject}
            />
          )}
        </Navbar>
        
        {error && (
          <ErrorNotification 
            message={error} 
            onDismiss={() => setError(null)} 
          />
        )}

        {showWorkspace ? (
          <Workspace 
            code={currentProject.html_code} 
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
