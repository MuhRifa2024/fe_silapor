"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Settings, Users, ClipboardList, PlusCircle, X, Hexagon } from "lucide-react";

export default function Sidebar({ user, isOpen, setIsOpen }) {
  const pathname = usePathname();

  // Definisi Menu Berdasarkan Role
  const menuConfig = {
    admin: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Semua Laporan", href: "/laporan", icon: ClipboardList },
      { name: "Kategori", href: "/admin/kategori", icon: Settings },
      { name: "Statistik", href: "/admin/statistik", icon: FileText },
      { name: "Petugas", href: "/admin/petugas", icon: Users },
    ],
    petugas: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Tugas Saya", href: "/laporan/tugas", icon: ClipboardList },
    ],
    mahasiswa: [
      { name: "Dashboard", href: "/dashboard", icon: Home },
      { name: "Buat Laporan", href: "/laporan/baru", icon: PlusCircle },
      { name: "Riwayat Laporanku", href: "/laporan", icon: ClipboardList },
    ],
  };

  const menuList = menuConfig[user?.role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r shadow-sm transform transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:w-64`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-ulbi-blue">
            <Hexagon className="h-6 w-6 text-ulbi-orange fill-ulbi-orange" />
            <span>SiLapor</span>
          </Link>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden text-slate-500 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menuList.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-ulbi-blue text-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-ulbi-blue/10 hover:text-ulbi-blue"
                  }`}
                  onClick={() => setIsOpen(false)} // Tutup menu di mobile saat diklik
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t text-xs text-center text-slate-500">
          &copy; 2026 SiLapor
        </div>
      </aside>
    </>
  );
}
