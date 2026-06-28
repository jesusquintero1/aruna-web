import { Suspense } from "react";
import type { Metadata } from "next";
import ResultadoClient from "./ResultadoClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resultado del pago",
  robots: { index: false, follow: false },
};

export default function ResultadoPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ResultadoClient />
    </Suspense>
  );
}
