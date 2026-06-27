"use client";

import { useEffect, useState, useRef } from "react";
import { getLaporanList, updateStatusLaporan } from "@/services/laporanService";
import { Zap, AlertTriangle, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function TugasSayaPage() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
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
    try {
      const res = await getLaporanList();
      const allLaporan = res.data || [];
      // Filter out 'selesai'
      setLaporan(allLaporan.filter(l => l.status !== "selesai"));
    } catch (error) {
      console.error("Gagal memuat tugas", error);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateClick = (task) => {
    setSelectedTask(task);
    setFileBukti(null); // Reset file
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!selectedTask) return;
    
    let nextStatus = "dikerjakan";
    if (selectedTask.status === "dikerjakan") nextStatus = "selesai";
    else if (selectedTask.status === "dilaporkan") nextStatus = "ditugaskan";
    else if (selectedTask.status === "ditugaskan") nextStatus = "dikerjakan";

    if (nextStatus === "selesai" && !fileBukti) {
      toast.error("Bukti penyelesaian wajib diunggah!");
      return;
    }

    if (nextStatus === "selesai" && fileBukti && fileBukti.size > 4 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 4 MB!");
      return;
    }

    setIsSubmitting(true);

    try {
      let payload;
      if (nextStatus === "selesai") {
        payload = new FormData();
        payload.append("status", nextStatus);
        payload.append("bukti_selesai", fileBukti);
      } else {
        payload = { status: nextStatus };
      }

      await updateStatusLaporan(selectedTask.id, payload);
      toast.success(`Status berhasil diubah menjadi ${nextStatus}`);
      setIsModalOpen(false);
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
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Tugas Saya</h1>
        <p className="text-muted-foreground">Laporan yang perlu ditangani</p>
      </div>

      {slaPassedCount > 0 && (
        <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
            {slaPassedCount} laporan melewati batas SLA. Segera tangani untuk mencegah eskalasi lebih lanjut.
          </p>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border shadow-sm">
        {laporan.length > 0 ? (
          laporan.map(t => {
            const dateStr = t.tanggal_lapor ? new Date(t.tanggal_lapor).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Unknown';
            return (
              <div key={t.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-muted/50 transition-colors gap-4 md:gap-0">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${t.prioritas === 'tinggi' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                    <Zap className="w-5 h-5" fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base">{t.deskripsi || t.lokasi}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t.lokasi} • Lapor: {dateStr} • {t.prioritas === 'tinggi' ? 'SLA terlewat' : 'Sisa waktu aman'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-start md:self-auto ml-16 md:ml-0">
                  <Badge variant={t.prioritas === 'tinggi' ? 'destructive' : 'outline'} className={`px-3 py-1 text-xs font-semibold rounded-full ${t.prioritas !== 'tinggi' ? "bg-background text-foreground" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0"}`}>
                    {t.status === 'dikerjakan' ? 'Dikerjakan' : t.prioritas === 'tinggi' ? 'Tinggi' : 'Normal'}
                  </Badge>
                  
                  <Button 
                    variant="outline" 
                    className="rounded-full border-border hover:bg-muted font-semibold px-6"
                    onClick={() => handleUpdateClick(t)}
                  >
                    {t.status === "dikerjakan" ? "Tandai Selesai" : "Update Status"}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground font-medium">Yeay! Tidak ada tugas yang menunggu.</div>
        )}
      </div>

      {/* Modal Update Status */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-1">Update Status Laporan</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ubah status pengerjaan untuk &quot;{selectedTask?.deskripsi}&quot;.
              </p>
              
              <div className="py-4 border-y border-border mb-6">
                <p className="text-sm text-muted-foreground mb-2">Status Saat Ini: <strong className="text-foreground capitalize">{selectedTask?.status}</strong></p>
                <p className="text-sm text-muted-foreground">Status Selanjutnya: <strong className="text-primary capitalize">
                  {selectedTask?.status === "dikerjakan" ? "selesai" : "dikerjakan"}
                </strong></p>
              </div>

              {selectedTask?.status === "dikerjakan" && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-foreground mb-2">Unggah Bukti Penyelesaian <span className="text-red-500">*</span></p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => setFileBukti(e.target.files[0])}
                  />
                  {!fileBukti ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="bg-primary/10 p-3 rounded-full mb-3 text-primary">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Pilih file atau ambil foto</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, atau Video maks 4MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl bg-muted/30">
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-medium truncate">{fileBukti.name}</span>
                        <span className="text-xs text-muted-foreground">{(fileBukti.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setFileBukti(null)} className="flex-shrink-0 text-muted-foreground hover:text-red-500">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Batal</Button>
                <Button onClick={handleConfirmUpdate} disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Konfirmasi Update"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
