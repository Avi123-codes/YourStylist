"use client";

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Bot, GalleryHorizontal, Sparkles, Lightbulb, Shirt, VenetianMask } from 'lucide-react';
import { createOutfitFromCloset } from '@/lib/actions';
import type { CreateOutfitFromClosetOutput } from '@/ai/flows/create-outfit-from-closet';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';


interface ClothingItem {
    id: string;
    imageDataUri: string;
}

export function ClosetOrganizer() {
    const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
    const [occasion, setOccasion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<CreateOutfitFromClosetOutput | null>(null);
    const { toast } = useToast();

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            for (const file of Array.from(files)) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newItem: ClothingItem = {
                        id: `item-${Date.now()}-${Math.random()}`,
                        imageDataUri: reader.result as string,
                    };
                    setClosetItems(prev => [...prev, newItem]);
                };
                reader.readAsDataURL(file);
            }
            toast({ title: `${files.length} item(s) added to your closet.` });
        }
    };

    const removeItem = (id: string) => {
        setClosetItems(prev => prev.filter(item => item.id !== id));
    };

    const handleCreateOutfit = async () => {
        if (closetItems.length < 2) {
            toast({ title: 'Not enough items', description: 'Please add at least two items to your closet.', variant: 'destructive' });
            return;
        }
        if (!occasion) {
            toast({ title: 'Occasion is required', description: 'Please specify an occasion for the outfit.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        setSuggestion(null);

        const result = await createOutfitFromCloset({
            clothingItems: closetItems.map(item => ({ imageDataUri: item.imageDataUri })),
            occasion,
        });

        if (result.success && result.data) {
            setSuggestion(result.data);
        } else {
            toast({ title: 'Error creating outfit', description: result.error || 'Something went wrong.', variant: 'destructive' });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><GalleryHorizontal /> Your Digital Closet</CardTitle>
                    <CardDescription>Upload photos of your clothes to build your virtual closet. Then, ask the AI to create outfits for you!</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
                        {closetItems.map(item => (
                            <div key={item.id} className="relative group aspect-square">
                                <Image src={item.imageDataUri} alt="Closet item" fill className="object-cover rounded-md border" />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                         <Button variant="outline" asChild className="aspect-square flex-col gap-2 h-full w-full border-dashed">
                            <label className="cursor-pointer">
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Add Items</span>
                                <input type="file" multiple accept="image/*" className="sr-only" onChange={handleImageUpload} />
                            </label>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Sparkles /> Create an Outfit</CardTitle>
                    <CardDescription>Tell the AI what the occasion is, and it will create an outfit from your closet items.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-4">
                    <div className="w-full max-w-sm space-y-2">
                        <Label htmlFor="occasion">What's the occasion?</Label>
                        <Input 
                            id="occasion" 
                            value={occasion} 
                            onChange={(e) => setOccasion(e.target.value)} 
                            placeholder="e.g., Work meeting, casual brunch..."
                        />
                    </div>
                    <Button onClick={handleCreateOutfit} disabled={isLoading || closetItems.length < 2}>
                        {isLoading ? <><Bot className="mr-2 animate-spin"/>Styling... </>: <><Lightbulb className="mr-2"/>Create Outfit</>}
                    </Button>
                </CardContent>
            </Card>
            
            {isLoading && <Skeleton className="h-64 w-full rounded-lg" />}

            {suggestion && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Your AI-Styled Outfit</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert>
                            <Bot className="h-4 w-4" />
                            <AlertTitle>Stylist's Note</AlertTitle>
                            <AlertDescription>{suggestion.reasoning}</AlertDescription>
                        </Alert>
                        <Card>
                           <CardContent className="p-4">
                                <h4 className="font-semibold mb-4">Suggested Items:</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {suggestion.outfit.map((item, index) => (
                                        <div key={index} className="flex flex-col items-center text-center gap-2">
                                            <div className="relative w-full aspect-square rounded-md border overflow-hidden">
                                                <Image src={item.imageDataUri} alt={item.itemName} fill className="object-cover" />
                                            </div>
                                            <div className='text-sm'>
                                                <p className="font-semibold">{item.itemName}</p>
                                                <p className="text-muted-foreground">({item.category})</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
