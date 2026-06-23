"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const dataKategori = [
  { name: "Elektrik", total: 45 },
  { name: "Sanitasi", total: 30 },
  { name: "Furnitur", total: 15 },
  { name: "IT", total: 20 },
];

const dataTren = [
  { name: "Senin", laporan: 5 },
  { name: "Selasa", laporan: 12 },
  { name: "Rabu", laporan: 8 },
  { name: "Kamis", laporan: 15 },
  { name: "Jumat", laporan: 10 },
  { name: "Sabtu", laporan: 2 },
  { name: "Minggu", laporan: 1 },
];

export default function StatistikPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Statistik & Kinerja</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Laporan Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">110</div>
            <p className="text-xs text-emerald-500 mt-1">+12% dari bulan lalu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Rata-rata Waktu Selesai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24 Jam</div>
            <p className="text-xs text-emerald-500 mt-1">-2 jam lebih cepat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Laporan Dieskalasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">8</div>
            <p className="text-xs text-red-500 mt-1">Melewati SLA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Petugas Teraktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Budi (Sanitasi)</div>
            <p className="text-xs text-slate-500 mt-1">Menyelesaikan 25 laporan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Jumlah Laporan per Kategori</CardTitle>
            <CardDescription>Distribusi kerusakan fasilitas kampus</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataKategori}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="total" fill="#605bff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tren Laporan Mingguan</CardTitle>
            <CardDescription>Volume laporan yang masuk setiap harinya</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataTren}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="laporan" stroke="#f25922" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
