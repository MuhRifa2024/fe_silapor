"use client";

import { useEffect, useState, useRef } from "react";
import { Menu, LogOut, User, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getNotifikasi, markAsRead, markAllAsRead } from "@/services/notifikasiService";

export default function Header({ user, setIsOpen }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifikasi = async () => {
    try {
      const res = await getNotifikasi();
      const list = res.data?.data;
      if (Array.isArray(list)) setNotifications(list);
    } catch (error) {
      console.error("Gagal memuat notifikasi", error);
    }
  };

  useEffect(() => {
    fetchNotifikasi();
    const interval = setInterval(fetchNotifikasi, 30000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div ref={dropdownRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
            className="relative text-slate-500 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 rounded-full"
          >
            <Bell className={`h-5 w-5 ${unreadCount > 0 ? "animate-pulse text-indigo-500" : ""}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white/50 dark:ring-slate-900/50">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Dropdown Notifikasi */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-2 sm:right-6 top-[64px] mt-1 w-[calc(100vw-1rem)] max-w-[320px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-2xl rounded-2xl z-50 overflow-hidden origin-top-right"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50">
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline font-medium transition-colors">Tandai semua dibaca</button>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                      <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      Belum ada notifikasi baru
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-4 border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-white/60 dark:hover:bg-slate-800/60 cursor-pointer flex gap-3 transition-colors ${!n.is_read ? 'bg-indigo-50/40 dark:bg-indigo-900/20' : ''}`} onClick={() => !n.is_read && handleMarkAsRead(n.id)}>
                        <div className={`mt-0.5 ${!n.is_read ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-normal text-slate-500 dark:text-slate-400'}`}>{n.pesan}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{new Date(n.created_at).toLocaleString('id-ID')}</p>
                        </div>
                        {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></span>}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ThemeToggle />
        <div className="flex items-center gap-2 text-sm font-medium border-l border-r px-4 sm:px-4 border-slate-200/50 dark:border-slate-700/50">
          <div className="h-7 w-7 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <span className="capitalize text-slate-700 dark:text-slate-200 hidden sm:inline-block">{user?.username} <span className="text-slate-400 dark:text-slate-500 font-normal">({user?.role})</span></span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout} 
          title="Logout" 
          className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/30 rounded-full transition-all duration-300"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
}
