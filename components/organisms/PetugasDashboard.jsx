import { TaskCard } from "@/components/molecules/TaskCard";

export function PetugasDashboard({ user }) {
  const tugas = [
    { id: 1, lokasi: "Ruang B201", kategori: "Elektrik", prioritas: "tinggi", batas_waktu: "Hari ini, 15:00" },
    { id: 3, lokasi: "Lab Komputer A", kategori: "IT", prioritas: "normal", batas_waktu: "Besok, 10:00" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-l-ulbi-orange bg-white dark:bg-slate-900 p-6 rounded-r-xl shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Area Petugas: {user?.username}</h1>
        <p className="text-slate-500 mt-1">Anda memiliki <strong className="text-ulbi-orange">{tugas.length} tugas</strong> yang belum selesai.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tugas.map((t) => (
          <TaskCard key={t.id} {...t} />
        ))}
      </div>
    </div>
  );
}
