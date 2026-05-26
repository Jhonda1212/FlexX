import { SimpleListPage } from "@/components/ui/SimpleListPage";

export default function NotificationsPage() {
  return (
    <SimpleListPage
      title="Notificaciones"
      description="Avisos importantes para entradas, canciones, turnos y reservas VIP."
      items={["Tu entrada Jazz Nights esta activa", "Estas en posicion #4", "Sala VIP disponible hasta las 02:00"]}
    />
  );
}
