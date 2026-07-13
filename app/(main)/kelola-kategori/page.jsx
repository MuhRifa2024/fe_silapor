"use client";

import { useState, useEffect } from "react";
import { getKategoriList, createKategori, updateKategori, deleteKategori, getAllUsers } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Settings, ListPlus, Clock, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

export default function KelolaKategoriPage() {
  const [categories, setCategories] = useState([]);
  const [petugasList, setPetugasList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nama_kategori: "",
    sla_jam: 48,
    petugas_id: "0" 
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

  const handleDelete = async (id, namaKategori) => {
    Swal.fire({
      title: "Hapus Kategori?",
      text: `Anda yakin ingin menghapus kategori "${namaKategori}"? Laporan yang terhubung mungkin akan kehilangan referensi kategori.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#0f172a',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteKategori(id);
          toast.success("Kategori berhasil dihapus");
          fetchData();
        } catch (error) {
          toast.error(error.response?.data?.message || "Gagal menghapus kategori");
        }
      }
    });
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/20 dark:border-slate-700/50 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 drop-shadow-sm transition-colors duration-300 flex items-center gap-2">
            Kelola Kategori
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium transition-colors duration-300">
            Atur kategori kerusakan dan tetapkan penanggung jawab (Petugas).
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={openAddModal} className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-xl px-5">
            <Plus className="w-4 h-4" /> Tambah Kategori
          </Button>
          
          <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/50 dark:border-slate-700/50">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100">{editingId ? "Edit Kategori" : "Tambah Kategori Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nama_kategori" className="text-slate-700 dark:text-slate-300">Nama Kategori</Label>
                <Input id="nama_kategori" name="nama_kategori" value={formData.nama_kategori} onChange={handleInputChange} required placeholder="Contoh: Elektrik, IT, Furnitur" className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="petugas_id" className="text-slate-700 dark:text-slate-300">Petugas Penanggung Jawab</Label>
                <Select value={formData.petugas_id} onValueChange={handlePetugasChange}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Pilih petugas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Tidak Ada (Manual Assignment)</SelectItem>
                    {petugasList.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400">Jika diatur, laporan baru akan otomatis ditugaskan ke petugas ini.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla_jam" className="text-slate-700 dark:text-slate-300">SLA (Batas Waktu Penanganan - Jam)</Label>
                <Input id="sla_jam" name="sla_jam" type="number" min="1" value={formData.sla_jam} onChange={handleInputChange} required className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100" />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-slate-700 dark:text-slate-300">Batal</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Container */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden transition-colors duration-300">
        {/* List Content */}
        <div className="p-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-white/50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                 <ListPlus className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Belum ada kategori yang dibuat.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
                  <TableHead className="w-[80px] text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">ID</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Nama Kategori</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Penanggung Jawab</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">SLA</TableHead>
                  <TableHead className="text-right text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id} className="border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/50 transition-colors duration-300">
                    <TableCell className="font-bold text-indigo-500 dark:text-indigo-400">#{c.id}</TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-100">{c.nama_kategori}</TableCell>
                    <TableCell>
                      {c.petugas ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          <UserCheck className="w-4 h-4" />
                          <span>{c.petugas.nama}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 text-sm italic">Belum ditugaskan</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        {c.sla_jam} Jam
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-full transition-all duration-300"
                          onClick={() => openEditModal(c)}
                          title="Edit Kategori"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-full transition-all duration-300"
                          onClick={() => handleDelete(c.id, c.nama_kategori)}
                          title="Hapus Kategori"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
