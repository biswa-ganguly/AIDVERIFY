import { Heart, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t bg-gradient-to-b from-background to-muted/20">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6">
        <div className="py-8 md:py-12">
          
          {/* Main content */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            
            {/* Brand */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                AidVerifyAI
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                AI-powered verification for transparent, trustworthy charitable giving.
              </p>
            </div>
            
            {/* Navigation */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                How It Works
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Browse Campaigns
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Help Center
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
            
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} AidVerifyAI. Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>for positive impact.</span>
            </div>
            
            {/* Right side: Social + Legal */}
            <div className="flex items-center gap-6">
              
              {/* Legal links */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
              </div>
              
              {/* Social links */}
              <div className="flex items-center gap-2">
                <a href="#" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                  <Twitter className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                  <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
                <a href="#" className="p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                  <Github className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}