'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Scissors, Shirt, Star, User, Bot, Sparkles } from 'lucide-react';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useUserProfile } from '@/context/user-profile-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from './ui/button';

export function MainNav() {
  const pathname = usePathname();
  const { profile } = useUserProfile();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/hairstyle', label: 'Hairstyle', icon: Scissors },
    { href: '/dashboard/wardrobe', label: 'Wardrobe', icon: Shirt },
    { href: '/dashboard/tryouts', label: 'Tryouts', icon: Sparkles },
    { href: '/dashboard/ootd', label: 'OOTD Rating', icon: Star },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-2xl font-bold">YourStylist</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
              <Button
                  variant={pathname === "/dashboard/profile" ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                <Link href="/dashboard/profile" className='w-full'>
                  <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.faceScan || undefined} alt={profile.name} />
                          <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                          <span className="font-semibold text-sm">{profile.name}</span>
                          <span className="text-xs text-muted-foreground">View Profile</span>
                      </div>
                  </div>
                </Link>
              </Button>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
