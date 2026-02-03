import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface UserProject {
  id: string;
  html_code: string;
  prompt: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get current project
  const currentProject = projects.find((p) => p.id === currentProjectId) || null;

  // Fetch all user projects
  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setCurrentProjectId(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_projects")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      setProjects(data || []);
      
      // Select the most recently updated project by default
      if (data && data.length > 0 && !currentProjectId) {
        setCurrentProjectId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentProjectId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Create a new project
  const createProject = async (htmlCode: string, prompt?: string): Promise<UserProject | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("user_projects")
        .insert({
          user_id: user.id,
          html_code: htmlCode,
          prompt: prompt || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setProjects((prev) => [data, ...prev]);
      setCurrentProjectId(data.id);
      return data;
    } catch (err) {
      console.error("Error creating project:", err);
      toast.error("Failed to create project");
      throw err;
    }
  };

  // Update an existing project
  const updateProject = async (projectId: string, htmlCode: string, prompt?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_projects")
        .update({
          html_code: htmlCode,
          prompt: prompt || undefined,
        })
        .eq("id", projectId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, html_code: htmlCode, prompt: prompt || p.prompt, updated_at: new Date().toISOString() }
            : p
        )
      );
    } catch (err) {
      console.error("Error updating project:", err);
      toast.error("Failed to save project");
      throw err;
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_projects")
        .delete()
        .eq("id", projectId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      setProjects(updatedProjects);
      
      // If we deleted the current project, select another one
      if (currentProjectId === projectId) {
        setCurrentProjectId(updatedProjects.length > 0 ? updatedProjects[0].id : null);
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project");
      throw err;
    }
  };

  // Select a project
  const selectProject = (projectId: string) => {
    setCurrentProjectId(projectId);
  };

  // Start a new project (doesn't save until generation)
  const startNewProject = () => {
    setCurrentProjectId(null);
  };

  return {
    projects,
    currentProject,
    currentProjectId,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    selectProject,
    startNewProject,
    refetch: fetchProjects,
  };
};
