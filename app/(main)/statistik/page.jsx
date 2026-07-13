"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from "recharts";

import { useState, useEffect } from "react";
import { getLaporanList } from "@/services/laporanService";
import { motion } from "framer-motion";

export default function StatistikPage() {
  const [dataKategori, setDataKategori] = useState([]);
  const [dataTren, setDataTren] = useState([]);
  const [stats, setStats] = useState({
    totalBulanIni: 0,
    rataWaktuSelesai: "0 Jam",
    dieskalasi: 0,
    petugasTeraktif: "Belum ada",
    petugasCount: 0,
    petugasTerbaik: "Belum ada",
    petugasTerbaikMetrik: "Belum ada rating"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getLaporanList();
        const laporan = res.data || [];
        
        // 1. Total Bulan Ini
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const laporanBulanIni = laporan.filter(l => {
          if (!l.tanggal_lapor) return false;
          const d = new Date(l.tanggal_lapor);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        // 2. Kategori Data
        const katMap = {};
        laporan.forEach(l => {
          const k = l.kategori?.nama_kategori || "Umum";
          katMap[k] = (katMap[k] || 0) + 1;
        });
        const katData = Object.keys(katMap).map(k => ({ name: k, total: katMap[k] })).sort((a,b) => b.total - a.total);
        
        // 3. Tren Mingguan
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const trenMap = { "Senin":0, "Selasa":0, "Rabu":0, "Kamis":0, "Jumat":0, "Sabtu":0, "Minggu":0 };
        laporanBulanIni.forEach(l => {
          if (l.tanggal_lapor) {
            const dayName = days[new Date(l.tanggal_lapor).getDay()];
            if (dayName) trenMap[dayName]++;
          }
        });
        const trenData = Object.keys(trenMap).map(k => ({ name: k, laporan: trenMap[k] }));

        // 4. Petugas Teraktif & Petugas Terbaik
        const petMap = {};
        const petRatingMap = {};
        laporan.forEach(l => {
          const petugasNama = l.petugas?.nama || l.kategori?.petugas?.nama;
          if (petugasNama && l.status === "selesai") {
            petMap[petugasNama] = (petMap[petugasNama] || 0) + 1;
            
            if (!petRatingMap[petugasNama]) {
              petRatingMap[petugasNama] = { totalRating: 0, countRating: 0, missedDeadline: 0 };
            }
            if (l.rating && l.rating > 0) {
              petRatingMap[petugasNama].totalRating += l.rating;
              petRatingMap[petugasNama].countRating += 1;
            }
            // Check if missed deadline
            if (l.tenggat_waktu && l.tanggal_selesai) {
              const deadline = new Date(l.tenggat_waktu.replace(" ", "T")).getTime();
              const selesai = new Date(l.tanggal_selesai.replace(" ", "T")).getTime();
              if (selesai > deadline) {
                petRatingMap[petugasNama].missedDeadline += 1;
              }
            } else if (l.prioritas === "tinggi") {
               // Missed SLA
               petRatingMap[petugasNama].missedDeadline += 1;
            }
          }
        });
        
        let topPetugas = "Belum ada";
        let topCount = 0;
        let bestPetugas = "Belum ada";
        let bestScore = -999;
        let bestMetrik = "Belum ada rating";

        for (const [name, count] of Object.entries(petMap)) {
          // Petugas Teraktif
          if (count > topCount) {
            topPetugas = name;
            topCount = count;
          }
          // Petugas Terbaik (Score = (Avg Rating * 10) + (Selesai * 2) - (Missed Deadline * 5))
          const rm = petRatingMap[name];
          if (rm.countRating > 0) {
            const avgRating = rm.totalRating / rm.countRating;
            const score = (avgRating * 10) + (count * 2) - (rm.missedDeadline * 5);
            if (score > bestScore) {
              bestScore = score;
              bestPetugas = name;
              bestMetrik = `★ ${avgRating.toFixed(1)} | ${count} selesai | ${rm.missedDeadline} telat`;
            }
          }
        }

        // 5. Rata-rata Waktu Selesai (Selesai status only)
        const laporanSelesai = laporan.filter(l => l.status === "selesai");
        let avgHours = 0;
        if (laporanSelesai.length > 0) {
          let totalMs = 0;
          let validCount = 0;
          laporanSelesai.forEach(l => {
            if (l.tanggal_lapor && l.tanggal_selesai) {
              const createTime = new Date(l.tanggal_lapor).getTime();
              const finishTime = new Date(l.tanggal_selesai).getTime();
              totalMs += (finishTime - createTime);
              validCount++;
            }
          });
          if (validCount > 0) {
            avgHours = Math.round((totalMs / validCount) / (1000 * 60 * 60));
          }
        }

        // 6. Laporan Dieskalasi
        const dieskalasi = laporan.filter(l => l.prioritas === "tinggi").length;

        setDataKategori(katData);
        setDataTren(trenData);
        setStats({
          totalBulanIni: laporanBulanIni.length,
          rataWaktuSelesai: `${avgHours} Jam`,
          dieskalasi,
          petugasTeraktif: topPetugas,
          petugasCount: topCount,
          petugasTerbaik: bestPetugas,
          petugasTerbaikMetrik: bestMetrik
        });
      } catch (error) {
        console.error("Gagal memuat statistik", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-[1200px] mx-auto">
        <div className="h-10 bg-white/50 dark:bg-slate-800/50 rounded w-1/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1,2,3,4,5].map(i => <div key={i} className="h-28 bg-white/50 dark:bg-slate-800/50 rounded-xl"></div>)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 bg-white/50 dark:bg-slate-800/50 rounded-xl"></div>
          <div className="h-80 bg-white/50 dark:bg-slate-800/50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 drop-shadow-sm transition-colors duration-300">
          Statistik & Kinerja
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Laporan Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.totalBulanIni}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Selama bulan ini</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Rata-rata Waktu Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats.rataWaktuSelesai}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Waktu penanganan efektif</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-rose-200/50 dark:border-rose-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/20 group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-rose-600 dark:text-rose-400">Laporan Dieskalasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.dieskalasi}</div>
            <p className="text-xs text-rose-500/80 dark:text-rose-400/80 mt-1 font-medium">Laporan prioritas tinggi</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Petugas Teraktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.petugasTeraktif}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Menyelesaikan {stats.petugasCount} laporan</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-amber-200/50 dark:border-amber-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/20 group">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-amber-600 dark:text-amber-500 flex items-center gap-1">
              Petugas Terbaik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.petugasTerbaik}</div>
            <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mt-1 font-medium">{stats.petugasTerbaikMetrik}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-100">Jumlah Laporan per Kategori</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Distribusi kerusakan fasilitas kampus</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {dataKategori.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataKategori}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 500, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 500, fontSize: 12 }} />
                  <RechartsTooltip cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.5)", color: "#1e293b", borderRadius: "8px", fontWeight: "bold" }} />
                  <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400 font-medium">Belum ada data</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-100">Tren Laporan Mingguan</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">Volume laporan yang masuk setiap harinya</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataTren}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 500, fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 500, fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.5)", color: "#1e293b", borderRadius: "8px", fontWeight: "bold" }} />
                <Line type="monotone" dataKey="laporan" stroke="#f97316" strokeWidth={4} dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, fill: "#f97316", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
