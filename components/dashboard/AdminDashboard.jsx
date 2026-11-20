"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Zap, Droplet, Monitor, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getAdminDashboardStats } from "@/services/adminService";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export function AdminDashboard({ user }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();

  const fetchStats = async () => {
    try {
      const res = await getAdminDashboardStats();
      if (res.data) {
        setData(res.data);
      }
    } catch (error) {
      toast.error("Gagal mengambil data dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";
    if (name.includes("listrik") || name.includes("elektrik") || name.includes("ac")) return <Zap className="w-5 h-5 text-rose-500" />;
    if (name.includes("air") || name.includes("sanitasi") || name.includes("toilet") || name.includes("pipa")) return <Droplet className="w-5 h-5 text-blue-500" />;
    if (name.includes("komputer") || name.includes("it") || name.includes("lab") || name.includes("proyektor")) return <Monitor className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
    return <Zap className="w-5 h-5 text-rose-500" />;
  };

  if (loading || !data) {
    return <div className="p-8 text-center animate-pulse text-slate-500 dark:text-slate-400 font-medium">Memuat dashboard real-time...</div>;
  }

  const stats = [
    {
      title: "Total Laporan",
      value: data.total_laporan || 0,
      sub: "Semua laporan aktif",
      color: "text-emerald-600 dark:text-emerald-400",
      href: "/laporan",
      highlight: false,
    },
    {
      title: "Belum Selesai",
      value: data.belum_selesai || 0,
      sub: "Perlu perhatian",
      color: "text-amber-600 dark:text-amber-400",
      href: "/laporan?status=aktif",
      highlight: false,
    },
    {
      title: "Prioritas Aktif",
      value: data.dieskalasi || 0,
      sub: "Prioritas tinggi",
      color: "text-indigo-600 dark:text-indigo-400",
      href: "/laporan?prioritas=tinggi",
      highlight: false,
    },
    {
      title: "Terlambat",
      value: data.terlambat || 0,
      sub: "Lewat SLA / Tenggat",
      color: "text-rose-600 dark:text-rose-400",
      href: "/laporan?terlambat=true",
      highlight: (data.terlambat || 0) > 0,
    },
    {
      title: "Selesai",
      value: data.total_selesai || 0,
      sub: "Di riwayat laporan",
      color: "text-blue-600 dark:text-blue-400",
      href: "/riwayat-laporan?status=selesai",
      highlight: false,
    },
    {
      title: "Ditolak",
      value: data.total_ditolak || 0,
      sub: "Di riwayat laporan",
      color: "text-slate-600 dark:text-slate-400",
      href: "/riwayat-laporan?status=ditolak",
      highlight: false,
    },
  ];

  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 drop-shadow-sm">
            Dashboard Admin
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Pantau seluruh sistem pelaporan, kelola keluhan, dan pastikan fasilitas optimal.
          </p>
        </div>
      </div>

      {/* Alert Banner Terlambat (Clickable) */}
      {data.terlambat > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => router.push("/laporan?terlambat=true")}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-rose-500/40 dark:border-rose-500/60 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(244,63,94,0.12)] relative overflow-hidden cursor-pointer hover:bg-rose-50/50 dark:hover:bg-rose-950/40 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-rose-500/5 dark:bg-rose-500/10 pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 animate-bounce" />
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
              Terdapat <span className="text-rose-600 dark:text-rose-400 font-bold">{data.terlambat}</span> laporan aktif yang melewati batas waktu SLA / Tenggat Waktu.{" "}
              <span className="font-bold underline decoration-rose-500 dark:decoration-rose-400 underline-offset-4 text-rose-600 dark:text-rose-400 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">
                Segera pantau petugas.
              </span>
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-rose-500 group-hover:translate-x-1 transition-transform relative z-10 shrink-0" />
        </motion.div>
      )}

      {/* 6 Clickable Statistic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => router.push(stat.href)}
            className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 sm:p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/80 border ${
              stat.highlight
                ? "border-rose-500/40 dark:border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.08)]"
                : "border-white/80 dark:border-slate-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            }`}
          >
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{stat.title}</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">{stat.value}</h3>
            <p className={`text-[11px] font-semibold ${stat.color} flex items-center justify-between`}>
              <span>{stat.sub}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          {/* Laporan Prioritas Tinggi (Clickable Item) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 drop-shadow-sm flex items-center gap-2">
                Laporan Prioritas Tinggi
              </h3>
              <button
                onClick={() => router.push("/laporan?prioritas=tinggi")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden flex flex-col gap-3 p-4 sm:p-5">
              {!data.priority_reports || data.priority_reports.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-6 text-sm">Tidak ada laporan prioritas tinggi yang aktif.</p>
              ) : (
                data.priority_reports.map((report) => (
                  <div 
                    key={report.id} 
                    onClick={() => router.push(`/laporan/tracking/${report.id}`)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-white/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer hover:bg-white/80 dark:hover:bg-slate-700/80 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm transition-transform duration-300 group-hover:scale-110">
                        {getCategoryIcon(report.kategori?.nama_kategori)}
                      </div>
                      <div>
                        <h4 className="text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          #{String(report.id).padStart(3, '0')} — {report.deskripsi?.substring(0, 32)}{report.deskripsi?.length > 32 ? '...' : ''}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          {report.kategori?.nama_kategori || "Umum"} • {report.pelapor?.nama || "User"} ({report.pelapor?.role || "mahasiswa"})
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 sm:mt-0 self-start sm:self-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Laporan Terlambat (Clickable Item) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 drop-shadow-sm">
                <AlertTriangle className="w-4 h-4" /> Laporan Terlambat
              </h3>
              <button
                onClick={() => router.push("/laporan?terlambat=true")}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                Lihat Semua <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-rose-100/50 dark:border-rose-900/30 shadow-[0_8px_30px_rgba(244,63,94,0.05)] rounded-3xl overflow-hidden flex flex-col gap-3 p-4 sm:p-5 relative">
              {!data.late_reports || data.late_reports.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-6 text-sm relative z-10">Tidak ada laporan yang terlambat.</p>
              ) : (
                data.late_reports.map((report) => (
                  <div 
                    key={report.id} 
                    onClick={() => router.push(`/laporan/tracking/${report.id}`)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-rose-200/50 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/40"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/50 shadow-sm transition-transform duration-300 group-hover:scale-110">
                        {getCategoryIcon(report.kategori?.nama_kategori)}
                      </div>
                      <div>
                        <h4 className="text-slate-800 dark:text-slate-200 font-bold text-sm transition-colors duration-300 group-hover:text-rose-700 dark:group-hover:text-rose-400">
                          #{String(report.id).padStart(3, '0')} — {report.deskripsi?.substring(0, 32)}{report.deskripsi?.length > 32 ? '...' : ''}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          {report.kategori?.nama_kategori || "Umum"} • {report.pelapor?.nama || "User"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 sm:mt-0 self-start sm:self-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Distribusi per Kategori Chart (Clickable Bar) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 drop-shadow-sm">
              Distribusi per Kategori
            </h3>
            <span className="text-xs text-muted-foreground">Klik batang untuk memfilter</span>
          </div>
          <div 
            className="bg-white/50 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl p-5 transition-all duration-500 hover:bg-white/60 dark:hover:bg-slate-800/80 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden overflow-y-auto custom-scrollbar"
            style={{ height: "450px" }}
          >
            {data.category_stats && data.category_stats.length > 0 ? (
              <div style={{ height: `${Math.max(380, data.category_stats.length * 55)}px`, minHeight: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={data.category_stats}
                    margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                    barSize={20}
                  >
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: isDark ? "#94a3b8" : "#475569", fontWeight: 600, fontSize: 12 }}
                      width={180}
                    />
                    <Tooltip 
                      cursor={{ fill: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)" }}
                      contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(8px)", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)", color: isDark ? "#f1f5f9" : "#0f172a", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", fontWeight: "bold" }}
                      itemStyle={{ color: isDark ? "#818cf8" : "#4f46e5", fontWeight: "bold" }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 8, 8, 0]} 
                      className="cursor-pointer"
                      onClick={(entry) => {
                        if (entry && entry.id) {
                          router.push(`/laporan?kategori_id=${entry.id}`);
                        }
                      }}
                    >
                      {data.category_stats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill === "#605bff" ? (isDark ? "#6366f1" : "#4f46e5") : entry.fill} 
                          className="transition-all duration-300 hover:opacity-80 drop-shadow-md cursor-pointer" 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 font-medium text-center mt-20">Belum ada data kategori.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
