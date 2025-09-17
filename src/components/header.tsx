'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/dashboard/hairstyle': 'AI Hairstyle Suggestion',
    '/dashboard/wardrobe': 'AI Wardrobe Suggestion',
    '/dashboard/ootd': 'Outfit of The Day Rating',
    '/dashboard/profile': 'My Profile',
};


export function Header() {
    const pathname = usePathname();
    const title = pageTitles[pathname] || 'YourStylist';

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="md:hidden" />
            <h1 className="font-headline text-2xl font-semibold tracking-wide">{title}</h1>
        </header>
    );
}
