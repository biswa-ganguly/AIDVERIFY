import { Badge } from '@/components/ui/badge';

export default function Hero() {
  return (
    <section className="hero-section text-center py-20 md:py-28  from-muted/20 to-transparent">
      <div className="container max-w-screen-2xl"> 
        <Badge variant="outline" className="hero-badge mb-4 border-primary/50 text-primary">
          AI-Powered Verification
        </Badge>
        <div className="max-w-4xl mx-auto">
          <h1 className="hero-title text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
            Empower Change, Verify Impact.
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-muted-foreground">
            Discover and support charitable campaigns with confidence. Our AI technology ensures every project is legitimate, transparent, and ready to make a difference.
          </p>
        </div>
      </div>
    </section>
  );
}
