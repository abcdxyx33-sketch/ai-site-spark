import { useState, KeyboardEvent } from "react";
import { Plus, Paperclip, Palette, MessageSquare, Mic, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InputCardProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const InputCard = ({ onSubmit, isLoading }: InputCardProps) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto animate-float-slow"
      style={{ animationDuration: '8s' }}
    >
      <div 
        className="cream-card rounded-3xl shadow-card hover:shadow-card-hover transition-all duration-500 overflow-hidden"
      >
        {/* Textarea */}
        <div className="p-6 pb-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lovable to create a project..."
            className="w-full h-24 resize-none bg-transparent text-foreground placeholder:text-muted-foreground text-base leading-relaxed focus:outline-none"
            disabled={isLoading}
          />
        </div>

        {/* Toolbar */}
        <div className="px-4 pb-4 flex items-center justify-between">
          {/* Left buttons */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-cream-dark"
            >
              <Plus className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-cream-dark"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-cream-dark"
            >
              <Palette className="w-5 h-5" />
            </Button>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-cream-dark"
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-cream-dark"
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="px-6 pb-4 text-center">
          <span className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-cream-dark rounded text-xs font-mono">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-cream-dark rounded text-xs font-mono">Enter</kbd> to generate
          </span>
        </div>
      </div>
    </div>
  );
};

export default InputCard;
