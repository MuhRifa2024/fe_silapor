"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLaporanList } from "@/services/laporanService";
import { Check, Star, ChevronRight, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RiwayatSelesaiPage() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  // Get unique categories for filter dropdown
  const categories = [...new Set(laporan.map(item => item.kategori?.nama_kategori).filter(Boolean))];

  // Apply filters
  const filteredLaporan = laporan.filter(item => {
    const matchesSearch = 
      (item.deskripsi && item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.lokasi && item.lokasi.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || item.kategori?.nama_kategori === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Riwayat Selesai</h1>
          <p className="text-muted-foreground">Laporan yang sudah ditangani</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari laporan..."
              className="pl-9 w-full bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Semua Kategori" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat, idx) => (
                <SelectItem key={idx} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
        {filteredLaporan.length > 0 ? (
          filteredLaporan.map(t => {
            const finishDateStr = t.tanggal_selesai ? new Date(t.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Unknown';
            return (
              <Link href={`/laporan/tracking/${t.id}`} key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-muted/50 transition-colors gap-4 sm:gap-0 group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl flex-shrink-0 bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base group-hover:text-primary transition-colors">{t.deskripsi?.substring(0, 50) || t.lokasi}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Selesai {finishDateStr} • Durasi: {formatDuration(t.tanggal_lapor, t.tanggal_selesai)}
                    </p>
                    {t.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= t.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center self-start sm:self-auto ml-16 sm:ml-0 gap-3">
                  <Badge variant="outline" className="px-4 py-1.5 text-sm font-semibold rounded-full bg-background border-border text-foreground">
                    Selesai
                  </Badge>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground font-medium">
            {laporan.length > 0 ? "Tidak ada laporan yang sesuai dengan filter pencarian." : "Belum ada riwayat tugas yang selesai."}
          </div>
        )}
      </div>
    </div>
  );
}
