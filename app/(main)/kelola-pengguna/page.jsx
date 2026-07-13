"use client";

import { useState, useEffect } from "react";
import { getAllUsers, createUserByAdmin, deleteUser } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, Search, Shield, UserCog, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import swal from "@/lib/swal";
import { motion } from "framer-motion";

export default function KelolaPenggunaPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    password: "",
    role: "petugas"
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getAllUsers();
      if (res.data) setUsers(res.data);
    } catch (error) {
      toast.error("Gagal mengambil data pengguna");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (val) => {
    setFormData((prev) => ({ ...prev, role: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUserByAdmin(formData);
      toast.success("Pengguna berhasil ditambahkan");
      setIsDialogOpen(false);
      setFormData({ nama: "", username: "", password: "", role: "petugas" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambahkan pengguna");
    }
  };

  const handleDelete = async (id) => {
    const result = await swal.fire({
      title: "Hapus Pengguna?",
      text: "Tindakan ini tidak bisa dibatalkan. Akun akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteUser(id);
      toast.success("Pengguna berhasil dihapus");
      fetchUsers();
    } catch (error) {
      toast.error("Gagal menghapus pengguna");
    }
  };

  const filteredUsers = users.filter((u) => 
    u.nama.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return <Shield className="w-4 h-4 text-rose-500" />;
      case "petugas": return <UserCog className="w-4 h-4 text-indigo-500" />;
      case "mahasiswa": return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      default: return <Users className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin": return <span className="px-2.5 py-1 bg-rose-100/80 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-800 shadow-sm">Admin</span>;
      case "petugas": return <span className="px-2.5 py-1 bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800 shadow-sm">Petugas</span>;
      case "mahasiswa": return <span className="px-2.5 py-1 bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 shadow-sm">Mahasiswa</span>;
      default: return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold shadow-sm">{role}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-700/50 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 drop-shadow-sm transition-colors duration-300 flex items-center gap-2">
            Kelola Pengguna
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium transition-colors duration-300">
            Tambahkan dan kelola akun Petugas, Admin, atau Mahasiswa.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-xl px-5">
            <Plus className="w-4 h-4" /> Tambah Pengguna
          </Button>
          <DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/50 dark:border-slate-700/50">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100">Tambah Pengguna Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-slate-700 dark:text-slate-300">Nama Lengkap</Label>
                <Input id="nama" name="nama" value={formData.nama} onChange={handleInputChange} required placeholder="Masukkan nama lengkap" className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">Username</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleInputChange} required placeholder="Masukkan username" className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required minLength={6} placeholder="Minimal 6 karakter" className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-700 dark:text-slate-300">Peran (Role)</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="petugas">Petugas</SelectItem>
                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-slate-700 dark:text-slate-300">Batal</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Simpan Pengguna</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Container */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden transition-colors duration-300">
        {/* Search */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Cari nama, username, atau role..."
              className="pl-9 h-10 w-full bg-white/50 dark:bg-slate-950/50 border-white/60 dark:border-slate-700/50 focus-visible:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List Content */}
        <div className="p-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-white/50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
                 <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Tidak ada pengguna yang ditemukan.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-transparent">
                  <TableHead className="w-[80px] text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">ID</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Nama Lengkap</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Username</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Role</TableHead>
                  <TableHead className="text-right text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u, index) => (
                  <TableRow key={u.id} className="border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/50 transition-colors duration-300">
                    <TableCell className="font-bold text-indigo-500 dark:text-indigo-400">#{u.id}</TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-100">{u.nama}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">{u.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(u.role)}
                        {getRoleBadge(u.role)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-full transition-all duration-300"
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
