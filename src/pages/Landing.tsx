import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Video, MessageCircle, Shield, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen animate-gradient">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-bold gradient-text">RandomTalk</h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
              About
            </Button>
            <Button variant="ghost" className="text-foreground/80 hover:text-foreground">
              Safety
            </Button>
            {user ? (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/video-chat')}
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                >
                  Chat Now
                </Button>
                <Button variant="ghost" onClick={signOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                Sign In
              </Button>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex flex-col items-center justify-center text-center py-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text animate-fade-in">
            Connect with Strangers
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto animate-fade-in">
            Start random conversations with people around the world. 
            Safe, anonymous, and always exciting.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button 
                  size="lg" 
                  className="px-8 py-4 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => navigate("/camera-setup")}
                >
                  <Video className="mr-2 h-5 w-5" />
                  Start Video Chat
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 py-4 text-lg border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  onClick={() => navigate("/video-chat")}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Text Chat Only
                </Button>
              </>
            ) : (
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Instant Video Chat</h3>
              <p className="text-muted-foreground">Connect face-to-face with people worldwide</p>
            </div>

            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Safe & Secure</h3>
              <p className="text-muted-foreground">Built-in moderation and reporting tools</p>
            </div>

            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Global Community</h3>
              <p className="text-muted-foreground">Meet interesting people from around the globe</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 text-muted-foreground">
          <p>&copy; 2024 RandomTalk. Connect responsibly.</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;