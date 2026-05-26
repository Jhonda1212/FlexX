import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
        <p className="mt-5 text-center text-sm text-[var(--muted)]">Sin cuenta? <Link className="text-[var(--gold)]" href="/register">Registrate</Link></p>
      </div>
    </main>
  );
}
