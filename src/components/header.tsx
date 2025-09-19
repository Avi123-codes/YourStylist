'use client';
import { usePathname } from 'next/navigation';

const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/dashboard/hairstyle': 'AI Hairstyle Suggestion',
    '/dashboard/wardrobe': 'AI Wardrobe Suggestion',
    '/dashboard/tryouts': 'Virtual Tryouts',
    '/dashboard/ootd': 'Outfit of The Day Rating',
    '/dashboard/profile': 'My Profile',
    '/dashboard/closet': 'Digital Closet',
};


export function Header() {
    const pathname = usePathname();
    const title = pageTitles[pathname] || 'YourStylist';

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <h1 className="font-headline text-xl font-semibold tracking-wide text-center">{title}</h1>
        </header>
    );
}
