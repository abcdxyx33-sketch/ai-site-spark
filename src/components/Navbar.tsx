import { useState } from "react";
import { Sparkles, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuItems = [
    { label: "Solutions", hasDropdown: true },
    { label: "Enterprise", hasDropdown: false },
    { label: "Pricing", hasDropdown: false },
    { label: "Community", hasDropdown: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 nav-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-bg flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-foreground">Webbuilder</span>
          </div>

          {/* Desktop Menu Items */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth flex items-center gap-1 rounded-lg hover:bg-muted/50"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Button 
                variant="ghost" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Log in
              </Button>
              <Button 
                className="bg-foreground text-background hover:bg-foreground/90 text-sm font-medium px-4 sm:px-5 rounded-full"
              >
                Get started
              </Button>
            </div>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-9 h-9"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border/30 pt-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth flex items-center justify-between rounded-lg hover:bg-muted/50 w-full text-left"
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </button>
              ))}
              
              {/* Mobile auth buttons */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/30 sm:hidden">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Log in
                </Button>
                <Button 
                  className="w-full bg-foreground text-background hover:bg-foreground/90 text-sm font-medium rounded-full"
                >
                  Get started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
