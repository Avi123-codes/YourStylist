import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background md:flex-row">
      {/* Image Section (Top on mobile, Right on desktop) */}
      <div className="w-full h-64 md:h-screen md:w-1/2 relative">
        <Image
          src="https://picsum.photos/seed/fashion-aesthetic/1000/1500"
          alt="A stylish person"
          layout="fill"
          objectFit="cover"
          className="grayscale"
          data-ai-hint="fashion model"
        />
        {/* Mobile Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:hidden" />
        {/* Desktop Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden md:block" />
      </div>

      {/* Content Section (Bottom on mobile, Left on desktop) */}
      <div className="w-full md:w-1/2 flex flex-col p-8 justify-between order-first md:order-last">
        <h1 className="font-headline text-3xl font-bold tracking-wide text-foreground">YourStylist</h1>
        
        <main className="flex-1 flex flex-col items-center justify-center text-center -mt-16 md:mt-0">
          <div className="max-w-md space-y-6">
            <h2 className="font-headline text-5xl font-bold tracking-tighter text-foreground sm:text-6xl">
              Discover Your Style
            </h2>
            <p className="text-lg text-muted-foreground">
              AI-powered recommendations for hair, clothes, and more, tailored just for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </main>
        
        <footer className="text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} YourStylist. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
