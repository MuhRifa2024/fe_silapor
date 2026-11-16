/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, AlertCircle, Clock, CheckCircle2, Play, Check, Star, XCircle, ExternalLink, UploadCloud } from "lucide-react";
import { getLaporanDetail, getLaporanRiwayat, updateStatusLaporan, submitRating } from "@/services/laporanService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import swal from "@/lib/swal";

export default function TrackingPage() {
  const { id } = useParams();
  const [laporan, setLaporan] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Modal Penolakan (Admin)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [alasanPenolakan, setAlasanPenolakan] = useState("");
  const [filePenolakan, setFilePenolakan] = useState(null);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Modal Selesai (Petugas/Admin)
  const [isSelesaiModalOpen, setIsSelesaiModalOpen] = useState(false);
  const [fileSelesai, setFileSelesai] = useState(null);
  const [isSubmittingSelesai, setIsSubmittingSelesai] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const detailRes = await getLaporanDetail(id);
      if (detailRes.data) setLaporan(detailRes.data);

      const riwayatRes = await getLaporanRiwayat(id);
      if (riwayatRes.data) setRiwayat(riwayatRes.data);
    } catch (err) {
      setError("Gagal memuat detail laporan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr && userStr !== "undefined") {
      try {
        const u = JSON.parse(userStr);
        setUserRole(u.role);
      } catch (e) {}
    }
    if (id) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    const labels = {
      diterima: "Diterima (Setujui laporan dan teruskan ke petugas)",
      diproses: "Diproses (Mulai penanganan oleh petugas)",
      dikerjakan: "Diproses (Mulai pengerjaan)",
    };

    const result = await swal.fire({
      title: "Ubah Status?",
      html: `Status laporan akan diubah menjadi <strong>${labels[newStatus] || newStatus}</strong>.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Lanjutkan",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    setIsUpdating(true);
    try {
      await updateStatusLaporan(id, { status: newStatus });
      toast.success("Status berhasil diperbarui");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal memperbarui status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!alasanPenolakan.trim()) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }

    setIsSubmittingReject(true);
    try {
      const formData = new FormData();
      formData.append("status", "ditolak");
      formData.append("alasan_penolakan", alasanPenolakan.trim());
      if (filePenolakan) {
        if (filePenolakan.size > 4 * 1024 * 1024) {
          toast.error("Ukuran file bukti penolakan maksimal 4 MB");
          setIsSubmittingReject(false);
          return;
        }
        formData.append("bukti_penolakan", filePenolakan);
      }

      await updateStatusLaporan(id, formData);
      toast.success("Laporan berhasil ditolak");
      setIsRejectModalOpen(false);
      setAlasanPenolakan("");
      setFilePenolakan(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menolak laporan");
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const handleSelesaiSubmit = async (e) => {
    e.preventDefault();
    if (!fileSelesai) {
      toast.error("Bukti penyelesaian (foto/video) wajib diunggah!");
      return;
    }
    if (fileSelesai.size > 4 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 4 MB!");
      return;
    }

    setIsSubmittingSelesai(true);
    try {
      const formData = new FormData();
      formData.append("status", "selesai");
      formData.append("bukti_selesai", fileSelesai);

      await updateStatusLaporan(id, formData);
      toast.success("Laporan berhasil ditandai selesai!");
      setIsSelesaiModalOpen(false);
      setFileSelesai(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyelesaikan laporan");
    } finally {
      setIsSubmittingSelesai(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error("Silakan berikan rating (1-5 bintang)");
      return;
    }
    setIsSubmittingRating(true);
    try {
      await submitRating(id, { rating, feedback });
      toast.success("Terima kasih atas ulasan Anda!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengirim rating");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Memuat tracking...</div>;
  if (error || !laporan) return <div className="p-8 text-center text-destructive">{error || "Laporan tidak ditemukan"}</div>;

  const getSLAInfo = () => {
    if (laporan.status === "selesai") return <p className="font-semibold text-emerald-600">Selesai</p>;
    if (laporan.status === "ditolak") return <p className="font-semibold text-rose-600">Ditolak</p>;
    
    if (laporan.tenggat_waktu) {
      const deadline = new Date(laporan.tenggat_waktu.replace(" ", "T")).getTime();
      const now = new Date().getTime();
      if (now > deadline) {
        return <p className="font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> Terlewat Tenggat Waktu</p>;
      }
      return <p className="font-semibold text-amber-600 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Dalam batas waktu</p>;
    }

    if (laporan.prioritas === "tinggi") return <p className="font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> Terlewat SLA</p>;
    return <p className="font-semibold text-amber-600 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Dalam batas waktu</p>;
  };

  const getRiwayatColor = (keterangan, status) => {
    if (status === "ditolak" || keterangan.includes("ditolak")) return "bg-rose-500";
    if (keterangan.includes("eskalasi") || keterangan.includes("tinggi") || keterangan.includes("melebihi")) return "bg-destructive";
    if (status === "selesai" || keterangan.includes("selesai")) return "bg-emerald-500";
    if (status === "diterima") return "bg-blue-500";
    if (status === "diproses" || status === "dikerjakan") return "bg-indigo-500";
    return "bg-amber-500";
  };

  // Helper untuk Progress Stepper (Ditinjau -> Diterima -> Diproses -> Selesai)
  const steps = [
    { key: "ditinjau", label: "Ditinjau", aliases: ["ditinjau", "dilaporkan"] },
    { key: "diterima", label: "Diterima", aliases: ["diterima", "ditugaskan"] },
    { key: "diproses", label: "Diproses", aliases: ["diproses", "dikerjakan"] },
    { key: "selesai", label: "Selesai", aliases: ["selesai"] },
  ];

  const getCurrentStepIndex = () => {
    if (laporan.status === "selesai") return 3;
    if (laporan.status === "diproses" || laporan.status === "dikerjakan") return 2;
    if (laporan.status === "diterima" || laporan.status === "ditugaskan") return 1;
    return 0; // ditinjau / dilaporkan
  };

  const currentStep = getCurrentStepIndex();

  return (
    <div className="max-w-3xl pb-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Detail #LPR-{String(laporan.id).padStart(3, '0')}
            </h1>
            {/* Status Badge */}
            {laporan.status === "ditolak" ? (
              <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full text-xs font-semibold">
                Ditolak
              </span>
            ) : laporan.status === "selesai" ? (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                Selesai
              </span>
            ) : laporan.status === "diproses" || laporan.status === "dikerjakan" ? (
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold">
                Diproses
              </span>
            ) : laporan.status === "diterima" || laporan.status === "ditugaskan" ? (
              <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold">
                Diterima
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
                Ditinjau Admin
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {(() => {
              const d = new Date((laporan.tanggal_lapor || laporan.created_at || "").replace(" ", "T"));
              return isNaN(d) ? "" : `Dilaporkan ${d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
            })()}
          </p>
        </div>
        
        {/* Action Buttons for Petugas/Admin */}
        {(userRole === "petugas" || userRole === "admin") && laporan.status !== "selesai" && laporan.status !== "ditolak" && (
          <div className="flex items-center gap-2 bg-card border border-border p-2 rounded-xl shadow-sm flex-wrap">
            {/* TAHAP 1: Ditinjau / Dilaporkan -> Khusus Admin bisa Terima atau Tolak */}
            {(laporan.status === "ditinjau" || laporan.status === "dilaporkan") && userRole === "admin" && (
              <>
                <Button 
                  onClick={() => handleUpdateStatus("diterima")} 
                  disabled={isUpdating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Terima Laporan
                </Button>
                <Button 
                  onClick={() => setIsRejectModalOpen(true)} 
                  disabled={isUpdating}
                  variant="destructive"
                  className="font-semibold gap-2 shadow-sm"
                >
                  <XCircle className="w-4 h-4" /> Tolak Laporan
                </Button>
              </>
            )}

            {/* TAHAP 2: Diterima / Ditugaskan -> Petugas / Admin bisa Mulai Proses */}
            {(laporan.status === "diterima" || laporan.status === "ditugaskan") && (
              <Button 
                onClick={() => handleUpdateStatus("diproses")} 
                disabled={isUpdating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-sm"
              >
                <Play className="w-4 h-4" /> Mulai Kerjakan
              </Button>
            )}

            {/* TAHAP 3: Diproses / Dikerjakan -> Petugas / Admin bisa Tandai Selesai */}
            {(laporan.status === "diproses" || laporan.status === "dikerjakan") && (
              <Button 
                onClick={() => setIsSelesaiModalOpen(true)} 
                disabled={isUpdating}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-sm"
              >
                <Check className="w-4 h-4" /> Tandai Selesai
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Progress Stepper (Ditinjau -> Diterima -> Diproses -> Selesai) */}
      {laporan.status !== "ditolak" ? (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Tahapan Penanganan Laporan</p>
          <div className="grid grid-cols-4 gap-2 relative">
            {/* Background connection bar */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-border -z-0 hidden sm:block"></div>
            
            {steps.map((step, idx) => {
              const isPassed = idx <= currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                    isCurrent 
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110" 
                      : isPassed 
                        ? "bg-emerald-600 text-white" 
                        : "bg-muted text-muted-foreground border border-border"
                  }`}>
                    {isPassed && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-xs mt-2 font-semibold ${isCurrent ? "text-primary font-bold" : isPassed ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Rejection Alert Card */
        <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-rose-600 dark:text-rose-400">Laporan Ditolak oleh Admin</h3>
              <p className="text-xs text-muted-foreground">Laporan ini tidak dapat diproses lebih lanjut</p>
            </div>
          </div>

          <div className="bg-background/90 p-4 rounded-lg border border-rose-200 dark:border-rose-900/50 space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400">Alasan Penolakan:</span>
            <p className="text-foreground text-sm leading-relaxed">{laporan.alasan_penolakan || "Tidak ada alasan spesifik"}</p>
          </div>

          {laporan.bukti_penolakan && (
            <div className="pt-2">
              <a 
                href={laporan.bukti_penolakan} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors border border-rose-500/30"
              >
                <ExternalLink className="w-4 h-4" /> Lihat Foto Bukti Penolakan
              </a>
            </div>
          )}
        </div>
      )}

      {/* Detail Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span>{laporan.lokasi}</span>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-3">
            {laporan.deskripsi.length > 50 ? laporan.deskripsi.substring(0, 50) + "..." : laporan.deskripsi}
          </h2>
          
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {laporan.deskripsi}
          </p>
        </div>

        {laporan.foto_url && (
          <div className="border border-border rounded-xl overflow-hidden bg-muted/20">
            <div className="p-3 border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground flex items-center justify-between">
              <span>Bukti Kerusakan Awal</span>
              <a href={laporan.foto_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                Buka Penuh <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <img 
              src={laporan.foto_url} 
              alt="Bukti Kerusakan" 
              className="w-full max-h-[400px] object-contain p-2"
            />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pelapor</p>
            <p className="font-semibold text-foreground">{laporan.pelapor?.nama || "Anonim"}</p>
            <p className="text-xs text-muted-foreground capitalize">({laporan.pelapor?.role || "Pelapor"})</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Kategori</p>
            <p className="font-semibold text-foreground">{laporan.kategori?.nama_kategori || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Petugas</p>
            <p className="font-semibold text-foreground">{laporan.petugas?.nama || laporan.kategori?.petugas?.nama || "Belum ditugaskan"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status SLA</p>
            {getSLAInfo()}
          </div>
        </div>
      </div>

      {/* Timeline Riwayat Status */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-6">Riwayat Status Laporan</h3>
        
        {riwayat.length > 0 ? (
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-border"></div>
            
            <div className="space-y-6 relative pl-6">
              {riwayat.map((rw) => (
                <div key={rw.id} className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-card ${getRiwayatColor(rw.keterangan, rw.status)}`}></div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">
                      {rw.status.charAt(0).toUpperCase() + rw.status.slice(1)}
                    </h4>
                    <p className="text-muted-foreground text-sm mt-0.5">{rw.keterangan}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const d = new Date((rw.created_at || rw.waktu || "").replace(" ", "T"));
                        return isNaN(d) ? "" : `${d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}, ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
                      })()}
                    </p>
                    
                    {rw.status === "selesai" && laporan.bukti_selesai && (
                      <div className="mt-3">
                        <a 
                          href={laporan.bukti_selesai} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-emerald-500/30"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Lihat Bukti Penyelesaian
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">Belum ada riwayat tercatat.</p>
        )}
      </div>

      {/* Rating & Feedback Section (Untuk Mahasiswa dan Dosen saat selesai) */}
      {laporan.status === "selesai" && (laporan.rating > 0 || userRole === "mahasiswa" || userRole === "dosen") && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">Ulasan Penanganan</h3>
          {laporan.rating > 0 ? (
            <div className="flex flex-col items-center text-center py-2">
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-7 h-7 ${star <= laporan.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                ))}
              </div>
              <p className="font-semibold text-foreground mb-1">
                {(userRole === "mahasiswa" || userRole === "dosen") ? "Terima kasih atas ulasan Anda!" : "Ulasan dari pelapor"}
              </p>
              {laporan.feedback && (
                <div className="bg-muted/50 p-3 rounded-lg text-muted-foreground w-full max-w-md italic border border-border mt-2 text-sm">
                  &quot;{laporan.feedback}&quot;
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-md mx-auto">
              <p className="text-foreground text-sm font-medium mb-3 text-center">Bagaimana kepuasan Anda terhadap penanganan laporan ini?</p>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoverRating || rating) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'fill-transparent text-muted-foreground stroke-[1.5]'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              
              <div className="w-full space-y-3">
                <textarea
                  placeholder="Bagikan masukan atau ulasan Anda (opsional)..."
                  className="w-full min-h-[90px] p-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none text-sm"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
                
                <Button 
                  onClick={handleSubmitRating} 
                  disabled={isSubmittingRating || rating === 0}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                >
                  {isSubmittingRating ? "Mengirim..." : "Kirim Ulasan"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog Modal: Tolak Laporan (Admin) */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Tolak Laporan
            </DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan dan lampirkan bukti pendukung jika diperlukan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRejectSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="alasan" className="font-semibold">
                Alasan Penolakan <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="alasan"
                required
                rows={3}
                value={alasanPenolakan}
                onChange={(e) => setAlasanPenolakan(e.target.value)}
                placeholder="Contoh: Lokasi fasilitas bukan wewenang kampus / Laporan duplikat / Kerusakan tidak ditemukan"
                className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-destructive focus:outline-none resize-none"
              ></textarea>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bukti_tolak" className="font-semibold">
                Bukti Foto Penolakan (Opsional)
              </Label>
              <Input
                id="bukti_tolak"
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFilePenolakan(e.target.files ? e.target.files[0] : null)}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Maksimal 4 MB (JPG, PNG, MP4)</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmittingReject}>
                {isSubmittingReject ? "Memproses..." : "Konfirmasi Penolakan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Modal: Tandai Selesai (Petugas/Admin) */}
      <Dialog open={isSelesaiModalOpen} onOpenChange={setIsSelesaiModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Selesaikan Laporan
            </DialogTitle>
            <DialogDescription>
              Unggah bukti foto/video bahwa perbaikan telah selesai ditangani.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSelesaiSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="bukti_selesai_file" className="font-semibold">
                Bukti Penyelesaian (Foto / Video) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bukti_selesai_file"
                type="file"
                required
                accept="image/*,video/*"
                onChange={(e) => setFileSelesai(e.target.files ? e.target.files[0] : null)}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Maksimal 4 MB (JPG, PNG, MP4)</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsSelesaiModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmittingSelesai}>
                {isSubmittingSelesai ? "Mengunggah..." : "Simpan & Selesai"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
