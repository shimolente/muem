import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginForm } from '@/components/admin/login-form';

export const metadata = { title: 'Sign in' };

export default async function LoginPage() {
  // Validated redirect (decodes JWT) — safe, unlike a cookie-presence check
  // in middleware. Only fires for a genuinely valid session.
  const session = await auth();
  if (session?.user) redirect('/admin/dashboard');

  return (
    <main className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  );
}
