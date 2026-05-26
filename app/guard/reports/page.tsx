import { SimpleListPage } from "@/components/ui/SimpleListPage";

export default function GuardReportsPage() {
  return (
    <SimpleListPage
      title="Reportes"
      description="Resumen operativo para seguridad."
      items={["Accesos validos: 191", "Accesos denegados: 7", "Aforo actual: 342/600"]}
    />
  );
}
