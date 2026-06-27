"use client";

import { useEffect, useState } from "react";
import { getLaporanList } from "@/services/laporanService";
import { Clock, CheckCircle2, AlertTriangle, ArrowRight, X, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function PetugasDashboard({ user }) {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getLaporanList();
        setLaporan(res.data || []);
      } catch (error) {
        console.error("Gagal memuat tugas", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-20 bg-muted rounded-xl"></div>
      <div className="grid grid-cols-3 gap-4"><div className="h-24 bg-muted rounded-xl"></div><div className="h-24 bg-muted rounded-xl"></div><div className="h-24 bg-muted rounded-xl"></div></div>
    </div>;
  }

  // Calculate stats
  const activeTasks = laporan.filter(l => l.status !== "selesai");
  const urgentTasks = activeTasks.filter(l => l.prioritas === "tinggi" || l.status === "ditugaskan");
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const finishedThisMonth = laporan.filter(l => {
    if (l.status !== "selesai" || !l.tanggal_selesai) return false;
    const d = new Date(l.tanggal_selesai);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Calculate average time
  let avgHours = 0;
  if (laporan.filter(l => l.status === "selesai").length > 0) {
    const finished = laporan.filter(l => l.status === "selesai");
    let totalMs = 0;
    let validCount = 0;
    finished.forEach(l => {
      if (l.tanggal_lapor && l.tanggal_selesai) {
        totalMs += (new Date(l.tanggal_selesai).getTime() - new Date(l.tanggal_lapor).getTime());
        validCount++;
      }
    });
    if (validCount > 0) {
      avgHours = (totalMs / validCount / (1000 * 60 * 60)).toFixed(1);
    }
  }

  // Determine Kategori from the first report (since Petugas only sees their assigned category)
  const kategoriName = laporan.length > 0 ? (laporan[0].kategori?.nama_kategori || "Umum") : "Belum ditentukan";

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Petugas</h1>
        <p className="text-muted-foreground">Kategori: {kategoriName}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card border-border border rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-2">Tugas Aktif</p>
          <div className="text-4xl font-bold text-foreground">{activeTasks.length}</div>
          <p className="text-xs text-ulbi-orange mt-2">Perlu ditangani</p>
        </div>
        
        <div className="bg-card border-border border rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-2">Selesai Bulan Ini</p>
          <div className="text-4xl font-bold text-foreground">{finishedThisMonth.length}</div>
          <p className="text-xs text-emerald-500 mt-2">Kerja bagus!</p>
        </div>
        
        <div className="bg-card border-border border rounded-2xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-2">Rata-rata Waktu</p>
          <div className="text-4xl font-bold text-foreground">{avgHours} hr</div>
          <p className="text-xs text-emerald-500 mt-2">Lebih cepat dari SLA</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 text-foreground">Tugas Mendesak</h2>
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
          {urgentTasks.length > 0 ? (
            urgentTasks.slice(0, 5).map(t => (
              <div key={t.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-muted/50 transition-colors gap-4 md:gap-0">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${t.prioritas === 'tinggi' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                    <Zap className="w-5 h-5" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">{t.deskripsi || t.lokasi}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t.lokasi} • {t.prioritas === 'tinggi' ? 'Melewati SLA' : 'Ditugaskan tadi'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-start md:self-auto ml-16 md:ml-0">
                  <Badge variant={t.prioritas === 'tinggi' ? 'destructive' : 'outline'} className={`px-3 py-1 text-xs font-semibold rounded-full ${t.prioritas !== 'tinggi' ? "bg-background text-foreground" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0"}`}>
                    {t.prioritas === 'tinggi' ? 'Prioritas Tinggi' : 'Ditugaskan'}
                  </Badge>
                  <Link href={`/tugas`}>
                    <Button variant="ghost" size="icon" className="rounded-full border border-border hover:bg-muted bg-background">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">Tidak ada tugas mendesak.</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4 mt-8 text-foreground">Yang tidak bisa dilakukan petugas</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 py-1.5 px-3 rounded-full text-sm font-medium">
            <X className="w-4 h-4 mr-1.5" /> Hapus laporan
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 py-1.5 px-3 rounded-full text-sm font-medium">
            <X className="w-4 h-4 mr-1.5" /> Kelola pengguna
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 py-1.5 px-3 rounded-full text-sm font-medium">
            <X className="w-4 h-4 mr-1.5" /> Lihat laporan kategori lain
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 py-1.5 px-3 rounded-full text-sm font-medium">
            <X className="w-4 h-4 mr-1.5" /> Akses statistik sistem
          </Badge>
          
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 py-1.5 px-3 rounded-full text-sm font-medium">
            <Check className="w-4 h-4 mr-1.5" /> Update status laporan
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 py-1.5 px-3 rounded-full text-sm font-medium">
            <Check className="w-4 h-4 mr-1.5" /> Lihat tugas sendiri
          </Badge>
        </div>
      </div>

    </div>
  );
}
