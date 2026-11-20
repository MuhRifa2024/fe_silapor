"use client";

import { useEffect, useState } from "react";
import { Check, User, Lock, Eye, EyeOff, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { changePassword, updateProfileEmail } from "@/services/authService";
import PasswordStrengthIndicator, { isPasswordStrong } from "@/components/ui/PasswordStrengthIndicator";

export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Email state
  const [email, setEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setEmail(parsed.email || "");
      } catch (e) {
        console.error("Invalid user JSON", e);
      }
    }
    setLoading(false);
  }, []);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin": return "Administrator";
      case "petugas": return "Teknisi / Petugas";
      case "mahasiswa": return "Mahasiswa (Pelapor)";
      case "dosen": return "Dosen (Pelapor)";
      case "staff": return "Staff Kampus (Pelapor)";
      default: return "Pengguna";
    }
  };

  const handleEmailSave = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Alamat email tidak boleh kosong");
      return;
    }

    setIsUpdatingEmail(true);
    try {
      const res = await updateProfileEmail({ email: email.trim() });
      toast.success("Email pemulihan akun berhasil disimpan!");
      if (res.data) {
        const updatedUser = { ...user, email: res.data.email };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan email pemulihan");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field password harus diisi");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok");
      return;
    }
    if (!isPasswordStrong(newPassword)) {
      toast.error("Password baru harus memenuhi seluruh kombinasi kriteria keamanan");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Password berhasil diubah!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Gagal mengubah password. Pastikan password lama benar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4 p-8 text-center text-muted-foreground">Memuat profil...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl pb-10">
      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profil Saya</h1>
        <p className="text-muted-foreground mt-1">Informasi akun, email pemulihan, dan keamanan</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shrink-0">
            {getInitials(user?.username)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user?.nama || "User"}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{getRoleLabel(user?.role)}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" /> Informasi Akun
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Nama Lengkap</label>
              <div className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-medium">
                {user?.nama || "-"}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Username / Inisial</label>
              <div className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm font-medium">
                {user?.username || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Pemulihan Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email Pemulihan Sandi
          </h3>
          {user?.email ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full px-2.5 py-0.5">
              Terhubung
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full px-2.5 py-0.5">
              Belum Diisi
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Email ini digunakan untuk menerima kode verifikasi OTP saat Anda lupa kata sandi. Pastikan menggunakan email aktif.
        </p>

        <form onSubmit={handleEmailSave} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border text-foreground h-11 rounded-xl pl-10"
                required
              />
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <Button
              type="submit"
              disabled={isUpdatingEmail}
              className="h-11 rounded-xl px-5 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isUpdatingEmail ? "Menyimpan..." : "Simpan Email"}
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4" /> Ganti Password
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Old Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Password Saat Ini</label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                placeholder="Masukkan password saat ini..."
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 pr-11 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Password Baru</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Minimal 8 karakter kombinasi..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 pr-11 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">Konfirmasi Password Baru</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Ulangi password baru..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 pr-11 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="rounded-xl font-semibold gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Check className="w-4 h-4" />
              {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
