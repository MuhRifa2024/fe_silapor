import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/atoms/table";
import { StatCard } from "@/components/molecules/StatCard";

export function AdminDashboard({ user }) {
  const laporan = [
    { id: 1, pelapor: "Andi (123)", lokasi: "Ruang B201", kategori: "Elektrik", status: "dikerjakan", petugas: "Budi" },
    { id: 2, pelapor: "Budi (124)", lokasi: "Toilet Lt. 2", kategori: "Sanitasi", status: "dilaporkan", petugas: "-" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-ulbi-blue text-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Administrator</h1>
        <p className="text-blue-100 mt-1">Pantau seluruh aktivitas pelaporan dan kinerja petugas.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Masuk" value="120" />
        <StatCard title="Menunggu Tugas" value="15" valueColorClass="text-ulbi-orange" />
        <StatCard title="Sedang Dikerjakan" value="45" valueColorClass="text-amber-500" />
        <StatCard title="Selesai (Bulan Ini)" value="60" valueColorClass="text-emerald-500" />
      </div>

      <Card className="border-t-4 border-t-ulbi-blue shadow-sm">
        <CardHeader>
          <CardTitle>Laporan Membutuhkan Perhatian</CardTitle>
          <CardDescription>Segera tugaskan petugas untuk laporan yang baru masuk.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Petugas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {laporan.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">#{l.id}</TableCell>
                  <TableCell>{l.kategori}</TableCell>
                  <TableCell>{l.lokasi}</TableCell>
                  <TableCell>{l.petugas}</TableCell>
                  <TableCell><Badge variant="outline">{l.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-ulbi-blue hover:text-ulbi-blue/80 hover:bg-ulbi-blue/10">Kelola</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
