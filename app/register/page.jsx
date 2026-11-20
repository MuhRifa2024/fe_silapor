"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { registerUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import PasswordStrengthIndicator, { isPasswordStrong } from "@/components/ui/PasswordStrengthIndicator";

const registerSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .refine((val) => isPasswordStrong(val), {
      message: "Password harus kombinasi huruf besar, kecil, angka, dan simbol",
    }),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success("Registrasi berhasil! Silakan login.");
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registrasi gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-start p-6 sm:p-12 md:p-24 overflow-hidden bg-slate-50">
      {/* Full-screen Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/silapor_bg_light.png" 
          alt="Campus daytime" 
          fill
          className="object-cover opacity-100"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="z-10 w-full max-w-md flex flex-col gap-6"
      >
        {/* Header / Brand */}
        <div className="space-y-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shadow-sm border border-indigo-200">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-widest uppercase">
              <span className="text-orange-500">Si</span>
              <span className="text-indigo-600">Lapor</span>
            </h1>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
            Buat Akun
          </h2>
          <p className="text-slate-600 text-sm">
            Khusus registrasi mandiri untuk <strong className="font-semibold text-slate-800">Mahasiswa</strong>. Akun Dosen, Staff, dan Petugas diberikan oleh Admin.
          </p>
        </div>

        {/* Glassmorphism Form Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nama" className="text-indigo-900/70 text-xs font-bold uppercase tracking-wider">NAMA LENGKAP</Label>
                <Input
                  id="nama"
                  placeholder="Masukkan nama lengkap"
                  className="bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  {...register("nama")}
                />
                {errors.nama && <p className="text-red-500 text-xs">{errors.nama.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-indigo-900/70 text-xs font-bold uppercase tracking-wider">USERNAME / NIM</Label>
                <Input
                  id="username"
                  placeholder="Masukkan NIM atau username"
                  className="bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  {...register("username")}
                />
                {errors.username && <p className="text-red-500 text-xs">{errors.username.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-indigo-900/70 text-xs font-bold uppercase tracking-wider">EMAIL (OPSIONAL)</Label>
                  <span className="text-[10px] text-slate-500">Untuk pemulihan password</span>
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="mahasiswa@kampus.ac.id"
                  className="bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  {...register("email")}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-indigo-900/70 text-xs font-bold uppercase tracking-wider">PASSWORD</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-11 rounded-xl pr-12 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                <PasswordStrengthIndicator password={passwordValue} />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] mt-2" 
              disabled={isLoading}
            >
              {isLoading ? "MEMPROSES..." : "DAFTAR SEKARANG"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200/60 text-center text-sm">
            <span className="text-slate-500">Sudah punya akun? </span>
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500 hover:underline font-semibold transition-colors">
              Login di sini
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
