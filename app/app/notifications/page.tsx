import { Bell, Home } from "lucide-react";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <AppPageHeader
        eyebrow="Centro de avisos"
        title="Avisos"
        description="Revisa notificaciones importantes sobre eventos, turnos y accesos."
        className="lg:hidden"
      />

      <AppEmptyState
        icon={<Bell size={24} />}
        title="Todo tranquilo por ahora"
        description="Cuando haya promociones, cambios o avisos importantes, los veras aqui."
        primaryAction={{ href: "/app", label: "Ir a inicio", icon: <Home size={16} /> }}
      />
    </div>
  );
}
