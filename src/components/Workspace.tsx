import { useState, useEffect } from "react";
import { Copy, Download, Edit3, Save, Plus, Check, Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkspaceProps {
  code: string;
  onCodeChange: (code: string) => void;
  onNewProject: () => void;
}

const Workspace = ({ code, onCodeChange, onNewProject }: WorkspaceProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('preview');
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
    <div className="min-h-screen pt-16 sm:pt-24 pb-8 sm:pb-12 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Action bar */}
        <div 
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 animate-slide-up"
          style={{ animationDelay: '0s' }}
        >
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              onClick={onNewProject}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="gap-2 rounded-full border-border hover:bg-muted"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">New Project</span>
              <span className="xs:hidden">New</span>
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {characterCount} chars
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
            {/* Mobile tab switcher */}
            {isMobile && (
              <div className="flex items-center gap-1 mr-2 bg-muted rounded-full p-1">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTab === 'code' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTab === 'preview' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="icon"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-muted"
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
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full hover:bg-muted"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              className="gap-1.5 sm:gap-2 rounded-full hover:bg-muted"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden xs:inline">Save</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden xs:inline">Edit</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Panels */}
        <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
          {/* Code Panel - Hide on mobile when preview is active */}
          <div 
            className={`rounded-xl sm:rounded-2xl overflow-hidden shadow-card animate-slide-up bg-[hsl(222_47%_11%)] ${
              isMobile && activeTab !== 'code' ? 'hidden' : ''
            }`}
            style={{ animationDelay: '0.1s' }}
          >
            {/* Header */}
            <div 
              className="px-4 sm:px-6 py-3 sm:py-4"
              style={{
                background: 'linear-gradient(135deg, hsl(212 80% 59%) 0%, hsl(263 74% 67%) 100%)',
              }}
            >
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/30" />
                </div>
                <span className="ml-1 sm:ml-2">Code</span>
              </h3>
            </div>

            {/* Code editor */}
            <div className="p-3 sm:p-4 h-[350px] sm:h-[500px] overflow-auto">
              {isEditing ? (
                <textarea
                  value={editedCode}
                  onChange={(e) => setEditedCode(e.target.value)}
                  className="w-full h-full bg-transparent text-[hsl(210_40%_85%)] code-editor resize-none focus:outline-none text-xs sm:text-sm"
                  spellCheck={false}
                />
              ) : (
                <pre className="text-[hsl(210_40%_85%)] code-editor whitespace-pre-wrap break-words text-xs sm:text-sm">
                  {code}
                </pre>
              )}
            </div>
          </div>

          {/* Preview Panel - Hide on mobile when code is active */}
          <div 
            className={`rounded-xl sm:rounded-2xl overflow-hidden shadow-card animate-slide-up bg-white ${
              isMobile && activeTab !== 'preview' ? 'hidden' : ''
            }`}
            style={{ animationDelay: '0.2s' }}
          >
            {/* Header */}
            <div 
              className="px-4 sm:px-6 py-3 sm:py-4"
              style={{
                background: 'linear-gradient(135deg, hsl(263 74% 67%) 0%, hsl(338 82% 60%) 100%)',
              }}
            >
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/30" />
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/30" />
                </div>
                <span className="ml-1 sm:ml-2">Preview</span>
              </h3>
            </div>

            {/* Preview iframe */}
            <div className="h-[350px] sm:h-[500px] bg-white">
              <iframe
                srcDoc={code}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
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
