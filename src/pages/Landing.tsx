import { useState } from "react";
import { Link } from "react-router-dom";
import { Video, Users, Shield, Zap, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-bg.jpg";

const Landing = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen animate-gradient">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 relative z-10">
        <div className="flex items-center space-x-2">
          <Video className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold gradient-text">RandomTalk</span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDarkMode}
          className="p-2"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-20 relative">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            Connect. Chat. Discover.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Meet new people instantly through secure video chats. 
            Safe, anonymous, and always exciting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/camera-setup">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6 animate-glow">
                <Video className="mr-2 h-6 w-6" />
                Start Video Chat
              </Button>
            </Link>
            
            <Link to="/text-chat">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-6">
                <Users className="mr-2 h-6 w-6" />
                Text Chat Only
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Connections</h3>
              <p className="text-muted-foreground">Connect with people worldwide in seconds</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Safe & Secure</h3>
              <p className="text-muted-foreground">Your privacy and safety are our top priority</p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Global Community</h3>
              <p className="text-muted-foreground">Meet interesting people from around the globe</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-muted-foreground relative z-10">
        <p>&copy; 2024 RandomTalk. Connect responsibly.</p>
      </footer>
    </div>
  );
};

export default Landing;