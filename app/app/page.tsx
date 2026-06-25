import Link from "next/link";
import { HomeEventCarousel } from "@/components/app/HomeEventCarousel";
import { HomeNightStatus } from "@/components/app/HomeNightStatus";
import { HomeQuickActions } from "@/components/app/HomeQuickActions";
import { HomeTodayPreview } from "@/components/app/HomeTodayPreview";
import { HomeUpcomingEvents } from "@/components/app/HomeUpcomingEvents";

export default function UserDashboard() {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)] xl:items-start xl:gap-7">
      <div className="order-1 min-w-0 space-y-6 xl:col-start-1">
        <div className="lg:hidden">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--gold)]">Bienvenido a FLEX</p>
          <h1 className="font-display mt-2 text-5xl text-white">Tu noche</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Tus canciones y tus accesos en un solo lugar.</p>
        </div>

        <HomeEventCarousel />

        <HomeQuickActions />
      </div>

      <HomeNightStatus />

      <div className="content-auto soft-enter soft-enter-delay-2 order-3 min-w-0 xl:col-start-1">
        <HomeTodayPreview />
      </div>

      <section className="content-auto soft-enter soft-enter-delay-3 order-4 min-w-0 space-y-4 xl:col-start-1">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-white">Proximos eventos</h2>
          <Link href="/app/events" prefetch={false} className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gold)]">Ver todos</Link>
        </div>
        <HomeUpcomingEvents />
      </section>
    </div>
  );
}
