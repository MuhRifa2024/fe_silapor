"use client";

import { useEffect, useState } from "react";
import { Download, AlertTriangle, Zap, Droplet, Monitor } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getAdminDashboardStats } from "@/services/adminService";
import { toast } from "sonner";

export function AdminDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

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

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || "";
    if (name.includes("listrik") || name.includes("elektrik") || name.includes("ac")) return <Zap className="w-5 h-5 text-rose-400" />;
    if (name.includes("air") || name.includes("sanitasi") || name.includes("toilet") || name.includes("pipa")) return <Droplet className="w-5 h-5 text-blue-400" />;
    if (name.includes("komputer") || name.includes("it") || name.includes("lab") || name.includes("proyektor")) return <Monitor className="w-5 h-5 text-slate-300" />;
    return <Zap className="w-5 h-5 text-rose-400" />;
  };

  if (loading || !data) {
    return <div className="p-8 text-center animate-pulse text-slate-400">Memuat dashboard real-time...</div>;
  }

  const stats = [
    { title: "Total Laporan", value: data.total_laporan || 0, sub: "Semua laporan", color: "text-emerald-400" },
    { title: "Belum Selesai", value: data.belum_selesai || 0, sub: "Perlu perhatian", color: "text-amber-500" },
    { title: "Dieskalasi Otomatis", value: data.dieskalasi || 0, sub: "Prioritas tinggi", color: "text-rose-500", highlight: true },
    { title: "Total Pengguna", value: data.total_pengguna || 0, sub: "Sistem aktif", color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Dashboard Admin
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pantau seluruh sistem
          </p>
        </div>
        
        <Button variant="outline" className="bg-card border-border text-foreground hover:bg-muted transition-colors">
          <Download className="w-4 h-4 mr-2" /> Unduh Laporan
        </Button>
      </div>

      {data.dieskalasi > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-start sm:items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-primary font-medium">
            {data.dieskalasi} laporan melebihi batas SLA dan diprioritaskan otomatis. <span className="font-bold underline decoration-primary underline-offset-4 cursor-pointer">Segera tindak lanjuti.</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`bg-card border rounded-xl p-5 ${stat.highlight ? "border-rose-500/50" : "border-border"}`}>
            <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
            <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className={`text-xs font-medium ${stat.color}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Laporan Prioritas Tinggi */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Laporan Prioritas Tinggi</h3>
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col gap-3 p-5">
            {!data.priority_reports || data.priority_reports.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Tidak ada laporan prioritas tinggi.</p>
            ) : (
              data.priority_reports.map((report, i) => {
                return (
                  <div key={report.id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border">
                        {getCategoryIcon(report.kategori?.nama_kategori)}
                      </div>
                      <div>
                        <h4 className="text-foreground font-semibold">{report.deskripsi?.substring(0, 20)}...</h4>
                        <p className="text-xs text-muted-foreground mt-1">{report.kategori?.nama_kategori || "Umum"} • {report.pelapor?.nama || "User"}</p>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 self-start sm:self-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        report.status === "dikerjakan" 
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" 
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400"
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

        {/* Distribusi per Kategori Chart */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-4">Distribusi per Kategori</h3>
          <div className="bg-card border border-border rounded-xl p-5 h-[320px]">
            {data.category_stats && data.category_stats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.category_stats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  barSize={12}
                >
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "currentColor", opacity: 0.7, fontSize: 13 }}
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: "var(--color-muted)" }}
                    contentStyle={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)", color: "var(--color-foreground)", borderRadius: "8px" }}
                    itemStyle={{ color: "var(--color-foreground)" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {data.category_stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill === "#605bff" ? "var(--color-primary)" : entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center mt-10">Belum ada data kategori.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
