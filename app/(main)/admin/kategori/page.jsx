"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/atoms/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/atoms/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function KelolaKategoriPage() {
  const [kategori, setKategori] = useState([
    { id: 1, nama: "Elektrik", petugas: "Andi (101)", sla: 48 },
    { id: 2, nama: "Sanitasi", petugas: "Budi (102)", sla: 24 },
    { id: 3, nama: "Furnitur", petugas: "Citra (103)", sla: 72 },
    { id: 4, nama: "IT & Jaringan", petugas: "Dani (104)", sla: 24 },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [nama, setNama] = useState("");
  const [petugas, setPetugas] = useState("");
  const [sla, setSla] = useState("");

  const resetForm = () => {
    setNama("");
    setPetugas("");
    setSla("");
    setEditingId(null);
  };

  const handleOpenEdit = (item) => {
    setNama(item.nama);
    setPetugas(item.petugas);
    setSla(item.sla);
    setEditingId(item.id);
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama || !petugas || !sla) {
      toast.error("Mohon lengkapi semua form");
      return;
    }

    if (editingId) {
      setKategori(kategori.map(k => k.id === editingId ? { ...k, nama, petugas, sla: Number(sla) } : k));
      toast.success("Kategori berhasil diupdate");
    } else {
      const newId = kategori.length > 0 ? Math.max(...kategori.map(k => k.id)) + 1 : 1;
      setKategori([...kategori, { id: newId, nama, petugas, sla: Number(sla) }]);
      toast.success("Kategori berhasil ditambahkan");
    }
    
    setIsOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if(confirm("Yakin ingin menghapus kategori ini?")) {
      setKategori(kategori.filter(k => k.id !== id));
      toast.success("Kategori berhasil dihapus");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Kategori Fasilitas</h1>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-ulbi-blue hover:bg-ulbi-blue/90 text-white gap-2">
              <Plus className="h-4 w-4" /> Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
                <DialogDescription>
                  Isi detail kategori dan atur petugas penanggung jawab serta batas SLA.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nama" className="text-right">
                    Nama Kategori
                  </Label>
                  <Input
                    id="nama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="col-span-3"
                    placeholder="Mis: Taman & Lingkungan"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="petugas" className="text-right">
                    ID Petugas
                  </Label>
                  <Input
                    id="petugas"
                    value={petugas}
                    onChange={(e) => setPetugas(e.target.value)}
                    className="col-span-3"
                    placeholder="Mis: ID Petugas Penanggungjawab"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sla" className="text-right">
                    SLA (Jam)
                  </Label>
                  <Input
                    id="sla"
                    type="number"
                    value={sla}
                    onChange={(e) => setSla(e.target.value)}
                    className="col-span-3"
                    placeholder="Mis: 48"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                <Button type="submit" className="bg-ulbi-blue text-white hover:bg-ulbi-blue/90">Simpan Perubahan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori Tersedia</CardTitle>
          <CardDescription>
            Menentukan petugas otomatis untuk setiap laporan baru berdasarkan kategori ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Penanggung Jawab</TableHead>
                  <TableHead>Batas SLA</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kategori.map((k) => (
                  <TableRow key={k.id}>
                    <TableCell className="font-medium">{k.id}</TableCell>
                    <TableCell>{k.nama}</TableCell>
                    <TableCell>{k.petugas}</TableCell>
                    <TableCell>{k.sla} Jam</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(k)}>
                          <Edit2 className="h-4 w-4 text-ulbi-blue" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(k.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {kategori.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Belum ada data kategori.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
