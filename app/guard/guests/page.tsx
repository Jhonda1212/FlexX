import { SimpleListPage } from "@/components/ui/SimpleListPage";

export default function GuardGuestsPage() {
  return (
    <SimpleListPage
      title="Invitados VIP"
      description="Control de invitados por sala privada y limite de 10 personas."
      items={["Sala Dorada · 6/10", "Sala Roja · 10/10", "Sala Negra · 3/10"]}
    />
  );
}
