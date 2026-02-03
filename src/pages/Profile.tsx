import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Calendar, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BackgroundGradient from "@/components/BackgroundGradient";
import { useAuth } from "@/hooks/useAuth";
import { useUserProjects, UserProject } from "@/hooks/useUserProjects";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { projects, isLoading: projectsLoading, deleteProject, selectProject } = useUserProjects();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      toast.success("Project deleted!");
    } catch {
      // Error handled in hook
    }
  };

  const handleOpenProject = (projectId: string) => {
    selectProject(projectId);
    navigate("/");
  };

  const getProjectName = (project: UserProject, index: number) => {
    if (project.prompt) {
      return project.prompt.length > 50 
        ? project.prompt.substring(0, 50) + "..." 
        : project.prompt;
    }
    return `Project ${index + 1}`;
  };

  if (authLoading || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitials = user.email?.charAt(0).toUpperCase() || "U";
  const userAvatar = user.user_metadata?.avatar_url;
  const createdAt = user.created_at ? new Date(user.created_at) : null;

  return (
    <div className="relative min-h-screen grain-overlay">
      <BackgroundGradient />
      
      <div className="relative z-10 pt-8 pb-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Button>

          {/* Profile Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={userAvatar} alt={user.email || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{user.user_metadata?.full_name || "User"}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </CardDescription>
                  {createdAt && (
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      Joined {format(createdAt, "MMMM yyyy")}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Projects Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>
                {projects.length === 0 
                  ? "You haven't created any projects yet." 
                  : `You have ${projects.length} project${projects.length === 1 ? "" : "s"}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Create your first website to see it here!</p>
                  <Button onClick={() => navigate("/")}>
                    Create a Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <h4 className="font-medium truncate">
                          {getProjectName(project, index)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenProject(project.id)}
                          className="gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this project? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteProject(project.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
