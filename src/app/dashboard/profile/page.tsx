import { redirect } from 'next/navigation';

// This page is now an alias for the onboarding page
export default function ProfilePage() {
    redirect('/onboarding');
}
