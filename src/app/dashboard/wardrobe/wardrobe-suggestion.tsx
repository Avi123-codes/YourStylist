"use client";

import { useState } from 'react';
import { useUserProfile } from '@/context/user-profile-context';
import { getWardrobeSuggestions, analyzeColors } from '@/lib/actions';
import type { SuggestWardrobeFromPreferencesOutput } from '@/ai/flows/suggest-wardrobe-from-preferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Bot, PartyPopper, Shirt, Palette, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

type ColorAnalysisResult = {
    bestColors: string[];
    colorsToAvoid: string[];
    analysis: string;
}

export function WardrobeSuggestion() {
    const { profile } = useUserProfile();
    const [suggestions, setSuggestions] = useState<SuggestWardrobeFromPreferencesOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [style, setStyle] = useState('casual');
    const [color, setColor] = useState('any');
    const [price, setPrice] = useState('any');
    const [colorAnalysis, setColorAnalysis] = useState<ColorAnalysisResult | null>(null);
    const [isAnalyzingColor, setIsAnalyzingColor] = useState(false);
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
            price,
            trendData: 'Current fashion trends'
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

    const handleColorAnalysis = async () => {
        if (!profile.faceScan) {
            toast({
                title: 'No Face Scan',
                description: 'Please upload a face scan in your profile for color analysis.',
                variant: 'destructive',
            });
            return;
        }
        setIsAnalyzingColor(true);
        const result = await analyzeColors({ photoDataUri: profile.faceScan });
        if (result.success && result.data) {
            setColorAnalysis(result.data);
        } else {
            toast({
                title: 'Color Analysis Failed',
                description: result.error || 'Could not perform color analysis.',
                variant: 'destructive'
            });
        }
        setIsAnalyzingColor(false);
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
                    <CardTitle className="font-headline">Color Analysis</CardTitle>
                    <CardDescription>Discover which colors suit you best based on your skin tone, hair, and eye color.</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {!colorAnalysis && (
                        <div className="flex flex-col items-center gap-4 text-center">
                            <p className="text-muted-foreground">Upload a face scan in your profile to use this feature.</p>
                            <Button onClick={handleColorAnalysis} disabled={isAnalyzingColor || !profile.faceScan}>
                                {isAnalyzingColor ? (
                                    <><Bot className="mr-2 h-5 w-5 animate-spin" />Analyzing...</>
                                ) : (
                                    <><Palette className="mr-2 h-5 w-5" /> Analyze My Colors</>
                                )}
                            </Button>
                        </div>
                    )}
                    {isAnalyzingColor && (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-1/2" />
                                <Skeleton className="h-10 w-1/2" />
                            </div>
                        </div>
                    )}
                    {colorAnalysis && (
                        <Alert>
                            <Palette className="h-4 w-4" />
                            <AlertTitle className='font-headline'>Your Colors</AlertTitle>
                            <AlertDescription className='space-y-3'>
                                <p>{colorAnalysis.analysis}</p>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <h4 className='font-semibold mb-2'>Recommended Colors</h4>
                                        <div className='flex flex-wrap gap-2'>
                                            {colorAnalysis.bestColors.map(c => <div key={c} className='px-3 py-1 text-sm rounded-full border' style={{ backgroundColor: c, color: 'white', textShadow: '0 0 2px black' }}>{c}</div>)}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className='font-semibold mb-2'>Colors to Use Sparingly</h4>
                                        <div className='flex flex-wrap gap-2'>
                                            {colorAnalysis.colorsToAvoid.map(c => <div key={c} className='px-3 py-1 text-sm rounded-full border' style={{ backgroundColor: c, color: 'white', textShadow: '0 0 2px black' }}>{c}</div>)}
                                        </div>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="style">Preferred Style</Label>
                                <Input id="style" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g., casual, formal" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color">Preferred Color</Label>
                                <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., any, blue, dark" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price Range</Label>
                                <Select value={price} onValueChange={setPrice}>
                                    <SelectTrigger id="price">
                                        <SelectValue placeholder="Select price range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="any">Any</SelectItem>
                                        <SelectItem value="under $50">Under $50</SelectItem>
                                        <SelectItem value="$50-$100">$50 - $100</SelectItem>
                                        <SelectItem value="$100-$250">$100 - $250</SelectItem>
                                        <SelectItem value="over $250">Over $250</SelectItem>
                                    </SelectContent>
                                </Select>
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
                            <Skeleton className="aspect-square rounded-t-lg" />
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
                            <Card key={index} className="flex flex-col overflow-hidden group">
                                <div className="p-4 flex flex-col flex-grow">
                                    <h4 className="font-headline text-base flex-grow">{suggestion.itemName}</h4>
                                    <p className="text-sm text-muted-foreground">{suggestion.itemType}</p>
                                    <div className="mt-2">
                                        <Progress value={suggestion.suitabilityScore * 100} />
                                        <p className="text-xs text-muted-foreground mt-1">Suitability: {Math.round(suggestion.suitabilityScore * 100)}%</p>
                                    </div>
                                </div>
                                <CardContent className="pt-0 space-y-2">
                                     <div className="text-sm text-muted-foreground flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4 flex-shrink-0" /> 
                                        <span>Find at: <span className='font-semibold text-foreground'>{suggestion.store}</span></span>
                                     </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
