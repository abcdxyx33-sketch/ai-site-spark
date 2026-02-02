import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Plus, Paperclip, Palette, MessageSquare, Mic, ArrowRight, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface InputCardProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const InputCard = ({ onSubmit, isLoading }: InputCardProps) => {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const toolbarButtons = [
    { icon: Plus, label: "Add" },
    { icon: Paperclip, label: "Attach" },
    { icon: Palette, label: "Theme" },
  ];

  const rightButtons = [
    { icon: MessageSquare, label: "Chat" },
    { icon: Mic, label: "Voice" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      <div 
        className={`
          cream-card rounded-2xl sm:rounded-3xl overflow-hidden
          ${isFocused ? 'ring-2 ring-[hsl(var(--gradient-purple)/0.2)]' : ''}
        `}
      >
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
            disabled={isLoading}
            style={{ height: isMobile ? "80px" : "96px" }}
          />
        </div>

        {/* Toolbar */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex items-center justify-between">
          {/* Left buttons - hide some on mobile */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {toolbarButtons.slice(0, isMobile ? 2 : 3).map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="input-toolbar-btn w-8 h-8 sm:w-9 sm:h-9"
                aria-label={label}
                type="button"
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ))}
          </div>

          {/* Right buttons - hide chat on mobile */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {rightButtons.slice(0, isMobile ? 1 : 2).map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="input-toolbar-btn w-8 h-8 sm:w-9 sm:h-9"
                aria-label={label}
                type="button"
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ))}
            
            {/* Submit button */}
            <button 
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
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
  );
};

export default InputCard;
