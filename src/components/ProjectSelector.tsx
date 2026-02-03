import { useState } from "react";
import { Plus, ChevronDown, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserProject } from "@/hooks/useUserProjects";
import { formatDistanceToNow } from "date-fns";

interface ProjectSelectorProps {
  projects: UserProject[];
  currentProjectId: string | null;
  onSelect: (projectId: string) => void;
  onNew: () => void;
  onDelete: (projectId: string) => void;
}

const ProjectSelector = ({
  projects,
  currentProjectId,
  onSelect,
  onNew,
  onDelete,
}: ProjectSelectorProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const currentProject = projects.find((p) => p.id === currentProjectId);
  
  const getProjectName = (project: UserProject) => {
    if (project.prompt) {
      // Truncate prompt to first 30 chars
      return project.prompt.length > 30 
        ? project.prompt.substring(0, 30) + "..." 
        : project.prompt;
    }
    return `Project ${projects.findIndex((p) => p.id === project.id) + 1}`;
  };

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      onDelete(projectToDelete);
      setProjectToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  if (projects.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-border hover:bg-muted max-w-[200px]"
          >
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {currentProject ? getProjectName(currentProject) : "Select Project"}
            </span>
            <ChevronDown className="w-3 h-3 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px]">
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className={`flex items-center justify-between gap-2 cursor-pointer ${
                project.id === currentProjectId ? "bg-muted" : ""
              }`}
              onClick={() => onSelect(project.id)}
            >
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate font-medium">
                  {getProjectName(project)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={(e) => handleDeleteClick(e, project.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer text-primary"
            onClick={onNew}
          >
            <Plus className="w-4 h-4" />
            New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProjectSelector;
