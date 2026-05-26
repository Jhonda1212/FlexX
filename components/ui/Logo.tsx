export function Logo({ staff = false }: { staff?: boolean }) {
  return (
    <div className="leading-none">
      <div className="font-display text-4xl tracking-[0.08em] text-white">FLEX</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.34em] text-[var(--gold)]">
        {staff ? "Staff" : "Live Sessions"}
      </div>
    </div>
  );
}
