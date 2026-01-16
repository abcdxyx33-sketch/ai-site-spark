import { useState, useEffect } from "react";
import { Copy, Download, Edit3, Save, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WorkspaceProps {
  code: string;
  onCodeChange: (code: string) => void;
  onNewProject: () => void;
}

const Workspace = ({ code, onCodeChange, onNewProject }: WorkspaceProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setEditedCode(code);
  }, [code]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ description: "Code copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    a.click();
    URL.revokeObjectURL(url);
    toast({ description: "File downloaded!" });
  };

  const handleSave = () => {
    onCodeChange(editedCode);
    setIsEditing(false);
    toast({ description: "Changes saved!" });
  };

  const characterCount = code.length.toLocaleString();

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Action bar */}
        <div 
          className="flex flex-wrap items-center justify-between gap-4 mb-6 animate-slide-up"
          style={{ animationDelay: '0s' }}
        >
          <div className="flex items-center gap-4">
            <Button
              onClick={onNewProject}
              variant="outline"
              className="gap-2 rounded-full border-border hover:bg-muted"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Button>
            <span className="text-sm text-muted-foreground">
              {characterCount} characters
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-full hover:bg-muted"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-full hover:bg-muted"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              variant="ghost"
              className="gap-2 rounded-full hover:bg-muted"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Panels */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Code Panel */}
          <div 
            className="rounded-2xl overflow-hidden shadow-card animate-slide-up bg-[hsl(222_47%_11%)]"
            style={{ animationDelay: '0.1s' }}
          >
            {/* Header */}
            <div 
              className="px-6 py-4"
              style={{
                background: 'linear-gradient(135deg, hsl(212 80% 59%) 0%, hsl(263 74% 67%) 100%)',
              }}
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                </div>
                <span className="ml-2">Code</span>
              </h3>
            </div>

            {/* Code editor */}
            <div className="p-4 h-[500px] overflow-auto">
              {isEditing ? (
                <textarea
                  value={editedCode}
                  onChange={(e) => setEditedCode(e.target.value)}
                  className="w-full h-full bg-transparent text-[hsl(210_40%_85%)] code-editor resize-none focus:outline-none"
                  spellCheck={false}
                />
              ) : (
                <pre className="text-[hsl(210_40%_85%)] code-editor whitespace-pre-wrap break-words">
                  {code}
                </pre>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div 
            className="rounded-2xl overflow-hidden shadow-card animate-slide-up bg-white"
            style={{ animationDelay: '0.2s' }}
          >
            {/* Header */}
            <div 
              className="px-6 py-4"
              style={{
                background: 'linear-gradient(135deg, hsl(263 74% 67%) 0%, hsl(338 82% 60%) 100%)',
              }}
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                </div>
                <span className="ml-2">Preview</span>
              </h3>
            </div>

            {/* Preview iframe */}
            <div className="h-[500px] bg-white">
              <iframe
                srcDoc={code}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
