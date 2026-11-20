"use client";

import { useState, useEffect } from "react";
import { getAllUsers, createUserByAdmin, deleteUser } from "@/services/adminService";
import { adminResetPassword } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, Search, Shield, UserCog, GraduationCap, BookOpen, Briefcase, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import swal from "@/lib/swal";
import PasswordStrengthIndicator, { isPasswordStrong } from "@/components/ui/PasswordStrengthIndicator";

export default function KelolaPenggunaPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form Tambah Pengguna
  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    email: "",
    password: "",
    role: "petugas"
  });

  // Modal Reset Password Manual Admin
  const [resetModalUser, setResetModalUser] = useState(null);
  const [manualPassword, setManualPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

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
    if (!isPasswordStrong(formData.password)) {
      toast.error("Password harus memenuhi syarat kombinasi huruf besar, kecil, angka, dan simbol (min 8 karakter)");
      return;
    }

    try {
      await createUserByAdmin(formData);
      toast.success("Pengguna berhasil ditambahkan");
      setIsDialogOpen(false);
      setFormData({ nama: "", username: "", email: "", password: "", role: "petugas" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menambahkan pengguna");
    }
  };

  const handleAdminResetPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordStrong(manualPassword)) {
      toast.error("Password baru harus memenuhi syarat kombinasi keamanan");
      return;
    }

    setIsResetting(true);
    try {
      await adminResetPassword(resetModalUser.id, { new_password: manualPassword });
      toast.success(`Password untuk ${resetModalUser.nama} berhasil direset!`);
      setResetModalUser(null);
      setManualPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mereset password pengguna");
    } finally {
      setIsResetting(false);
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
    (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin": return <Shield className="w-4 h-4 text-rose-500" />;
      case "petugas": return <UserCog className="w-4 h-4 text-indigo-500" />;
      case "mahasiswa": return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      case "dosen": return <BookOpen className="w-4 h-4 text-amber-500" />;
      case "staff": return <Briefcase className="w-4 h-4 text-purple-500" />;
      default: return <Users className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin": return <span className="px-2.5 py-1 bg-rose-100/80 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 rounded-full text-xs font-bold border border-rose-200 dark:border-rose-800 shadow-sm">Admin</span>;
      case "petugas": return <span className="px-2.5 py-1 bg-indigo-100/80 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800 shadow-sm">Petugas</span>;
      case "mahasiswa": return <span className="px-2.5 py-1 bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800 shadow-sm">Mahasiswa</span>;
      case "dosen": return <span className="px-2.5 py-1 bg-amber-100/80 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800 shadow-sm">Dosen</span>;
      case "staff": return <span className="px-2.5 py-1 bg-purple-100/80 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-full text-xs font-bold border border-purple-200 dark:border-purple-800 shadow-sm">Staff</span>;
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
            Tambahkan dan kelola akun Petugas, Admin, Dosen, Staff, atau Mahasiswa.
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 rounded-xl px-5">
            <Plus className="w-4 h-4" /> Tambah Pengguna
          </Button>
          <DialogContent className="sm:max-w-[480px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-white/50 dark:border-slate-700/50">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100">Tambah Pengguna Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="nama" className="text-slate-700 dark:text-slate-300 text-xs font-bold">Nama Lengkap</Label>
                <Input id="nama" name="nama" value={formData.nama} onChange={handleInputChange} required placeholder="Masukkan nama lengkap" className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 text-xs font-bold">Username / Inisial</Label>
                <Input 
                  id="username" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleInputChange} 
                  required 
                  placeholder={formData.role === "dosen" ? "Inisial dosen (KML, RFA) atau NIDN" : "Masukkan username / NIP / NIM"} 
                  className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100" 
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-xs font-bold">Email (Opsional)</Label>
                  <span className="text-[10px] text-muted-foreground">Untuk pemulihan lupa password</span>
                </div>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="pengguna@kampus.ac.id" 
                  className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100" 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-slate-700 dark:text-slate-300 text-xs font-bold">Peran (Role)</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100">
                    <SelectValue placeholder="Pilih peran">
                      {formData.role ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1) : ""}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dosen" label="Dosen (Pelapor)">Dosen (Pelapor)</SelectItem>
                    <SelectItem value="staff" label="Staff (Pelapor)">Staff (Pelapor)</SelectItem>
                    <SelectItem value="petugas" label="Petugas (Teknisi)">Petugas (Teknisi)</SelectItem>
                    <SelectItem value="admin" label="Admin">Admin</SelectItem>
                    <SelectItem value="mahasiswa" label="Mahasiswa (Pelapor)">Mahasiswa (Pelapor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-xs font-bold">Password Awal</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  value={formData.password} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Kombinasi min 8 karakter..." 
                  className="bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-slate-100" 
                />
                <PasswordStrengthIndicator password={formData.password} />
              </div>
              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="text-slate-700 dark:text-slate-300">Batal</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">Simpan Pengguna</Button>
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
              placeholder="Cari nama, username, email, atau role..."
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
                  <TableHead className="w-[70px] text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">ID</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Nama Lengkap</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Username</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Email Pemulihan</TableHead>
                  <TableHead className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Role</TableHead>
                  <TableHead className="text-right text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className="border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/50 transition-colors duration-300">
                    <TableCell className="font-bold text-indigo-500 dark:text-indigo-400">#{u.id}</TableCell>
                    <TableCell className="font-semibold text-slate-800 dark:text-slate-100">{u.nama}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300">{u.username}</TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 text-xs">
                      {u.email ? u.email : <span className="text-amber-500 italic">Belum diisi</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(u.role)}
                        {getRoleBadge(u.role)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Reset Password Manual"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-full transition-all"
                          onClick={() => { setResetModalUser(u); setManualPassword(""); }}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Hapus Pengguna"
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/50 rounded-full transition-all"
                          onClick={() => handleDelete(u.id)}
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

      {/* Modal Reset Password Manual Admin */}
      {resetModalUser && (
        <Dialog open={true} onOpenChange={() => setResetModalUser(null)}>
          <DialogContent className="sm:max-w-[425px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100">
                Reset Password Pengguna
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdminResetPassword} className="space-y-4 pt-3">
              <p className="text-xs text-muted-foreground">
                Setel ulang kata sandi untuk akun: <strong>{resetModalUser.nama}</strong> ({resetModalUser.username}). Gunakan jika pengguna lupa sandi dan belum mendaftarkan email.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="manualPassword" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password Baru
                </Label>
                <Input
                  id="manualPassword"
                  type="password"
                  value={manualPassword}
                  onChange={(e) => setManualPassword(e.target.value)}
                  placeholder="Kombinasi min 8 karakter..."
                  required
                />
                <PasswordStrengthIndicator password={manualPassword} />
              </div>
              <DialogFooter className="pt-3">
                <Button type="button" variant="outline" onClick={() => setResetModalUser(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isResetting} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                  {isResetting ? "Menyimpan..." : "Reset Kata Sandi"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
