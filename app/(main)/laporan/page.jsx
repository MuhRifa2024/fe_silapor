"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLaporanList, deleteLaporan } from "@/services/laporanService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Trash2, Download, Zap, Droplet, Monitor, Sofa, Search, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import swal from "@/lib/swal";

const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || "";
  if (name.includes("listrik") || name.includes("elektrik") || name.includes("ac")) return <Zap className="w-5 h-5 text-rose-500" />;
  if (name.includes("air") || name.includes("sanitasi") || name.includes("toilet") || name.includes("pipa")) return <Droplet className="w-5 h-5 text-blue-500" />;
  if (name.includes("komputer") || name.includes("it") || name.includes("lab") || name.includes("proyektor")) return <Monitor className="w-5 h-5 text-slate-500" />;
  if (name.includes("meja") || name.includes("kursi") || name.includes("furnitur")) return <Sofa className="w-5 h-5 text-emerald-500" />;
  return <Zap className="w-5 h-5 text-rose-500" />;
};

const getStatusColor = (status) => {
  switch (status) {
    case "dilaporkan": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    case "ditugaskan": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50";
    case "dikerjakan": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-500 border-amber-200 dark:border-amber-800/50";
    case "selesai": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50";
    default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
};

export default function LaporanPage() {
  const router = useRouter();
  const [laporan, setLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const fetchLaporan = async () => {
    setIsLoading(true);
    try {
      const res = await getLaporanList();
      if (res.data) setLaporan(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined") {
      try {
        const u = JSON.parse(userStr);
        setUserRole(u.role);
        setUser(u);
      } catch (e) {}
    } else {
      setUserRole("mahasiswa"); // default if not logged in just in case
    }
    setIsAuthLoading(false);
    fetchLaporan();
  }, []);

  const handleDelete = async (id) => {
    const result = await swal.fire({
      title: "Hapus Laporan?",
      text: "Laporan yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteLaporan(id);
      toast.success("Laporan berhasil dihapus");
      fetchLaporan();
    } catch (error) {
      toast.error("Gagal menghapus laporan");
    }
  };

  if (isAuthLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Memeriksa sesi...</div>;
  }

  if (userRole === "mahasiswa") {
    const mahasiswaFiltered = laporan.filter((item) => {
      const matchStatus = filterStatus === "semua" || item.status === filterStatus;
      return matchStatus;
    });

    return (
      <div className="space-y-6 max-w-4xl pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Laporan Saya
            </h1>
            <p className="text-muted-foreground mt-1">
              Pantau pengaduan yang kamu buat
            </p>
          </div>
          <Link href="/laporan/buat">
            <Button className="bg-card border border-border text-foreground hover:bg-muted font-semibold transition-colors gap-2">
              <span className="text-lg leading-none">+</span> Buat Laporan
            </Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-4 flex flex-col gap-4">
          <div className="w-full sm:w-64">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-background border border-border text-foreground rounded-lg h-10">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border">
                <SelectItem value="semua">Semua status</SelectItem>
                <SelectItem value="dilaporkan">Dilaporkan</SelectItem>
                <SelectItem value="ditugaskan">Ditugaskan</SelectItem>
                <SelectItem value="dikerjakan">Dikerjakan</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col divide-y divide-border border border-border rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Memuat laporan...</div>
            ) : mahasiswaFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <ClipboardList className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Belum ada laporan</p>
              </div>
            ) : (
              mahasiswaFiltered.map((item) => {
                const categoryName = item.kategori?.nama_kategori || "Umum";
                const rawDate = item.created_at || item.tanggal || "";
                const parsedDate = rawDate ? new Date(rawDate.replace(" ", "T")) : null;
                const date = parsedDate && !isNaN(parsedDate)
                  ? parsedDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                  : "—";
                return (
                  <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-border bg-background shadow-sm">
                        {getCategoryIcon(categoryName)}
                      </div>
                      <div>
                        <h4 className="text-foreground font-bold line-clamp-1">#{String(item.id).padStart(3, '0')} — {item.deskripsi}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{categoryName} · {date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)} hidden sm:block`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      <Link href={`/laporan/tracking/${item.id}`}>
                        <Button variant="outline" size="sm" className="bg-card border-border hover:bg-muted text-foreground gap-2 h-8">
                          <Eye className="w-3.5 h-3.5" /> Lacak
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Admin/Petugas View ---
  const filteredLaporan = laporan.filter((item) => {
    const matchSearch = item.lokasi?.toLowerCase().includes(search.toLowerCase()) || 
                        item.deskripsi?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "semua" || item.status === filterStatus;
    const itemKategori = item.kategori?.nama_kategori?.toLowerCase() || "";
    const matchKategori = filterKategori === "semua" || itemKategori.includes(filterKategori);
    return matchSearch && matchStatus && matchKategori;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "dilaporkan": return <span className="px-3 py-1 bg-background text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-semibold">Dilaporkan</span>;
      case "ditugaskan": return <span className="px-3 py-1 bg-background text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800 rounded-full text-xs font-semibold">Ditugaskan</span>;
      case "dikerjakan": return <span className="px-3 py-1 bg-background text-amber-600 dark:text-amber-500 border border-amber-300 dark:border-amber-800 rounded-full text-xs font-semibold">Dikerjakan</span>;
      case "selesai": return <span className="px-3 py-1 bg-background text-emerald-600 dark:text-emerald-500 border border-emerald-300 dark:border-emerald-800 rounded-full text-xs font-semibold">Selesai</span>;
      default: return <span className="px-3 py-1 bg-background text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getPrioritasBadge = (prioritas) => {
    if (prioritas === "tinggi") {
      return <span className="text-rose-500 dark:text-rose-400 bg-background border border-rose-300 dark:border-rose-800 rounded-full text-xs font-bold px-3 py-1">Prioritas Tinggi</span>;
    }
    return <span className="text-muted-foreground text-xs font-bold px-2">Normal</span>;
  };

  const getIconBackground = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";
    if (name.includes("listrik") || name.includes("elektrik") || name.includes("ac")) return "bg-rose-50 dark:bg-rose-950/30";
    if (name.includes("komputer") || name.includes("it") || name.includes("lab") || name.includes("proyektor")) return "bg-amber-50 dark:bg-amber-950/30";
    if (name.includes("meja") || name.includes("kursi") || name.includes("furnitur")) return "bg-emerald-50 dark:bg-emerald-950/30";
    return "bg-background";
  };

  const handleExportCSV = () => {
    if (!filteredLaporan || filteredLaporan.length === 0) {
      toast.info("Tidak ada data laporan untuk diekspor");
      return;
    }
    
    const headers = ["ID", "Pelapor", "Kategori", "Lokasi", "Deskripsi", "Status", "Prioritas", "Tanggal"];
    const csvData = filteredLaporan.map(item => [
      item.id,
      `"${item.pelapor?.nama || ""}"`,
      `"${item.kategori?.nama_kategori || "Umum"}"`,
      `"${item.lokasi?.replace(/"/g, '""') || ""}"`,
      `"${item.deskripsi?.replace(/"/g, '""') || ""}"`,
      item.status,
      item.prioritas,
      new Date(item.created_at).toLocaleDateString("id-ID")
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_silapor_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Berhasil mengekspor data laporan");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Semua Laporan
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola seluruh pengaduan masuk
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/laporan/buat">
            <Button variant="outline" className="bg-card border-border text-foreground hover:bg-muted font-semibold transition-colors gap-2">
              <span className="text-lg leading-none">+</span> Buat Laporan
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="bg-card border-border text-foreground hover:bg-muted transition-colors font-semibold"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-card border border-border rounded-xl shadow-sm">
        
        {/* Filters */}
        <div className="p-5 border-b border-border bg-card flex gap-4 flex-wrap">
          <div className="w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-background border-border text-foreground h-11 rounded-xl font-medium">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua status</SelectItem>
                <SelectItem value="dilaporkan">Dilaporkan</SelectItem>
                <SelectItem value="ditugaskan">Ditugaskan</SelectItem>
                <SelectItem value="dikerjakan">Dikerjakan</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger className="bg-background border-border text-foreground h-11 rounded-xl font-medium">
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua kategori</SelectItem>
                <SelectItem value="elektrik">Elektrik</SelectItem>
                <SelectItem value="sanitasi">Sanitasi</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="furnitur">Furnitur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List Content */}
        <div className="p-5 flex flex-col gap-4 bg-background rounded-b-xl">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredLaporan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                 <ClipboardList className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Belum ada laporan yang ditemukan.</p>
            </div>
          ) : (
            <>
              {filteredLaporan.map((item) => {
                const categoryName = item.kategori?.nama_kategori || "Umum";
                const pelaporName = item.pelapor?.nama || "Unknown User";
                return (
                  <div key={item.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-all gap-4">
                    <div className="flex items-center gap-5">
                      {/* Icon Box */}
                      <div className={`w-14 h-14 rounded-2xl border border-border flex items-center justify-center shrink-0 shadow-sm ${getIconBackground(categoryName)}`}>
                        {getCategoryIcon(categoryName)}
                      </div>
                      
                      {/* Details */}
                      <div>
                        <h4 className="text-foreground font-bold text-lg flex items-center gap-2">
                          <span className="text-foreground">#{String(item.id).padStart(3, '0')} — </span> 
                          {item.deskripsi.length > 40 ? item.deskripsi.substring(0, 40) + '...' : item.deskripsi}
                        </h4>
                        <div className="text-muted-foreground font-medium text-sm mt-1 flex flex-wrap items-center gap-1.5">
                          <span>{pelaporName}</span>
                          <span className="text-border mx-1">•</span>
                          <span>{categoryName}</span>
                          <span className="text-border mx-1">•</span>
                          <span>{item.lokasi}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:ml-auto">
                      <div className="hidden sm:block">
                        {getPrioritasBadge(item.prioritas)}
                      </div>
                      
                      <div>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center gap-2 ml-2">
                        <Link href={`/laporan/tracking/${item.id}`}>
                          <Button variant="outline" size="icon" className="h-9 w-9 border-border text-foreground hover:bg-muted rounded-full">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {(userRole === "admin" || userRole === "petugas") && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-9 w-9 border-rose-200 dark:border-rose-900/50 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-full"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="text-right text-sm font-medium text-muted-foreground mt-2 pr-2">
                Menampilkan {filteredLaporan.length} dari {laporan.length} laporan
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
