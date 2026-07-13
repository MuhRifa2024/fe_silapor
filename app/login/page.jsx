"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { loginUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username/NIM wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await loginUser(data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Login berhasil!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login gagal. Silakan periksa kembali kredensial Anda.");
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
        {/* Subtle light gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="z-10 w-full max-w-md flex flex-col gap-6"
      >
        {/* Header / Brand */}
        <div className="space-y-3 mb-4">
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
            Welcome to SiLapor
          </h2>
          <p className="text-slate-600 text-lg">
            Manage Campus Operations Seamlessly.
          </p>
        </div>

        {/* Glassmorphism Form Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-indigo-900/70 text-xs font-bold uppercase tracking-wider">USERNAME / NIM</Label>
                <Input
                  id="username"
                  placeholder="Masukkan NIM atau username"
                  className="bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 rounded-xl focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  {...register("username")}
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-indigo-900/70 text-xs font-bold uppercase tracking-wider">PASSWORD</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-white/50 border-slate-200 text-slate-900 placeholder:text-slate-400 h-12 rounded-xl pr-12 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]" 
              disabled={isLoading}
            >
              {isLoading ? "MEMPROSES..." : "LOG IN"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200/60 text-center text-sm">
            <span className="text-slate-500">Belum punya akun? </span>
            <Link href="/register" className="text-indigo-600 hover:text-indigo-500 hover:underline font-medium transition-colors">
              Daftar di sini
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
