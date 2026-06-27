/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, AlertCircle, Clock, CheckCircle2, Play, Check } from "lucide-react";
import { getLaporanDetail, getLaporanRiwayat, updateStatusLaporan } from "@/services/laporanService";
import { Button } from "@/components/ui/button";
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
    const result = await swal.fire({
      title: "Ubah Status?",
      html: `Status laporan akan diubah menjadi <strong>${newStatus}</strong>.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Ubah",
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

  if (isLoading) return <div className="p-8 text-center animate-pulse">Memuat tracking...</div>;
  if (error || !laporan) return <div className="p-8 text-center text-destructive">{error || "Laporan tidak ditemukan"}</div>;

  const getSLAInfo = () => {
    if (laporan.status === "selesai") return <p className="font-semibold text-emerald-600">Selesai</p>;
    if (laporan.prioritas === "tinggi") return <p className="font-semibold text-destructive flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> Terlewat SLA</p>;
    return <p className="font-semibold text-amber-600 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Dalam batas waktu</p>;
  };

  const getRiwayatColor = (status) => {
    if (status.includes("eskalasi") || status.includes("tinggi") || status.includes("melebihi")) return "bg-destructive";
    if (status.includes("selesai")) return "bg-emerald-500";
    return "bg-primary";
  };

  return (
    <div className="max-w-3xl pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-border mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Detail #LPR-{String(laporan.id).padStart(3, '0')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {(() => {
              const d = new Date((laporan.created_at || "").replace(" ", "T"));
              return isNaN(d) ? "" : `Dilaporkan ${d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
            })()}
          </p>
        </div>
        
        {/* Action Buttons for Petugas/Admin */}
        {(userRole === "petugas" || userRole === "admin") && laporan.status !== "selesai" && (
          <div className="flex items-center gap-3 bg-card border border-border p-2 rounded-xl shadow-sm">
            {laporan.status === "ditugaskan" || laporan.status === "dilaporkan" ? (
              <Button 
                onClick={() => handleUpdateStatus("dikerjakan")} 
                disabled={isUpdating}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-2"
              >
                <Play className="w-4 h-4" /> Mulai Kerjakan
              </Button>
            ) : laporan.status === "dikerjakan" ? (
              <Button 
                onClick={() => handleUpdateStatus("selesai")} 
                disabled={isUpdating}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold gap-2"
              >
                <Check className="w-4 h-4" /> Tandai Selesai
              </Button>
            ) : null}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Detail Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span>{laporan.lokasi}</span>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-3">
            {laporan.deskripsi.length > 50 ? laporan.deskripsi.substring(0, 50) + "..." : laporan.deskripsi}
          </h2>
          
          <p className="text-foreground leading-relaxed mb-6 whitespace-pre-wrap">
            {laporan.deskripsi}
          </p>

          {laporan.foto_url && (
            <div className="mb-6">
              <p className="text-sm font-semibold mb-2">Bukti Lampiran:</p>
              {laporan.foto_url.includes("dummy") ? (
                <div className="w-full sm:w-64 aspect-video bg-muted border border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                  {laporan.foto_url.split('/').pop()} (Simulasi B2)
                </div>
              ) : (
                <img src={laporan.foto_url} alt="Bukti" className="w-full sm:w-64 object-cover border border-border rounded-lg" />
              )}
            </div>
          )}
          
          <div className="flex flex-wrap gap-8 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Kategori</p>
              <p className="font-semibold text-foreground">{laporan.kategori?.nama_kategori || "Umum"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ditugaskan ke</p>
              <p className="font-semibold text-foreground">{laporan.kategori?.petugas?.nama || "Belum ditugaskan"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status/SLA</p>
              {getSLAInfo()}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-lg font-bold text-foreground mb-6">Riwayat status laporan</h3>
          
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm relative">
            {riwayat.length > 0 ? (
              <>
                {/* Vertical Line */}
                <div className="absolute left-[39px] top-8 bottom-8 w-px bg-border"></div>
                
                <div className="space-y-8 relative">
                  {riwayat.map((rw, index) => {
                    const isLast = index === riwayat.length - 1;
                    const date = new Date(rw.created_at || rw.waktu);
                    return (
                      <div key={rw.id} className="flex gap-4">
                        <div className={`w-4 h-4 rounded-full ring-4 ring-card z-10 shrink-0 mt-1 ${getRiwayatColor(rw.keterangan)}`}></div>
                        <div>
                          <h4 className={`font-semibold ${rw.keterangan.includes('eskalasi') ? 'text-destructive' : 'text-foreground'}`}>
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
                                className="inline-flex items-center gap-2 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-emerald-200 dark:border-emerald-800"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Lihat Bukti Penyelesaian
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {laporan.status !== "selesai" && (
                    <div className="flex gap-4 opacity-60">
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground bg-card ring-4 ring-card z-10 shrink-0 mt-1"></div>
                      <div>
                        <h4 className="text-muted-foreground font-semibold">Menunggu tahap selanjutnya...</h4>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm text-center">Belum ada riwayat tercatat.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
