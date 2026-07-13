"use client";

import { useEffect, useState } from "react";
import { Download, AlertTriangle, Zap, Droplet, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getAdminDashboardStats } from "@/services/adminService";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export function AdminDashboard({ user }) {
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
    { title: "Total Laporan", value: data.total_laporan || 0, sub: "Semua laporan", color: "text-emerald-600 dark:text-emerald-400" },
    { title: "Belum Selesai", value: data.belum_selesai || 0, sub: "Perlu perhatian", color: "text-amber-600 dark:text-amber-400" },
    { title: "Prioritas Aktif", value: data.dieskalasi || 0, sub: "Prioritas tinggi", color: "text-indigo-600 dark:text-indigo-400", highlight: false },
    { title: "Terlambat", value: data.terlambat || 0, sub: "Lewat SLA/Tenggat", color: "text-rose-600 dark:text-rose-400", highlight: true },
  ];

  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 drop-shadow-sm">
            Dashboard Admin
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Pantau seluruh sistem pelaporan, kelola keluhan, dan pastikan fasilitas optimal.
          </p>
        </div>
      </div>

      {data.terlambat > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-rose-500/30 dark:border-rose-500/50 rounded-2xl p-4 flex items-start sm:items-center gap-3 shadow-[0_0_15px_rgba(244,63,94,0.1)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-rose-500/5 dark:bg-rose-500/10 animate-pulse" />
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 sm:mt-0 relative z-10 animate-bounce" />
          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium relative z-10">
            Terdapat <span className="text-rose-600 dark:text-rose-400 font-bold">{data.terlambat}</span> laporan aktif yang melewati batas waktu SLA / Tenggat Waktu. <span className="font-bold underline decoration-rose-500 dark:decoration-rose-400 underline-offset-4 cursor-pointer text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors">Segera pantau petugas.</span>
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`bg-white/50 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 hover:bg-white/70 dark:hover:bg-slate-800/80 border ${
              stat.highlight ? "border-rose-500/30 dark:border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.05)]" : "border-white/80 dark:border-slate-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            }`}
          >
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{stat.title}</p>
            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-1 tracking-tighter">{stat.value}</h3>
            <p className={`text-xs font-semibold ${stat.color}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="space-y-6">
          {/* Laporan Prioritas Tinggi */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 drop-shadow-sm flex items-center gap-2">
              Laporan Prioritas Tinggi
            </h3>
            <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden flex flex-col gap-3 p-5">
              {!data.priority_reports || data.priority_reports.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-6">Tidak ada laporan prioritas tinggi yang aktif.</p>
              ) : (
                data.priority_reports.map((report, i) => {
                  return (
                    <div 
                      key={report.id || i} 
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-white/60 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/15 cursor-pointer hover:bg-white/80 dark:hover:bg-slate-700/80 hover:border-indigo-200 dark:hover:border-indigo-500/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm transition-transform duration-300 group-hover:scale-110">
                          {getCategoryIcon(report.kategori?.nama_kategori)}
                        </div>
                        <div>
                          <h4 className="text-slate-800 dark:text-slate-200 font-bold transition-colors duration-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{report.deskripsi?.substring(0, 30)}{report.deskripsi?.length > 30 ? '...' : ''}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{report.kategori?.nama_kategori || "Umum"} • {report.pelapor?.nama || "User"}</p>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 self-start sm:self-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          report.status === "dikerjakan" 
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50" 
                          : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50"
                        }`}>
                          {report.status || "tinggi"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Laporan Terlambat */}
          <div>
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-4 flex items-center gap-2 drop-shadow-sm">
              <AlertTriangle className="w-5 h-5 animate-pulse" /> Laporan Terlambat
            </h3>
            <div className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border border-rose-100/50 dark:border-rose-900/30 shadow-[0_8px_30px_rgba(244,63,94,0.05)] rounded-3xl overflow-hidden flex flex-col gap-3 p-5 relative">
              {!data.late_reports || data.late_reports.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 font-medium text-center py-6 relative z-10">Tidak ada laporan yang terlambat.</p>
              ) : (
                data.late_reports.map((report, i) => {
                  return (
                    <div 
                      key={report.id || i} 
                      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-rose-200/50 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/20 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/40"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/50 shadow-sm transition-transform duration-300 group-hover:scale-110">
                          {getCategoryIcon(report.kategori?.nama_kategori)}
                        </div>
                        <div>
                          <h4 className="text-slate-800 dark:text-slate-200 font-bold transition-colors duration-300 group-hover:text-rose-700 dark:group-hover:text-rose-400">{report.deskripsi?.substring(0, 30)}{report.deskripsi?.length > 30 ? '...' : ''}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{report.kategori?.nama_kategori || "Umum"} • {report.pelapor?.nama || "User"}</p>
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0 self-start sm:self-center">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {report.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Distribusi per Kategori Chart */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 drop-shadow-sm">Distribusi per Kategori</h3>
          <div className="bg-white/50 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl p-6 h-[400px] transition-all duration-500 hover:bg-white/60 dark:hover:bg-slate-800/80 hover:shadow-2xl hover:shadow-indigo-500/10">
            {data.category_stats && data.category_stats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.category_stats}
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  barSize={16}
                >
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDark ? "#94a3b8" : "#475569", fontWeight: 600, fontSize: 12 }}
                    width={90}
                  />
                  <Tooltip 
                    cursor={{ fill: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.4)" }}
                    contentStyle={{ backgroundColor: isDark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(8px)", borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)", color: isDark ? "#f1f5f9" : "#0f172a", borderRadius: "12px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", fontWeight: "bold" }}
                    itemStyle={{ color: isDark ? "#818cf8" : "#4f46e5", fontWeight: "bold" }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {data.category_stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill === "#605bff" ? (isDark ? "#6366f1" : "#4f46e5") : entry.fill} className="transition-all duration-300 hover:opacity-80 drop-shadow-md" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 dark:text-slate-400 font-medium text-center mt-20">Belum ada data kategori.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
