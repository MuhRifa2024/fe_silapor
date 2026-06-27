"use client";

import { useState, useEffect } from "react";
import { getKategoriList, createKategori, updateKategori, getAllUsers } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Settings, ListPlus, Clock, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function KelolaKategoriPage() {
  const [categories, setCategories] = useState([]);
  const [petugasList, setPetugasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nama_kategori: "",
    sla_jam: 48,
    petugas_id: "0" // "0" berarti unassigned
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [katRes, userRes] = await Promise.all([
        getKategoriList(),
        getAllUsers()
      ]);
      if (katRes.data) setCategories(katRes.data);
      if (userRes.data) {
        const petugasOnly = userRes.data.filter(u => u.role === "petugas");
        setPetugasList(petugasOnly);
      }
    } catch (error) {
      toast.error("Gagal mengambil data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "sla_jam" ? parseInt(value) || 0 : value 
    }));
  };

  const handlePetugasChange = (val) => {
    setFormData((prev) => ({ ...prev, petugas_id: val }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ nama_kategori: "", sla_jam: 48, petugas_id: "0" });
    setIsDialogOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setFormData({
      nama_kategori: cat.nama_kategori,
      sla_jam: cat.sla_jam || 48,
      petugas_id: cat.petugas_id ? cat.petugas_id.toString() : "0"
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nama_kategori: formData.nama_kategori,
        sla_jam: formData.sla_jam,
        petugas_id: formData.petugas_id === "0" ? null : parseInt(formData.petugas_id)
      };

      if (editingId) {
        await updateKategori(editingId, payload);
        toast.success("Kategori berhasil diperbarui");
      } else {
        await createKategori(payload);
        toast.success("Kategori berhasil ditambahkan");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan kategori");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Kelola Kategori
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Atur kategori kerusakan dan tetapkan penanggung jawab (Petugas).
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={openAddModal} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2">
            <Plus className="w-4 h-4" /> Tambah Kategori
          </Button>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nama_kategori">Nama Kategori</Label>
                <Input id="nama_kategori" name="nama_kategori" value={formData.nama_kategori} onChange={handleInputChange} required placeholder="Contoh: Elektrik, IT, Furnitur" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petugas_id">Petugas Penanggung Jawab</Label>
                <Select value={formData.petugas_id} onValueChange={handlePetugasChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih petugas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Tidak Ada (Manual Assignment)</SelectItem>
                    {petugasList.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Jika diatur, laporan baru akan otomatis ditugaskan ke petugas ini.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla_jam">SLA (Batas Waktu Penanganan - Jam)</Label>
                <Input id="sla_jam" name="sla_jam" type="number" min="1" value={formData.sla_jam} onChange={handleInputChange} required />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button type="submit">Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Container */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* List Content */}
        <div className="p-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                 <ListPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Belum ada kategori yang dibuat.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Penanggung Jawab</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-muted-foreground">#{c.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{c.nama_kategori}</TableCell>
                    <TableCell>
                      {c.petugas ? (
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <UserCheck className="w-4 h-4 text-emerald-500" />
                          <span>{c.petugas.nama}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">Belum ditugaskan</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {c.sla_jam} Jam
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-foreground hover:bg-muted"
                        onClick={() => openEditModal(c)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
