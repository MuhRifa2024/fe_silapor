"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area 
} from "recharts";
import { 
  Calendar, TrendingUp, BarChart3, Clock, AlertTriangle, Star, 
  Award, CheckCircle2, XCircle, Download, Printer, Filter, 
  ArrowUpRight, FileSpreadsheet, RefreshCw, Layers
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getLaporanList } from "@/services/laporanService";
import { motion, AnimatePresence } from "framer-motion";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

// Helper parsing tanggal aman
const parseDate = (dStr) => {
  if (!dStr) return null;
  const clean = typeof dStr === "string" && dStr.includes(" ") && !dStr.includes("T") 
    ? dStr.replace(" ", "T") 
    : dStr;
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
};

// Format durasi jam ke Hari + Jam
const formatDuration = (hours) => {
  if (!hours || hours <= 0) return "0 Jam";
  if (hours < 24) return `${hours} Jam`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0 ? `${days}h ${remainingHours}j` : `${days} Hari`;
};

// Helper format cell CSV (Mencegah teks terpotong dan menjaga tipe Number)
const escapeCsv = (val, delimiter = ";") => {
  if (val === null || val === undefined) return "";
  const str = String(val).trim();
  // Jika angka murni, biarkan tanpa petik agar Excel mengenali sebagai tipe Angka (bukan teks)
  if (/^-?\d+(\.\d+)?$/.test(str)) {
    return str;
  }
  // Jika mengandung pemisah, petik, atau baris baru, bungkus dengan petik ganda
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export default function StatistikPage() {
  const [laporanRaw, setLaporanRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [trendTab, setTrendTab] = useState("bulanan"); // "mingguan" | "bulanan" | "tahunan"
  const [rekapTab, setRekapTab] = useState("bulanan"); // "bulanan" | "tahunan"

  const fetchData = async () => {
    try {
      const res = await getLaporanList();
      const list = res.data || [];
      setLaporanRaw(list);
    } catch (error) {
      console.error("Gagal memuat data statistik:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // 1. Ekstraksi Tahun yang Tersedia
  const availableYears = useMemo(() => {
    const set = new Set();
    set.add(currentYear);
    laporanRaw.forEach(l => {
      const d = parseDate(l.tanggal_lapor);
      if (d) set.add(d.getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [laporanRaw, currentYear]);

  // 2. Olah Data Metrik Utama & Ringkasan
  const summaryMetrics = useMemo(() => {
    const totalSemua = laporanRaw.length;
    
    // Laporan Bulan Ini (Kalender Saat Ini)
    const bulanIniReports = laporanRaw.filter(l => {
      const d = parseDate(l.tanggal_lapor);
      return d && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Laporan Tahun Terpilih
    const tahunTerpilihReports = laporanRaw.filter(l => {
      const d = parseDate(l.tanggal_lapor);
      return d && d.getFullYear() === Number(selectedYear);
    });

    // Total Selesai pada tahun terpilih
    const selesaiTahunIni = tahunTerpilihReports.filter(l => l.status === "selesai").length;
    const rateTahunIni = tahunTerpilihReports.length > 0 
      ? Math.round((selesaiTahunIni / tahunTerpilihReports.length) * 100) 
      : 0;

    // Rata-rata waktu penyelesaian keseluruhan
    const laporanSelesai = laporanRaw.filter(l => l.status === "selesai");
    let avgHours = 0;
    if (laporanSelesai.length > 0) {
      let totalMs = 0;
      let validCount = 0;
      laporanSelesai.forEach(l => {
        const createTime = parseDate(l.tanggal_lapor);
        const finishTime = parseDate(l.tanggal_selesai);
        if (createTime && finishTime) {
          const diff = finishTime.getTime() - createTime.getTime();
          if (diff > 0) {
            totalMs += diff;
            validCount++;
          }
        }
      });
      if (validCount > 0) {
        avgHours = Math.round((totalMs / validCount) / (1000 * 60 * 60));
      }
    }

    // Dieskalasi (Prioritas Tinggi)
    const dieskalasi = laporanRaw.filter(l => l.prioritas === "tinggi").length;

    // Petugas Teraktif & Terbaik
    const petMap = {};
    const petRatingMap = {};
    laporanRaw.forEach(l => {
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
        // Cek SLA / Deadline
        if (l.tenggat_waktu && l.tanggal_selesai) {
          const dl = parseDate(l.tenggat_waktu)?.getTime();
          const sl = parseDate(l.tanggal_selesai)?.getTime();
          if (dl && sl && sl > dl) {
            petRatingMap[petugasNama].missedDeadline += 1;
          }
        } else if (l.prioritas === "tinggi") {
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
      if (count > topCount) {
        topPetugas = name;
        topCount = count;
      }
      const rm = petRatingMap[name];
      if (rm && rm.countRating > 0) {
        const avgRating = rm.totalRating / rm.countRating;
        const score = (avgRating * 10) + (count * 2) - (rm.missedDeadline * 5);
        if (score > bestScore) {
          bestScore = score;
          bestPetugas = name;
          bestMetrik = `★ ${avgRating.toFixed(1)} | ${count} selesai | ${rm.missedDeadline} telat`;
        }
      }
    }

    return {
      totalSemua,
      totalBulanIni: bulanIniReports.length,
      namaBulanIni: MONTH_NAMES[currentMonth],
      totalTahunTerpilih: tahunTerpilihReports.length,
      selesaiTahunIni,
      rateTahunIni,
      avgHours,
      dieskalasi,
      topPetugas,
      topCount,
      bestPetugas,
      bestMetrik
    };
  }, [laporanRaw, selectedYear, currentMonth, currentYear]);

  // 3. Olah Data Rekapitulasi Bulanan (12 Bulan untuk Selected Year)
  const rekapBulanan = useMemo(() => {
    const list = MONTH_NAMES.map((name, idx) => ({
      idx,
      bulan: idx + 1,
      nama: name,
      short: MONTH_SHORT[idx],
      total: 0,
      selesai: 0,
      diproses: 0,
      ditolak: 0,
      rate: 0,
      avgHours: 0,
      totalMs: 0,
      countDur: 0
    }));

    laporanRaw.forEach(l => {
      const d = parseDate(l.tanggal_lapor);
      if (!d || d.getFullYear() !== Number(selectedYear)) return;
      const m = d.getMonth();
      list[m].total += 1;

      if (l.status === "selesai") {
        list[m].selesai += 1;
        const selDate = parseDate(l.tanggal_selesai);
        if (selDate) {
          const dur = selDate.getTime() - d.getTime();
          if (dur > 0) {
            list[m].totalMs += dur;
            list[m].countDur += 1;
          }
        }
      } else if (l.status === "ditolak") {
        list[m].ditolak += 1;
      } else {
        list[m].diproses += 1;
      }
    });

    list.forEach(item => {
      item.rate = item.total > 0 ? Math.round((item.selesai / item.total) * 100) : 0;
      if (item.countDur > 0) {
        item.avgHours = Math.round((item.totalMs / item.countDur) / (1000 * 60 * 60));
      }
    });

    return list;
  }, [laporanRaw, selectedYear]);

  // Grand Total untuk Rekap Bulanan
  const totalRekapBulanan = useMemo(() => {
    const sum = rekapBulanan.reduce(
      (acc, curr) => ({
        total: acc.total + curr.total,
        selesai: acc.selesai + curr.selesai,
        diproses: acc.diproses + curr.diproses,
        ditolak: acc.ditolak + curr.ditolak,
      }),
      { total: 0, selesai: 0, diproses: 0, ditolak: 0 }
    );
    const rate = sum.total > 0 ? Math.round((sum.selesai / sum.total) * 100) : 0;
    return { ...sum, rate };
  }, [rekapBulanan]);

  // 4. Olah Data Rekapitulasi Tahunan (Multi-Tahun)
  const rekapTahunan = useMemo(() => {
    const yearlyMap = {};
    availableYears.forEach(y => {
      yearlyMap[y] = {
        tahun: y,
        total: 0,
        selesai: 0,
        diproses: 0,
        ditolak: 0,
        rate: 0,
        avgHours: 0,
        totalMs: 0,
        countDur: 0
      };
    });

    laporanRaw.forEach(l => {
      const d = parseDate(l.tanggal_lapor);
      if (!d) return;
      const y = d.getFullYear();
      if (!yearlyMap[y]) {
        yearlyMap[y] = {
          tahun: y,
          total: 0,
          selesai: 0,
          diproses: 0,
          ditolak: 0,
          rate: 0,
          avgHours: 0,
          totalMs: 0,
          countDur: 0
        };
      }
      yearlyMap[y].total += 1;
      if (l.status === "selesai") {
        yearlyMap[y].selesai += 1;
        const selDate = parseDate(l.tanggal_selesai);
        if (selDate) {
          const dur = selDate.getTime() - d.getTime();
          if (dur > 0) {
            yearlyMap[y].totalMs += dur;
            yearlyMap[y].countDur += 1;
          }
        }
      } else if (l.status === "ditolak") {
        yearlyMap[y].ditolak += 1;
      } else {
        yearlyMap[y].diproses += 1;
      }
    });

    return Object.values(yearlyMap)
      .map(item => {
        const rate = item.total > 0 ? Math.round((item.selesai / item.total) * 100) : 0;
        const avgHours = item.countDur > 0 ? Math.round((item.totalMs / item.countDur) / (1000 * 60 * 60)) : 0;
        return { ...item, rate, avgHours };
      })
      .sort((a, b) => b.tahun - a.tahun);
  }, [laporanRaw, availableYears]);

  // 5. Olah Data Tren Mingguan (Senin - Minggu bulan ini)
  const dataTrenMingguan = useMemo(() => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const map = { "Senin": 0, "Selasa": 0, "Rabu": 0, "Kamis": 0, "Jumat": 0, "Sabtu": 0, "Minggu": 0 };
    
    laporanRaw.forEach(l => {
      const d = parseDate(l.tanggal_lapor);
      if (d && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const dayName = days[d.getDay()];
        if (map[dayName] !== undefined) {
          map[dayName]++;
        }
      }
    });

    return ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(k => ({
      name: k,
      laporan: map[k]
    }));
  }, [laporanRaw, currentMonth, currentYear]);

  // 6. Olah Data Kategori
  const dataKategori = useMemo(() => {
    const katMap = {};
    laporanRaw.forEach(l => {
      const k = l.kategori?.nama_kategori || "Umum";
      katMap[k] = (katMap[k] || 0) + 1;
    });
    return Object.keys(katMap)
      .map(k => ({ name: k, total: katMap[k] }))
      .sort((a, b) => b.total - a.total);
  }, [laporanRaw]);

  // 7. GENERATOR TEMPLATE CSV (DENGAN PEMISAH TITIK-KOMA ";" AGAR LANGSUNG BERKOLOM RAPI DI EXCEL)
  const generateCsvBulanan = (delimiter = ";") => {
    const d = delimiter;
    const now = new Date();
    const tanggalCetak = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }) + ", " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

    const headers = [
      "No",
      "Bulan",
      "Tahun",
      "Total Masuk",
      "Selesai",
      "Sedang Diproses",
      "Ditolak",
      "Tingkat Penyelesaian (%)",
      "Rata-rata Waktu",
      "Status Evaluasi"
    ];

    const lines = [
      ["SISTEM INFORMASI PENGADUAN FASILITAS KAMPUS (SILAPOR)"].join(d),
      [`LAPORAN REKAPITULASI PENGADUAN BULANAN - TAHUN ${selectedYear}`].join(d),
      [`Tanggal Ekspor: ${tanggalCetak} | Operator: Administrator Sistem`].join(d),
      [""].join(d),
      headers.map(c => escapeCsv(c, d)).join(d),
      ...rekapBulanan.map((b, i) => {
        let statusKinerja = "Tidak Ada Laporan";
        if (b.total > 0) {
          if (Number(selectedYear) === currentYear && b.idx === currentMonth) {
            statusKinerja = "Sedang Berjalan";
          } else if (b.rate >= 80) {
            statusKinerja = "Optimal";
          } else if (b.rate >= 50) {
            statusKinerja = "Cukup Baik";
          } else {
            statusKinerja = "Perlu Evaluasi";
          }
        }

        return [
          i + 1,
          b.nama,
          selectedYear,
          b.total,
          b.selesai,
          b.diproses,
          b.ditolak,
          `${b.rate}%`,
          b.countDur > 0 ? formatDuration(b.avgHours) : "-",
          statusKinerja
        ].map(c => escapeCsv(c, d)).join(d);
      }),
      [
        "TOTAL",
        `Akumulasi Tahun ${selectedYear}`,
        selectedYear,
        totalRekapBulanan.total,
        totalRekapBulanan.selesai,
        totalRekapBulanan.diproses,
        totalRekapBulanan.ditolak,
        `${totalRekapBulanan.rate}%`,
        formatDuration(summaryMetrics.avgHours),
        "Akumulasi"
      ].map(c => escapeCsv(c, d)).join(d),
      [""].join(d),
      ["--- RINGKASAN INDIKATOR KINERJA UTAMA (KPI) ---"].join(d),
      ["Indikator", "Nilai", "Keterangan"].map(c => escapeCsv(c, d)).join(d),
      ["Total Pengaduan Masuk", totalRekapBulanan.total, `Seluruh laporan fasilitas tahun ${selectedYear}`].map(c => escapeCsv(c, d)).join(d),
      ["Pengaduan Selesai", totalRekapBulanan.selesai, "Berhasil ditangani teknisi"].map(c => escapeCsv(c, d)).join(d),
      ["Sedang Diproses", totalRekapBulanan.diproses, "Dalam tahap pengerjaan"].map(c => escapeCsv(c, d)).join(d),
      ["Pengaduan Ditolak", totalRekapBulanan.ditolak, "Ditolak / tidak relevan"].map(c => escapeCsv(c, d)).join(d),
      ["Tingkat Penyelesaian (SLA)", `${totalRekapBulanan.rate}%`, "Efektivitas penanganan"].map(c => escapeCsv(c, d)).join(d),
      ["Rata-rata Waktu Respons", formatDuration(summaryMetrics.avgHours), "Efektivitas waktu penanganan"].map(c => escapeCsv(c, d)).join(d),
      ["Laporan Dieskalasi", summaryMetrics.dieskalasi, "Prioritas tinggi / risiko SLA"].map(c => escapeCsv(c, d)).join(d),
      ["Petugas Terbaik", summaryMetrics.bestPetugas, summaryMetrics.bestMetrik].map(c => escapeCsv(c, d)).join(d),
      ["Petugas Teraktif", summaryMetrics.topPetugas, `Menyelesaikan ${summaryMetrics.topCount} laporan`].map(c => escapeCsv(c, d)).join(d)
    ];

    return "\uFEFF" + lines.join("\r\n");
  };

  const generateCsvTahunan = (delimiter = ";") => {
    const d = delimiter;
    const now = new Date();
    const tanggalCetak = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }) + ", " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

    const headers = [
      "No",
      "Tahun",
      "Total Laporan Masuk",
      "Selesai",
      "Sedang Diproses",
      "Ditolak",
      "Tingkat Penyelesaian (%)",
      "Rata-rata Waktu",
      "Status Evaluasi"
    ];

    const lines = [
      ["SISTEM INFORMASI PENGADUAN FASILITAS KAMPUS (SILAPOR)"].join(d),
      ["LAPORAN REKAPITULASI PENGADUAN TAHUNAN (MULTI-TAHUN)"].join(d),
      [`Tanggal Ekspor: ${tanggalCetak} | Operator: Administrator Sistem`].join(d),
      [""].join(d),
      headers.map(c => escapeCsv(c, d)).join(d),
      ...rekapTahunan.map((y, i) => {
        let statusEvaluasi = "Perlu Evaluasi";
        if (y.rate >= 80) statusEvaluasi = "Optimal";
        else if (y.rate >= 50) statusEvaluasi = "Cukup Baik";

        return [
          i + 1,
          y.tahun,
          y.total,
          y.selesai,
          y.diproses,
          y.ditolak,
          `${y.rate}%`,
          formatDuration(y.avgHours),
          statusEvaluasi
        ].map(c => escapeCsv(c, d)).join(d);
      }),
      [""].join(d),
      ["--- RINGKASAN KESELURUHAN SISTEM ---"].join(d),
      ["Indikator", "Nilai", "Keterangan"].map(c => escapeCsv(c, d)).join(d),
      ["Total Seluruh Laporan", summaryMetrics.totalSemua, "Akumulasi laporan dari seluruh tahun"].map(c => escapeCsv(c, d)).join(d),
      ["Total Laporan Selesai", laporanRaw.filter(l => l.status === "selesai").length, "Telah tuntas dikerjakan"].map(c => escapeCsv(c, d)).join(d),
      ["Rata-rata Waktu Selesai", formatDuration(summaryMetrics.avgHours), "Efektivitas seluruh teknisi"].map(c => escapeCsv(c, d)).join(d),
      ["Laporan Prioritas Tinggi", summaryMetrics.dieskalasi, "Laporan prioritas tinggi tercatat"].map(c => escapeCsv(c, d)).join(d)
    ];

    return "\uFEFF" + lines.join("\r\n");
  };

  // 8. GENERATOR FORMAT EXCEL (.XLS RESMI DENGAN STYLING WARNA)
  const handleExportExcel = (type) => {
    const isBulanan = type === "bulanan";
    const now = new Date();
    const tanggalCetak = now.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }) + ", " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

    const title = isBulanan ? `Rekapitulasi Bulanan ${selectedYear}` : "Rekapitulasi Tahunan";

    let tableHeaderHtml = "";
    let tableRowsHtml = "";
    let tableFooterHtml = "";

    if (isBulanan) {
      tableHeaderHtml = `
        <tr>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">No</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Bulan</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Tahun</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Total Masuk</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Selesai</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Sedang Diproses</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Ditolak</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Tingkat Penyelesaian (%)</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Rata-rata Waktu</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Status Kinerja</th>
        </tr>
      `;

      tableRowsHtml = rekapBulanan.map((b, i) => {
        let statusKinerja = "Tidak Ada Laporan";
        let statusBg = "#f8fafc";
        let statusColor = "#64748b";
        if (b.total > 0) {
          if (Number(selectedYear) === currentYear && b.idx === currentMonth) {
            statusKinerja = "Sedang Berjalan";
            statusBg = "#e0e7ff";
            statusColor = "#3730a3";
          } else if (b.rate >= 80) {
            statusKinerja = "Optimal (Sangat Baik)";
            statusBg = "#d1fae5";
            statusColor = "#065f46";
          } else if (b.rate >= 50) {
            statusKinerja = "Cukup Baik";
            statusBg = "#dbeafe";
            statusColor = "#1e40af";
          } else {
            statusKinerja = "Perlu Evaluasi";
            statusBg = "#fef3c7";
            statusColor = "#92400e";
          }
        }

        const rowBg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
        return `
          <tr style="background-color:${rowBg};">
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">${i + 1}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;font-weight:bold;">${b.nama}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">${selectedYear}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:bold;color:#1e293b;">${b.total}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;background-color:#d1fae5;color:#065f46;font-weight:bold;">${b.selesai}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;background-color:#fef3c7;color:#92400e;font-weight:bold;">${b.diproses}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;background-color:#ffe4e6;color:#9f1239;font-weight:bold;">${b.ditolak}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:bold;color:#059669;">${b.rate}%</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">${b.countDur > 0 ? formatDuration(b.avgHours) : "-"}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;background-color:${statusBg};color:${statusColor};font-weight:bold;">${statusKinerja}</td>
          </tr>
        `;
      }).join("");

      tableFooterHtml = `
        <tr style="background-color:#e2e8f0;font-weight:bold;border-top:2px solid #475569;">
          <td colspan="3" style="border:1px solid #cbd5e1;padding:8px;font-weight:bold;text-align:right;">TOTAL TAHUN ${selectedYear}:</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;color:#4338ca;font-size:12pt;">${totalRekapBulanan.total}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;color:#065f46;font-size:12pt;background-color:#d1fae5;">${totalRekapBulanan.selesai}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;color:#92400e;font-size:12pt;background-color:#fef3c7;">${totalRekapBulanan.diproses}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;color:#9f1239;font-size:12pt;background-color:#ffe4e6;">${totalRekapBulanan.ditolak}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;color:#059669;font-size:12pt;">${totalRekapBulanan.rate}%</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;">${formatDuration(summaryMetrics.avgHours)}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;color:#4338ca;">Akumulasi</td>
        </tr>
      `;
    } else {
      tableHeaderHtml = `
        <tr>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">No</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Tahun</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Total Pengaduan</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Selesai</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Sedang Diproses</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Ditolak</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Tingkat Penyelesaian (%)</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Rata-rata Waktu Selesai</th>
          <th style="background-color:#4338ca;color:#ffffff;border:1px solid #312e81;padding:8px;font-size:11pt;">Status Evaluasi</th>
        </tr>
      `;

      tableRowsHtml = rekapTahunan.map((y, i) => {
        let statusEvaluasi = "Perlu Evaluasi";
        let statusBg = "#fef3c7";
        let statusColor = "#92400e";
        if (y.rate >= 80) {
          statusEvaluasi = "Optimal (Sangat Baik)";
          statusBg = "#d1fae5";
          statusColor = "#065f46";
        } else if (y.rate >= 50) {
          statusEvaluasi = "Cukup Baik";
          statusBg = "#dbeafe";
          statusColor = "#1e40af";
        }

        const rowBg = i % 2 === 0 ? "#ffffff" : "#f8fafc";
        return `
          <tr style="background-color:${rowBg};">
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">${i + 1}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;font-weight:bold;text-align:center;">Tahun ${y.tahun}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:bold;color:#4338ca;">${y.total}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;background-color:#d1fae5;color:#065f46;font-weight:bold;">${y.selesai}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;background-color:#fef3c7;color:#92400e;font-weight:bold;">${y.diproses}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;background-color:#ffe4e6;color:#9f1239;font-weight:bold;">${y.ditolak}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:bold;color:#059669;">${y.rate}%</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;">${formatDuration(y.avgHours)}</td>
            <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;background-color:${statusBg};color:${statusColor};font-weight:bold;">${statusEvaluasi}</td>
          </tr>
        `;
      }).join("");
    }

    const fullHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${title}</x:Name>
                <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1e293b; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
        </style>
      </head>
      <body>
        <div style="margin-bottom:16px;">
          <h2 style="color:#1e1b4b;margin:0 0 4px 0;font-size:16pt;">SISTEM INFORMASI PENGADUAN FASILITAS KAMPUS (SILAPOR)</h2>
          <h3 style="color:#4338ca;margin:0 0 4px 0;font-size:13pt;">${isBulanan ? `LAPORAN REKAPITULASI PENGADUAN BULANAN - TAHUN ${selectedYear}` : "LAPORAN REKAPITULASI PENGADUAN TAHUNAN"}</h3>
          <p style="color:#64748b;margin:0;font-size:10pt;">Waktu Ekspor: ${tanggalCetak} | Dicetak Oleh: Administrator SiLapor</p>
        </div>

        <table>
          <thead>${tableHeaderHtml}</thead>
          <tbody>${tableRowsHtml}</tbody>
          ${tableFooterHtml ? `<tfoot>${tableFooterHtml}</tfoot>` : ""}
        </table>

        <div style="margin-top:20px;">
          <h4 style="color:#1e293b;margin:0 0 8px 0;font-size:12pt;background-color:#e2e8f0;padding:6px 10px;border-left:4px solid #4338ca;">RINGKASAN INDIKATOR KINERJA UTAMA (KPI)</h4>
          <table style="width:auto;min-width:500px;">
            <tr style="background-color:#f1f5f9;"><th style="border:1px solid #cbd5e1;padding:6px 12px;text-align:left;">Indikator</th><th style="border:1px solid #cbd5e1;padding:6px 12px;text-align:left;">Nilai</th><th style="border:1px solid #cbd5e1;padding:6px 12px;text-align:left;">Catatan</th></tr>
            <tr><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;">Total Pengaduan Masuk</td><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;color:#4338ca;">${isBulanan ? totalRekapBulanan.total : summaryMetrics.totalSemua}</td><td style="border:1px solid #cbd5e1;padding:6px 12px;">Akumulasi pengaduan</td></tr>
            <tr><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;">Pengaduan Selesai</td><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;color:#065f46;">${isBulanan ? totalRekapBulanan.selesai : laporanRaw.filter(l => l.status === "selesai").length}</td><td style="border:1px solid #cbd5e1;padding:6px 12px;">Tuntas dikerjakan teknisi</td></tr>
            <tr><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;">Tingkat Penyelesaian (SLA)</td><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;color:#059669;">${isBulanan ? `${totalRekapBulanan.rate}%` : `${summaryMetrics.rateTahunIni}%`}</td><td style="border:1px solid #cbd5e1;padding:6px 12px;">Rasio penyelesaian</td></tr>
            <tr><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;">Rata-rata Waktu Selesai</td><td style="border:1px solid #cbd5e1;padding:6px 12px;">${formatDuration(summaryMetrics.avgHours)}</td><td style="border:1px solid #cbd5e1;padding:6px 12px;">Waktu respons teknisi</td></tr>
            <tr><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;">Laporan Dieskalasi</td><td style="border:1px solid #cbd5e1;padding:6px 12px;color:#dc2626;font-weight:bold;">${summaryMetrics.dieskalasi}</td><td style="border:1px solid #cbd5e1;padding:6px 12px;">Prioritas tinggi / risiko SLA</td></tr>
            <tr><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;">Petugas Terbaik</td><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;color:#d97706;">${summaryMetrics.bestPetugas}</td><td style="border:1px solid #cbd5e1;padding:6px 12px;">${summaryMetrics.bestMetrik}</td></tr>
            <tr><td style="border:1px solid #cbd5e1;padding:6px 12px;font-weight:bold;">Petugas Teraktif</td><td style="border:1px solid #cbd5e1;padding:6px 12px;">${summaryMetrics.topPetugas}</td><td style="border:1px solid #cbd5e1;padding:6px 12px;">Menyelesaikan ${summaryMetrics.topCount} laporan</td></tr>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fileName = isBulanan ? `Laporan_Bulanan_SiLapor_${selectedYear}.xls` : `Laporan_Tahunan_SiLapor.xls`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 9. Ekspor CSV Handler (Default Titik-Koma ";" agar langsung terpisah kolom di Excel)
  const handleExportCSV = (type, delimiter = ";") => {
    const content = type === "bulanan" ? generateCsvBulanan(delimiter) : generateCsvTahunan(delimiter);
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fileName = type === "bulanan"
      ? `Laporan_Bulanan_SiLapor_${selectedYear}.csv`
      : "Laporan_Tahunan_SiLapor.csv";
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-[1240px] mx-auto pb-10">
        <div className="h-10 bg-white/50 dark:bg-slate-800/50 rounded w-1/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-28 bg-white/50 dark:bg-slate-800/50 rounded-xl"></div>)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-84 bg-white/50 dark:bg-slate-800/50 rounded-xl"></div>
          <div className="h-84 bg-white/50 dark:bg-slate-800/50 rounded-xl"></div>
        </div>
        <div className="h-96 bg-white/50 dark:bg-slate-800/50 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1240px] mx-auto pb-16 print:p-0 print:max-w-none">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/60 pb-6 print:border-none">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Statistik & Kinerja
            </h1>
            <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
              Admin Analytics
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau efektivitas fasilitas kampus, SLA perbaikan, dan rekapitulasi laporan bulanan & tahunan.
          </p>
        </div>

        {/* Global Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {/* Tahun Selector */}
          <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Pilih Tahun Laporan"
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
            >
              {availableYears.map(y => (
                <option key={y} value={y} className="dark:bg-slate-900 dark:text-slate-100">{y}</option>
              ))}
            </select>
          </div>

          {/* Tombol Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Muat Ulang Data"
            className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-500" : ""}`} />
          </button>

          {/* Tombol Cetak */}
          <button
            onClick={handlePrint}
            title="Cetak Halaman Laporan"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>

          {/* Tombol Unduh CSV (Format Titik-Koma Excel) */}
          <button
            onClick={() => handleExportCSV(rekapTab, ";")}
            title="Unduh CSV Format Excel (Pemisah Titik-Koma agar langsung rapi berkolom)"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV ({rekapTab === "bulanan" ? `Bulanan ${selectedYear}` : "Tahunan"})</span>
          </button>

          {/* Tombol Unduh Dokumen Excel (.xls) */}
          <button
            onClick={() => handleExportExcel(rekapTab)}
            title="Unduh File Spreadsheet Excel Resmi (.xls lengkap dengan warna & format rapi)"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xls)</span>
          </button>
        </div>
      </div>

      {/* 1. TOP STATS CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Total Laporan Bulan Ini */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Bulan Ini
              </CardTitle>
              <Calendar className="w-4 h-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              {summaryMetrics.totalBulanIni}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Periode {summaryMetrics.namaBulanIni} {currentYear}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Laporan Tahun Terpilih */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-indigo-200/50 dark:border-indigo-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Tahun {selectedYear}
              </CardTitle>
              <Layers className="w-4 h-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {summaryMetrics.totalTahunTerpilih}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{summaryMetrics.selesaiTahunIni} Selesai</span>
              <span>•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{summaryMetrics.rateTahunIni}% Rate</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Rata-rata Waktu Selesai */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Waktu Selesai
              </CardTitle>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              {formatDuration(summaryMetrics.avgHours)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Rata-rata respons teknisi
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Laporan Dieskalasi */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-rose-200/50 dark:border-rose-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/15">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Dieskalasi
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {summaryMetrics.dieskalasi}
            </div>
            <p className="text-xs text-rose-500/80 dark:text-rose-400/80 mt-1 font-medium">
              Laporan prioritas tinggi / SLA
            </p>
          </CardContent>
        </Card>

        {/* Card 5: Petugas Terbaik */}
        <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-amber-200/50 dark:border-amber-900/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/15">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                Petugas Terbaik
              </CardTitle>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 truncate" title={summaryMetrics.bestPetugas}>
              {summaryMetrics.bestPetugas}
            </div>
            <p className="text-xs text-amber-600/90 dark:text-amber-400/90 mt-1 font-medium truncate">
              {summaryMetrics.bestMetrik}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. CHARTS SECTION (Tren Berkala + Distribusi Kategori) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Chart: Tren Laporan Dinamis (Mingguan / Bulanan / Tahunan) */}
        <Card className="lg:col-span-7 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Tren Laporan Fasilitas
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {trendTab === "mingguan" && "Volume pengaduan harian pada bulan berjalan"}
                {trendTab === "bulanan" && `Statistik 12 bulan sepanjang tahun ${selectedYear}`}
                {trendTab === "tahunan" && "Perbandingan volume laporan antar tahun"}
              </CardDescription>
            </div>

            {/* Toggle Mode Periode Grafik */}
            <div className="inline-flex p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/50 dark:border-slate-700/50 text-xs font-semibold">
              <button
                onClick={() => setTrendTab("mingguan")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  trendTab === "mingguan" 
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setTrendTab("bulanan")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  trendTab === "bulanan" 
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Bulanan ({selectedYear})
              </button>
              <button
                onClick={() => setTrendTab("tahunan")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  trendTab === "tahunan" 
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Tahunan
              </button>
            </div>
          </CardHeader>

          <CardContent className="h-[320px] pt-4">
            {/* VIEW MINGGUAN */}
            {trendTab === "mingguan" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataTrenMingguan}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 500, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 500, fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", fontWeight: "bold" }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="laporan" 
                    name="Laporan Masuk"
                    stroke="#f97316" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }} 
                    activeDot={{ r: 6, fill: "#f97316" }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* VIEW BULANAN (12 Bulan) */}
            {trendTab === "bulanan" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rekapBulanan} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="short" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 500, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 500, fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", fontWeight: "bold" }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="total" name="Total Masuk" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="selesai" name="Selesai Ditangani" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="diproses" name="Sedang Proses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* VIEW TAHUNAN */}
            {trendTab === "tahunan" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...rekapTahunan].reverse()} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="tahun" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 500, fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontWeight: 500, fontSize: 12 }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", fontWeight: "bold" }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="total" name="Total Pengaduan" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="selesai" name="Selesai Ditangani" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="ditolak" name="Ditolak" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Right Chart: Kategori Kerusakan */}
        <Card className="lg:col-span-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Laporan per Kategori
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Distribusi jenis kerusakan fasilitas kampus
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] pt-4">
            {dataKategori.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataKategori} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100}
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }} 
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} 
                    contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: "8px", fontWeight: "bold" }} 
                  />
                  <Bar dataKey="total" name="Total Laporan" fill="#4f46e5" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400 font-medium text-sm">
                Belum ada data laporan
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. DEDICATED REKAPITULASI REPORT SECTION (Laporan Bulanan & Tahunan) */}
      <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
        <CardHeader className="border-b border-slate-200/50 dark:border-slate-800/60 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Tabel Rekapitulasi Laporan Berkala
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Data resmi agregasi bulanan & tahunan untuk pelaporan pertanggungjawaban fasilitas kampus.
              </CardDescription>
            </div>

            {/* Tab Switcher & Export */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-lg border border-slate-200/50 dark:border-slate-700/50 text-xs font-semibold">
                <button
                  onClick={() => setRekapTab("bulanan")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    rekapTab === "bulanan"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Rekap Bulanan ({selectedYear})</span>
                </button>
                <button
                  onClick={() => setRekapTab("tahunan")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    rekapTab === "tahunan"
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Rekap Tahunan (Semua)</span>
                </button>
              </div>

              {/* Tombol Unduh CSV (Pemisah Titik Koma Excel) */}
              <button
                onClick={() => handleExportCSV(rekapTab, ";")}
                title="Unduh format CSV (Pemisah Titik Koma agar langsung rapi di Excel)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV</span>
              </button>

              {/* Tombol Unduh Dokumen Excel (.xls Berwarna) */}
              <button
                onClick={() => handleExportExcel(rekapTab)}
                title="Unduh format Excel Resmi (.xls dengan warna tabel dan border)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Unduh Excel (.xls)</span>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {rekapTab === "bulanan" ? (
              /* TABEL REKAP BULANAN */
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-700/60 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Bulan</th>
                    <th className="py-3 px-4 text-center">Total Masuk</th>
                    <th className="py-3 px-4 text-center">Selesai</th>
                    <th className="py-3 px-4 text-center">Dalam Proses</th>
                    <th className="py-3 px-4 text-center">Ditolak</th>
                    <th className="py-3 px-4 text-center">Tingkat Penyelesaian</th>
                    <th className="py-3 px-4 text-center">Rata-rata Waktu</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-slate-800 dark:text-slate-200 text-xs">
                  {rekapBulanan.map((b, idx) => {
                    const isCurrent = Number(selectedYear) === currentYear && b.idx === currentMonth;
                    return (
                      <tr 
                        key={b.idx}
                        className={`hover:bg-slate-500/5 dark:hover:bg-slate-700/20 transition-colors ${
                          isCurrent ? "bg-indigo-50/40 dark:bg-indigo-950/20 font-medium" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {b.nama}
                          {isCurrent && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                              Berjalan
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800 dark:text-slate-100">
                          {b.total}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                            {b.selesai}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                            {b.diproses}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                            {b.ditolak}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${b.rate}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">
                              {b.rate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400 font-mono">
                          {b.countDur > 0 ? formatDuration(b.avgHours) : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {b.total === 0 ? (
                            <span className="text-slate-400">Tidak ada laporan</span>
                          ) : b.rate >= 80 ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                              <Clock className="w-3.5 h-3.5" /> Berlangsung
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100/90 dark:bg-slate-800/90 font-bold text-xs text-slate-900 dark:text-slate-100 border-t-2 border-slate-300 dark:border-slate-700">
                    <td colSpan={2} className="py-3.5 px-4 uppercase tracking-wider">
                      TOTAL TAHUN {selectedYear}
                    </td>
                    <td className="py-3.5 px-4 text-center font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                      {totalRekapBulanan.total}
                    </td>
                    <td className="py-3.5 px-4 text-center text-emerald-600 dark:text-emerald-400 text-sm">
                      {totalRekapBulanan.selesai}
                    </td>
                    <td className="py-3.5 px-4 text-center text-amber-600 dark:text-amber-400 text-sm">
                      {totalRekapBulanan.diproses}
                    </td>
                    <td className="py-3.5 px-4 text-center text-rose-600 dark:text-rose-400 text-sm">
                      {totalRekapBulanan.ditolak}
                    </td>
                    <td className="py-3.5 px-4 text-center text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {totalRekapBulanan.rate}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                      {formatDuration(summaryMetrics.avgHours)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        Akumulasi
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              /* TABEL REKAP TAHUNAN */
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-700/60 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Tahun</th>
                    <th className="py-3 px-4 text-center">Total Pengaduan</th>
                    <th className="py-3 px-4 text-center">Selesai</th>
                    <th className="py-3 px-4 text-center">Sedang Proses</th>
                    <th className="py-3 px-4 text-center">Ditolak</th>
                    <th className="py-3 px-4 text-center">Tingkat Penyelesaian</th>
                    <th className="py-3 px-4 text-center">Rata-rata Waktu Selesai</th>
                    <th className="py-3 px-4 text-right">Status Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-slate-800 dark:text-slate-200 text-xs">
                  {rekapTahunan.map((y, idx) => {
                    const isSelected = y.tahun === Number(selectedYear);
                    return (
                      <tr 
                        key={y.tahun}
                        className={`hover:bg-slate-500/5 dark:hover:bg-slate-700/20 transition-colors ${
                          isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20 font-medium" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          Tahun {y.tahun}
                          {y.tahun === currentYear && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                              Tahun Ini
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {y.total}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                            {y.selesai}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                            {y.diproses}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                            {y.ditolak}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all"
                                style={{ width: `${y.rate}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 w-9 text-right">
                              {y.rate}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                          {formatDuration(y.avgHours)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {y.rate >= 80 ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sangat Baik
                            </span>
                          ) : y.rate >= 50 ? (
                            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Cukup Baik
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" /> Perlu Evaluasi
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
