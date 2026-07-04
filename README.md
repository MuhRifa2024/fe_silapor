# fe_silapor — Frontend Aplikasi SILAPOR

Frontend aplikasi **SILAPOR** berbasis **Next.js 15** yang terhubung ke backend REST API. Dibangun dengan React 19, Tailwind CSS v4, dan komponen UI dari shadcn/ui.

---

## Daftar Isi

- [Deskripsi Aplikasi](#deskripsi-aplikasi)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Folder](#struktur-folder)
- [Environment Variables](#environment-variables)
- [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
- [Integrasi dengan Backend (API)](#integrasi-dengan-backend-api)
- [Catatan Pengembang](#catatan-pengembang)

---

## Deskripsi Aplikasi

**SILAPOR** (Sistem Laporan Online) adalah aplikasi web yang memungkinkan pengguna untuk membuat, mengelola, dan memantau laporan secara digital. Aplikasi ini terdiri dari dua repository terpisah:

- **`fe_silapor`** — Frontend (repository ini): antarmuka pengguna berbasis Next.js
- **`be_silapor`** *(terpisah)* — Backend: REST API yang menyediakan data

### Pengguna Utama

| Peran | Akses |
|---|---|
| User / Pelapor | Membuat dan memantau laporan yang dikirim |
| Admin | Mengelola seluruh laporan dan pengguna |

### Fitur Utama

- Autentikasi pengguna (login & registrasi)
- Pembuatan dan pengiriman laporan
- Pemantauan status laporan secara real-time
- Dashboard ringkasan dengan grafik (Recharts)
- Tampilan tabel data dengan filter dan sorting (@tanstack/react-table)
- Validasi form menggunakan React Hook Form + Zod
- Notifikasi dengan Sonner dan SweetAlert2
- Tema terang/gelap (next-themes)
- Animasi UI dengan Framer Motion

---

## Teknologi yang Digunakan

| Kategori | Teknologi | Versi |
|---|---|---|
| Framework | Next.js | ^15.3.3 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | ^4 |
| Komponen UI | shadcn/ui (base-nova) | ^4.11.0 |
| State Management | Zustand | ^5.0.14 |
| HTTP Client | Axios | ^1.18.1 |
| Form Management | React Hook Form | ^7.80.0 |
| Validasi Skema | Zod | ^4.4.3 |
| Tabel Data | TanStack Table | ^8.21.3 |
| Grafik | Recharts | ^3.8.1 |
| Animasi | Framer Motion | ^12.40.0 |
| Notifikasi | Sonner + SweetAlert2 | ^2.0.7 / ^11 |
| Ikon | Lucide React | ^1.21.0 |
| Linting | ESLint + eslint-config-next | ^9 / 16.2.9 |

---

## Struktur Folder

```
fe_silapor/
├── app/                        # Next.js App Router (halaman dan layout)
│   ├── globals.css             # CSS global dan variabel Tailwind
│   ├── layout.js               # Root layout (provider, font, theme)
│   └── [halaman]/              # Folder untuk setiap halaman (route)
│       └── page.js
│
├── components/                 # Komponen UI yang dapat digunakan ulang
│   ├── ui/                     # Komponen shadcn/ui yang di-generate
│   │   ├── button.jsx
│   │   ├── input.jsx
│   │   ├── table.jsx
│   │   └── ...
│   └── [NamaKomponen].jsx      # Komponen kustom (form, card, navbar, dll)
│
├── lib/                        # Fungsi utilitas dan helper
│   └── utils.js                # Fungsi cn() untuk merge Tailwind class
│
├── services/                   # Lapisan integrasi API backend
│   └── [nama].service.js       # Fungsi pemanggilan endpoint API (Axios)
│
├── .env.example                # Contoh konfigurasi environment variable
├── .env.local                  # File environment aktif (tidak di-commit)
├── .gitignore
├── components.json             # Konfigurasi shadcn/ui
├── eslint.config.mjs           # Konfigurasi ESLint
├── jsconfig.json               # Path alias (@/...)
├── next.config.mjs             # Konfigurasi Next.js
├── package.json
└── postcss.config.mjs          # Konfigurasi PostCSS untuk Tailwind
```

### Penjelasan Folder Penting

| Folder | Peran |
|---|---|
| `app/` | Routing berbasis file system (Next.js App Router). Setiap subfolder mewakili satu URL path. |
| `components/ui/` | Komponen shadcn/ui yang di-generate otomatis. Jangan diedit manual kecuali ada kebutuhan khusus. |
| `components/` | Komponen kustom yang dibangun dari komponen `ui/`, berisi logika presentasi spesifik fitur. |
| `lib/` | Fungsi helper yang tidak terikat pada komponen tertentu, seperti `cn()` untuk class merging. |
| `services/` | Semua pemanggilan API ke backend diletakkan di sini menggunakan Axios, agar komponen tidak langsung berinteraksi dengan HTTP. |

---

## Environment Variables

Salin file `.env.example` menjadi `.env.local` dan sesuaikan nilainya:

```bash
cp .env.example .env.local
```

| Variabel | Contoh Nilai | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | Base URL REST API backend. Prefix `NEXT_PUBLIC_` membuat variabel ini dapat diakses dari sisi client (browser). Ganti ke URL production saat deploy. |

> **Catatan:** Variabel dengan prefix `NEXT_PUBLIC_` akan di-embed ke dalam bundle JavaScript dan dapat dilihat oleh pengguna. Jangan simpan secret/token di variabel ini.

---

## Cara Menjalankan Aplikasi

### Prasyarat

Pastikan sudah terinstal di mesin kamu:

- [Node.js](https://nodejs.org/) versi **18 atau lebih baru**
- npm (sudah termasuk dengan Node.js) atau yarn/pnpm

### Langkah-langkah

**1. Clone repository**

```bash
git clone https://github.com/MuhRifa2024/fe_silapor.git
cd fe_silapor
```

**2. Install dependensi**

```bash
npm install
```

**3. Konfigurasi environment**

```bash
cp .env.example .env.local
```

Buka `.env.local` dan sesuaikan URL backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

> Pastikan backend (`be_silapor`) sudah berjalan terlebih dahulu sebelum menjalankan frontend.

**4. Jalankan server development**

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:3001**

> Port default diset ke `3001` (bukan 3000) agar tidak bentrok dengan backend yang biasanya berjalan di port `3000`.

### Perintah Lainnya

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server development di port 3001 |
| `npm run build` | Build aplikasi untuk production |
| `npm run start` | Menjalankan hasil build production |
| `npm run lint` | Menjalankan ESLint untuk cek kualitas kode |

---

## Integrasi dengan Backend (API)

Frontend berkomunikasi dengan backend melalui REST API menggunakan **Axios**. Semua fungsi pemanggilan API diletakkan di folder `services/`.

### Contoh Pola Pemanggilan API

```javascript
// services/laporan.service.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Ambil semua laporan
export const getAllLaporan = async (token) => {
  const response = await axios.get(`${API_URL}/laporan`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Buat laporan baru
export const createLaporan = async (data, token) => {
  const response = await axios.post(`${API_URL}/laporan`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
```

### Endpoint API yang Digunakan Frontend

> Sesuaikan dengan endpoint yang tersedia di backend `be_silapor`.

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/login` | Login pengguna, mendapatkan token JWT |
| `POST` | `/api/auth/register` | Registrasi akun baru |
| `GET` | `/api/laporan` | Ambil daftar semua laporan |
| `POST` | `/api/laporan` | Buat laporan baru |
| `GET` | `/api/laporan/:id` | Ambil detail laporan berdasarkan ID |
| `PUT` | `/api/laporan/:id` | Update laporan |
| `DELETE` | `/api/laporan/:id` | Hapus laporan |
| `GET` | `/api/dashboard` | Ambil data ringkasan untuk dashboard |

> **Catatan:** Daftar endpoint di atas adalah perkiraan berdasarkan nama aplikasi. Sesuaikan dengan dokumentasi atau kode router di repository backend.

---

## Catatan Pengembang

### Menambahkan Komponen UI (shadcn/ui)

Proyek ini menggunakan shadcn/ui dengan style `base-nova`. Untuk menambahkan komponen baru:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add table
```

Komponen akan otomatis ditambahkan ke folder `components/ui/`.

### Path Alias

Proyek menggunakan alias `@/` yang merujuk ke root proyek, dikonfigurasi di `jsconfig.json`:

```javascript
// Contoh penggunaan
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
```

### State Management (Zustand)

State global aplikasi dikelola menggunakan Zustand. Buat store baru di folder yang sesuai:

```javascript
// Contoh store sederhana
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => set({ user: null, token: null }),
}));
```

### Struktur Halaman (App Router)

Setiap halaman dibuat sebagai file `page.js` di dalam folder `app/`:

```
app/
├── page.js               → Route: /
├── login/
│   └── page.js           → Route: /login
├── dashboard/
│   └── page.js           → Route: /dashboard
└── laporan/
    ├── page.js           → Route: /laporan
    └── [id]/
        └── page.js       → Route: /laporan/:id
```

---

## Lisensi

Repository ini merupakan proyek akademik. Seluruh hak penggunaan mengikuti ketentuan institusi terkait.