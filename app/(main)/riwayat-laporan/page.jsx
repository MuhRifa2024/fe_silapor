"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getLaporanList } from "@/services/laporanService";
import { getKategoriList } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Download, Zap, Droplet, Monitor, Sofa, Search, CheckCircle2, XCircle, Star, GraduationCap, BookOpen, Briefcase, Calendar, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || "";
  if (name.includes("listrik") || name.includes("elektrik") || name.includes("ac")) return <Zap className="w-5 h-5 text-rose-500" />;
  if (name.includes("air") || name.includes("sanitasi") || name.includes("toilet") || name.includes("pipa")) return <Droplet className="w-5 h-5 text-blue-500" />;
  if (name.includes("komputer") || name.includes("it") || name.includes("lab") || name.includes("proyektor")) return <Monitor className="w-5 h-5 text-slate-500" />;
  if (name.includes("meja") || name.includes("kursi") || name.includes("furnitur")) return <Sofa className="w-5 h-5 text-emerald-500" />;
  return <Zap className="w-5 h-5 text-rose-500" />;
};

function RiwayatLaporanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [laporan, setLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua"); // semua, selesai, ditolak
  const [filterKategori, setFilterKategori] = useState("semua");
  const [activeRoleTab, setActiveRoleTab] = useState("semua");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam === "selesai" || statusParam === "ditolak") {
      setFilterStatus(statusParam);
    }
  }, [searchParams]);

  const fetchRiwayat = async () => {
    setIsLoading(true);
    try {
      // Ambil laporan yang statusnya selesai atau ditolak
      const res = await getLaporanList({ riwayat: "true" });
      if (res.data) {
        setLaporan(res.data);
      }
    } catch (error) {
      console.error("Gagal mengambil riwayat laporan", error);
      toast.error("Gagal memuat riwayat laporan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
    getKategoriList().then((res) => {
      if (res.data) setCategories(res.data);
    }).catch(console.error);
  }, []);

  const getRolePelaporBadge = (role) => {
    switch (role) {
      case "dosen":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <BookOpen className="w-3 h-3" /> Dosen
          </span>
        );
      case "staff":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Briefcase className="w-3 h-3" /> Staff
          </span>
        );
      case "mahasiswa":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <GraduationCap className="w-3 h-3" /> Mahasiswa
          </span>
        );
    }
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return "-";
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    if (isNaN(diffMs) || diffMs < 0) return "-";
    const diffMins = Math.round(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins} menit`;
    const diffHours = (diffMins / 60).toFixed(1);
    return `${diffHours} jam`;
  };

  // Counts
  const countSelesai = laporan.filter((l) => l.status === "selesai").length;
  const countDitolak = laporan.filter((l) => l.status === "ditolak").length;

  // Filtered List
  const filteredLaporan = laporan.filter((item) => {
    const matchSearch =
      (item.lokasi && item.lokasi.toLowerCase().includes(search.toLowerCase())) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(search.toLowerCase())) ||
      (item.pelapor?.nama && item.pelapor.nama.toLowerCase().includes(search.toLowerCase()));

    const matchStatus =
      filterStatus === "semua" || item.status === filterStatus;

    const matchKategori =
      filterKategori === "semua" ||
      String(item.kategori_id) === String(filterKategori) ||
      (item.kategori?.nama_kategori?.toLowerCase() || "").includes(filterKategori.toLowerCase());

    const itemRole = item.pelapor?.role || "mahasiswa";
    const matchRole = activeRoleTab === "semua" || itemRole === activeRoleTab;

    return matchSearch && matchStatus && matchKategori && matchRole;
  });

  const handleExportCSV = () => {
    if (!filteredLaporan || filteredLaporan.length === 0) {
      toast.info("Tidak ada data riwayat untuk diekspor");
      return;
    }
    
    const headers = ["ID", "Pelapor", "Role Pelapor", "Kategori", "Lokasi", "Deskripsi", "Status", "Tanggal Lapor", "Tanggal Selesai", "Rating", "Feedback / Alasan"];
    const csvData = filteredLaporan.map(item => [
      item.id,
      `"${item.pelapor?.nama || ""}"`,
      item.pelapor?.role || "mahasiswa",
      `"${item.kategori?.nama_kategori || "Umum"}"`,
      `"${item.lokasi?.replace(/"/g, '""') || ""}"`,
      `"${item.deskripsi?.replace(/"/g, '""') || ""}"`,
      item.status,
      new Date(item.tanggal_lapor || item.created_at).toLocaleDateString("id-ID"),
      item.tanggal_selesai ? new Date(item.tanggal_selesai).toLocaleDateString("id-ID") : "-",
      item.rating || 0,
      `"${(item.feedback || item.alasan_penolakan || "").replace(/"/g, '""')}"`
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `riwayat_laporan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 drop-shadow-sm">
            Riwayat Laporan
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium text-sm">
            Arsip seluruh pengaduan yang telah diselesaikan atau ditolak oleh admin
          </p>
        </div>
        <div>
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="bg-card border-border hover:bg-muted text-foreground"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV Riwayat
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Status Sub-Tabs */}
        <div className="flex items-center border-b border-border bg-muted/40 px-5 pt-3 overflow-x-auto gap-3">
          <button
            onClick={() => setFilterStatus("semua")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              filterStatus === "semua"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua Riwayat
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-foreground font-semibold">
              {laporan.length}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus("selesai")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              filterStatus === "selesai"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Selesai
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
              {countSelesai}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus("ditolak")}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              filterStatus === "ditolak"
                ? "border-rose-600 text-rose-600 dark:text-rose-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-500" /> Ditolak
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold">
              {countDitolak}
            </span>
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border bg-card flex gap-3 flex-wrap items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari deskripsi, lokasi, nama pelapor..."
              className="pl-9 h-10 bg-background border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-44">
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger className="bg-background border-border h-10 rounded-xl text-xs font-semibold">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.nama_kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={activeRoleTab} onValueChange={setActiveRoleTab}>
              <SelectTrigger className="bg-background border-border h-10 rounded-xl text-xs font-semibold">
                <SelectValue placeholder="Role Pelapor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Role</SelectItem>
                <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                <SelectItem value="dosen">Dosen</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(filterStatus !== "semua" || filterKategori !== "semua" || activeRoleTab !== "semua" || search !== "") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterStatus("semua");
                setFilterKategori("semua");
                setActiveRoleTab("semua");
                setSearch("");
                router.replace("/riwayat-laporan");
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-10"
            >
              Reset Filter
            </Button>
          )}
        </div>

        {/* List Content */}
        <div className="p-4 flex flex-col gap-3 bg-background">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredLaporan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium text-sm">Tidak ada riwayat laporan yang ditemukan.</p>
            </div>
          ) : (
            <>
              {filteredLaporan.map((item) => {
                const categoryName = item.kategori?.nama_kategori || "Umum";
                const pelaporName = item.pelapor?.nama || "Pengguna";
                const pelaporRole = item.pelapor?.role || "mahasiswa";
                const isSelesai = item.status === "selesai";

                return (
                  <div
                    key={item.id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-all gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl border border-border flex items-center justify-center shrink-0 shadow-sm ${
                        isSelesai ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40"
                      }`}>
                        {isSelesai ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-foreground font-bold text-base">
                            #{String(item.id).padStart(3, '0')} — {item.deskripsi.length > 50 ? item.deskripsi.substring(0, 50) + '...' : item.deskripsi}
                          </h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isSelesai
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200"
                          }`}>
                            {isSelesai ? "Selesai Ditangani" : "Ditolak Admin"}
                          </span>
                        </div>

                        <div className="text-muted-foreground text-xs mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-foreground">{pelaporName}</span>
                          {getRolePelaporBadge(pelaporRole)}
                          <span className="text-border mx-0.5">•</span>
                          <span>{categoryName}</span>
                          <span className="text-border mx-0.5">•</span>
                          <span>{item.lokasi}</span>
                          {isSelesai && item.tanggal_selesai && (
                            <>
                              <span className="text-border mx-0.5">•</span>
                              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <Clock className="w-3 h-3" /> Durasi: {formatDuration(item.tanggal_lapor, item.tanggal_selesai)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Extra Details: Rating atau Alasan Penolakan */}
                        {isSelesai && item.rating > 0 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= item.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-muted text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            {item.feedback && (
                              <span className="text-xs text-muted-foreground italic truncate max-w-md">
                                "{item.feedback}"
                              </span>
                            )}
                          </div>
                        )}

                        {!isSelesai && item.alasan_penolakan && (
                          <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-200/50">
                            <strong>Alasan Penolakan:</strong> {item.alasan_penolakan}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-auto">
                      <Link href={`/laporan/tracking/${item.id}`}>
                        <Button variant="outline" size="sm" className="h-9 rounded-xl font-semibold gap-1.5">
                          <Eye className="w-4 h-4" /> Lihat Riwayat
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
              <div className="text-right text-xs font-semibold text-muted-foreground mt-2 pr-2">
                Menampilkan {filteredLaporan.length} dari {laporan.length} riwayat laporan
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RiwayatLaporanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Memuat riwayat...</div>}>
      <RiwayatLaporanContent />
    </Suspense>
  );
}
