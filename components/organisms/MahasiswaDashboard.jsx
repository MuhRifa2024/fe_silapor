import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { PlusCircle, Clock, CheckCircle2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/molecules/StatCard";
import { ReportCard } from "@/components/molecules/ReportCard";

export function MahasiswaDashboard({ user }) {
  const stats = { total: 5, diproses: 2, selesai: 3 };
  const laporan = [
    { id: 1, lokasi: "Ruang B201", kategori: "Elektrik", status: "dikerjakan", prioritas: "normal", tanggal: "2024-03-01 10:00" },
    { id: 2, lokasi: "Toilet Lt. 2", kategori: "Sanitasi", status: "dilaporkan", prioritas: "tinggi", tanggal: "2024-02-28 14:00" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ulbi-blue">Halo, {user?.username}!</h1>
          <p className="text-slate-500">Selamat datang di Dashboard Mahasiswa SiLapor.</p>
        </div>
        <Link href="/laporan/baru">
          <Button className="bg-ulbi-orange hover:bg-[#d94a1a] text-white gap-2 rounded-full px-6">
            <PlusCircle className="h-5 w-5" /> Buat Laporan Baru
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Total Laporanku" 
          value={stats.total} 
          icon={FileText} 
          borderTopColor="border-t-ulbi-blue" 
          iconColorClass="text-ulbi-blue" 
        />
        <StatCard 
          title="Sedang Diproses" 
          value={stats.diproses} 
          icon={Clock} 
          borderTopColor="border-t-amber-500" 
          iconColorClass="text-amber-500" 
        />
        <StatCard 
          title="Selesai" 
          value={stats.selesai} 
          icon={CheckCircle2} 
          borderTopColor="border-t-emerald-500" 
          iconColorClass="text-emerald-500" 
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">Laporan Terkini</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {laporan.map((item, idx) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <ReportCard {...item} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
