import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface UserProject {
  id: string;
  html_code: string;
  prompt: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProject = () => {
  const { user } = useAuth();
  const [project, setProject] = useState<UserProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the user's project
  const fetchProject = useCallback(async () => {
    if (!user) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_projects")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProject(data);
    } catch (err) {
      console.error("Error fetching project:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Save or update the project
  const saveProject = async (htmlCode: string, prompt?: string) => {
    if (!user) return;

    try {
      if (project) {
        // Update existing project
        const { error } = await supabase
          .from("user_projects")
          .update({
            html_code: htmlCode,
            prompt: prompt || project.prompt,
          })
          .eq("user_id", user.id);

        if (error) throw error;
        setProject((prev) => prev ? { ...prev, html_code: htmlCode, prompt: prompt || prev.prompt } : null);
      } else {
        // Create new project
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
        setProject(data);
      }
    } catch (err) {
      console.error("Error saving project:", err);
      toast.error("Failed to save project");
      throw err;
    }
  };

  // Delete the project (start fresh)
  const deleteProject = async () => {
    if (!user || !project) return;

    try {
      const { error } = await supabase
        .from("user_projects")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      setProject(null);
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Failed to delete project");
      throw err;
    }
  };

  return {
    project,
    isLoading,
    saveProject,
    deleteProject,
    refetch: fetchProject,
  };
};
