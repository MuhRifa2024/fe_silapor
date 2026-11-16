"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function LaporanDetailPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    if (unwrappedParams?.id) {
      router.replace(`/laporan/tracking/${unwrappedParams.id}`);
    }
  }, [unwrappedParams, router]);

  return <div className="p-8 text-center text-muted-foreground animate-pulse">Mengalihkan ke halaman tracking...</div>;
}
