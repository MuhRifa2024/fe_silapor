import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Info, AlertTriangle, Wrench, CheckCircle2, Check, X, ClipboardList, Zap, Droplet, Monitor, Sofa } from "lucide-react";
import { getLaporanList } from "@/services/laporanService";

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

export function MahasiswaDashboard({ user }) {
  const username = user?.nama || user?.username || "Mahasiswa";
  const [laporan, setLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLaporanList();
        if (res.data) setLaporan(res.data);
      } catch (error) {
        console.error("Gagal mengambil laporan", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const total = laporan.length;
  const diproses = laporan.filter(l => l.status === "ditugaskan" || l.status === "dikerjakan").length;
  const selesai = laporan.filter(l => l.status === "selesai").length;

  const prioritasTinggi = laporan.find(l => l.prioritas === "tinggi" && l.status !== "selesai");

  return (
    <div className="space-y-8 max-w-4xl pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang, {username}
          </p>
        </div>
        <Link href="/laporan/buat">
          <Button className="bg-card border border-border text-foreground hover:bg-muted font-semibold transition-colors gap-2">
            <Plus className="w-4 h-4" /> Buat Laporan
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Laporan Saya</p>
          <h3 className="text-3xl font-bold text-foreground mb-1">{isLoading ? "..." : total}</h3>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total dibuat</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Sedang Diproses</p>
          <h3 className="text-3xl font-bold text-foreground mb-1">{isLoading ? "..." : diproses}</h3>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-500">Dalam penanganan</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground mb-1">Selesai</p>
          <h3 className="text-3xl font-bold text-foreground mb-1">{isLoading ? "..." : selesai}</h3>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Berhasil ditangani</p>
        </div>
      </div>

      {prioritasTinggi && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
            Laporan <strong>#LPR-{String(prioritasTinggi.id).padStart(3, '0')}</strong> kamu telah dieskalasi ke prioritas tinggi. Petugas sedang menindaklanjuti.
          </p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Laporan Terbaru</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col divide-y divide-border">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Memuat laporan...</div>
          ) : laporan.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-8 text-center">
               <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                 <ClipboardList className="w-6 h-6 text-muted-foreground" />
               </div>
               <p className="text-muted-foreground text-sm">Belum ada laporan</p>
             </div>
          ) : (
            laporan.slice(0, 3).map((item) => {
              const categoryName = item.kategori?.nama_kategori || "Umum";
              const rawDate = item.created_at || item.tanggal || "";
              const parsedDate = rawDate ? new Date(rawDate.replace(" ", "T")) : null;
              const date = parsedDate && !isNaN(parsedDate)
                ? parsedDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                : "—";
              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                      {getCategoryIcon(categoryName)}
                    </div>
                    <div>
                      <h4 className="text-foreground font-semibold line-clamp-1">{item.deskripsi}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{categoryName} · {date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {item.prioritas === "tinggi" && (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                        Prioritas Tinggi
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">Yang bisa dilakukan mahasiswa</h3>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            <Check className="w-4 h-4" /> Buat laporan
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            <Check className="w-4 h-4" /> Pantau status laporan sendiri
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            <Check className="w-4 h-4" /> Lihat riwayat laporan
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 opacity-75">
            <X className="w-4 h-4" /> Lihat laporan orang lain
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 opacity-75">
            <X className="w-4 h-4" /> Ubah status laporan
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 opacity-75">
            <X className="w-4 h-4" /> Akses menu admin
          </span>
        </div>
      </div>
    </div>
  );
}
