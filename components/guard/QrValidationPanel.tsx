"use client";

import { useState } from "react";
import { CheckCircle2, QrCode, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import type { QrStatus } from "@/lib/types";
import { validateQrToken } from "@/lib/flex-actions";

type Result = {
  status: QrStatus;
  title: string;
  detail: string;
};

export function QrValidationPanel({ onValidated }: { onValidated?: () => void }) {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function validate() {
    setLoading(true);
    try {
      const data = await validateQrToken(token);
      setResult({
        status: normalizeStatus(data.status),
        title: data.status === "valid" ? "Acceso valido" : "Acceso denegado",
        detail: data.message ?? "QR no reconocido"
      });
      onValidated?.();
    } catch {
      setResult({ status: "invalid", title: "Sin conexion", detail: "No se pudo validar el QR." });
    } finally {
      setLoading(false);
    }
  }

  const valid = result?.status === "valid";

  return (
    <Card>
      <SectionTitle title="Validar QR" />
      <div className="rounded-lg border border-white/10 bg-black/40 p-5">
        <div className="grid min-h-64 place-items-center rounded-lg border border-[var(--gold)]/25 bg-gradient-to-b from-white/[0.04] to-black">
          <QrCode className="text-[var(--gold)]" size={92} />
        </div>
        <div className="mt-5 grid gap-3">
          <input
            className="rounded-md border border-white/10 bg-black px-4 py-4 text-white"
            placeholder="Pegar token QR"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <Button onClick={validate} disabled={!token || loading}>{loading ? "Validando" : "Validar acceso"}</Button>
        </div>
      </div>

      {result ? (
        <div className={`mt-5 rounded-lg border p-5 ${valid ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}>
          <div className="flex items-center gap-3">
            {valid ? <CheckCircle2 className="text-green-300" size={34} /> : <XCircle className="text-red-300" size={34} />}
            <div>
              <div className={valid ? "font-bold text-green-200" : "font-bold text-red-200"}>{result.title}</div>
              <div className="mt-1 text-sm text-white/72">{result.detail}</div>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function normalizeStatus(status: string): QrStatus {
  if (status === "valid" || status === "used" || status === "expired" || status === "full" || status === "inactive") {
    return status;
  }
  return "invalid";
}
