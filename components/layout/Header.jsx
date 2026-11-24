"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Menu, LogOut, User, Bell, CheckCircle2, Volume2, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getNotifikasi, markAsRead, markAllAsRead } from "@/services/notifikasiService";
import { toast } from "sonner";

// Shared AudioContext instance (di-unlock otomatis oleh interaksi pertama pengguna)
let globalAudioCtx = null;

const getUnlockedAudioContext = () => {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!globalAudioCtx) {
    globalAudioCtx = new AudioCtx();
  }
  if (globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

export default function Header({ user, setIsOpen }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [browserPermission, setBrowserPermission] = useState("default");
  const dropdownRef = useRef(null);

  // Helper membaca ID notifikasi yang sudah pernah di-pop-up di sesi browser ini
  const getShownNotifIds = () => {
    try {
      if (typeof window === "undefined") return [];
      const raw = sessionStorage.getItem("silapor_shown_notifs");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  };

  const markNotifAsShown = (id) => {
    try {
      if (typeof window === "undefined") return;
      const list = getShownNotifIds();
      if (!list.includes(id)) {
        list.push(id);
        sessionStorage.setItem("silapor_shown_notifs", JSON.stringify(list.slice(-100)));
      }
    } catch (e) {}
  };

  // Bunyikan nada dering notifikasi (Web Audio API)
  const playNotificationSound = useCallback(() => {
    try {
      const ctx = getUnlockedAudioContext();
      if (!ctx) return;

      const playTone = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        // Dua nada lembut (E5 659Hz -> A5 880Hz)
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      };

      if (ctx.state === "suspended") {
        ctx.resume().then(playTone).catch(() => {});
      } else {
        playTone();
      }
    } catch (e) {}
  }, []);

  // Kirim notifikasi native OS — via SW jika tersedia, fallback ke Notification API langsung
  const showPushViaSW = useCallback((title, body, laporanId) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    // Coba via Service Worker terlebih dahulu (diperlukan untuk mobile)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          if (registration.active) {
            registration.active.postMessage({
              type: "SHOW_NOTIFICATION",
              payload: {
                title,
                body,
                icon: "/dashboard_banner.png",
                tag: laporanId ? `silapor-laporan-${laporanId}` : "silapor-notif",
                data: { laporan_id: laporanId },
              },
            });
          } else {
            // SW belum aktif (first load) — fallback ke Notification API langsung
            const n = new Notification(title, { body, icon: "/dashboard_banner.png" });
            if (laporanId) n.onclick = () => { window.focus(); };
          }
        })
        .catch(() => {
          // SW gagal — fallback ke Notification API langsung
          try {
            const n = new Notification(title, { body, icon: "/dashboard_banner.png" });
            if (laporanId) n.onclick = () => { window.focus(); };
          } catch (e) {}
        });
    } else {
      // Browser tanpa Service Worker — Notification API langsung (desktop lama)
      try {
        const n = new Notification(title, { body, icon: "/dashboard_banner.png" });
        if (laporanId) n.onclick = () => { window.focus(); };
      } catch (e) {}
    }
  }, []);

  // Meminta izin Notifikasi secara resmi dengan gesture klik
  const requestDesktopPermission = async () => {
    if (typeof window === "undefined") {
      toast.info("Browser Anda tidak mendukung notifikasi");
      return;
    }
    if (!("Notification" in window)) {
      toast.info("Browser Anda tidak mendukung notifikasi");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === "granted") {
        toast.success("Notifikasi push browser berhasil diaktifkan!");
        playNotificationSound();
        showPushViaSW(
          "SiLapor - Siap Menerima Notifikasi",
          "Notifikasi push aktif untuk akun " + (user?.username || ""),
          null
        );
      } else if (perm === "denied") {
        toast.warning("Izin notifikasi ditolak di browser. Anda dapat mengaktifkannya di pengaturan browser.");
      }
    } catch (e) {
      console.error("Gagal meminta izin notifikasi", e);
    }
  };

  // Fungsi tes suara dan notifikasi (untuk verifikasi langsung pengguna)
  const handleTestNotification = () => {
    playNotificationSound();
    toast.info("Tes Notifikasi Push SiLapor", {
      description: "Suara chime dan in-app toast berfungsi normal!",
      duration: 5000,
      action: {
        label: "Oke",
        onClick: () => {}
      }
    });

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      showPushViaSW("SiLapor - Tes Notifikasi", "Push notification berhasil diterima!", null);
    }
  };

  const fetchNotifikasi = useCallback(async () => {
    if (typeof window === "undefined" || !localStorage.getItem("token")) return;
    try {
      const res = await getNotifikasi();
      const list = res.data?.data;
      if (Array.isArray(list)) {
        setNotifications(list);

        // Ambil ID yang sudah pernah ditampilkan toast di sesi browser ini
        const shownIds = new Set(getShownNotifIds());
        const newUnread = list.filter(n => !n.is_read && !shownIds.has(n.id));

        if (newUnread.length > 0) {
          playNotificationSound();

          // Batasi maksimal 2 notifikasi sekaligus agar tidak tumpang tindih
          const toPop = newUnread.slice(0, 2);
          toPop.forEach(n => {
            markNotifAsShown(n.id);

            // 1. In-App Toast Push (Sonner)
            toast.info(n.pesan, {
              description: "Notifikasi baru SiLapor",
              duration: 7000,
              action: n.laporan_id ? {
                label: "Buka",
                onClick: () => router.push(`/laporan/tracking/${n.laporan_id}`)
              } : undefined,
            });

            // 2. Native OS Push Notification via Service Worker (Android & iOS PWA)
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              showPushViaSW("SiLapor - Notifikasi Baru", n.pesan, n.laporan_id);
            }
          });

          // Tandai sisanya agar tidak spam berulang
          if (newUnread.length > 2) {
            newUnread.slice(2).forEach(n => markNotifAsShown(n.id));
          }
        }
      }
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error("Gagal memuat notifikasi", error);
      }
    }
  }, [playNotificationSound, showPushViaSW, router]);

  useEffect(() => {
    // Cek status izin notifikasi saat ini
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(Notification.permission);
    }

    // Listener unlock audio pada interaksi pertama kali oleh user
    const unlockAudio = () => {
      getUnlockedAudioContext();
    };
    window.addEventListener("click", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio, { passive: true });
    window.addEventListener("touchstart", unlockAudio, { passive: true });

    fetchNotifikasi();

    // Polling setiap 5 detik agar terasa live / push real-time
    const interval = setInterval(fetchNotifikasi, 5000); 

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifikasi();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Listener event kustom agar notifikasi langsung ter-fetch saat ada aksi kirim/update
    const handleCustomRefresh = () => {
      fetchNotifikasi();
    };
    window.addEventListener("silapor-notif-refresh", handleCustomRefresh);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("silapor-notif-refresh", handleCustomRefresh);
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, [fetchNotifikasi]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    if (notif.laporan_id) {
      setIsDropdownOpen(false);
      router.push(`/laporan/tracking/${notif.laporan_id}`);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      fetchNotifikasi();
    } catch (error) {
      console.error("Gagal menandai notifikasi", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifikasi();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Gagal menandai semua notifikasi", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/40 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50 px-4 md:px-6 shadow-[0_4px_30px_rgba(0,0,0,0.02)] shrink-0 transition-colors duration-300">
      <button 
        onClick={() => setIsOpen(true)} 
        className="md:hidden text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Lonceng Notifikasi */}
        <div ref={dropdownRef} className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              // Jika izin desktop masih default, minta izin saat klik lonceng
              if (browserPermission === "default") {
                requestDesktopPermission();
              }
            }} 
            className="relative text-slate-500 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 rounded-full cursor-pointer"
          >
            <Bell className={`h-5 w-5 ${unreadCount > 0 ? "animate-pulse text-indigo-500" : ""}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white/50 dark:ring-slate-900/50 animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Dropdown Notifikasi */}
          <AnimatePresence>
            {isDropdownOpen && (
              <>
                {/* Mobile Backdrop Overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setIsDropdownOpen(false)}
                  className="fixed inset-0 bg-black/25 backdrop-blur-[1px] z-40 sm:hidden"
                />

                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="fixed left-3 right-3 top-[62px] sm:absolute sm:left-auto sm:right-0 sm:top-[52px] mt-1 max-w-[420px] mx-auto sm:mx-0 sm:w-[380px] sm:max-w-[380px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-2xl rounded-2xl z-50 overflow-hidden origin-top sm:origin-top-right"
                >
                  {/* Header Dropdown */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold">
                          {unreadCount} baru
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead} 
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline font-medium transition-colors cursor-pointer"
                        >
                          Tandai dibaca
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Banner Status Desktop Push Notification */}
                  <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {browserPermission === "granted" ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5" /> Desktop Push Aktif
                      </span>
                    ) : (
                      <button
                        onClick={requestDesktopPermission}
                        className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:underline cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" /> Aktifkan Push Desktop
                      </button>
                    )}

                    <button
                      onClick={handleTestNotification}
                      title="Uji coba suara dan notifikasi pop-up"
                      className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-[11px] font-semibold bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 shadow-xs cursor-pointer ml-auto sm:ml-0"
                    >
                      <Volume2 className="w-3 h-3 text-indigo-500" />
                      <span>Tes Notifikasi</span>
                    </button>
                  </div>

                  {/* Daftar Notifikasi */}
                  <div className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto divide-y divide-slate-100/50 dark:divide-slate-800/50">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                        <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        Belum ada notifikasi baru
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer flex gap-3 transition-colors ${
                            !n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                          }`} 
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className={`mt-0.5 shrink-0 ${!n.is_read ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-snug break-words ${!n.is_read ? 'font-bold text-slate-900 dark:text-slate-100' : 'font-normal text-slate-600 dark:text-slate-400'}`}>
                              {n.pesan}
                            </p>
                            <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                              <span>{new Date(n.created_at).toLocaleString('id-ID')}</span>
                              {n.laporan_id && (
                                <span className="text-indigo-500 flex items-center gap-0.5 hover:underline">
                                  Lihat <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                          </div>
                          {!n.is_read && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <ThemeToggle />
        <div className="flex items-center gap-2 text-sm font-medium border-l border-r px-4 sm:px-4 border-slate-200/50 dark:border-slate-700/50">
          <div className="h-7 w-7 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <span className="capitalize text-slate-700 dark:text-slate-200 hidden sm:inline-block">
            {user?.username} <span className="text-slate-400 dark:text-slate-500 font-normal">({user?.role})</span>
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout} 
          title="Logout" 
          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/30 rounded-full transition-all duration-300 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
}
