"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Settings, Users, BarChart3, PlusCircle, FileText, UserCircle, X, History } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ user, isOpen, setIsOpen }) {
  const pathname = usePathname();
  const isAdmin = user?.role === "admin";
  const isPetugas = user?.role === "petugas";
  const isMahasiswa = user?.role === "mahasiswa" || !user?.role;

  // Configuration for Menu Sections
  const menuSections = [];

  if (isAdmin) {
    menuSections.push({
      title: "Menu Utama",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Semua Laporan", href: "/laporan", icon: ClipboardList, badge: "5" },
      ]
    });
    menuSections.push({
      title: "Manajemen",
      items: [
        { name: "Kelola Pengguna", href: "/kelola-pengguna", icon: Users },
        { name: "Kelola Kategori", href: "/kelola-kategori", icon: Settings },
        { name: "Statistik", href: "/statistik", icon: BarChart3 },
      ]
    });
  } else if (isPetugas) {
    menuSections.push({
      title: "Menu",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Tugas Saya", href: "/tugas", icon: ClipboardList },
        { name: "Riwayat Selesai", href: "/riwayat-selesai", icon: History },
        { name: "Profil Saya", href: "/profil", icon: UserCircle },
      ]
    });
  } else {
    menuSections.push({
      title: "Menu",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Laporan Saya", href: "/laporan", icon: ClipboardList },
        { name: "Buat Laporan", href: "/laporan/buat", icon: PlusCircle },
        { name: "Profil Saya", href: "/profil", icon: UserCircle },
      ]
    });
  }

  const getInitials = (name) => {
    if (!name) return "MR"; // Fallback to "MR" for M. Rizki dummy
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content (Glassmorphism Light & Dark) */}
      <motion.aside
        variants={{
          hidden: { x: -50, opacity: 0 },
          visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
        }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/50 dark:bg-slate-900/60 backdrop-blur-xl text-slate-700 dark:text-slate-200 border-r border-white/60 dark:border-slate-700/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:w-64`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-800/50">
          <Link href="/dashboard" className="flex flex-col">
            <span className="font-bold text-2xl tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <span className="text-orange-500">Si</span><span className="text-indigo-600 dark:text-indigo-400">Lapor</span>
            </span>
            <div className="mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold capitalize border border-indigo-200/50 dark:border-indigo-800/50">
                {user?.role || "User"}
              </span>
            </div>
          </Link>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h3 className="px-6 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <nav className="space-y-1 px-3">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-out ${
                        isActive
                          ? "bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20"
                          : "text-slate-600 dark:text-slate-300 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 hover:text-indigo-700 dark:hover:text-indigo-300"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Soft Fill & Icon Shift Animation */}
                        <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`} />
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm transition-colors ${
                          isActive ? "bg-white text-indigo-600" : "bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 group cursor-pointer hover:bg-white/50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors">
            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:shadow-md transition-shadow">
              {getInitials(user?.username || "M. Rizki")}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate capitalize">{user?.username || "M. Rizki"}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                {isMahasiswa ? "Mahasiswa Aktif" : (user?.role || "Administrator")}
              </span>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
