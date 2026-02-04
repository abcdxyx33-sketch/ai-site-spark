import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }
      
      setProfile(data || null);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const generateAvatar = async (prompt: string, style: string = "modern"): Promise<string | null> => {
    if (!user) return null;

    setIsGeneratingAvatar(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-avatar", {
        body: { prompt, style },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast.error("Too many requests. Please wait a moment.");
        } else if (error.message?.includes("402")) {
          toast.error("Service limit reached. Please try again later.");
        } else {
          toast.error(error.message || "Failed to generate avatar");
        }
        return null;
      }

      if (data?.avatarUrl) {
        setProfile(prev => prev 
          ? { ...prev, avatar_url: data.avatarUrl }
          : {
              id: "",
              user_id: user.id,
              avatar_url: data.avatarUrl,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
        );
        toast.success("Avatar generated successfully!");
        return data.avatarUrl;
      }

      return null;
    } catch (err) {
      console.error("Error generating avatar:", err);
      toast.error("Failed to generate avatar");
      return null;
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        toast.error("Failed to upload avatar");
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = publicUrlData.publicUrl;

      // Update profile
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (upsertError) {
        console.error("Error updating profile:", upsertError);
      }

      setProfile(prev => prev 
        ? { ...prev, avatar_url: avatarUrl }
        : {
            id: "",
            user_id: user.id,
            avatar_url: avatarUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
      );

      toast.success("Avatar uploaded successfully!");
      return avatarUrl;
    } catch (err) {
      console.error("Error uploading avatar:", err);
      toast.error("Failed to upload avatar");
      return null;
    }
  };

  const getAvatarUrl = (): string | null => {
    // Priority: profile avatar > Google avatar > null
    if (profile?.avatar_url) return profile.avatar_url;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    return null;
  };

  return {
    profile,
    isLoading,
    isGeneratingAvatar,
    generateAvatar,
    uploadAvatar,
    getAvatarUrl,
    refetch: fetchProfile,
  };
};
