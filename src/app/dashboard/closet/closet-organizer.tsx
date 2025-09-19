"use client";

import { useState, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Bot, GalleryHorizontal, Sparkles, Lightbulb, VenetianMask, AlertCircle } from 'lucide-react';
import { createOutfitFromCloset } from '@/lib/actions';
import type { CreateOutfitFromClosetOutput } from '@/ai/flows/create-outfit-from-closet';
import { getItemDescription } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

interface ClothingItem {
    id: string;
    imageDataUri: string;
    description: string | null;
    isDescribing: boolean;
}

interface SuggestedOutfit {
    items: ClothingItem[];
    reasoning: string;
}

type StoredClothingItem = Omit<ClothingItem, 'isDescribing'>;

export function ClosetOrganizer() {
    const [closetItems, setClosetItems] = useState<ClothingItem[]>([]);
    const [occasion, setOccasion] = useState('');
    const [isCreatingOutfit, setIsCreatingOutfit] = useState(false);
    const [suggestion, setSuggestion] = useState<SuggestedOutfit | null>(null);
    const { toast } = useToast();

    // Load items from localStorage on component mount
    useEffect(() => {
        try {
            const savedItemsJSON = localStorage.getItem('closetItems');
            if (savedItemsJSON) {
                const savedItems: StoredClothingItem[] = JSON.parse(savedItemsJSON);
                // Add the transient `isDescribing` property back
                setClosetItems(savedItems.map(item => ({ ...item, isDescribing: false })));
            }
        } catch (error) {
            console.error("Failed to load items from localStorage", error);
            toast({ title: 'Could not load saved items', variant: 'destructive' });
        }
    }, [toast]); // Added toast to dependency array as it's used inside the effect's catch block

    // Save items to localStorage whenever they change
    useEffect(() => {
        try {
            // We only store the permanent data, not the transient `isDescribing` state.
            const itemsToSave: StoredClothingItem[] = closetItems.map(({ id, imageDataUri, description }) => ({ id, imageDataUri, description }));
            // Avoid saving an empty array on first load if nothing exists
            if (itemsToSave.length > 0 || localStorage.getItem('closetItems')) {
                 localStorage.setItem('closetItems', JSON.stringify(itemsToSave));
            }
        } catch (error) {
            console.error("Failed to save items to localStorage", error);
            toast({ title: 'Could not save your closet', variant: 'destructive' });
        }
    }, [closetItems, toast]);


    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newItems: ClothingItem[] = [];
            for (const file of Array.from(files)) {
                const id = `item-${Date.now()}-${Math.random()}`;
                const reader = new FileReader();
                
                const newItem: ClothingItem = {
                    id,
                    imageDataUri: '',
                    description: null,
                    isDescribing: true,
                };
                newItems.push(newItem);

                reader.onloadend = () => {
                    const imageDataUri = reader.result as string;
                    setClosetItems(prev => prev.map(item => item.id === id ? { ...item, imageDataUri } : item));
                    describeItem(id, imageDataUri);
                };
                reader.readAsDataURL(file);
            }

            setClosetItems(prev => [...prev, ...newItems]);
            toast({ title: `${files.length} item(s) being added...` });
        }
    };
    
    const describeItem = async (id: string, imageDataUri: string) => {
        const result = await getItemDescription({ photoDataUri: imageDataUri });

        setClosetItems(prev => prev.map(item => {
            if (item.id === id) {
                if (result.success && result.data) {
                    return { ...item, description: result.data.description, isDescribing: false };
                } else {
                     toast({ title: 'Description Failed', description: 'Could not get description for an item.', variant: 'destructive' });
                    return { ...item, description: 'Unknown Item', isDescribing: false };
                }
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setClosetItems(prev => prev.filter(item => item.id !== id));
    };

    const handleCreateOutfit = async () => {
        const describableItems = closetItems.filter(item => item.description);
        if (describableItems.length < 2) {
            toast({ title: 'Not enough items', description: 'Please add and describe at least two items.', variant: 'destructive' });
            return;
        }
        if (!occasion) {
            toast({ title: 'Occasion is required', description: 'Please specify an occasion for the outfit.', variant: 'destructive' });
            return;
        }
        setIsCreatingOutfit(true);
        setSuggestion(null);

        const result = await createOutfitFromCloset({
            clothingItems: describableItems.map(({ id, description }) => ({ id, description: description! })),
            occasion,
        });

        if (result.success && result.data) {
            const suggestedItems = result.data.outfit?.map(chosenItem => {
                return closetItems.find(item => item.id === chosenItem.id);
            }).filter((item): item is ClothingItem => !!item) || [];
            
            setSuggestion({
                items: suggestedItems,
                reasoning: result.data.reasoning
            });
        } else {
            toast({ title: 'Error creating outfit', description: result.error || 'The AI stylist could not create an outfit.', variant: 'destructive' });
        }
        setIsCreatingOutfit(false);
    };

    const allItemsDescribed = closetItems.every(item => !item.isDescribing);

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><GalleryHorizontal /> Your Digital Closet</CardTitle>
                    <CardDescription>Upload photos of your clothes. The AI will automatically describe them for you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-4">
                        {closetItems.map(item => (
                            <div key={item.id} className="relative group aspect-square">
                                {item.isDescribing && !item.imageDataUri && <Skeleton className="absolute inset-0" />}
                                {item.imageDataUri && <Image src={item.imageDataUri} alt={item.description || "Closet item"} fill className="object-cover rounded-md border" />}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs text-center truncate">{item.isDescribing ? 'Analyzing...' : item.description}</div>
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
                    <Button onClick={handleCreateOutfit} disabled={isCreatingOutfit || !allItemsDescribed || closetItems.length < 2}>
                        {isCreatingOutfit ? <><Bot className="mr-2 animate-spin"/>Styling... </>: <><Lightbulb className="mr-2"/>Create Outfit</>}
                    </Button>
                </CardContent>
            </Card>
            
            {isCreatingOutfit && <Skeleton className="h-64 w-full rounded-lg" />}

            {!isCreatingOutfit && !suggestion && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Suggestion Yet</AlertTitle>
                    <AlertDescription>Your AI-styled outfit will appear here once it's generated.</AlertDescription>
                </Alert>
            )}

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
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {suggestion.items.map(item => (
                                <div key={item.id} className="space-y-2">
                                    <div className="relative aspect-square">
                                        <Image src={item.imageDataUri} alt={item.description || 'outfit item'} fill className="object-cover rounded-md border" />
                                    </div>
                                    <p className="text-sm text-center font-medium">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

    