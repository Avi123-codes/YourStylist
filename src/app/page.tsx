import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, GalleryHorizontal, Scissors, Shirt, Sparkles, Star, User } from 'lucide-react';

const features = [
  {
    title: 'Hairstyle Suggestions',
    description: 'Find the perfect cut based on your face scan.',
    icon: Scissors,
  },
  {
    title: 'Wardrobe Builder',
    description: 'Get recommendations that match your style.',
    icon: Shirt,
  },
    {
    title: 'OOTD Rating',
    description: 'Get instant feedback on your outfit of the day.',
    icon: Star,
  },
   {
    title: 'Virtual Tryouts',
    description: 'Get a detailed AI analysis of your outfit.',
    icon: Sparkles,
  },
   {
    title: 'Digital Closet',
    description: 'Organize your wardrobe and get outfit suggestions.',
    icon: GalleryHorizontal,
  },
  {
    title: 'Personalized Profile',
    description: 'Keep your preferences up to date for better results.',
    icon: User,
  },
];


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <h1 className="font-headline text-2xl font-bold tracking-wide text-center">YourStylist AI</h1>
      </header>
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-card">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Discover Your Perfect Style with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    YourStylist is your personal AI-powered assistant for hair and fashion. Get personalized recommendations, rate your outfits, and build your dream wardrobe.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link href="/onboarding">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <img
                src="https://picsum.photos/seed/style/1200/800"
                data-ai-hint="fashion style"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Your Personal Style Toolkit</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to elevate your style, powered by cutting-edge AI.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

       <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 YourStylist AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
