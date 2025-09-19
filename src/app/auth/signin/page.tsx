import { SignInForm } from './signin-form';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}
