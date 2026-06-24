"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLaporanList, deleteLaporan } from "@/services/laporanService";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Eye, Trash2, Download, Zap, Droplet, Monitor, Sofa, Search, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export default function LaporanPage() {
  const router = useRouter();
  const [laporan, setLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined") {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        // ignore
      }
    }
    fetchLaporan();
  }, []);

  const fetchLaporan = async () => {
    setIsLoading(true);
    try {
      const res = await getLaporanList();
      if (res.data) {
        setLaporan(res.data);
      } else {
        setLaporan([]);
      }
    } catch (error) {
      toast.error("Gagal mengambil riwayat laporan");
      setLaporan([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;
    
    try {
      await deleteLaporan(id);
      toast.success("Laporan berhasil dihapus");
      fetchLaporan();
    } catch (error) {
      toast.error("Gagal menghapus laporan");
    }
  };

  // Filter & Search Logic
  const filteredLaporan = laporan.filter((item) => {
    const matchSearch = item.lokasi?.toLowerCase().includes(search.toLowerCase()) || 
                        item.deskripsi?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "semua" || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "dilaporkan": return <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold">Dilaporkan</span>;
      case "ditugaskan": return <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-xs font-semibold">Ditugaskan</span>;
      case "dikerjakan": return <span className="px-3 py-1 bg-amber-900/50 text-amber-300 rounded-full text-xs font-semibold">Dikerjakan</span>;
      case "selesai": return <span className="px-3 py-1 bg-emerald-900/50 text-emerald-300 rounded-full text-xs font-semibold">Selesai</span>;
      default: return <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const getPrioritasBadge = (prioritas) => {
    if (prioritas === "tinggi") {
      return <span className="text-rose-400 text-xs font-bold px-2">Prioritas Tinggi</span>;
    }
    return <span className="text-slate-500 text-xs font-semibold px-2">Normal</span>;
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";
    if (name.includes("listrik") || name.includes("elektrik") || name.includes("ac")) return <Zap className="w-5 h-5 text-rose-400" />;
    if (name.includes("air") || name.includes("sanitasi") || name.includes("toilet") || name.includes("pipa")) return <Droplet className="w-5 h-5 text-blue-400" />;
    if (name.includes("komputer") || name.includes("it") || name.includes("lab") || name.includes("proyektor")) return <Monitor className="w-5 h-5 text-slate-300" />;
    if (name.includes("meja") || name.includes("kursi") || name.includes("furnitur")) return <Sofa className="w-5 h-5 text-emerald-400" />;
    return <Zap className="w-5 h-5 text-rose-400" />; // default
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Semua Laporan
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelola seluruh pengaduan masuk
          </p>
        </div>
        
        <Button variant="outline" className="bg-[#1e1e24] border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Main Container */}
      <div className="bg-[#1e1e24] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        
        {/* Filters */}
        <div className="p-4 border-b border-slate-800 bg-[#1e1e24] flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Cari lokasi atau deskripsi..."
              className="pl-9 bg-[#151518] border-slate-700 text-slate-200 placeholder:text-slate-500 h-10 w-full rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-[#151518] border-slate-700 text-slate-200 h-10 rounded-lg">
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e24] border-slate-700 text-slate-200">
                <SelectItem value="semua">Semua status</SelectItem>
                <SelectItem value="dilaporkan">Dilaporkan</SelectItem>
                <SelectItem value="ditugaskan">Ditugaskan</SelectItem>
                <SelectItem value="dikerjakan">Dikerjakan</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select defaultValue="semua">
              <SelectTrigger className="bg-[#151518] border-slate-700 text-slate-200 h-10 rounded-lg">
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e1e24] border-slate-700 text-slate-200">
                <SelectItem value="semua">Semua kategori</SelectItem>
                <SelectItem value="elektrik">Elektrik</SelectItem>
                <SelectItem value="sanitasi">Sanitasi</SelectItem>
                <SelectItem value="it">IT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List Content */}
        <div className="p-4 flex flex-col gap-3 bg-[#151518]">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredLaporan.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ClipboardList className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400">Belum ada laporan yang ditemukan.</p>
            </div>
          ) : (
            <>
              {filteredLaporan.map((item) => {
                const categoryName = item.kategori?.nama_kategori || "Umum";
                return (
                  <div key={item.id} className="group flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-[#1e1e24] hover:bg-[#25252c] transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Icon Box */}
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                        {getCategoryIcon(categoryName)}
                      </div>
                      
                      {/* Details */}
                      <div>
                        <h4 className="text-slate-200 font-semibold flex items-center gap-2">
                          <span className="text-slate-500">#{String(item.id).padStart(3, '0')} —</span> 
                          {item.deskripsi.length > 30 ? item.deskripsi.substring(0, 30) + '...' : item.deskripsi}
                        </h4>
                        <div className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                          <span>User ID {item.mahasiswa_id}</span>
                          <span className="text-slate-600">•</span>
                          <span>{categoryName}</span>
                          <span className="text-slate-600">•</span>
                          <span>{item.lokasi}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden sm:block">
                        {getPrioritasBadge(item.prioritas)}
                      </div>
                      
                      <div>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/laporan/${item.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {(userRole === "admin" || userRole === "petugas") && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-rose-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-full"
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
              <div className="text-right text-sm text-slate-500 mt-2 pr-2">
                Menampilkan {filteredLaporan.length} dari {laporan.length} laporan
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
