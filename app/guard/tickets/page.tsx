import { SimpleListPage } from "@/components/ui/SimpleListPage";

export default function GuardTicketsPage() {
  return (
    <SimpleListPage
      title="Entradas"
      description="Consulta rapida de tickets y estados QR."
      items={["FLEX-DEMO-VALID · valida", "FLEX-DEMO-USED · usada", "Entradas vendidas hoy: 198"]}
    />
  );
}
