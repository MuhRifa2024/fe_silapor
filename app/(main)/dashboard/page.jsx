"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MahasiswaDashboard } from "@/components/dashboard/MahasiswaDashboard";
import { PetugasDashboard } from "@/components/dashboard/PetugasDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  if (!user) return <div className="p-8 text-center animate-pulse">Memuat dashboard...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {user.role === "mahasiswa" ? (
        <MahasiswaDashboard user={user} />
      ) : user.role === "petugas" ? (
        <PetugasDashboard user={user} />
      ) : (
        <AdminDashboard user={user} />
      )}
    </div>
  );
}
