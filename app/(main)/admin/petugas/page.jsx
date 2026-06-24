"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Wrench, User, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { getAllUsers, deleteUser, createUserByAdmin } from "@/services/adminService";
import { toast } from "sonner";
import swalAlert from "@/lib/swal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/atoms/dialog";
import { Input } from "@/components/atoms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Label } from "@/components/atoms/label";

export default function KelolaPenggunaPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    password: "",
    role: "petugas"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      if (res.data) setUsers(res.data);
    } catch (error) {
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await swalAlert.fire({
      title: "Hapus pengguna?",
      text: "Data pengguna ini akan dihapus secara permanen dan tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(id);
        toast.success("Pengguna berhasil dihapus");
        fetchUsers();
      } catch (error) {
        toast.error("Gagal menghapus pengguna");
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await createUserByAdmin(formData);
      toast.success("Pengguna baru berhasil ditambahkan");
      setIsAddOpen(false);
      setFormData({ nama: "", username: "", password: "", role: "petugas" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambahkan pengguna");
    }
  };

  const handleEdit = () => {
    swalAlert.fire({
      title: "Fitur Segera Hadir",
      text: "Fitur Edit Pengguna akan segera dirilis pada pembaruan berikutnya.",
      icon: "info",
      confirmButtonText: "Mengerti"
    });
  };

  const getUserDetails = (user) => {
    let icon = User;
    let iconColor = "text-blue-600";
    let badgeColor = "bg-blue-900/50 text-blue-300";

    if (user.role === "admin") {
      icon = ShieldAlert;
      iconColor = "text-indigo-600";
      badgeColor = "bg-indigo-900/50 text-indigo-300";
    } else if (user.role === "petugas") {
      icon = Wrench;
      iconColor = "text-emerald-600";
      badgeColor = "bg-emerald-900/50 text-emerald-300";
    }

    return { icon, iconColor, badgeColor };
  };

  const rolesInfo = [
    { role: "Admin", desc: "Kelola semua data, pengguna, kategori, lihat statistik, hapus laporan", icon: ShieldAlert, color: "text-indigo-400" },
    { role: "Petugas", desc: "Lihat & update status laporan sesuai kategori, lihat riwayat tugas", icon: Wrench, color: "text-emerald-400" },
    { role: "Mahasiswa", desc: "Buat laporan, pantau status laporan milik sendiri", icon: User, color: "text-blue-400" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Kelola Pengguna
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tambah dan atur akun pengguna
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-card border border-border text-foreground hover:bg-muted transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleAddUser}>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input 
                    id="nama" 
                    placeholder="M. Rizki" 
                    value={formData.nama}
                    onChange={(e) => setFormData({...formData, nama: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username / NIM</Label>
                  <Input 
                    id="username" 
                    placeholder="2022310042" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password Baru</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role (Peran)</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="petugas">Petugas Lapangan</SelectItem>
                      <SelectItem value="mahasiswa">Mahasiswa (User)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan Pengguna</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm mt-6">
        <div className="p-4 flex flex-col gap-3 bg-muted/30">
          {loading ? (
            <p className="text-center text-muted-foreground py-4 animate-pulse">Memuat data pengguna...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Belum ada pengguna.</p>
          ) : (
            users.map((u) => {
              const { icon: Icon, iconColor, badgeColor } = getUserDetails(u);
              return (
                <div key={u.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                      <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <div>
                      <h4 className="text-foreground font-bold capitalize">{u.nama}</h4>
                      <div className="text-muted-foreground text-sm mt-1">
                        {u.role} - {u.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize ${badgeColor}`}>
                      {u.role}
                    </span>

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
                        onClick={() => handleDelete(u.id)}
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

      <div className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Hak Akses per Role</h3>
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm">
          {rolesInfo.map((info, i) => {
            const Icon = info.icon;
            return (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
                <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${info.color}`} />
                </div>
                <div>
                  <h4 className="text-foreground font-bold">{info.role}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{info.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
