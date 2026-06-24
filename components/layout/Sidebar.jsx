"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Settings, Users, BarChart3, PlusCircle, Hexagon, X } from "lucide-react";

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
        { name: "Kelola Pengguna", href: "/admin/petugas", icon: Users },
        { name: "Kelola Kategori", href: "/admin/kategori", icon: Settings },
        { name: "Statistik", href: "/admin/statistik", icon: BarChart3 },
      ]
    });
  } else if (isPetugas) {
    menuSections.push({
      title: "Menu Utama",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Tugas Saya", href: "/laporan/tugas", icon: ClipboardList },
      ]
    });
  } else {
    menuSections.push({
      title: "Menu Utama",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Buat Laporan", href: "/laporan/baru", icon: PlusCircle },
        { name: "Riwayat Laporanku", href: "/laporan", icon: ClipboardList },
      ]
    });
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card text-muted-foreground border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:w-64`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-border">
          <Link href="/dashboard" className="flex flex-col">
            <span className="font-bold text-2xl tracking-tight flex items-center gap-2">
              <span className="text-[#f25922]">Si</span><span className="text-primary">Lapor</span>
            </span>
            <div className="mt-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold capitalize">
                {user?.role || "User"}
              </span>
            </div>
          </Link>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          {menuSections.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h3 className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : ""}`} />
                        {item.name}
                      </div>
                      {item.badge && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-[10px] font-bold text-foreground shadow-sm">
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
        <div className="p-4 border-t border-border bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              {getInitials(user?.username)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground truncate capitalize">{user?.username}</span>
              <span className="text-xs text-muted-foreground truncate capitalize">Administrator</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
