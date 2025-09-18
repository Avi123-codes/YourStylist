'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Scissors, Shirt, Star, User, CloudSun, Sparkles } from 'lucide-react';
import { useUserProfile } from '@/context/user-profile-context';
import Image from 'next/image';

const features = [
  {
    title: 'Hairstyle Suggestions',
    description: 'Find the perfect cut. Let our AI suggest hairstyles based on your face scan.',
    link: '/dashboard/hairstyle',
    icon: Scissors,
  },
  {
    title: 'Wardrobe Builder',
    description: 'Get clothing recommendations that match your style and body type.',
    link: '/dashboard/wardrobe',
    icon: Shirt,
  },
    {
    title: 'OOTD Rating',
    description: 'Get instant feedback on your outfit of the day and tips for improvement.',
    link: '/dashboard/ootd',
    icon: Star,
  },
   {
    title: 'What to Wear?',
    description: 'Get an outfit suggestion based on the weather in your city.',
    link: '/dashboard/what-to-wear',
    icon: CloudSun,
  },
    {
    title: 'Virtual Tryouts',
    description: 'Select clothing items to get a detailed AI analysis and rating for your outfit.',
    link: '/dashboard/tryouts',
    icon: Sparkles,
  },
  {
    title: 'Your Profile',
    description: 'Keep your preferences and scans up to date for the best recommendations.',
    link: '/dashboard/profile',
    icon: User,
  },
];

export default function DashboardPage() {
    const { profile } = useUserProfile();

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="font-headline text-4xl font-bold tracking-tight">Welcome back, {profile.name}!</h2>
                    <p className="text-muted-foreground mt-2">Ready to discover your perfect style?</p>
                </div>
                {profile.faceScan && (
                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-primary shadow-lg">
                        <Image src={profile.faceScan} alt="Your face scan" fill objectFit="cover" />
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {features.map((feature) => (
                <Card key={feature.title} className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className='flex items-center gap-3'>
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-headline">{feature.title}</CardTitle>
                        </div>
                        <Button asChild variant="ghost" size="icon">
                            <Link href={feature.link}>
                                <ArrowRight className="h-4 w-4" />
                                <span className="sr-only">Go to {feature.title}</span>
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>
    );
}
