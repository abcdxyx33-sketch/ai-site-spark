import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Plus, Paperclip, Mic, ArrowRight, Loader2, Image, FileText, Link2, X, Wand2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import FileUploadDialog from "./FileUploadDialog";
import VoiceAssistant from "./VoiceAssistant";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InputCardProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

interface Reference {
  type: "image" | "pdf" | "url";
  content: string;
  usage: "inspiration" | "include";
}

const InputCard = ({ onSubmit, isLoading }: InputCardProps) => {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [references, setReferences] = useState<Reference[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading && !isEnhancing) {
      let fullPrompt = prompt.trim();
      
      references.forEach((ref) => {
        if (ref.type === "image") {
          if (ref.usage === "inspiration") {
            fullPrompt += `\n\n[Reference Image for Design Inspiration - use similar style, colors, and layout]`;
          } else {
            fullPrompt += `\n\n[Include this image in the website: ${ref.content}]`;
          }
        } else if (ref.type === "pdf") {
          fullPrompt += `\n\n[PDF Reference for Design: ${ref.content}]`;
        } else if (ref.type === "url") {
          fullPrompt += `\n\n[Reference Website for Inspiration: ${ref.content}]`;
        }
      });
      
      onSubmit(fullPrompt);
      setReferences([]);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing || isLoading) return;

    setIsEnhancing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Please sign in to enhance prompts.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("enhance-prompt", {
        body: { prompt: prompt.trim() },
      });

      if (error) throw error;

      if (data?.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        toast.success("Prompt enhanced! Review and generate when ready.");
      } else {
        throw new Error("No enhanced prompt received");
      }
    } catch (err) {
      console.error("Enhance prompt error:", err);
      toast.error("Failed to enhance prompt. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleFileProcessed = (data: Reference) => {
    setReferences((prev) => [...prev, data]);
  };

  const handleRemoveReference = (index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoiceGenerate = (voicePrompt: string) => {
    setShowVoiceAssistant(false);
    onSubmit(voicePrompt);
  };

  const getReferenceIcon = (type: string) => {
    switch (type) {
      case "image":
        return Image;
      case "pdf":
        return FileText;
      case "url":
        return Link2;
      default:
        return Paperclip;
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
        <div 
          className={`
            cream-card rounded-2xl sm:rounded-3xl overflow-hidden
            ${isFocused ? 'ring-2 ring-[hsl(var(--gradient-purple)/0.2)]' : ''}
          `}
        >
          {/* References Preview */}
          {references.length > 0 && (
            <div className="px-4 sm:px-6 pt-4 flex flex-wrap gap-2">
              {references.map((ref, index) => {
                const Icon = getReferenceIcon(ref.type);
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-muted/80"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs max-w-[100px] truncate">
                      {ref.type === "url"
                        ? new URL(ref.content).hostname
                        : ref.type === "image"
                        ? `Image (${ref.usage})`
                        : ref.content}
                    </span>
                    <button
                      onClick={() => handleRemoveReference(index)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Textarea */}
          <div className="p-4 sm:p-6 pb-2 sm:pb-3">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask Lovable to create a project..."
              className="w-full min-h-[80px] sm:min-h-[96px] max-h-[200px] resize-none bg-transparent text-foreground placeholder:text-muted-foreground text-sm sm:text-base leading-relaxed focus:outline-none transition-colors duration-300"
              disabled={isLoading || isEnhancing}
              style={{ height: isMobile ? "80px" : "96px" }}
            />
          </div>

          {/* Toolbar */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex items-center justify-between">
            {/* Left buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={() => setShowFileDialog(true)}
                className="input-toolbar-btn w-8 h-8 sm:w-9 sm:h-9"
                aria-label="Add files"
                type="button"
                title="Add image, PDF, or URL reference"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => setShowFileDialog(true)}
                className="input-toolbar-btn w-8 h-8 sm:w-9 sm:h-9"
                aria-label="Attach file"
                type="button"
                title="Upload reference file"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Right buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Enhance Prompt Button */}
              <button
                onClick={handleEnhancePrompt}
                disabled={!prompt.trim() || isEnhancing || isLoading}
                className="input-toolbar-btn w-8 h-8 sm:w-9 sm:h-9 disabled:opacity-40 disabled:cursor-not-allowed group relative"
                aria-label="Enhance prompt"
                type="button"
                title="Enhance prompt with AI"
              >
                {isEnhancing ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12" />
                )}
              </button>

              <button
                onClick={() => setShowVoiceAssistant(true)}
                className="input-toolbar-btn w-8 h-8 sm:w-9 sm:h-9"
                aria-label="Voice assistant"
                type="button"
                title="Talk to AI assistant"
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              {/* Submit button */}
              <button 
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading || isEnhancing}
                className="submit-btn w-9 h-9 sm:w-10 sm:h-10 ml-1 sm:ml-2"
                aria-label="Generate"
                type="button"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Keyboard hint - hide on mobile */}
          <div className="hidden sm:block px-6 pb-4 text-center">
            <span className="text-xs text-muted-foreground opacity-70 transition-opacity duration-300 hover:opacity-100">
              Press{" "}
              <kbd className="px-1.5 py-0.5 bg-[hsl(var(--cream-dark))] rounded text-xs font-mono border border-[hsl(var(--border))]">
                ⌘
              </kbd>
              {" + "}
              <kbd className="px-1.5 py-0.5 bg-[hsl(var(--cream-dark))] rounded text-xs font-mono border border-[hsl(var(--border))]">
                Enter
              </kbd>
              {" "}to generate
            </span>
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      {showFileDialog && (
        <FileUploadDialog
          onClose={() => setShowFileDialog(false)}
          onFileProcessed={handleFileProcessed}
        />
      )}
      
      {showVoiceAssistant && (
        <VoiceAssistant
          onReadyToGenerate={handleVoiceGenerate}
          onClose={() => setShowVoiceAssistant(false)}
        />
      )}
    </>
  );
};

export default InputCard;
