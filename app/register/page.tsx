import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { Logo } from "@/components/ui/Logo";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <Suspense>
          <AuthForm mode="register" />
        </Suspense>
        <p className="mt-5 text-center text-sm text-[var(--muted)]">Ya tienes cuenta? <Link className="text-[var(--gold)]" href="/login">Entrar</Link></p>
      </div>
    </main>
  );
}
