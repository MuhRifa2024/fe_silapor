"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Send } from "lucide-react";
import { toast } from "sonner";
import { getKategoriList } from "@/services/adminService";
import { createLaporan } from "@/services/laporanService";

export default function BuatLaporanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Form State
  const [kategoriId, setKategoriId] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const res = await getKategoriList();
        if (res.data) setCategories(res.data);
      } catch (error) {
        toast.error("Gagal mengambil daftar kategori");
      }
    };
    fetchKategori();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kategoriId || !lokasi || !deskripsi) {
      toast.error("Harap isi semua kolom yang wajib");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Gunakan FormData untuk mengirim file fisik ke backend
      const formData = new FormData();
      formData.append("kategori_id", kategoriId);
      formData.append("lokasi", lokasi);
      formData.append("deskripsi", deskripsi);
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Maksimal 4 MB
        toast.error("Ukuran file maksimal 4 MB!");
        return;
      }
      formData.append("bukti", file);
    }

      await createLaporan(formData);
      toast.success("Laporan berhasil dikirim!");
      router.push("/laporan");
      
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal mengirim laporan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl pb-10">
      <div className="pb-4 border-b border-border mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Buat Laporan Baru
        </h1>
        <p className="text-muted-foreground mt-1">
          Laporkan kerusakan fasilitas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        {/* Kategori Fasilitas */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Kategori fasilitas <span className="text-destructive">*</span></label>
          <Select required value={kategoriId} onValueChange={setKategoriId}>
            <SelectTrigger className="bg-background border border-border text-foreground h-11 rounded-lg">
              <SelectValue placeholder="Pilih kategori..." />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border">
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nama_kategori}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lokasi Kerusakan */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Lokasi kerusakan <span className="text-destructive">*</span></label>
          <Input 
            required
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            placeholder="Contoh: Ruang B201, Lab Komputer A" 
            className="bg-background border border-border text-foreground placeholder:text-muted-foreground h-11 rounded-lg"
          />
        </div>

        {/* Deskripsi Kerusakan */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Deskripsi kerusakan <span className="text-destructive">*</span></label>
          <textarea 
            required
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Jelaskan kondisi kerusakan secara detail..." 
            className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground p-3 rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
          ></textarea>
        </div>

        {/* Bukti (foto / video) */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Bukti (foto / video)</label>
          <div className="relative border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/30 transition-colors cursor-pointer group">
            <input 
              type="file" 
              accept="image/*,video/*" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadCloud className="w-8 h-8 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
            <p className="text-sm font-medium text-foreground mb-1">
              {file ? file.name : "Klik atau seret file ke sini"}
            </p>
            <p className="text-xs text-muted-foreground">JPG, PNG, MP4 · Maks. 4 MB · Disimpan ke Supabase Storage</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
          <Link href="/laporan">
            <Button type="button" variant="outline" className="bg-card border-border text-foreground hover:bg-muted font-medium">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="font-medium gap-2">
            <Send className="w-4 h-4" /> 
            {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
