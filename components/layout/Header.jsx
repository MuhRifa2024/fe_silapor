"use client";

import { useEffect, useState, useRef } from "react";
import { Menu, LogOut, User, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
      // res.data adalah wrapper { message, data }, array notifikasi ada di res.data.data
      const list = res.data?.data;
      if (Array.isArray(list)) setNotifications(list);
    } catch (error) {
      console.error("Gagal memuat notifikasi", error);
    }
  };

  useEffect(() => {
    fetchNotifikasi();
    const interval = setInterval(fetchNotifikasi, 30000); // Poll every 30 detik
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown click outside
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

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-slate-900 px-4 md:px-6 shadow-sm shrink-0">
      <button 
        onClick={() => setIsOpen(true)} 
        className="md:hidden text-slate-500 hover:text-slate-700"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        {/* Lonceng Notifikasi */}
        <div className="relative" ref={dropdownRef}>
          <Button variant="ghost" size="icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="relative text-slate-500 hover:text-slate-700">
            <Bell className="h-5 w-5" />
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border border-white dark:border-slate-900">
                {notifications.filter(n => !n.is_read).length > 9 ? '9+' : notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </Button>

          {/* Dropdown Notifikasi */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-semibold text-sm">Notifikasi</h3>
                {notifications.filter(n => !n.is_read).length > 0 && (
                  <button onClick={handleMarkAllAsRead} className="text-xs text-primary hover:underline font-medium">Tandai semua dibaca</button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                    <Bell className="h-8 w-8 text-slate-300" />
                    Belum ada notifikasi baru
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex gap-3 transition-colors ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`} onClick={() => !n.is_read && handleMarkAsRead(n.id)}>
                      <div className={`mt-0.5 ${!n.is_read ? 'text-blue-500' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'font-normal text-slate-500 dark:text-slate-400'}`}>{n.pesan}</p>
                        <p className="text-xs text-slate-400 mt-1.5">{new Date(n.created_at).toLocaleString('id-ID')}</p>
                      </div>
                      {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500"></span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <ThemeToggle />
        <div className="flex items-center gap-2 text-sm font-medium border-l border-r px-4 sm:px-4 border-slate-200 dark:border-slate-700">
          <User className="h-4 w-4 text-ulbi-orange" />
          <span className="capitalize">{user?.username} ({user?.role})</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout} 
          title="Logout" 
          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  );
}
