import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { UserProfileProvider } from '@/context/user-profile-context';
import { Header } from '@/components/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProfileProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar>
            <MainNav />
          </Sidebar>
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </UserProfileProvider>
  );
}
