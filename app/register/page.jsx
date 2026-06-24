"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { registerUser } from "@/services/authService";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/atoms/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Controller } from "react-hook-form";
import Link from "next/link";
import { motion } from "framer-motion";

const registerSchema = z.object({
  nama: z.string().min(2, "Nama minimal 2 karakter"),
  username: z.string().min(1, "NIM/Username wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.string().default("mahasiswa"), // Default registration is for students usually
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "mahasiswa"
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success("Registrasi berhasil! Silakan login.");
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registrasi gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl text-slate-100 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center text-indigo-400">Buat Akun</CardTitle>
            <CardDescription className="text-slate-400 text-center">
              Daftar untuk mengakses SiLapor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-slate-300">Nama Lengkap</Label>
                <Input
                  id="nama"
                  placeholder="Masukkan nama lengkap"
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  {...register("nama")}
                />
                {errors.nama && <p className="text-red-400 text-sm">{errors.nama.message}</p>}
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">Daftar Sebagai (Role)</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || "mahasiswa"}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-100">
                        <SelectValue placeholder="Pilih Peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                        <SelectItem value="petugas">Petugas</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Daftar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-sm text-center text-slate-400">
            <p>
              Sudah punya akun?{" "}
              <Link href="/login" className="text-indigo-400 hover:underline">
                Login di sini
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
