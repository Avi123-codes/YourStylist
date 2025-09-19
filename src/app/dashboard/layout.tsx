import { BottomNavBar } from '@/components/bottom-nav';
import { UserProfileProvider } from '@/context/user-profile-context';
import { Header } from '@/components/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProfileProvider>
      <div className="flex flex-col h-screen bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </UserProfileProvider>
  );
}
