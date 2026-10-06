# Rencana Migrasi Database: Transisi dari Cloud Firestore ke Supabase / Turso

Rencana arsitektur dan eksekusi untuk menggantikan Google Cloud Firestore dengan database relasional **Supabase (PostgreSQL)** atau **Turso (libSQL/SQLite)**, serta memigrasikan seluruh berkas pengajuan kredit, dokumen verifikasi, data sita jaminan, dan log audit yang sudah tersimpan tanpa kehilangan data.

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawaban klarifikasi yang telah Anda berikan:
> - **Pilihan Database**: Menggunakan **Supabase (PostgreSQL)** sebagai database cloud utama (dengan kompatibilitas opsi Turso / libSQL).
> - **Penanganan Data**: **Migrasikan seluruh data yang ada** (data pengajuan pinjaman, riwayat verifikasi, berkas, dan log audit dari Firestore akan dipindahkan ke Supabase).

- **Confirmed Decision 1**: Database diganti dari Cloud Firestore ke Supabase PostgreSQL Client SDK (`@supabase/supabase-js`), menyediakan penyimpanan relasional dengan Row Level Security (RLS) serta kapabilitas realtime subscription.
- **Confirmed Decision 2**: Semua data aktif di Firestore akan dimigrasikan ke tabel Supabase melalui skrip sinkronisasi & tombol migrasi otomatis sekali klik di antarmuka Admin.
- **Open Question / Setting**: Supabase membutuhkan **Project URL** dan **Anon Key** (API Key publik). Aplikasi akan menyediakan antarmuka konfigurasi koneksi Supabase yang fleksibel dengan validasi koneksi langsung dan fallback offline storage.

---

## 1. Overview & Core Concept

- **Tujuan**: Mengalihkan seluruh operasi baca-tulis (CRUD) dan sinkronisasi berkas pinjaman dari NoSQL Firestore ke database relasional Supabase PostgreSQL.
- **Nilai Tambah**:
  1. Struktur data bertipe kuat (relasional SQL) dengan relasi antar tabel (nasabah, pinjaman, jaminan, surat sita, dan log audit).
  2. Kemampuan query SQL yang lebih cepat dan fleksibel dibanding NoSQL.
  3. Tetap mempertahankan fitur sinkronisasi real-time dan mode offline (PWA Local Cache).
  4. Seluruh data lama dari Firestore tetap utuh dan termigrasi sempurna.

---

## 2. User Experience & Visual Design

### Alur Pengguna & Antarmuka
1. **Formulir Pinjaman Nasabah (Mobile View)**:
   - Pengajuan pinjaman, foto KTP, selfie liveness, dan tanda tangan digital langsung tersimpan ke tabel `loan_applications` di Supabase.
   - Status indikator di header menampilkan status koneksi ke Supabase (*Supabase Connected*).
2. **Dashboard Verifikator & Analis (Admin)**:
   - Menerima update pengajuan baru secara real-time melalui *Supabase Realtime Channel*.
   - Analis dapat memperbarui status (Approve/Reject) atau mengubah plafon langsung ke database Supabase.
3. **Panel Konfigurasi & Migrasi Database (Admin Modal/Tab)**:
   - Menampilkan status koneksi Supabase (URL Project, Latensi, Status Pool).
   - Tombol **"Migrasikan Data dari Firestore"**: Mengambil seluruh data pengajuan lama dari Firestore dan mengimpornya ke tabel Supabase secara otomatis dengan visual progress bar.

### Visual Identity & Theme
- Menjaga estetika antarmuka saat ini: Slate gelap (`#0f172a`), aksen biru Supabase/Emerald untuk status terhubung, teks tajam tanpa elemen *AI slop*, dan tipografi rapi.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Supabase Client SDK (`@supabase/supabase-js`)**:
  - *Pendekatan*: Menggunakan library resmi Supabase dengan skema tabel PostgreSQL.
  - *Alasan*: Supabase dirancang untuk aplikasi web modern dengan integrasi client-side yang aman melalui Row Level Security (RLS), sinkronisasi realtime melalui WebSocket, dan dukungan offline.
