import { SimpleListPage } from "@/components/ui/SimpleListPage";

export default function StorageHistoryPage() {
  return (
    <SimpleListPage
      title="Historial storage"
      description="Entregas cerradas y actividad reciente."
      items={["A-024 · entregada", "B-011 · entregada", "C-008 · entregada"]}
    />
  );
}
