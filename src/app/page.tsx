import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://picsum.photos/seed/stylist-hero/1200/1600')",
        }}
        data-ai-hint="stylish woman"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 flex h-20 items-center justify-center px-4 sm:px-6">
        <h1 className="font-headline text-3xl font-bold tracking-wide text-white">YourStylist</h1>
      </header>
      
      {/* Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center text-white px-4">
        <div className="max-w-2xl space-y-6">
          <h2 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
            Welcome to Your Stylist
          </h2>
          <p className="text-lg text-white/90 md:text-xl">
            Discover your perfect look with AI-powered style recommendations for hair, clothes, and more.
          </p>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/onboarding">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer can be added here if needed */}
    </div>
  );
}
