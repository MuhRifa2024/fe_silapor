"use client";

import { useEffect, useState } from "react";
import { Check, User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { changePassword } from "@/services/authService";

export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      setUser(JSON.parse(storedUser));
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
      case "mahasiswa": return "Mahasiswa";
      default: return "Pengguna";
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
    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
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
      toast.error(error.response?.data?.error || "Gagal mengubah password. Pastikan password lama benar.");
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
        <p className="text-muted-foreground mt-1">Informasi akun dan keamanan</p>
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
              <div className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm">
                {user?.nama || "-"}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Username / NIM</label>
              <div className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm">
                {user?.username || "-"}
              </div>
            </div>
          </div>
        </div>
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
                placeholder="Minimal 6 karakter..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 pr-11 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
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

          {/* Strength indicator */}
          {newPassword.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                    newPassword.length >= i * 3
                      ? newPassword.length >= 8 ? "bg-emerald-500" : "bg-amber-500"
                      : "bg-muted"
                  }`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {newPassword.length < 6 ? "Terlalu pendek" : newPassword.length < 8 ? "Cukup" : "Kuat"}
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="rounded-xl font-semibold gap-2">
              <Check className="w-4 h-4" />
              {isSubmitting ? "Menyimpan..." : "Simpan Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
