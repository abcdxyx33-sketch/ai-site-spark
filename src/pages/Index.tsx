import { useState, useEffect } from "react";
import BackgroundGradient from "@/components/BackgroundGradient";
import SplashScreen from "@/components/SplashScreen";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Workspace from "@/components/Workspace";
import ErrorNotification from "@/components/ErrorNotification";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle splash completion
  const handleSplashComplete = () => {
    setTimeout(() => setShowSplash(false), 300);
  };

  // Generate website with AI
  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mock generation for now - will connect to AI later
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Website</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 24px;
      padding: 60px;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    h1 {
      font-size: 2.5rem;
      color: #1a1a2e;
      margin-bottom: 16px;
      font-weight: 700;
    }
    p {
      font-size: 1.125rem;
      color: #64748b;
      line-height: 1.7;
      margin-bottom: 32px;
    }
    .button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(102, 126, 234, 0.5);
    }
    .prompt-label {
      font-size: 0.875rem;
      color: #94a3b8;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✨ Your Website is Ready!</h1>
    <p>This website was generated based on your prompt. You can edit the code on the left panel and see live changes here.</p>
    <button class="button" onclick="alert('Hello from your AI-generated website!')">Click Me!</button>
    <p class="prompt-label">Prompt: "${prompt}"</p>
  </div>
</body>
</html>`;

      setGeneratedCode(mockHtml);
    } catch (err) {
      setError("Failed to generate website. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewProject = () => {
    setGeneratedCode(null);
    setError(null);
  };

  const handleCodeChange = (newCode: string) => {
    setGeneratedCode(newCode);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="relative min-h-screen grain-overlay">
      <BackgroundGradient />
      
      <div className="relative z-10">
        <Navbar />
        
        {error && (
          <ErrorNotification 
            message={error} 
            onDismiss={() => setError(null)} 
          />
        )}

        {generatedCode ? (
          <Workspace 
            code={generatedCode} 
            onCodeChange={handleCodeChange}
            onNewProject={handleNewProject}
          />
        ) : (
          <HeroSection 
            onSubmit={handleGenerate} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;
