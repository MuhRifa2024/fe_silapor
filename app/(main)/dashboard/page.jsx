"use client";

import { useEffect, useState } from "react";
import { MahasiswaDashboard } from "@/components/organisms/MahasiswaDashboard";
import { PetugasDashboard } from "@/components/organisms/PetugasDashboard";
import { AdminDashboard } from "@/components/organisms/AdminDashboard";

export default function DashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    // BYPASS LOGIN UNTUK PREVIEW SEMENTARA JIKA TIDAK ADA LOGIN REAL
    setUser(storedUser ? JSON.parse(storedUser) : { username: "Admin Preview", role: "admin" });
  }, []);

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
