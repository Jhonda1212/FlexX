import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-8">
      <section className="relative flex min-h-[calc(100vh-3rem)] items-end overflow-hidden rounded-lg border border-[var(--gold)]/20 bg-black">
        <div className="absolute inset-0 bg-[url('/images/jazz-night.png')] bg-cover bg-center opacity-58" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/72 to-black/18" />
        <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14">
          <Logo />
          <div className="mt-16 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[var(--gold)]">Jazz club · live sessions</p>
            <h1 className="font-display mt-3 text-6xl font-bold leading-none text-white sm:text-7xl">FLEX</h1>
            <p className="mt-4 max-w-xl text-lg text-white/78">Entradas QR, salas VIP, canciones y turnos de escenario en una experiencia rapida para la noche.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login"><Button className="w-full sm:w-auto">Entrar</Button></Link>
              <Link href="/register"><Button variant="ghost" className="w-full sm:w-auto">Crear cuenta</Button></Link>
            </div>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {["Compra simple", "QR seguro", "Staff en vivo"].map((item) => (
              <Card key={item} className="bg-black/55 p-4">
                <div className="text-sm font-bold uppercase tracking-[0.12em] text-white">{item}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
