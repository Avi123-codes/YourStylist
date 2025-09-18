"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useUserProfile } from '@/context/user-profile-context';
import { getHairstyleSuggestions } from '@/lib/actions';
import type { SuggestHairstylesFromPhotoOutput } from '@/ai/flows/suggest-hairstyles-from-photo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bot, PartyPopper, Scissors, Star, Zap, User, MessageSquare, Wrench } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StarRating = ({ rating, label }: { rating: number, label: string }) => {
    return (
        <div className="flex items-center gap-2">
            <p className="text-sm font-medium w-24">{label}</p>
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                ))}
            </div>
        </div>
    )
}

export function HairstyleSuggestion() {
    const { profile } = useUserProfile();
    const [suggestions, setSuggestions] = useState<SuggestHairstylesFromPhotoOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSuggest = async () => {
        if (!profile.faceScan) {
            toast({
                title: 'No Face Scan',
                description: 'Please upload a face scan in your profile first.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setSuggestions(null);

        const result = await getHairstyleSuggestions({ photoDataUri: profile.faceScan });

        if (result.success && result.data) {
            setSuggestions(result.data);
        } else {
            toast({
                title: 'Error',
                description: result.error || 'Something went wrong.',
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    };


    if (!profile.faceScan) {
        return (
            <Card className="text-center max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Upload a Face Scan</CardTitle>
                    <CardDescription>To get hairstyle suggestions, you first need to upload a clear photo of your face.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/profile">Go to Profile</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">AI Hairstyle Advisor</CardTitle>
                    <CardDescription>Your current face scan. Use the button below to generate AI-powered hairstyle suggestions.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="relative w-64 h-64 rounded-lg overflow-hidden border-2 border-primary shadow-lg">
                        <Image src={profile.faceScan} alt="Your face scan" fill objectFit="cover" />
                    </div>
                    <Button onClick={handleSuggest} disabled={isLoading} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                        {isLoading ? (
                            <>
                                <Bot className="mr-2 h-5 w-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Scissors className="mr-2 h-5 w-5" />
                                Suggest Hairstyles
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 rounded" />
                                <Skeleton className="h-4 w-1/2 rounded" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-5/6 rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {suggestions && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <PartyPopper className="w-6 h-6 text-primary" />
                        <h3 className="font-headline text-2xl font-bold">Here are your suggestions!</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suggestions.map((suggestion, index) => (
                            <Card key={index} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="font-headline">{suggestion.hairstyle}</CardTitle>
                                    <CardDescription>Suitability: {Math.round(suggestion.suitabilityScore * 100)}%</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col gap-4">
                                    <div className="space-y-2">
                                        <StarRating rating={suggestion.trendiness} label="Trendiness" />
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium w-24">Maintenance</p>
                                            <div className="flex items-center gap-2">
                                                <Wrench className="w-5 h-5 text-muted-foreground" />
                                                <p className="text-sm font-medium">{suggestion.maintenance}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Tabs defaultValue="extrovert" className="w-full pt-4">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="extrovert"><User className="mr-2"/>Extrovert</TabsTrigger>
                                            <TabsTrigger value="introvert"><MessageSquare className="mr-2"/>Introvert</TabsTrigger>
                                        </TabsList>
                                         <Card className='mt-2'>
                                            <TabsContent value="extrovert" className="p-4">
                                                <p className="text-sm text-muted-foreground">{suggestion.description.extrovert}</p>
                                            </TabsContent>
                                            <TabsContent value="introvert" className="p-4">
                                                <p className="text-sm text-muted-foreground font-style: italic">"{suggestion.description.introvert}"</p>
                                            </TabsContent>
                                        </Card>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
