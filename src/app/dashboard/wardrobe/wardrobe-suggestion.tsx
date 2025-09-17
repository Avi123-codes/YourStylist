"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useUserProfile } from '@/context/user-profile-context';
import { getWardrobeSuggestions } from '@/lib/actions';
import type { SuggestWardrobeFromPreferencesOutput } from '@/ai/flows/suggest-wardrobe-from-preferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Bot, PartyPopper, Shirt } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function WardrobeSuggestion() {
    const { profile } = useUserProfile();
    const [suggestions, setSuggestions] = useState<SuggestWardrobeFromPreferencesOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [style, setStyle] = useState('casual');
    const [color, setColor] = useState('any');
    const { toast } = useToast();

    const handleSuggest = async () => {
        if (!profile.bodyScan) {
            toast({
                title: 'No Body Scan',
                description: 'Please upload a body scan in your profile first.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setSuggestions(null);

        const result = await getWardrobeSuggestions({ 
            bodyScanDataUri: profile.bodyScan,
            style,
            color,
            trendData: 'Current summer trends'
        });

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

    if (!profile.bodyScan) {
        return (
            <Card className="text-center max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Upload a Body Scan</CardTitle>
                    <CardDescription>To get wardrobe recommendations, you first need to upload a full-body photo.</CardDescription>
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
                    <CardTitle className="font-headline">Virtual Wardrobe</CardTitle>
                    <CardDescription>Enter your preferences and we'll suggest items for you. Your body scan is on the left for reference.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="md:col-span-1 flex flex-col items-center gap-4">
                        <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border-2 border-primary shadow-lg">
                            <Image src={profile.bodyScan} alt="Your body scan" fill objectFit="cover" />
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="style">Preferred Style</Label>
                                <Input id="style" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g., casual, formal" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color">Preferred Color</Label>
                                <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., any, blue, dark" />
                            </div>
                        </div>
                        <Button onClick={handleSuggest} disabled={isLoading} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                            {isLoading ? (
                                <><Bot className="mr-2 h-5 w-5 animate-spin" /> Finding clothes...</>
                            ) : (
                                <><Shirt className="mr-2 h-5 w-5" /> Suggest Wardrobe</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isLoading && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                             <Skeleton className="aspect-[3/4] rounded-t-lg" />
                            <CardHeader>
                                <Skeleton className="h-5 w-3/4 rounded" />
                            </CardHeader>
                            <CardContent>
                               <Skeleton className="h-4 w-1/2 rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {suggestions && (
                <div>
                     <div className="flex items-center gap-2 mb-4">
                        <PartyPopper className="w-6 h-6 text-primary" />
                        <h3 className="font-headline text-2xl font-bold">Your new wardrobe awaits!</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {suggestions.suggestions.map((suggestion, index) => (
                            <Card key={index} className="flex flex-col overflow-hidden">
                                <div className="relative w-full aspect-[3/4] bg-muted">
                                     <Image src={suggestions.images[index]} data-ai-hint="clothing item" alt={suggestion} fill objectFit="cover" />
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h4 className="font-headline text-base flex-grow">{suggestion}</h4>
                                    <div className="mt-2">
                                        <Progress value={(suggestions.suitabilityScores[index] || 0) * 100} />
                                        <p className="text-xs text-muted-foreground mt-1">Suitability: {Math.round((suggestions.suitabilityScores[index] || 0) * 100)}%</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
