/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getLaporanList, updateStatusLaporan } from "@/services/laporanService";
import { 
  Zap, 
  AlertTriangle, 
  UploadCloud, 
  X, 
  Eye, 
  MapPin, 
  User, 
  Tag, 
  Calendar, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Play, 
  Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function TugasSayaPage() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  
  // Modal state - Detail Laporan
  const [detailTask, setDetailTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Modal state - Selesaikan Tugas / Upload Bukti
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileBukti, setFileBukti] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setIsError(false);
    try {
      const res = await getLaporanList();
      const allLaporan = res.data || [];
      // Filter out 'selesai', 'ditolak', 'ditinjau' (petugas hanya menangani yang diterima/diproses)
      setLaporan(allLaporan.filter(l => l.status !== "selesai" && l.status !== "ditolak" && l.status !== "ditinjau"));
    } catch (error) {
      console.error("Gagal memuat tugas", error);
      setIsError(true);
      toast.error("Gagal memuat daftar tugas");
    } finally {
      setLoading(false);
    }
  }

  const handleOpenDetail = (task) => {
    setDetailTask(task);
    setIsDetailOpen(true);
  };

  const handleUpdateClick = (task) => {
    // Jika masih "diterima" / "ditugaskan", langsung mulai kerjakan tanpa perlu upload file
    if (task.status === "diterima" || task.status === "ditugaskan") {
      handleDirectStart(task);
      return;
    }

    // Jika sudah "diproses" / "dikerjakan", buka modal untuk upload bukti penyelesaian
    setSelectedTask(task);
    setFileBukti(null);
    setIsModalOpen(true);
  };

  const handleDirectStart = async (task) => {
    setIsSubmitting(true);
    try {
      await updateStatusLaporan(task.id, { status: "diproses" });
      toast.success("Pengerjaan tugas dimulai (status: Diproses)");
      if (isDetailOpen && detailTask?.id === task.id) {
        setDetailTask(prev => ({ ...prev, status: "diproses" }));
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengubah status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmUpdate = async () => {
    if (!selectedTask) return;
    
    if (!fileBukti) {
      toast.error("Bukti penyelesaian wajib diunggah!");
      return;
    }

    if (fileBukti.size > 4 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 4 MB!");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("status", "selesai");
      payload.append("bukti_selesai", fileBukti);

      await updateStatusLaporan(selectedTask.id, payload);
      toast.success("Laporan berhasil diselesaikan!");
      setIsModalOpen(false);
      setIsDetailOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal mengubah status");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4 p-8 text-center text-muted-foreground">Memuat tugas...</div>;
  }

  const slaPassedCount = laporan.filter(l => l.prioritas === "tinggi").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="border-b border-border pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tugas Saya</h1>
          <p className="text-muted-foreground">Laporan fasilitas yang ditugaskan kepada Anda</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-500/20">
          {laporan.length} Tugas Aktif
        </span>
      </div>

      {slaPassedCount > 0 && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
            {slaPassedCount} laporan melewati batas SLA. Segera tangani untuk mencegah keterlambatan lebih lanjut.
          </p>
        </div>
      )}

      {/* Task List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
        {laporan.length > 0 ? (
          laporan.map(t => {
            const rawDate = t.tanggal_lapor || t.created_at || "";
            const d = rawDate ? new Date(rawDate.replace(" ", "T")) : null;
            const dateStr = d && !isNaN(d) ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Baru';
            const isDiproses = t.status === "diproses" || t.status === "dikerjakan";

            return (
              <div 
                key={t.id} 
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-muted/40 transition-colors gap-4"
              >
                {/* Left section: Icon + info (clickable to open detail) */}
                <div 
                  className="flex items-start gap-4 flex-1 cursor-pointer group"
                  onClick={() => handleOpenDetail(t)}
                  title="Klik untuk melihat detail lengkap laporan"
                >
                  <div className={`p-3 rounded-xl flex-shrink-0 transition-transform group-hover:scale-105 ${t.prioritas === 'tinggi' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                    <Zap className="w-5 h-5" fill="currentColor" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        #LPR-{String(t.id).padStart(3, '0')}
                      </span>
                      {t.kategori?.nama_kategori && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                          {t.kategori.nama_kategori}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-foreground text-base mt-0.5 group-hover:text-primary transition-colors line-clamp-1">
                      {t.deskripsi || t.lokasi}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <MapPin className="w-3.5 h-3.5 inline text-muted-foreground" />
                      <span>{t.lokasi}</span>
                      <span>•</span>
                      <Calendar className="w-3.5 h-3.5 inline text-muted-foreground" />
                      <span>Lapor: {dateStr}</span>
                      <span>•</span>
                      <span className={t.prioritas === 'tinggi' ? 'text-destructive font-semibold' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                        {t.prioritas === 'tinggi' ? 'SLA terlewat' : 'Sisa waktu aman'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right section: Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0 flex-wrap">
                  {/* Status Badge */}
                  <Badge 
                    variant={t.prioritas === 'tinggi' ? 'destructive' : 'outline'} 
                    className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                      isDiproses 
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" 
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {isDiproses ? 'Diproses' : 'Diterima'}
                  </Badge>

                  {/* Tombol Lihat Detail */}
                  <Button 
                    variant="outline"
                    size="sm"
                    className="rounded-full border-border hover:bg-muted font-semibold gap-1.5 px-3.5 text-foreground"
                    onClick={() => handleOpenDetail(t)}
                  >
                    <Eye className="w-4 h-4 text-primary" />
                    <span>Lihat Detail</span>
                  </Button>
                  
                  {/* Tombol Mulai Kerjakan / Tandai Selesai */}
                  <Button 
                    variant={isDiproses ? "default" : "secondary"}
                    size="sm"
                    className={`rounded-full font-semibold px-4 gap-1.5 shadow-sm transition-all ${
                      isDiproses 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                    onClick={() => handleUpdateClick(t)}
                    disabled={isSubmitting}
                  >
                    {isDiproses ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Tandai Selesai</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Mulai Kerjakan</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        ) : isError ? (
          <div className="p-8 text-center text-destructive font-medium flex flex-col items-center gap-2">
            <AlertTriangle className="w-8 h-8" />
            Terjadi kesalahan saat memuat tugas.
            <Button variant="outline" size="sm" onClick={fetchData} className="mt-2 text-foreground">Coba Lagi</Button>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground font-medium flex flex-col items-center gap-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mb-2" />
            <p className="text-base text-foreground font-semibold">Semua tugas beres!</p>
            <p className="text-xs text-muted-foreground">Tidak ada laporan yang sedang menunggu penanganan Anda.</p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DIALOG MODAL: LIHAT ISI DETAIL LAPORAN                   */}
      {/* ======================================================== */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          {detailTask && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-3 pr-6">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    #LPR-{String(detailTask.id).padStart(3, '0')}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      detailTask.status === "diproses" || detailTask.status === "dikerjakan"
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                    }`}>
                      {detailTask.status}
                    </span>
                    {detailTask.prioritas === "tinggi" && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        Prioritas Tinggi
                      </span>
                    )}
                  </div>
                </div>
                <DialogDescription>
                  Rincian informasi laporan kerusakan fasilitas kampus
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Meta info grid */}
                <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3.5 rounded-xl border border-border text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                      <User className="w-3.5 h-3.5" /> Pelapor:
                    </span>
                    <p className="font-semibold text-foreground">
                      {detailTask.pelapor?.nama || "Pelapor"}
                      <span className="text-xs font-normal text-muted-foreground capitalize ml-1">
                        ({detailTask.pelapor?.role || "Pelapor"})
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Tag className="w-3.5 h-3.5" /> Kategori:
                    </span>
                    <p className="font-semibold text-foreground">
                      {detailTask.kategori?.nama_kategori || "Umum"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                      <MapPin className="w-3.5 h-3.5" /> Lokasi:
                    </span>
                    <p className="font-semibold text-foreground">
                      {detailTask.lokasi}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mb-0.5">
                      <Clock className="w-3.5 h-3.5" /> Waktu Lapor:
                    </span>
                    <p className="font-semibold text-foreground">
                      {(() => {
                        const raw = detailTask.tanggal_lapor || detailTask.created_at || "";
                        const d = raw ? new Date(raw.replace(" ", "T")) : null;
                        return d && !isNaN(d) ? d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-";
                      })()}
                    </p>
                  </div>
                </div>

                {/* Deskripsi Lengkap Kerusakan */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Deskripsi Kerusakan:
                  </span>
                  <div className="p-3.5 rounded-xl bg-background border border-border text-sm text-foreground whitespace-pre-wrap leading-relaxed shadow-xs">
                    {detailTask.deskripsi || "Tidak ada deskripsi rinci."}
                  </div>
                </div>

                {/* Foto Bukti Kerusakan Awal */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Foto Bukti Kerusakan:
                    </span>
                    {detailTask.foto_url && (
                      <a 
                        href={detailTask.foto_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        Buka Ukuran Penuh <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {detailTask.foto_url ? (
                    <div className="rounded-xl overflow-hidden border border-border bg-muted/20 p-2 flex items-center justify-center">
                      <img 
                        src={detailTask.foto_url} 
                        alt="Bukti Kerusakan" 
                        className="max-h-[260px] w-auto max-w-full object-contain rounded-lg shadow-xs"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-border bg-muted/20 text-center text-xs text-muted-foreground">
                      Tidak ada foto bukti kerusakan yang dilampirkan oleh pelapor.
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-3 gap-2 flex-col sm:flex-row">
                <Link href={`/laporan/tracking/${detailTask.id}`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full gap-1.5">
                    <ExternalLink className="w-4 h-4" /> Buka Tracking Penuh
                  </Button>
                </Link>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  {detailTask.status === "diterima" || detailTask.status === "ditugaskan" ? (
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 flex-1 sm:flex-initial"
                      onClick={() => handleDirectStart(detailTask)}
                      disabled={isSubmitting}
                    >
                      <Play className="w-4 h-4" /> Mulai Kerjakan
                    </Button>
                  ) : (
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 flex-1 sm:flex-initial"
                      onClick={() => {
                        setSelectedTask(detailTask);
                        setFileBukti(null);
                        setIsModalOpen(true);
                      }}
                    >
                      <Check className="w-4 h-4" /> Tandai Selesai
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setIsDetailOpen(false)}>
                    Tutup
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* DIALOG MODAL: UPLOAD BUKTI & TANDAI SELESAI              */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Selesaikan Laporan
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Unggah bukti foto atau video bahwa perbaikan fasilitas untuk &quot;{selectedTask?.deskripsi}&quot; telah selesai.
              </p>
              
              <div className="py-3 px-4 rounded-xl bg-muted/40 border border-border mb-5 text-xs space-y-1">
                <p className="text-muted-foreground">Nomor Laporan: <strong className="text-foreground">#LPR-{String(selectedTask?.id).padStart(3, '0')}</strong></p>
                <p className="text-muted-foreground">Lokasi: <strong className="text-foreground">{selectedTask?.lokasi}</strong></p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-2">
                  Unggah Bukti Penyelesaian <span className="text-destructive">*</span>
                </p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => setFileBukti(e.target.files ? e.target.files[0] : null)}
                />
                {!fileBukti ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="bg-emerald-500/10 p-3 rounded-full mb-3 text-emerald-600">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Klik untuk pilih file foto atau video</p>
                    <p className="text-xs text-muted-foreground mt-1">Format: JPG, PNG, atau MP4 (Maksimal 4 MB)</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30">
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-medium truncate text-foreground">{fileBukti.name}</span>
                      <span className="text-xs text-muted-foreground">{(fileBukti.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setFileBukti(null)} className="flex-shrink-0 text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={handleConfirmUpdate} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Mengunggah..." : "Simpan & Selesai"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
