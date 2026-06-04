UMKM-INSIGHT
==============

Deskripsi singkat
-----------------
UMKM-INSIGHT adalah aplikasi full-stack untuk membantu pelaku UMKM mendapatkan insight penjualan, laporan, cashflow, dan manajemen langganan.

Komponen utama
---------------
- `backend/`: API Node.js + Express
  - `server.js` — entrypoint
  - `controllers/` — logika `auth`, `analytics`, `subscription`
  - `routes/` — definisi endpoint API
  - `middleware/` — autentikasi, logger, validasi
  - `config/db.js` — koneksi database
  - `backend/.env` — konfigurasi lingkungan (TIDAK disertakan di repo)

- `frontend/`: Next.js (app router) React UI
  - `src/app/` — halaman (dashboard, login, register, reports, cashflow, sales, subscription)
  - `src/components/` — komponen UI
  - `src/context/AuthContext.js` — state autentikasi
  - `src/utils/api.js` — helper panggilan API

Alur (Flow) Aplikasi
---------------------
1. Pengguna membuka aplikasi frontend; jika belum login diarahkan ke `login`/`register`.
2. Frontend memanggil `POST /auth/login` di backend untuk autentikasi; backend mengembalikan token/session.
3. Frontend menyimpan token di `AuthContext` (atau cookie/secure storage) dan mengakses `dashboard`.
4. Dashboard memanggil endpoint analytics (`/analytics/*`) untuk menampilkan ringkasan: total penjualan, pendapatan, grafik periode, dsb.
5. Pengguna dapat membuka `reports` atau `cashflow` untuk detail; frontend memanggil API yang sesuai.
6. Untuk fitur langganan, frontend memanggil endpoint `subscription` yang berinteraksi dengan provider pembayaran (jika tersedia).
7. Backend menyimpan data (user, transaksi, laporan) di database yang dikonfigurasi pada `config/db.js`.

Menjalankan lokal (singkat)
--------------------------
1. Buat file `.env` di `backend/` berdasarkan `.env.example` dan isi variabel sensitif.
2. Install dependency dan jalankan:

```powershell
cd backend
npm install
npm run dev

cd ..\frontend
npm install
npm run dev
```

Keamanan & Catatan penting
--------------------------
- Jangan commit file `.env` atau kunci sensitif. Gunakan `.gitignore` (sudah ditambahkan).
- Jika kunci pembayaran (Midtrans, dsb.) pernah ter-commit, segera rotasi/batalkan kunci tersebut.

Kontribusi
----------
- Gunakan branch fitur: `git checkout -b feat/your-feature`
- Commit dan buat PR ke `main`.

Kontak
------
Informasi pemilik repo ada di GitHub. Terima kasih.
# Proyek Pertama Saya
