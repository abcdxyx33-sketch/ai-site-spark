import { useState } from "react";
import { Sparkles, Upload, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarGeneratorProps {
  currentAvatar: string | null;
  userInitials: string;
  onGenerateAvatar: (prompt: string, style: string) => Promise<string | null>;
  onUploadAvatar: (file: File) => Promise<string | null>;
  isGenerating: boolean;
}

const avatarStyles = [
  { value: "modern", label: "Modern & Clean" },
  { value: "cartoon", label: "Cartoon" },
  { value: "anime", label: "Anime Style" },
  { value: "pixel", label: "Pixel Art" },
  { value: "realistic", label: "Realistic" },
  { value: "abstract", label: "Abstract" },
];

const AvatarGenerator = ({
  currentAvatar,
  userInitials,
  onGenerateAvatar,
  onUploadAvatar,
  isGenerating,
}: AvatarGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [isUploading, setIsUploading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const result = await onGenerateAvatar(prompt, style);
    if (result) {
      setPrompt("");
      setIsOpen(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    const result = await onUploadAvatar(file);
    setIsUploading(false);
    
    if (result) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="relative group">
          <Avatar className="w-20 h-20 cursor-pointer ring-2 ring-border hover:ring-primary transition-all">
            <AvatarImage src={currentAvatar || undefined} alt="Avatar" />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Choose Your Avatar
          </DialogTitle>
          <DialogDescription>
            Generate a unique AI avatar or upload your own image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Current Avatar Preview */}
          <div className="flex justify-center">
            <Avatar className="w-24 h-24 ring-2 ring-border">
              <AvatarImage src={currentAvatar || undefined} alt="Current avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* AI Generation Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Describe your avatar</Label>
              <Input
                id="prompt"
                placeholder="e.g., A friendly robot with blue eyes"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Art Style</Label>
              <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {avatarStyles.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <Label htmlFor="avatar-upload" className="sr-only">
              Upload avatar
            </Label>
            <label
              htmlFor="avatar-upload"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-muted transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Image
                </>
              )}
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading || isGenerating}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Max 5MB, JPG, PNG, or GIF
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarGenerator;
