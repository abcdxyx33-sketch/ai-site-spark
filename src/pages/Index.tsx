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
      // Get user's session token for authenticated request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Please sign in to generate websites.");
      }

      // Use fetch with AbortController for longer timeout (60s)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-website`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.html) {
        if (currentProjectId && !isCreatingNew) {
          // Regenerating UI for existing project — update it
          await updateProject(currentProjectId, data.html, prompt);
          toast.success("New design generated!");
        } else {
          // Creating a brand new project
          await createProject(data.html, prompt);
          setIsCreatingNew(false);
          toast.success("Website generated successfully!");
        }
      } else {
        throw new Error("No HTML received from AI");
      }
    } catch (err) {
      let message = "Failed to generate website. Please try again.";
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          message = "Generation is taking longer than expected. Please try with a simpler prompt.";
        } else {
          message = err.message;
        }
      }
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
            prompt={currentProject.prompt}
            onCodeChange={handleCodeChange}
            onNewProject={handleNewProject}
            onRegenerateUI={handleGenerate}
            isRegenerating={isGenerating}
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
