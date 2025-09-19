import { OnboardingForm } from './onboarding-form';

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
                <h1 className="font-headline text-xl font-semibold tracking-wide text-center">Setup Your Profile</h1>
            </header>
            <main className="flex-1 p-4 md:p-6">
                 <OnboardingForm />
            </main>
        </div>
    );
}
