import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Plus, Paperclip, Palette, MessageSquare, Mic, ArrowRight, Loader2 } from "lucide-react";

interface InputCardProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const InputCard = ({ onSubmit, isLoading }: InputCardProps) => {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className={`
          cream-card rounded-3xl overflow-hidden
          ${isFocused ? 'ring-2 ring-[hsl(var(--gradient-purple)/0.2)]' : ''}
        `}
      >
        {/* Textarea */}
        <div className="p-6 pb-3">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask Lovable to create a project..."
            className="w-full min-h-[96px] max-h-[200px] resize-none bg-transparent text-foreground placeholder:text-muted-foreground text-base leading-relaxed focus:outline-none transition-colors duration-300"
            disabled={isLoading}
            style={{ height: "96px" }}
          />
        </div>

        {/* Toolbar */}
        <div className="px-4 pb-4 flex items-center justify-between">
          {/* Left buttons */}
          <div className="flex items-center gap-1">
            {toolbarButtons.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="input-toolbar-btn"
                aria-label={label}
                type="button"
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-1">
            {rightButtons.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="input-toolbar-btn"
                aria-label={label}
                type="button"
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
            
            {/* Submit button */}
            <button 
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="submit-btn ml-2"
              aria-label="Generate"
              type="button"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="px-6 pb-4 text-center">
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