- **Keputusan 2: Strategi Migrasi Data Tanpa Downtime**:
  - *Pendekatan*: Menyediakan modul `migrateFirestoreToSupabase()` yang membaca berkas dari Firestore/Local Cache dan melakukan batch *upsert* ke Supabase berdasarkan `contractNumber`.
  - *Alasan*: Menjamin tidak ada data pengajuan nasabah yang terhapus atau tertinggal selama proses transisi.

---

## 4. Technical Architecture & Data Strategy

### Diagram Arsitektur Sistem

```
┌───────────────────────────────────────────────────────────────┐
│                 Aplikasi Web PM Mitra Sejahtera               │
├───────────────────────────────┬───────────────────────────────┤
│    Mode Nasabah (Mobile HP)   │   Admin Dashboard Verifikasi  │
└───────────────┬───────────────┴───────────────┬───────────────┘
                │                               │
                ▼                               ▼
┌───────────────────────────────────────────────────────────────┐
│           Supabase Data Layer (`src/lib/supabase.ts`)         │
│  - Realtime Table Subscriptions (Postgres Changes)            │
│  - Offline Cache & Local Fallback Sync                        │
│  - Data Migration Utility (Firestore -> Supabase)             │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│              Supabase Cloud (PostgreSQL Database)             │
├───────────────────────────────────────────────────────────────┤
│  Tabel `loan_applications` (Berkas & Kontrak Pinjaman)        │
│  Tabel `surat_sita`        (Surat Perintah & Berita Acara)    │
│  Tabel `audit_logs`        (Riwayat Verifikasi Analis)        │
│  Tabel `auth_users`        (Pengguna & Hak Akses)             │
└───────────────────────────────────────────────────────────────┘
```

### Struktur Skema Tabel Supabase (PostgreSQL)

1. **`loan_applications`**:
   - `id` (VARCHAR PK)
   - `contract_number` (VARCHAR UNIQUE)
   - `created_at`, `updated_at` (TIMESTAMPTZ)
   - `applicant` (JSONB) — Identitas lengkap, NIK, KK, pendapatan, keluarga
   - `has_witness` (BOOLEAN)
   - `witness` (JSONB) — Identitas saksi jika ada
   - `loan` (JSONB) — Plafon, bunga, tenor, angsuran mingguan
   - `collateral` (JSONB) — Data BPKB / sertifikat jaminan
   - `location_tag` (JSONB) — Koordinat GPS & alamat geocoding
   - `documents` (JSONB) — URL KTP, KK, selfie liveness, tanda tangan
   - `biometric` (JSONB) — Kredensial WebAuthn FIDO2
   - `status` (VARCHAR) — PENDING / APPROVED / REJECTED / SURVEY / NEED_REVISION
   - `verified_by`, `verified_at`, `verification_notes` (TEXT/TIMESTAMPTZ)

2. **`surat_sita`**:
   - `id` (VARCHAR PK), `nomor_surat` (VARCHAR UNIQUE)
   - `application_id` (VARCHAR FK)
   - `status` (VARCHAR), `data` (JSONB), `created_at` (TIMESTAMPTZ)

3. **`audit_logs`**:
   - `id` (VARCHAR PK), `application_id` (VARCHAR)
   - `action` (VARCHAR), `performed_by` (VARCHAR), `timestamp` (TIMESTAMPTZ)

### Langkah Implementasi Eksekusi
1. Instalasi paket `@supabase/supabase-js`.
2. Pembuatan modul koneksi `src/lib/supabase.ts` dengan konfigurasi kredensial aman dan fallback persistensi lokal.
3. Pembuatan utilitas migrasi `migrateFromFirestoreToSupabase()` untuk memindahkan seluruh data pengajuan yang ada.
4. Penggantian hook & fungsi baca-tulis di `App.tsx` agar menggunakan adapter Supabase.
5. Pembaruan indikator koneksi di header aplikasi menjadi status koneksi Supabase.
6. Verifikasi pengujian build, validasi TypeScript, dan uji alur pengajuan baru.
