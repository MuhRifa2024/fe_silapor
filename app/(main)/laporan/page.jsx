"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getLaporanList, deleteLaporan, adminUpdateLaporan } from "@/services/laporanService";
import { getKategoriList } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Trash2, Download, Zap, Droplet, Monitor, Sofa, Search, ClipboardList, Settings, X, AlertTriangle, Plus, Users, GraduationCap, BookOpen, Briefcase } from "lucide-react";
import { toast } from "sonner";
import swal from "@/lib/swal";
import { getAllUsers } from "@/services/adminService";

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
    case "ditinjau":
    case "dilaporkan": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    case "diterima":
    case "ditugaskan": return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "diproses":
    case "dikerjakan": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
    case "selesai": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    case "ditolak": return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200 dark:border-rose-800";
    default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
};

function LaporanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [laporan, setLaporan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [activeRoleTab, setActiveRoleTab] = useState("semua");
  const [filterTerlambatOnly, setFilterTerlambatOnly] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Admin Assign Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedReportForAssign, setSelectedReportForAssign] = useState(null);
  const [petugasList, setPetugasList] = useState([]);
  const [assignForm, setAssignForm] = useState({ prioritas: "normal", petugas_id: "none", tenggat_waktu: "" });
  const [isAssigning, setIsAssigning] = useState(false);

  // Sync with URL Query Params (e.g. from Dashboard click)
  useEffect(() => {
    const terlambatParam = searchParams.get("terlambat");
    if (terlambatParam === "true") {
      setFilterTerlambatOnly(true);
    }
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setFilterStatus(statusParam);
    }
    const katParam = searchParams.get("kategori_id");
    if (katParam) {
      setFilterKategori(katParam);
    }
    const roleParam = searchParams.get("role_pelapor");
    if (roleParam) {
      setActiveRoleTab(roleParam);
    }
  }, [searchParams]);

  const fetchPetugasList = async () => {
    try {
      const res = await getAllUsers();
      if (res.data) {
        setPetugasList(res.data.filter((u) => u.role === "petugas"));
      }
    } catch (e) {
      console.error("Gagal memuat petugas", e);
    }
  };

  const fetchLaporan = async () => {
    setIsLoading(true);
    try {
      // Untuk admin, halaman ini hanya menampilkan laporan aktif (riwayat: false)
      // Laporan selesai & ditolak dipindahkan ke /riwayat-laporan
      const params = {};
      const userStr = localStorage.getItem("user");
      let currentRole = "";
      if (userStr && userStr !== "undefined") {
        currentRole = JSON.parse(userStr).role;
      }

      if (currentRole === "admin") {
        params.riwayat = "false";
      }

      const res = await getLaporanList(params);
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
        setUser(u);
        setUserRole(u.role);
        if (u.role === "admin") {
          fetchPetugasList();
        }
      } catch (e) {
        console.error("Invalid user JSON");
      }
    }
    setIsAuthLoading(false);
    fetchLaporan();
    getKategoriList().then((res) => {
      if (res.data) setCategories(res.data);
    }).catch(console.error);
  }, []);

  const handleOpenAssignModal = (report) => {
    setSelectedReportForAssign(report);
    setAssignForm({
      prioritas: report.prioritas || "normal",
      petugas_id: report.petugas_id ? String(report.petugas_id) : "none",
      tenggat_waktu: report.tenggat_waktu ? report.tenggat_waktu.slice(0, 16) : "",
    });
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    setIsAssigning(true);
    try {
      const payload = {
        prioritas: assignForm.prioritas,
      };
      if (assignForm.petugas_id !== "none") {
        payload.petugas_id = parseInt(assignForm.petugas_id);
      } else {
        payload.petugas_id = 0;
      }
      if (assignForm.tenggat_waktu) {
        payload.tenggat_waktu = new Date(assignForm.tenggat_waktu).toISOString();
      } else {
        payload.tenggat_waktu = null;
      }

      await adminUpdateLaporan(selectedReportForAssign.id, payload);
      toast.success("Laporan berhasil diperbarui");
      setIsAssignModalOpen(false);
      fetchLaporan();
    } catch (e) {
      toast.error(e.response?.data?.message || "Gagal memperbarui laporan");
    } finally {
      setIsAssigning(false);
    }
  };

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

  // Helper untuk mengecek apakah laporan melewati batas SLA / tenggat
  const isReportLate = (item) => {
    if (item.status === "selesai" || item.status === "ditolak") return false;
    const now = new Date();
    if (item.tenggat_waktu) {
      return now > new Date(item.tenggat_waktu);
    }
    const slaJam = item.kategori?.sla_jam || 48;
    const reportDate = new Date(item.tanggal_lapor || item.created_at);
    const deadline = new Date(reportDate.getTime() + slaJam * 60 * 60 * 1000);
    return now > deadline;
  };

  // --- Pelapor View (Mahasiswa / Dosen / Staff) ---
  if (userRole === "mahasiswa" || userRole === "dosen" || userRole === "staff") {
    const pelaporFiltered = laporan.filter((item) => {
      const matchStatus = filterStatus === "semua" || item.status === filterStatus ||
        (filterStatus === "ditinjau" && item.status === "dilaporkan") ||
        (filterStatus === "diterima" && item.status === "ditugaskan") ||
        (filterStatus === "diproses" && item.status === "dikerjakan");
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
              Pantau pengaduan fasilitas yang Anda buat
            </p>
          </div>
          <Link href="/laporan/buat">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors gap-2">
              <Plus className="w-4 h-4" /> Buat Laporan
            </Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm p-4 flex flex-col gap-4">
          <div className="w-full sm:w-64">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-background border border-border text-foreground rounded-lg h-10">
                <SelectValue placeholder="Semua status">
                  {filterStatus === "semua" ? "Semua status" : filterStatus ? filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1) : ""}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card border border-border">
                <SelectItem value="semua" label="Semua status">Semua status</SelectItem>
                <SelectItem value="ditinjau" label="Ditinjau">Ditinjau</SelectItem>
                <SelectItem value="diterima" label="Diterima">Diterima</SelectItem>
                <SelectItem value="diproses" label="Diproses">Diproses</SelectItem>
                <SelectItem value="selesai" label="Selesai">Selesai</SelectItem>
                <SelectItem value="ditolak" label="Ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col divide-y divide-border border border-border rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Memuat laporan...</div>
            ) : pelaporFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <ClipboardList className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Belum ada laporan</p>
              </div>
            ) : (
              pelaporFiltered.map((item) => {
                const categoryName = item.kategori?.nama_kategori || "Umum";
                const rawDate = item.tanggal_lapor || item.created_at || "";
                const parsedDate = rawDate ? new Date(rawDate) : null;
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
                        <p className="text-xs text-muted-foreground mt-0.5">{categoryName} · {date} · {item.lokasi}</p>
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
  // Menghitung jumlah per kelompok pelapor
  const countAll = laporan.length;
  const countMhs = laporan.filter((l) => (l.pelapor?.role || "mahasiswa") === "mahasiswa").length;
  const countDsn = laporan.filter((l) => l.pelapor?.role === "dosen").length;
  const countStf = laporan.filter((l) => l.pelapor?.role === "staff").length;
  const countLate = laporan.filter((l) => isReportLate(l)).length;

  const filteredLaporan = laporan.filter((item) => {
    // Filter Pencarian
    const matchSearch =
      item.lokasi?.toLowerCase().includes(search.toLowerCase()) || 
      item.deskripsi?.toLowerCase().includes(search.toLowerCase()) ||
      item.pelapor?.nama?.toLowerCase().includes(search.toLowerCase());

    // Filter Status
    const matchStatus =
      filterStatus === "semua" ||
      (filterStatus === "aktif" && item.status !== "selesai" && item.status !== "ditolak") ||
      item.status === filterStatus ||
      (filterStatus === "ditinjau" && item.status === "dilaporkan") ||
      (filterStatus === "diterima" && item.status === "ditugaskan") ||
      (filterStatus === "diproses" && item.status === "dikerjakan");

    // Filter Kategori
    const matchKategori =
      filterKategori === "semua" ||
      String(item.kategori_id) === String(filterKategori) ||
      (item.kategori?.nama_kategori?.toLowerCase() || "").includes(filterKategori.toLowerCase());

    // Filter Role Pelapor Tab
    const itemRole = item.pelapor?.role || "mahasiswa";
    const matchRole = activeRoleTab === "semua" || itemRole === activeRoleTab;

    // Filter Terlambat
    const matchTerlambat = !filterTerlambatOnly || isReportLate(item);

    return matchSearch && matchStatus && matchKategori && matchRole && matchTerlambat;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "ditinjau":
      case "dilaporkan": return <span className="px-3 py-1 bg-background text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800 rounded-full text-xs font-semibold">Ditinjau</span>;
      case "diterima":
      case "ditugaskan": return <span className="px-3 py-1 bg-background text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-800 rounded-full text-xs font-semibold">Diterima</span>;
      case "diproses":
      case "dikerjakan": return <span className="px-3 py-1 bg-background text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800 rounded-full text-xs font-semibold">Diproses</span>;
      case "selesai": return <span className="px-3 py-1 bg-background text-emerald-600 dark:text-emerald-500 border border-emerald-300 dark:border-emerald-800 rounded-full text-xs font-semibold">Selesai</span>;
      case "ditolak": return <span className="px-3 py-1 bg-background text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 rounded-full text-xs font-semibold">Ditolak</span>;
      default: return <span className="px-3 py-1 bg-background text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

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
    
    const headers = ["ID", "Pelapor", "Role Pelapor", "Kategori", "Lokasi", "Deskripsi", "Status", "Prioritas", "Tanggal Lapor"];
    const csvData = filteredLaporan.map(item => [
      item.id,
      `"${item.pelapor?.nama || ""}"`,
      item.pelapor?.role || "mahasiswa",
      `"${item.kategori?.nama_kategori || "Umum"}"`,
      `"${item.lokasi?.replace(/"/g, '""') || ""}"`,
      `"${item.deskripsi?.replace(/"/g, '""') || ""}"`,
      item.status,
      item.prioritas,
      new Date(item.tanggal_lapor || item.created_at).toLocaleDateString("id-ID")
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `semua_laporan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 drop-shadow-sm">
            Semua Laporan Aktif
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium text-sm">
            Kelola pengaduan yang sedang ditinjau, diterima, atau diproses oleh teknisi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/laporan/buat">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all">
              <Plus className="mr-2 h-4 w-4" /> Buat Laporan
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="bg-card border-border hover:bg-muted text-foreground"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        
        {/* Tab Pengelompokan Berdasarkan Pelapor (Fitur 1) */}
        {userRole === "admin" && (
          <div className="flex items-center border-b border-border bg-muted/40 px-5 pt-3 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveRoleTab("semua")}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeRoleTab === "semua"
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" /> Semua Pelapor
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-foreground font-semibold">
                {countAll}
              </span>
            </button>

            <button
              onClick={() => setActiveRoleTab("mahasiswa")}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeRoleTab === "mahasiswa"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-500" /> Mahasiswa
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
                {countMhs}
              </span>
            </button>

            <button
              onClick={() => setActiveRoleTab("dosen")}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeRoleTab === "dosen"
                  ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500" /> Dosen
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                {countDsn}
              </span>
            </button>

            <button
              onClick={() => setActiveRoleTab("staff")}
              className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                activeRoleTab === "staff"
                  ? "border-purple-600 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="w-4 h-4 text-purple-500" /> Staff
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold">
                {countStf}
              </span>
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="p-4 border-b border-border bg-card flex gap-3 flex-wrap items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari deskripsi, lokasi, nama pelapor..."
              className="pl-9 h-10 bg-background border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Status Aktif */}
          <div className="w-44">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-background border-border h-10 rounded-xl text-xs font-semibold">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua Status Aktif</SelectItem>
                <SelectItem value="ditinjau">Ditinjau</SelectItem>
                <SelectItem value="diterima">Diterima</SelectItem>
                <SelectItem value="diproses">Diproses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Kategori */}
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

          {/* Filter Terlambat Toggle (Fitur 2) */}
          <Button
            type="button"
            variant={filterTerlambatOnly ? "destructive" : "outline"}
            onClick={() => setFilterTerlambatOnly(!filterTerlambatOnly)}
            className={`h-10 rounded-xl text-xs font-bold gap-2 transition-all ${
              filterTerlambatOnly
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Terlambat ({countLate})
          </Button>

          {(filterTerlambatOnly || filterStatus !== "semua" || filterKategori !== "semua" || search !== "" || activeRoleTab !== "semua") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterTerlambatOnly(false);
                setFilterStatus("semua");
                setFilterKategori("semua");
                setActiveRoleTab("semua");
                setSearch("");
                router.replace("/laporan");
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
                 <ClipboardList className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium text-sm">Tidak ada laporan yang sesuai dengan filter.</p>
              {filterTerlambatOnly && (
                <p className="text-xs text-muted-foreground mt-1">Tidak ada laporan aktif yang terlambat.</p>
              )}
            </div>
          ) : (
            <>
              {filteredLaporan.map((item) => {
                const categoryName = item.kategori?.nama_kategori || "Umum";
                const pelaporName = item.pelapor?.nama || "Pengguna";
                const pelaporRole = item.pelapor?.role || "mahasiswa";
                const isLate = isReportLate(item);

                return (
                  <div 
                    key={item.id} 
                    className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                      isLate
                        ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl border border-border flex items-center justify-center shrink-0 shadow-sm ${getIconBackground(categoryName)}`}>
                        {getCategoryIcon(categoryName)}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-foreground font-bold text-base">
                            #{String(item.id).padStart(3, '0')} — {item.deskripsi.length > 45 ? item.deskripsi.substring(0, 45) + '...' : item.deskripsi}
                          </h4>
                          {isLate && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Lewat SLA
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground text-xs mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-foreground">{pelaporName}</span>
                          {getRolePelaporBadge(pelaporRole)}
                          <span className="text-border mx-0.5">•</span>
                          <span>{categoryName}</span>
                          <span className="text-border mx-0.5">•</span>
                          <span>{item.lokasi}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:ml-auto">
                      <div className="hidden sm:block">
                        {getPrioritasBadge(item.prioritas)}
                      </div>
                      
                      <div>
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center gap-1.5 ml-2">
                        {userRole === "admin" && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground h-9 w-9 rounded-xl"
                            onClick={() => handleOpenAssignModal(item)}
                            title="Assign & Prioritas"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}
                        <Link href={`/laporan/tracking/${item.id}`}>
                          <Button variant="secondary" size="icon" className="bg-muted text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {userRole === "admin" && (
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-none h-9 w-9 rounded-xl"
                            onClick={() => handleDelete(item.id)}
                            title="Hapus Laporan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="text-right text-xs font-semibold text-muted-foreground mt-2 pr-2">
                Menampilkan {filteredLaporan.length} dari {laporan.length} laporan aktif
              </div>
            </>
          )}
        </div>
      </div>

      {/* Admin Assign Modal */}
      {isAssignModalOpen && selectedReportForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-foreground">Pengaturan Laporan</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsAssignModalOpen(false)} className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Tingkat Prioritas</label>
                  <Select value={assignForm.prioritas} onValueChange={(val) => setAssignForm({...assignForm, prioritas: val})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih prioritas">
                        {assignForm.prioritas === "normal" ? "Normal" : assignForm.prioritas === "tinggi" ? "Tinggi (Eskalasi)" : ""}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal" label="Normal">Normal</SelectItem>
                      <SelectItem value="tinggi" label="Tinggi (Eskalasi)">Tinggi (Eskalasi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Tugaskan Kepada Petugas</label>
                  <Select value={assignForm.petugas_id} onValueChange={(val) => setAssignForm({...assignForm, petugas_id: val})}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Petugas">
                        {(() => {
                          if (assignForm.petugas_id === "none") return "Sesuai Kategori (Otomatis)";
                          const p = petugasList.find(x => String(x.id) === assignForm.petugas_id);
                          if (!p) return "";
                          const namaKategori = p.kategori_fasilitas && p.kategori_fasilitas.length > 0 
                            ? p.kategori_fasilitas[0].nama_kategori 
                            : "";
                          return namaKategori ? `${p.nama} - ${namaKategori}` : p.nama;
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" label="Sesuai Kategori (Otomatis)">Sesuai Kategori (Otomatis)</SelectItem>
                      {petugasList.map(p => {
                        const namaKategori = p.kategori_fasilitas && p.kategori_fasilitas.length > 0 
                          ? p.kategori_fasilitas[0].nama_kategori 
                          : "";
                        const labelTampil = namaKategori ? `${p.nama} - ${namaKategori}` : p.nama;
                        
                        return (
                          <SelectItem key={p.id} value={String(p.id)} label={labelTampil}>
                            {labelTampil}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground mb-1 block">Tenggat Waktu (Deadline) Khusus</label>
                  <div className="relative">
                    <Input 
                      type="datetime-local" 
                      className="w-full"
                      value={assignForm.tenggat_waktu}
                      onChange={(e) => setAssignForm({...assignForm, tenggat_waktu: e.target.value})}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Kosongkan jika ingin mengikuti SLA bawaan kategori.</p>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setIsAssignModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button 
                    className="flex-1 bg-primary text-primary-foreground font-bold hover:bg-primary/90" 
                    onClick={handleAssignSubmit}
                    disabled={isAssigning}
                  >
                    {isAssigning ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LaporanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Memuat laporan...</div>}>
      <LaporanContent />
    </Suspense>
  );
}
