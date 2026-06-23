"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { motion } from "framer-motion";

const formSchema = z.object({
  kategori_id: z.string().min(1, "Kategori wajib dipilih"),
  lokasi: z.string().min(3, "Lokasi tidak boleh kosong"),
  deskripsi: z.string().min(10, "Deskripsi minimal 10 karakter"),
  foto_url: z.any().optional(),
});

export default function BuatLaporanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Mocking submission
      console.log("Submitting:", data);
      await new Promise((r) => setTimeout(r, 1000));
      
      toast.success("Laporan berhasil dibuat!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Gagal membuat laporan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Buat Laporan Baru</CardTitle>
          <CardDescription>Isi detail kerusakan fasilitas dengan jelas agar petugas mudah menemukan dan menanganinya.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori Fasilitas</Label>
              <Select onValueChange={(val) => setValue("kategori_id", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori kerusakan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Elektrik (Listrik, AC, Lampu)</SelectItem>
                  <SelectItem value="2">Sanitasi (Toilet, Keran, Pipa)</SelectItem>
                  <SelectItem value="3">Furnitur (Meja, Kursi, Papan Tulis)</SelectItem>
                  <SelectItem value="4">IT & Jaringan (Proyektor, Wi-Fi)</SelectItem>
                </SelectContent>
              </Select>
              {errors.kategori_id && <p className="text-red-500 text-sm">{errors.kategori_id.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasi">Lokasi Kerusakan</Label>
              <Input
                id="lokasi"
                placeholder="Mis: Ruang B201, Gedung C Lt 3"
                {...register("lokasi")}
              />
              {errors.lokasi && <p className="text-red-500 text-sm">{errors.lokasi.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi Detail</Label>
              <Textarea
                id="deskripsi"
                placeholder="Jelaskan secara spesifik kerusakan yang terjadi..."
                className="min-h-[100px]"
                {...register("deskripsi")}
              />
              {errors.deskripsi && <p className="text-red-500 text-sm">{errors.deskripsi.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto">Upload Foto Bukti (Opsional)</Label>
              <Input
                id="foto"
                type="file"
                accept="image/*"
                {...register("foto_url")}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                {isLoading ? "Mengirim..." : "Kirim Laporan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
