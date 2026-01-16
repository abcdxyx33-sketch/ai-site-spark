import { Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const menuItems = [
    { label: "Solutions", hasDropdown: true },
    { label: "Enterprise", hasDropdown: false },
    { label: "Pricing", hasDropdown: false },
    { label: "Community", hasDropdown: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 nav-blur">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-xl font-semibold text-foreground">Lovable</span>
          </div>

          {/* Menu Items */}
          <div className="hidden md:flex items-center gap-1">
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
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Log in
            </Button>
            <Button 
              className="bg-foreground text-background hover:bg-foreground/90 text-sm font-medium px-5 rounded-full"
            >
              Get started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
