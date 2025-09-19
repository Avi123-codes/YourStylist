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
      <div className="bg-neutral-800 flex justify-center items-center min-h-screen">
        <div className="w-full max-w-sm h-[800px] max-h-[90vh] bg-background rounded-[40px] border-[10px] border-black shadow-2xl overflow-hidden flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          <BottomNavBar />
        </div>
      </div>
    </UserProfileProvider>
  );
}
