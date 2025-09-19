'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Scissors, Shirt, Sparkles, Star, GalleryHorizontal, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/context/user-profile-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export function BottomNavBar() {
  const pathname = usePathname();
  const { profile } = useUserProfile();

  const menuItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/dashboard/hairstyle', label: 'Hairstyle', icon: Scissors },
    { href: '/dashboard/wardrobe', label: 'Wardrobe', icon: Shirt },
    { href: '/dashboard/tryouts', label: 'Tryouts', icon: Sparkles },
    { href: '/dashboard/ootd', label: 'OOTD', icon: Star },
    { href: '/dashboard/closet', label: 'Closet', icon: GalleryHorizontal },
    { href: '/dashboard/profile', label: 'Profile', icon: User, isProfile: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full border-t bg-card/80 backdrop-blur-sm">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
                 <Link href={item.href} key={item.href} className={cn(
                     "flex flex-col items-center justify-center text-xs font-medium gap-1",
                     isActive ? "text-primary" : "text-muted-foreground",
                     "hover:text-primary transition-colors"
                 )}>
                    {item.isProfile ? (
                         <Avatar className={cn("h-7 w-7 border-2", isActive ? "border-primary" : "border-transparent")}>
                            <AvatarImage src={profile.faceScan || undefined} alt={profile.name} />
                            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <item.icon className="h-5 w-5" />
                    )}
                    <span>{item.label}</span>
                </Link>
            )
        })}
      </div>
    </nav>
  );
}
