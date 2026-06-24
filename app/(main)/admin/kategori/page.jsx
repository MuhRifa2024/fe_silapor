"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Zap, Droplet, Monitor, AlertCircle } from "lucide-react";
import { Button } from "@/components/atoms/button";
import api from "@/services/api";
import { createKategori } from "@/services/adminService";
import swalAlert from "@/lib/swal";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";

export default function KelolaKategoriPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama_kategori: "",
    sla_jam: 48,
    deskripsi: "",
    petugas_id: null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/kategori");
      if (res.data && res.data.data) {
        setCategories(res.data.data);
      } else if (res.data) {
        setCategories(res.data);
      }
    } catch (error) {
      toast.error("Gagal mengambil data kategori");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await swalAlert.fire({
      title: "Hapus kategori?",
      text: "Kategori ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/kategori/${id}`);
        toast.success("Kategori berhasil dihapus");
        fetchCategories();
      } catch (error) {
        toast.error("Gagal menghapus kategori");
      }
    }
  };

  const handleAddKategori = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        sla_jam: parseInt(formData.sla_jam)
      };
      await createKategori(payload);
      toast.success("Kategori baru berhasil ditambahkan");
      setIsAddOpen(false);
      setFormData({ nama_kategori: "", sla_jam: 48, deskripsi: "", petugas_id: null });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambahkan kategori");
    }
  };

  const handleEdit = () => {
    swalAlert.fire({
      title: "Fitur Segera Hadir",
      text: "Fitur Edit Kategori akan segera dirilis.",
      icon: "info",
      confirmButtonText: "Mengerti"
    });
  };

  const getIcon = (name) => {
    const n = name?.toLowerCase() || "";
    if (n.includes("listrik") || n.includes("ac") || n.includes("elektrik")) return { icon: Zap, color: "text-rose-400" };
    if (n.includes("air") || n.includes("sanitasi") || n.includes("toilet")) return { icon: Droplet, color: "text-blue-400" };
    if (n.includes("it") || n.includes("komputer") || n.includes("proyektor")) return { icon: Monitor, color: "text-indigo-400" };
    return { icon: AlertCircle, color: "text-slate-400" };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Kelola Kategori
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Atur kategori dan penugasan petugas
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-card border border-border text-foreground hover:bg-muted transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddKategori}>
              <DialogHeader>
                <DialogTitle>Tambah Kategori Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nama_kategori">Nama Kategori</Label>
                  <Input 
                    id="nama_kategori" 
                    placeholder="Contoh: AC & Pendingin" 
                    value={formData.nama_kategori}
                    onChange={(e) => setFormData({...formData, nama_kategori: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sla_jam">Target Waktu Selesai (SLA) - Jam</Label>
                  <Input 
                    id="sla_jam" 
                    type="number"
                    min="1"
                    value={formData.sla_jam}
                    onChange={(e) => setFormData({...formData, sla_jam: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan Kategori</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mt-6 p-4 flex flex-col gap-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-4 animate-pulse">Memuat data kategori...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Belum ada kategori fasilitas.</p>
        ) : (
          categories.map((c) => {
            const { icon: Icon, color } = getIcon(c.nama_kategori);
            const pjName = c.petugas ? c.petugas.nama : "Belum ada petugas";
            
            return (
              <div key={c.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div>
                    <h4 className="text-foreground font-bold">{c.nama_kategori}</h4>
                    <div className="text-muted-foreground text-sm mt-1">
                      PJ: <span className="text-foreground font-medium capitalize">{pjName}</span> · SLA: {c.sla_jam || 48} jam
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handleEdit}
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full border border-border"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(c.id)}
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-full border border-rose-200 dark:border-rose-900/50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
