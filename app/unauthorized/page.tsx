import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gold)]">Acceso restringido</p>
        <h1 className="font-display mt-3 text-4xl text-white">No tienes permiso</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Tu sesion no tiene el rol operativo necesario para abrir esta zona de FLEX.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link className="gold-focus inline-flex min-h-12 items-center justify-center rounded-md bg-[var(--gold)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-black" href="/app">
            Ir a inicio
          </Link>
          <Link className="gold-focus inline-flex min-h-12 items-center justify-center rounded-md border border-white/10 px-5 text-sm font-bold uppercase tracking-[0.08em] text-white" href="/login">
            Login
          </Link>
        </div>
      </Card>
    </main>
  );
}
