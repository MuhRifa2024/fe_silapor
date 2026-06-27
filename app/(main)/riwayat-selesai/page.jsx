"use client";

import { useEffect, useState } from "react";
import { getLaporanList } from "@/services/laporanService";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RiwayatSelesaiPage() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getLaporanList();
        const allLaporan = res.data || [];
        // Filter 'selesai'
        setLaporan(allLaporan.filter(l => l.status === "selesai").sort((a,b) => new Date(b.tanggal_selesai) - new Date(a.tanggal_selesai)));
      } catch (error) {
        console.error("Gagal memuat riwayat", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4 p-8 text-center text-muted-foreground">Memuat riwayat...</div>;
  }

  const formatDuration = (start, end) => {
    if (!start || !end) return "Durasi tidak diketahui";
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    if (isNaN(diffMs) || diffMs < 0) return "Durasi tidak diketahui";
    
    const diffMins = Math.round(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins} menit`;
    
    const diffHrs = (diffMins / 60).toFixed(1);
    return `${diffHrs} jam`;
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Riwayat Selesai</h1>
        <p className="text-muted-foreground">Laporan yang sudah ditangani</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
        {laporan.length > 0 ? (
          laporan.map(t => {
            const finishDateStr = t.tanggal_selesai ? new Date(t.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Unknown';
            return (
              <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/50 transition-colors gap-4 sm:gap-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl flex-shrink-0 bg-emerald-500/10 text-emerald-500">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">{t.deskripsi || t.lokasi}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Selesai {finishDateStr} • Durasi: {formatDuration(t.tanggal_lapor, t.tanggal_selesai)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center self-start sm:self-auto ml-16 sm:ml-0">
                  <Badge variant="outline" className="px-4 py-1.5 text-sm font-semibold rounded-full bg-background border-border text-foreground">
                    Selesai
                  </Badge>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground font-medium">Belum ada riwayat tugas yang selesai.</div>
        )}
      </div>
    </div>
  );
}
