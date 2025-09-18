"use client";

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { useUserProfile } from '@/context/user-profile-context';
import { virtualTryOn } from '@/lib/actions';
import type { VirtualTryOnOutput } from '@/ai/flows/virtual-try-on';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Bot, Star, Sparkles, Shirt, Footprints, Watch, Upload, ThumbsUp, Wrench } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

type ClothingCategory = 'Tops' | 'Bottoms' | 'Footwear' | 'Accessories';
type SelectedClothing = {
    [key in ClothingCategory]?: string; // imageDataUri
};

export function VirtualTryouts() {
    const { profile } = useUserProfile();
    const [selectedClothing, setSelectedClothing] = useState<SelectedClothing>({});
    const [tryOnResult, setTryOnResult] = useState<VirtualTryOnOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, category: ClothingCategory | 'Custom') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageDataUri = reader.result as string;
                if (category === 'Custom') {
                    // For simplicity, we'll just add it to accessories for now.
                    // A more complex implementation could ask the user for the category.
                    setSelectedClothing(prev => ({ ...prev, 'Accessories': imageDataUri }));
                } else {
                    setSelectedClothing(prev => ({ ...prev, [category]: imageDataUri }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTryOn = async () => {
        if (!profile.bodyScan) {
            toast({ title: 'No Body Scan', description: 'Please upload a body scan in your profile first.', variant: 'destructive' });
            return;
        }
        if (Object.keys(selectedClothing).length === 0) {
            toast({ title: 'No Clothing Selected', description: 'Please select or upload at least one clothing item.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        setTryOnResult(null);

        const clothingItems = Object.entries(selectedClothing).map(([category, imageDataUri]) => ({
            category,
            imageDataUri: imageDataUri!
        }));

        const result = await virtualTryOn({
            bodyScanDataUri: profile.bodyScan,
            clothingItems,
        });

        if (result.success && result.data) {
            setTryOnResult(result.data);
        } else {
            toast({ title: 'Error', description: result.error || 'Something went wrong.', variant: 'destructive' });
        }
        setIsLoading(false);
    };

    const clothingCategories: { name: ClothingCategory; icon: React.ElementType }[] = [
        { name: 'Tops', icon: Shirt },
        { name: 'Bottoms', icon: Sparkles }, // Using sparkles as a placeholder for pants
        { name: 'Footwear', icon: Footprints },
        { name: 'Accessories', icon: Watch },
    ];

    if (!profile.bodyScan) {
        return (
            <Card className="text-center max-w-lg mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Upload a Body Scan</CardTitle>
                    <CardDescription>To use Virtual Tryouts, you first need to upload a full-body photo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild><Link href="/dashboard/profile">Go to Profile</Link></Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Virtual Tryouts</CardTitle>
                    <CardDescription>Select clothing items to see how they look on you, then get an AI rating.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full max-w-sm aspect-[9/16] rounded-lg border-2 border-dashed bg-muted flex items-center justify-center overflow-hidden">
                            {isLoading ? (
                                <div className="flex flex-col items-center text-muted-foreground">
                                    <Bot className="w-12 h-12 animate-spin mb-4" />
                                    <p>Generating your look...</p>
                                </div>
                            ) : tryOnResult ? (
                                <Image src={tryOnResult.image} alt="Virtual try-on result" fill objectFit="cover" />
                            ) : (
                                <Image src={profile.bodyScan} alt="Your body scan" fill objectFit="cover" />
                            )}
                        </div>
                         {tryOnResult && !isLoading && (
                            <Card className="w-full max-w-sm shadow-lg">
                                <CardHeader className="flex flex-row justify-between items-start">
                                    <CardTitle className="font-headline text-2xl flex items-center gap-3">
                                        <ThumbsUp className="w-7 h-7 text-primary" />
                                        Your Rating: {tryOnResult.rating}/10
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-start gap-3">
                                        <Wrench className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-lg">Improvement Suggestions</h4>
                                            <p className="text-muted-foreground">{tryOnResult.suggestions}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {clothingCategories.map(({ name, icon: Icon }) => (
                                <div key={name} className="relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/50 hover:border-primary transition-colors">
                                    {selectedClothing[name] ? (
                                        <Image src={selectedClothing[name]!} alt={`${name} selection`} fill objectFit="contain" className="p-2"/>
                                    ) : (
                                        <Icon className="w-10 h-10 text-muted-foreground" />
                                    )}
                                    <p className="absolute bottom-2 text-sm font-medium text-muted-foreground">{name}</p>
                                     <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => handleImageUpload(e, name)}
                                    />
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" asChild className="w-full">
                            <label className="cursor-pointer"><Upload className="mr-2"/> Upload Your Own <input type="file" className="sr-only" onChange={(e) => handleImageUpload(e, 'Custom')} /></label>
                        </Button>
                        <Button onClick={handleTryOn} disabled={isLoading} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            {isLoading ? (
                                <><Bot className="mr-2 h-5 w-5 animate-spin" /> Rating...</>
                            ) : (
                                <><Sparkles className="mr-2 h-5 w-5" /> Try On & Rate Outfit</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
