import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "dark" || (!stored && prefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-full flex items-center justify-center overflow-hidden group transition-all duration-500 ease-out hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icons container */}
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun 
          className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-500 ease-out ${
            isDark 
              ? "opacity-0 rotate-90 scale-0" 
              : "opacity-100 rotate-0 scale-100"
          }`}
          strokeWidth={2}
        />
        
        {/* Moon icon */}
        <Moon 
          className={`absolute inset-0 w-5 h-5 text-indigo-400 transition-all duration-500 ease-out ${
            isDark 
              ? "opacity-100 rotate-0 scale-100" 
              : "opacity-0 -rotate-90 scale-0"
          }`}
          strokeWidth={2}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
