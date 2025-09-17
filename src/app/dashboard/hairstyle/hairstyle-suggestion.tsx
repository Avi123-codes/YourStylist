"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useUserProfile } from '@/context/user-profile-context';
import { getHairstyleSuggestions, generateHairstyle } from '@/lib/actions';
import type { SuggestHairstylesFromPhotoOutput } from '@/ai/flows/suggest-hairstyles-from-photo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Bot, PartyPopper, Scissors, Sparkles, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


type SuggestionWithImage = SuggestHairstylesFromPhotoOutput[0] & {imageUrl: string | null; isGenerating: boolean};

export function HairstyleSuggestion() {
    const { profile } = useUserProfile();
    const [suggestions, setSuggestions] = useState<SuggestionWithImage[] | null>(null);
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
            setSuggestions(result.data.map(s => ({...s, imageUrl: null, isGenerating: false})));
        } else {
            toast({
                title: 'Error',
                description: result.error || 'Something went wrong.',
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    };

    const handleGenerateImage = async (index: number) => {
        if (!profile.faceScan || !suggestions) return;

        setSuggestions(prev => {
            if (!prev) return null;
            const newSuggestions = [...prev];
            newSuggestions[index].isGenerating = true;
            return newSuggestions;
        });

        const suggestion = suggestions[index];
        const result = await generateHairstyle({ photoDataUri: profile.faceScan, hairstyle: suggestion.hairstyle });
        
        if (result.success && result.data?.imageUrl) {
             setSuggestions(prev => {
                if (!prev) return null;
                const newSuggestions = [...prev];
                newSuggestions[index].imageUrl = result.data.imageUrl;
                newSuggestions[index].isGenerating = false;
                return newSuggestions;
            });
        } else {
             toast({
                title: 'Image Generation Failed',
                description: result.error || 'Could not generate the hairstyle image.',
                variant: 'destructive',
            });
             setSuggestions(prev => {
                if (!prev) return null;
                const newSuggestions = [...prev];
                newSuggestions[index].isGenerating = false;
                return newSuggestions;
            });
        }
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
                    <CardTitle className="font-headline">Virtual Hairstyle Preview</CardTitle>
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
                               <Skeleton className="h-40 w-full rounded-lg" />
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
                                    <div className="relative w-full aspect-square rounded-lg bg-muted overflow-hidden">
                                        {suggestion.isGenerating && (
                                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
                                                <Wand2 className="w-10 h-10 text-white animate-pulse" />
                                                <p className="text-white mt-2">Generating...</p>
                                            </div>
                                        )}
                                        {suggestion.imageUrl ? (
                                            <Image src={suggestion.imageUrl} alt={suggestion.hairstyle} fill objectFit="cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted gap-2 text-center p-4">
                                                <Sparkles className="w-8 h-8 text-primary" />
                                                 <p className="text-sm text-muted-foreground">Preview this hairstyle on you!</p>
                                                <Button size="sm" onClick={() => handleGenerateImage(index)} disabled={suggestion.isGenerating}>
                                                    Generate Image
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <Tabs defaultValue="extrovert" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="extrovert">Extrovert</TabsTrigger>
                                            <TabsTrigger value="introvert">Introvert</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="extrovert">
                                            <p className="text-sm text-muted-foreground">{suggestion.description.extrovert}</p>
                                        </TabsContent>
                                        <TabsContent value="introvert">
                                             <p className="text-sm text-muted-foreground font-style: italic">"{suggestion.description.introvert}"</p>
                                        </TabsContent>
                                    </Tabs>
                                    <Progress value={suggestion.suitabilityScore * 100} className="mt-auto" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
