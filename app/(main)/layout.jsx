"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export default function MainLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, resolvedTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser || storedUser === "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [router]);

  if (!isMounted || !user) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">Memuat...</div>;
  }

  // Determine active theme (handling hydration)
  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';

  // Determine Background Image based on Route and Theme
  let baseImage = "silapor_bg"; // Default (Dashboard)
  if (pathname.includes("/laporan")) baseImage = "silapor_bg_laporan";
  if (pathname.includes("/kelola-pengguna")) baseImage = "silapor_bg_users";
  if (pathname.includes("/kelola-kategori") || pathname.includes("/statistik")) baseImage = "silapor_bg_laporan";

  // Append _dark if dark mode is active
  const bgImage = `/${baseImage}${isDark ? '_dark' : ''}.png`;

  return (
    <div className={`flex h-screen overflow-hidden relative ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      
      {/* Full-screen Dynamic Glassmorphism Background */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image 
              src={bgImage} 
              alt="Campus Background" 
              fill
              className="object-cover opacity-100"
              priority
            />
          </motion.div>
        </AnimatePresence>
        {/* Subtle gradient overlay for readability (Glassmorphism Base) */}
        <div className={`absolute inset-0 backdrop-blur-[2px] transition-colors duration-700 ${
          isDark 
            ? 'bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/70' 
            : 'bg-gradient-to-br from-white/80 via-white/40 to-white/70'
        }`} />
      </div>

      {/* Staggered Container for Sidebar and Main Content */}
      <motion.div 
        className="relative z-10 flex w-full h-full"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
          }
        }}
      >
        <Sidebar user={user} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Header user={user} setIsOpen={setIsSidebarOpen} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <motion.div 
              className="mx-auto w-full max-w-7xl relative"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </motion.div>
    </div>
  );
}
