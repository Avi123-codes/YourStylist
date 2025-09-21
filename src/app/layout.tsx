import type { Metadata } from 'next';
import { Playfair_Display, PT_Sans } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { UserProfileProvider } from '@/context/user-profile-context';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});


export const metadata: Metadata = {
  title: 'YourStylist',
  description: 'AI-powered style suggestions for hair and wardrobe.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ptSans.variable} ${playfairDisplay.variable} font-body antialiased`}>
        <UserProfileProvider>
          {children}
        </UserProfileProvider>
        <Toaster />
      </body>
    </html>
  );
}
