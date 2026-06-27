"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function LaporanDetailPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [laporan, setLaporan] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    // Mock Data
    setLaporan({
      id: unwrappedParams.id,
      pelapor: "Andi (12345)",
      kategori: "Elektrik",
      lokasi: "Ruang B201",
      deskripsi: "AC mati dan mengeluarkan air saat dihidupkan.",
      status: "dikerjakan",
      prioritas: "tinggi",
      tanggal_lapor: "2024-03-01T10:00:00Z",
      riwayat: [
        { id: 1, status: "dilaporkan", keterangan: "Laporan dibuat oleh mahasiswa", waktu: "2024-03-01T10:00:00Z" },
        { id: 2, status: "ditugaskan", keterangan: "Sistem otomatis menugaskan ke petugas elektrik", waktu: "2024-03-01T10:05:00Z" },
        { id: 3, status: "ditugaskan", keterangan: "Eskalasi otomatis: melewati batas SLA", waktu: "2024-03-03T10:05:00Z" },
        { id: 4, status: "dikerjakan", keterangan: "Petugas mulai menangani", waktu: "2024-03-03T11:00:00Z" },
      ]
    });
  }, [unwrappedParams.id]);

  if (!laporan || !user) return <div className="p-8">Memuat...</div>;

  const isStaff = user.role === "admin" || user.role === "petugas";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Detail Laporan #{laporan.id}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Laporan</CardTitle>
            <CardDescription>Data lengkap kerusakan fasilitas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 font-medium">Kategori</p>
              <p className="font-semibold">{laporan.kategori}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Lokasi</p>
              <p>{laporan.lokasi}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Deskripsi</p>
              <p className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3 rounded-md mt-1">
                {laporan.deskripsi}
              </p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Status Saat Ini</p>
                <Badge variant={laporan.status === 'selesai' ? 'success' : laporan.status === 'dikerjakan' ? 'warning' : 'default'} className="uppercase">
                  {laporan.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">Prioritas</p>
                {laporan.prioritas === "tinggi" ? (
                  <Badge variant="destructive" className="animate-pulse">TINGGI (ESKALASI)</Badge>
                ) : (
                  <Badge variant="secondary">NORMAL</Badge>
                )}
              </div>
            </div>
            
            {isStaff && (
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium mb-2">Aksi Petugas</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">Set Dikerjakan</Button>
                  <Button size="sm" variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">Set Selesai</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline Status</CardTitle>
            <CardDescription>Riwayat penanganan laporan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6">
              {laporan.riwayat.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="pl-6 relative"
                >
                  <span className="absolute -left-[11px] top-1 bg-white dark:bg-slate-950">
                    {item.status === 'selesai' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : item.keterangan.includes('Eskalasi') ? (
                      <Clock className="h-5 w-5 text-red-500 animate-pulse" />
                    ) : (
                      <Circle className="h-5 w-5 text-blue-500 fill-blue-50 dark:fill-blue-950" />
                    )}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold uppercase text-slate-700 dark:text-slate-300">
                      {item.status}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      {new Date(item.waktu).toLocaleString('id-ID')}
                    </span>
                    <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
                      {item.keterangan}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
