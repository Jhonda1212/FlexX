"use client";

import { useState } from "react";
import { QrValidationPanel } from "@/components/guard/QrValidationPanel";
import { RecentAccessPanel } from "@/components/guard/RecentAccessPanel";

export default function GuardScanPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <QrValidationPanel onValidated={() => setRefreshKey((current) => current + 1)} />
      <RecentAccessPanel refreshKey={refreshKey} />
    </div>
  );
}
