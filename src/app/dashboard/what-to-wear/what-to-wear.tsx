'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getWeatherOutfitSuggestion } from '@/lib/actions';
import type { SuggestOutfitForWeatherOutput } from '@/ai/flows/suggest-outfit-for-weather';
import { Bot, CloudSun, MapPin, Wind, Thermometer, Shirt, Sparkles, Umbrella, VenetianMask } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function WhatToWear() {
    const [city, setCity] = useState('');
    const [style, setStyle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SuggestOutfitForWeatherOutput | null>(null);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city) {
            toast({ title: 'City is required', description: 'Please enter a city name.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        setResult(null);

        const response = await getWeatherOutfitSuggestion({ city, style_preference: style });

        if (response.success && response.data) {
            setResult(response.data);
        } else {
            toast({ title: 'Error', description: response.error || 'Failed to get suggestion.', variant: 'destructive' });
        }

        setIsLoading(false);
    };

    const OutfitItem = ({ icon: Icon, label, item }: { icon: React.ElementType, label: string, item?: string }) => {
        if (!item) return null;
        return (
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="font-semibold text-lg">{item}</p>
                </div>
            </div>
        )
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Weather-Aware Stylist</CardTitle>
                    <CardDescription>Get an outfit recommendation based on the real-time weather in your city.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="city" className="flex items-center gap-2"><MapPin className="w-4 h-4"/> City</Label>
                            <Input
                                id="city"
                                placeholder="e.g., New York"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="style" className="flex items-center gap-2"><VenetianMask className="w-4 h-4" /> Style Preference (Optional)</Label>
                            <Input
                                id="style"
                                placeholder="e.g., casual, chic, formal"
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                            {isLoading ? (
                                <><Bot className="mr-2 h-5 w-5 animate-spin" /> Fetching your outfit...</>
                            ) : (
                                <><CloudSun className="mr-2 h-5 w-5" /> Suggest Outfit</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="sticky top-20">
                {isLoading && (
                    <Card>
                        <CardHeader>
                             <Skeleton className="h-8 w-2/3 rounded-md" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-around">
                                <Skeleton className="h-10 w-24 rounded-md" />
                                <Skeleton className="h-10 w-24 rounded-md" />
                            </div>
                            <Skeleton className="h-6 w-full rounded-md" />
                            <div className="space-y-4 pt-4">
                                <Skeleton className="h-12 w-full rounded-md" />
                                <Skeleton className="h-12 w-full rounded-md" />
                                <Skeleton className="h-12 w-full rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {result && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline">Your Outfit for {city}</CardTitle>
                            <div className="flex justify-between items-center text-muted-foreground pt-2">
                                <div className="flex items-center gap-2">
                                    <Thermometer className="w-5 h-5" />
                                    <span>{result.weather.temperature.toFixed(1)}°C</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Umbrella className="w-5 h-5" />
                                    <span className="capitalize">{result.weather.condition}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert>
                                <Bot className="h-4 w-4" />
                                <AlertTitle>Stylist's Note</AlertTitle>
                                <AlertDescription>{result.reasoning}</AlertDescription>
                            </Alert>
                            <div className="space-y-4">
                                <OutfitItem icon={Shirt} label="Top" item={result.outfit.top} />
                                <OutfitItem icon={Sparkles} label="Bottoms" item={result.outfit.bottom} />
                                <OutfitItem icon={VenetianMask} label="Outerwear" item={result.outfit.outerwear} />
                                <OutfitItem icon={Shirt} label="Footwear" item={result.outfit.footwear} />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !result && (
                    <Card className="text-center border-dashed">
                       <CardContent className="p-12">
                           <CloudSun className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                           <h3 className="font-semibold text-lg text-muted-foreground">Your outfit suggestion will appear here</h3>
                           <p className="text-sm text-muted-foreground">Enter a city to get started.</p>
                       </CardContent>
                   </Card>
               )}
            </div>
        </div>
    );
}
