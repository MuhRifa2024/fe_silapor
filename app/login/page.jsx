"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { loginUser } from "@/services/authService";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/atoms/card";
import Link from "next/link";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "Username/NIM wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
      // Mocking for testing UI since backend may not be available yet
      // const response = await loginUser(data);
      // localStorage.setItem("token", response.token);
      // localStorage.setItem("user", JSON.stringify(response.user));
      
      // MOCK SUCCESS
      localStorage.setItem("token", "mock-token");
      localStorage.setItem("user", JSON.stringify({ role: "mahasiswa", username: data.username }));
      
      toast.success("Login berhasil!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login gagal. Silakan periksa kembali kredensial Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl text-slate-100 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center text-blue-400">SiLapor</CardTitle>
            <CardDescription className="text-slate-400 text-center">
              Sistem Pengaduan & Tracking Fasilitas Kampus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">NIM / Username</Label>
                <Input
                  id="username"
                  placeholder="Masukkan NIM atau username"
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  {...register("username")}
                />
                {errors.username && <p className="text-red-400 text-sm">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  {...register("password")}
                />
                {errors.password && <p className="text-red-400 text-sm">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-sm text-center text-slate-400">
            <p>
              Belum punya akun?{" "}
              <Link href="/register" className="text-blue-400 hover:underline">
                Daftar di sini
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
