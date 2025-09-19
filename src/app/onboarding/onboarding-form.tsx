
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserProfile } from "@/context/user-profile-context";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Camera, Trash2, ArrowRight } from "lucide-react";
import { ChangeEvent, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, { message: "Invalid age." }),
  gender: z.string().min(1, "Gender is required."),
  // Metric fields
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),
  // Imperial fields
  heightFt: z.string().optional(),
  heightIn: z.string().optional(),
  weightLbs: z.string().optional(),
  // Scans
  faceScan: z.string().nullable().optional(),
  bodyScan: z.string().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function OnboardingForm() {
  const { profile, setProfile, user } = useUserProfile();
  const { toast } = useToast();
  const router = useRouter();
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name || '',
      age: profile.age || '',
      gender: profile.gender || '',
      heightCm: profile.height || '',
      weightKg: profile.weight || '',
      heightFt: '',
      heightIn: '',
      weightLbs: '',
      faceScan: profile.faceScan,
      bodyScan: profile.bodyScan,
    },
  });

  // When profile loads from context, update the form
  useEffect(() => {
    if (user) {
        // Function to convert cm to feet and inches
        const toImperialHeight = (cm: string) => {
            const totalInches = parseFloat(cm) / 2.54;
            const feet = Math.floor(totalInches / 12);
            const inches = Math.round(totalInches % 12);
            return { feet: feet > 0 ? feet.toString() : '', inches: inches > 0 ? inches.toString() : '' };
        };

        // Function to convert kg to lbs
        const toImperialWeight = (kg: string) => {
            const lbs = parseFloat(kg) * 2.20462;
            return lbs > 0 ? Math.round(lbs).toString() : '';
        };
        
        const { feet, inches } = toImperialHeight(profile.height);

        form.reset({
            name: profile.name || '',
            age: profile.age || '',
            gender: profile.gender || '',
            heightCm: profile.height || '',
            weightKg: profile.weight || '',
            heightFt: feet,
            heightIn: inches,
            weightLbs: toImperialWeight(profile.weight),
            faceScan: profile.faceScan,
            bodyScan: profile.bodyScan,
        });
    }
  }, [profile, user, form]);

  function onSubmit(values: ProfileFormValues) {
    let heightCm = values.heightCm;
    let weightKg = values.weightKg;

    if (units === 'imperial') {
        const feet = parseInt(values.heightFt || '0');
        const inches = parseInt(values.heightIn || '0');
        const lbs = parseInt(values.weightLbs || '0');
        
        if (!isNaN(feet) || !isNaN(inches)) {
            heightCm = (((feet * 12) + inches) * 2.54).toFixed(2);
        }
        if (!isNaN(lbs)) {
            weightKg = (lbs * 0.453592).toFixed(2);
        }
    }

    setProfile({ 
        ...profile,
        name: values.name,
        age: values.age,
        gender: values.gender,
        height: heightCm || '',
        weight: weightKg || '',
        faceScan: values.faceScan || null,
        bodyScan: values.bodyScan || null,
    });
    toast({
      title: "Profile Updated",
      description: "Your personal details have been saved.",
    });
    router.push('/dashboard');
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, type: 'faceScan' | 'bodyScan') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        form.setValue(type, result);
        toast({ title: `${type === 'faceScan' ? 'Face' : 'Body'} Scan Updated` });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const ImageUploader = ({ type }: { type: 'faceScan' | 'bodyScan' }) => {
    const imageSrc = form.watch(type);
    const title = type === 'faceScan' ? 'Face Scan' : 'Body Scan';
    const description = type === 'faceScan' ? 'Used for hairstyle suggestions.' : 'Used for wardrobe recommendations.';
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div 
            className="relative w-48 h-48 rounded-lg border-2 border-dashed bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => inputRef.current?.click()}
            >
            {imageSrc ? (
              <Image src={imageSrc} alt={title} fill objectFit="cover" />
            ) : (
              <Camera className="w-12 h-12 text-muted-foreground" />
            )}
             <Input
                id={type}
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleImageUpload(e, type)}
              />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" type="button" onClick={() => inputRef.current?.click()}>
              {imageSrc ? 'Change Scan' : 'Upload Scan'}
            </Button>
            {imageSrc && (
              <Button variant="destructive" size="icon" type="button" onClick={() => form.setValue(type, null)}>
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Remove {title}</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Personal Details</CardTitle>
              <CardDescription>Update your information to get personalized results.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="age" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl><Input placeholder="e.g., male" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-2">
                    <FormLabel>Units</FormLabel>
                    <RadioGroup
                        value={units}
                        onValueChange={(value: 'metric' | 'imperial') => setUnits(value)}
                        className="flex gap-4"
                    >
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                                <RadioGroupItem value="metric" id="metric" />
                            </FormControl>
                            <FormLabel htmlFor="metric" className="font-normal">Metric (cm, kg)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                                <RadioGroupItem value="imperial" id="imperial" />
                            </FormControl>
                            <FormLabel htmlFor="imperial" className="font-normal">Imperial (ft, lbs)</FormLabel>
                        </FormItem>
                    </RadioGroup>
                </div>
                
                {units === 'metric' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="heightCm" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Height (cm)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g., 180" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="weightKg" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Weight (kg)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g., 75" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem>
                             <FormLabel>Height</FormLabel>
                            <div className="flex gap-2">
                                <FormField control={form.control} name="heightFt" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl><Input type="number" placeholder="ft" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="heightIn" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl><Input type="number" placeholder="in" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </FormItem>
                        <FormField control={form.control} name="weightLbs" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Weight (lbs)</FormLabel>
                                <FormControl><Input type="number" placeholder="e.g., 165" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <ImageUploader type="faceScan" />
            <ImageUploader type="bodyScan" />
          </div>
        </div>
        <div className="flex justify-end">
            <Button type="submit" size="lg">
                Continue to Dashboard
                <ArrowRight className="ml-2"/>
            </Button>
        </div>
      </form>
    </Form>
  );
}
