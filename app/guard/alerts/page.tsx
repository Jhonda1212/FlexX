import { SimpleListPage } from "@/components/ui/SimpleListPage";

export default function GuardAlertsPage() {
  return (
    <SimpleListPage
      title="Alertas"
      description="Incidencias recientes de QR invalidos, usados o expirados."
      items={["QR invalido detectado en puerta", "Sala Roja completa", "2 tickets expirados rechazados"]}
    />
  );
}
