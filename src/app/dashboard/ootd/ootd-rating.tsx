"use client";

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { getOotdRating } from '@/lib/actions';
import type { OutfitRatingAndSuggestionsOutput } from '@/ai/flows/outfit-rating-and-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bot, Camera, Star, ThumbsUp, Wrench } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function OotdRating() {
    const [rating, setRating] = useState<OutfitRatingAndSuggestionsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [ootdImage, setOotdImage] = useState<string | null>(null);
    const { toast } = useToast();

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOotdImage(reader.result as string);
                setRating(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRateOutfit = async () => {
        if (!ootdImage) {
            toast({
                title: 'No Outfit Photo',
                description: 'Please upload a photo of your outfit first.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        setRating(null);

        const result = await getOotdRating({ photoDataUri: ootdImage });

        if (result.success && result.data) {
            setRating(result.data);
        } else {
            toast({
                title: 'Error',
                description: result.error || 'Something went wrong.',
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Upload Your Outfit</CardTitle>
                    <CardDescription>Upload a picture of your outfit of the day (OOTD) to get an AI-powered rating and suggestions.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className="relative w-full max-w-sm aspect-[9/16] rounded-lg border-2 border-dashed bg-muted flex items-center justify-center overflow-hidden">
                        {ootdImage ? (
                            <Image src={ootdImage} alt="Outfit of the day" fill objectFit="cover" />
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                <Camera className="w-12 h-12 mx-auto mb-2" />
                                <p>Your photo will appear here</p>
                            </div>
                        )}
                        <Input
                            id="ootd-upload"
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageUpload}
                        />
                    </div>
                     <Button asChild variant="outline">
                        <label htmlFor="ootd-upload" className="cursor-pointer">{ootdImage ? 'Change Photo' : 'Upload Photo'}</label>
                    </Button>
                    {ootdImage && (
                        <Button onClick={handleRateOutfit} disabled={isLoading} size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                            {isLoading ? (
                                <><Bot className="mr-2 h-5 w-5 animate-spin" /> Rating...</>
                            ) : (
                                <><Star className="mr-2 h-5 w-5" /> Rate My Outfit</>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>

            <div className="sticky top-20">
                {isLoading && (
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2 rounded" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Skeleton className="h-6 w-1/3 rounded" />
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-4 w-5/6 rounded" />
                        </CardContent>
                    </Card>
                )}
                
                {rating && (
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center gap-3">
                                <ThumbsUp className="w-7 h-7 text-primary" />
                                Your Rating: {rating.rating}/10
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                               <div className="flex items-start gap-3">
                                    <Wrench className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-semibold text-lg">Improvement Suggestions</h4>
                                        <p className="text-muted-foreground">{rating.suggestions}</p>
                                    </div>
                               </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !rating && (
                     <Card className="text-center border-dashed">
                        <CardContent className="p-12">
                            <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                            <h3 className="font-semibold text-lg text-muted-foreground">Your rating will appear here</h3>
                            <p className="text-sm text-muted-foreground">Upload an outfit and click "Rate My Outfit" to see the results.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
